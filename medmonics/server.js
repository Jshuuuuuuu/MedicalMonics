import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Client } from "pg";
import dotenv from "dotenv";
import cors from "cors"; // Import CORS package

dotenv.config(); // To load environment variables like JWT_SECRET

const app = express();

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "medicalmnemonics",
  password: "JEDI", 
  port: 5432,
});

client.connect(); 

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
    let paramIndex = 2; // Start from $2 since $1 is userId

    // Add search query filter if provided
    if (searchQuery && searchQuery.trim() !== "") {
      query += ` AND (acronym ILIKE $${paramIndex} OR full_form ILIKE $${paramIndex})`;
      params.push(`%${searchQuery}%`);
      paramIndex++;
    }

    // Add category filter if provided and not "All"
    if (category && category.trim() !== "" && category !== "All") {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Log the query and parameters for debugging
    console.log("Executing query:", query, "with params:", params);

    const result = await client.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching mnemonics:", err);
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

app.post("/start-quiz", authenticateJWT, async (req, res) => {
  const { categories, numberOfCards, difficulty, includeNew, includeReview } = req.body;
  const userId = req.user.userId;

  try {
    let query = `SELECT m.*, 
             COALESCE(ums.correct_count, 0) as correct_count,
             COALESCE(ums.incorrect_count, 0) as incorrect_count,
             COALESCE(ums.ease_factor, 2.5) as ease_factor,
             COALESCE(ums.interval, 1) as interval,
             ums.last_reviewed,
             CASE 
               WHEN ums.last_reviewed IS NULL THEN 'new'
               WHEN ums.last_reviewed < NOW() - INTERVAL '1 day' * ums.interval THEN 'due'
               ELSE 'future'
             END as review_status
      FROM mnemonics m
      LEFT JOIN user_mnemonic_stats ums ON m.id = ums.mnemonic_id AND ums.user_id = $1
      WHERE m.user_id = $1`;

    let params = [userId];
    let paramIndex = 2;

    // Add category filter
    if (categories && categories.length > 0 && !categories.includes("All")) {
      query += ` AND m.category = ANY($${paramIndex}::text[])`;
      params.push(categories);
      paramIndex++;
    }

    // Add difficulty filter
    if (difficulty && difficulty !== "All") {
      query += ` AND m.difficulty = $${paramIndex}`;
      params.push(difficulty);
      paramIndex++;
    }

    const result = await client.query(query, params);
    let flashcards = result.rows;

    if (flashcards.length === 0) {
      return res.status(400).json({ message: "No flashcards found matching your criteria" });
    }

    // Apply review settings
    if (!includeNew && !includeReview) {
      return res.status(400).json({ message: "Must include either new or review cards" });
    }

    if (!includeNew) {
      flashcards = flashcards.filter(card => card.review_status !== 'new');
    }

    if (!includeReview) {
      flashcards = flashcards.filter(card => card.review_status === 'new');
    }

    // Prioritize review cards first, then shuffle
    flashcards.sort((a, b) => {
      if (a.review_status === 'new' && b.review_status !== 'new') return -1;
      if (b.review_status === 'new' && a.review_status !== 'new') return 1;
      return (a.correct_count / (a.correct_count + a.incorrect_count)) - 
              (b.correct_count / (b.correct_count + b.incorrect_count));
    });

    // Limit to the requested number of cards
    const selectedCards = flashcards.slice(0, numberOfCards);

    res.json({
      flashcards: selectedCards,
      totalAvailable: flashcards.length,
    });

  } catch (error) {
    console.error("Error starting quiz:", error);
    res.status(500).json({ message: "Error starting quiz", error: error.message });
  }
});

// Update mnemonic statistics based on user performance
app.post("/update-mnemonic-stats", authenticateJWT, async (req, res) => {
  const { mnemonicId, isCorrect } = req.body;
  const userId = req.user.userId;

  try {
    // Check if stats record exists
    const existingStats = await client.query(
      "SELECT * FROM user_mnemonic_stats WHERE user_id = $1 AND mnemonic_id = $2",
      [userId, mnemonicId]
    );

    if (existingStats.rows.length === 0) {
      // Create new stats record
      const newEaseFactor = isCorrect ? 2.6 : 2.5;
      const newInterval = isCorrect ? 1 : 1;
      
      await client.query(`
        INSERT INTO user_mnemonic_stats 
        (user_id, mnemonic_id, correct_count, incorrect_count, ease_factor, interval, last_reviewed)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `, [
        userId, 
        mnemonicId, 
        isCorrect ? 1 : 0, 
        isCorrect ? 0 : 1, 
        newEaseFactor, 
        newInterval
      ]);
    } else {
      // Update existing stats using spaced repetition algorithm
      const stats = existingStats.rows[0];
      const newCorrectCount = stats.correct_count + (isCorrect ? 1 : 0);
      const newIncorrectCount = stats.incorrect_count + (isCorrect ? 0 : 1);
      
      // Calculate new ease factor (SM-2 algorithm adaptation)
      let newEaseFactor = stats.ease_factor;
      if (isCorrect) {
        newEaseFactor = Math.max(1.3, newEaseFactor + (0.1 - (5 - 4) * (0.08 + (5 - 4) * 0.02)));
      } else {
        newEaseFactor = Math.max(1.3, newEaseFactor - 0.2);
      }
      
      // Calculate new interval
      let newInterval;
      if (isCorrect) {
        if (stats.interval === 1) {
          newInterval = 6;
        } else {
          newInterval = Math.round(stats.interval * newEaseFactor);
        }
      } else {
        newInterval = 1; // Reset interval for incorrect answers
      }

      await client.query(`
        UPDATE user_mnemonic_stats 
        SET correct_count = $1, incorrect_count = $2, ease_factor = $3, 
            interval = $4, last_reviewed = NOW()
        WHERE user_id = $5 AND mnemonic_id = $6
      `, [newCorrectCount, newIncorrectCount, newEaseFactor, newInterval, userId, mnemonicId]);
    }

    res.json({ message: "Stats updated successfully" });

  } catch (err) {
    console.error("Error updating mnemonic stats:", err);
    res.status(500).json({ message: "Error updating stats", error: err.message });
  }
});

app.get("/get-progress-overview", authenticateJWT, async (req, res) => {
  const userId = req.user.userId;

  try {
    // Get today's date in UTC
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0); // Set to beginning of day in UTC

    // Count total mnemonics for this user
    const totalResult = await client.query(
      "SELECT COUNT(*) as total FROM mnemonics WHERE user_id = $1",
      [userId]
    );
    const totalMnemonics = parseInt(totalResult.rows[0].total);

    // Count mnemonics reviewed today (after 12AM UTC)
    const reviewedTodayResult = await client.query(
      "SELECT COUNT(*) as reviewed FROM user_mnemonic_stats ums " +
      "JOIN mnemonics m ON ums.mnemonic_id = m.id " +
      "WHERE ums.user_id = $1 AND m.user_id = $1 " +
      "AND ums.last_reviewed >= $2",
      [userId, todayUTC.toISOString()]
    );
    const reviewedToday = parseInt(reviewedTodayResult.rows[0].reviewed);

    // Calculate progress percentage
    const progressPercentage = totalMnemonics > 0 
      ? Math.round((reviewedToday / totalMnemonics) * 100) 
      : 0;

    // Calculate time until reset (12AM UTC tomorrow)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    const timeUntilReset = tomorrow - now;
    const hoursUntilReset = Math.floor(timeUntilReset / (1000 * 60 * 60));
    const minutesUntilReset = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));

    res.json({
      totalMnemonics,
      reviewedToday,
      progressPercentage,
      isComplete: reviewedToday === totalMnemonics && totalMnemonics > 0,
      resetTime: {
        hoursUntilReset,
        minutesUntilReset
      }
    });
  } catch (error) {
    console.error("Error fetching progress overview:", error);
    res.status(500).json({ message: "Error fetching progress", error: error.message });
  }
});

app.get("/get-analytical-report", authenticateJWT, async (req, res) => {
  const userId = req.user.userId;

  try {
    // Get performance metrics by category
    const categoryPerformanceResult = await client.query(`
      SELECT 
        m.category,
        SUM(ums.correct_count) AS total_correct,
        SUM(ums.incorrect_count) AS total_incorrect,
        COUNT(m.id) AS total_mnemonics,
        COUNT(CASE WHEN ums.last_reviewed IS NOT NULL THEN 1 END) AS studied_mnemonics
      FROM mnemonics m
      LEFT JOIN user_mnemonic_stats ums 
        ON m.id = ums.mnemonic_id AND ums.user_id = $1
      WHERE m.user_id = $1
      GROUP BY m.category
      ORDER BY 
        (CASE WHEN SUM(ums.correct_count) + SUM(ums.incorrect_count) > 0 
          THEN SUM(ums.correct_count)::float / (SUM(ums.correct_count) + SUM(ums.incorrect_count)) 
          ELSE 0 END) DESC
    `, [userId]);

    // Get overall performance metrics
    const overallPerformanceResult = await client.query(`
      SELECT 
        SUM(ums.correct_count) AS total_correct,
        SUM(ums.incorrect_count) AS total_incorrect
      FROM user_mnemonic_stats ums
      JOIN mnemonics m ON m.id = ums.mnemonic_id
      WHERE ums.user_id = $1 AND m.user_id = $1
    `, [userId]);

    // Format the category performance data
    const categoryPerformance = categoryPerformanceResult.rows.map(category => {
      // Convert string values to numbers before adding
      const totalCorrect = parseInt(category.total_correct) || 0;
      const totalIncorrect = parseInt(category.total_incorrect) || 0;
      const totalAnswers = totalCorrect + totalIncorrect;
      
      const accuracyRate = totalAnswers > 0 
        ? Math.round((totalCorrect / totalAnswers) * 100) 
        : 0;
      
      const studiedPercentage = category.total_mnemonics > 0
        ? Math.round((category.studied_mnemonics / category.total_mnemonics) * 100)
        : 0;

      return {
        category: category.category,
        accuracyRate,
        totalCorrect,
        totalIncorrect,
        totalAnswers,  // Now it's properly calculated as a sum
        totalMnemonics: parseInt(category.total_mnemonics),
        studiedMnemonics: parseInt(category.studied_mnemonics),
        studiedPercentage
      };
    });

    // Calculate overall stats
    const overallStats = overallPerformanceResult.rows[0];
    const totalOverallAnswers = 
  parseInt(overallStats?.total_correct || 0) +
      parseInt(overallStats?.total_incorrect || 0);
    const overallAccuracy = totalOverallAnswers > 0
      ? Math.round((parseInt(overallStats?.total_correct || 0) / totalOverallAnswers) * 100)
      : 0;

    res.json({
      categoryPerformance,
      overallStats: {
        totalCorrect: parseInt(overallStats?.total_correct || 0),
        totalIncorrect: parseInt(overallStats?.total_incorrect || 0),
        totalAnswers: totalOverallAnswers,
        overallAccuracy
      }
    });
  } catch (error) {
    console.error("Error fetching analytical report:", error);
    res.status(500).json({ message: "Error fetching analytical data", error: error.message });
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
