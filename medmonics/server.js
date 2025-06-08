import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Client } from "pg";
import dotenv from "dotenv";
import cors from "cors"; // Import CORS package

dotenv.config();  // To load environment variables like JWT_SECRET

const app = express();

// Correct PostgreSQL connection setup
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'medicalmnemonics',
  password: 'JEDI',  // Replace with your actual password
  port: 5432,
});

client.connect();  // Connect to the PostgreSQL server

const JWT_SECRET = process.env.JWT_SECRET;  // Make sure to define this in your .env file

app.use(express.json());  // For parsing JSON bodies in requests
app.use(cors());  // Enable CORS for all origins

// Middleware for JWT Authentication
const authenticateJWT = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;  // Attach the user object to the request
    next();  // Proceed to the next middleware/route handler
  });
};

// Signup endpoint (User Registration)
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the email already exists
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database without username
    const insertResult = await client.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, hashedPassword]
    );

    res.status(201).json({ message: "User created successfully", user: insertResult.rows[0] });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ message: "Error signing up" });
  }
});

app.post("/add-mnemonic", authenticateJWT, async (req, res) => {
  const { acronym, fullForm, category, bodySystem, difficulty, examRelevance, tags, userId } = req.body;
  
  console.log('Received mnemonic data:', req.body); // Log received data

  try {
    // Insert the new mnemonic into the database
    const result = await client.query(
      `INSERT INTO mnemonics (acronym, full_form, category, body_system, difficulty, exam_relevance, tags, user_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *`, 
      [acronym, fullForm, category, bodySystem, difficulty, examRelevance, tags, userId]
    );

    res.status(201).json(result.rows[0]);  // Send the inserted mnemonic back
  } catch (err) {
    console.error("Error saving mnemonic:", err);  // Log error for debugging
    res.status(500).json({ message: "Error saving mnemonic", error: err.message });
  }
});

app.get("/get-mnemonics", authenticateJWT, async (req, res) => {
  const { searchQuery, category } = req.query;
  const userId = req.user.userId;

  try {
    let query = "SELECT * FROM mnemonics WHERE user_id = $1";
    let params = [userId];

    if (category) {
      query += " AND category = $2";
      params.push(category);
    }

    if (searchQuery) {
      query += " AND (acronym ILIKE $3 OR full_form ILIKE $3 OR description ILIKE $3)";
      params.push(`%${searchQuery}%`);
    }

    const result = await client.query(query, params);
    res.json(result.rows);  // Return the fetched data
  } catch (err) {
    console.error("Error fetching mnemonics:", err);
    res.status(500).json({ message: "Error fetching mnemonics" });
  }
});
// Login endpoint (Authentication)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Email:', email);
    console.log('Password:', password);

    const result = await client.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    console.log('Stored password hash:', user.password);
    const match = bcrypt.compareSync(password, user.password);
    console.log('Password match:', match);

    if (match) {
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
      res.json({ token, user });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Error logging in" });
  }
});

// Verify token endpoint
app.get("/verify-token", authenticateJWT, (req, res) => {
  res.json({ user: req.user });  // Respond with the user data if token is valid
});

// Fetch Mnemonics (Authenticated route)
app.get("/get-mnemonics", authenticateJWT, async (req, res) => {
  const { category, searchQuery } = req.query;
  const userId = req.user.userId;

  try {
    let query = "SELECT * FROM mnemonics WHERE user_id = $1";
    let params = [userId];

    if (category) {
      query += " AND category = $2";
      params.push(category);
    }

    if (searchQuery) {
      query += " AND (title ILIKE $3 OR content ILIKE $3)";
      params.push(`%${searchQuery}%`);
    }

    const result = await client.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching mnemonics:", err);
    res.status(500).json({ message: "Error fetching mnemonics" });
  }
});

// Start the server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
