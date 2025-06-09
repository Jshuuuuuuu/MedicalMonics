import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Client } from "pg";
import dotenv from "dotenv";
import cors from "cors"; // Import CORS package

dotenv.config(); // To load environment variables like JWT_SECRET

const app = express();

// Correct PostgreSQL connection setup
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "medicalmnemonics",
  password: "JEDI", // Replace with your actual password
  port: 5432,
});

client.connect(); // Connect to the PostgreSQL server

const JWT_SECRET = process.env.JWT_SECRET; // Make sure to define this in your .env file

app.use(express.json()); // For parsing JSON bodies in requests
app.use(cors()); // Enable CORS for all origins

// Middleware for JWT Authentication
const authenticateJWT = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from Authorization header

  if (!token) {
    return res
      .status(403)
      .json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user; // Attach the user object to the request
    next(); // Proceed to the next middleware/route handler
  });
};

// Signup endpoint (User Registration)
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the email already exists
    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
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

    res
      .status(201)
      .json({
        message: "User created successfully",
        user: insertResult.rows[0],
      });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ message: "Error signing up" });
  }
});

app.post("/add-mnemonic", authenticateJWT, async (req, res) => {
  const {
    acronym,
    fullForm,
    category,
    bodySystem,
    difficulty,
    examRelevance,
    tags,
  } = req.body;
  const userId = req.user.userId; // Extract userId from the JWT token

  console.log("Received mnemonic data:", req.body); // Log received data

  try {
    const result = await client.query(
      `INSERT INTO mnemonics (acronym, full_form, category, body_system, difficulty, exam_relevance, tags, user_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *`,
      [
        acronym,
        fullForm,
        category,
        bodySystem,
        difficulty,
        examRelevance,
        tags,
        userId,
      ]
    );
    res.status(201).json(result.rows[0]); // Send the inserted mnemonic back
  } catch (err) {
    console.error("Error saving mnemonic:", err); // Log error for debugging
    res
      .status(500)
      .json({ message: "Error saving mnemonic", error: err.message });
  }
});

app.get("/get-mnemonics", authenticateJWT, async (req, res) => {
  const { searchQuery, category } = req.query;
  const userId = req.user.userId;

  try {
    let query = "SELECT * FROM mnemonics WHERE user_id = $1";
    let params = [userId];

    // If searchQuery is provided, include it in the query and parameters
    if (searchQuery) {
      query += " AND (acronym ILIKE $2 OR full_form ILIKE $2)";
      params.push(`%${searchQuery}%`);  // Bind $2 parameter
    }

    // If category is provided and searchQuery is not passed, include it in the query
    if (category) {
      if (!searchQuery) { // Only add category filter if searchQuery is not provided
        query += " AND category = $3";
        params.push(category);  // Bind $3 parameter
      } else { // If searchQuery is provided, include category in the query as well
        query += " AND category = $3";
        params.push(category);  // Bind $3 parameter
      }
    }

    // Log the query and parameters for debugging
    console.log("Executing query:", query, "with params:", params);

    const result = await client.query(query, params);
    res.json(result.rows);  // Return the fetched mnemonics
  } catch (err) {
    console.error("Error fetching mnemonics:", err);  // Log the error
    res
      .status(500)
      .json({ message: "Error fetching mnemonics", error: err.message });
  }
});

// Login endpoint (Authentication)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Email:", email);
    console.log("Password:", password);

    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    console.log("Stored password hash:", user.password);
    const match = bcrypt.compareSync(password, user.password);
    console.log("Password match:", match);

    if (match) {
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({ token, user });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Error logging in" });
  }
});

app.post("/update-progress", authenticateJWT, async (req, res) => {
  const { userId, isCorrect } = req.body; // `isCorrect` is a boolean indicating whether the answer is correct

  try {
    // Check if user already has a progress record
    let result = await client.query(
      "SELECT * FROM user_progress WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      // If no record, create one
      await client.query(
        "INSERT INTO user_progress (user_id, correct_answers, total_answers) VALUES ($1, $2, $3)",
        [userId, isCorrect ? 1 : 0, 1]
      );
    } else {
      // If record exists, update the progress
      let progress = result.rows[0];
      let updatedCorrectAnswers =
        progress.correct_answers + (isCorrect ? 1 : 0);
      let updatedTotalAnswers = progress.total_answers + 1;

      await client.query(
        "UPDATE user_progress SET correct_answers = $1, total_answers = $2, last_updated = NOW() WHERE user_id = $3",
        [updatedCorrectAnswers, updatedTotalAnswers, userId]
      );
    }

    res.status(200).json({ message: "Progress updated successfully" });
  } catch (err) {
    console.error("Error updating progress:", err);
    res.status(500).json({ message: "Error updating progress" });
  }
});

app.get("/get-progress", authenticateJWT, async (req, res) => {
  const userId = req.user.userId; // Get user ID from JWT

  try {
    // Example query to calculate the progress (e.g., based on flashcards answered correctly)
    const result = await client.query(
      `SELECT COUNT(*) AS total_flashcards, 
              SUM(CASE WHEN is_correct = true THEN 1 ELSE 0 END) AS correct_flashcards 
       FROM flashcards 
       WHERE user_id = $1`,
      [userId]
    );

    const { total_flashcards, correct_flashcards } = result.rows[0];
    const progress =
      total_flashcards > 0 ? (correct_flashcards / total_flashcards) * 100 : 0;

    res.json({ progress, total_flashcards, correct_flashcards });
  } catch (err) {
    console.error("Error fetching progress:", err);
    res
      .status(500)
      .json({ message: "Error fetching progress", error: err.message });
  }
});

// Verify token endpoint
app.get("/verify-token", authenticateJWT, (req, res) => {
  res.json({ user: req.user }); // Respond with the user data if token is valid
});

// Start the server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
