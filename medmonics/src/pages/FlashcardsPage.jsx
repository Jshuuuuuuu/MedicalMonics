import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import "../styles/common.css";
import "../styles/FlashcardsPage.css"; // Scoped to this page
import "../responsiveness/Flashcardtransition.css"; // Keep for transitions

const FlashcardsPage = () => {
  const { currentUser } = useAuth();
  const [flashcards, setFlashcards] = useState([]);
  const [currentFlashcard, setCurrentFlashcard] = useState(null);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [quizFlashcards, setQuizFlashcards] = useState([]);
  const [points, setPoints] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [quizSettings, setQuizSettings] = useState({
    categories: ["All"],
    numberOfCards: 10,
    difficulty: "All",
    includeNew: true,
    includeReview: true,
  });
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizStats, setQuizStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  });
  const showToast = useToast();

  const categories = [
    "All",
    "Pathology",
    "Anatomy",
    "Histology",
    "Embryology",
    "Pharmacology",
    "Microbiology",
    "Neurology",
  ];

  const difficulties = ["All", "Easy", "Medium", "Hard"];

  useEffect(() => {
    if (!currentUser) return;

    const fetchFlashcards = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5000/get-mnemonics",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            params: {
              category: activeCategory === "All" ? "" : activeCategory,
            },
          }
        );
        setFlashcards(response.data);
      } catch (error) {
        console.error("Error fetching flashcards:", error);
        showToast("Error fetching flashcards", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [activeCategory, currentUser, showToast]);

  const startQuiz = async () => {
    setLoading(true);
    setQuizMode(false);

    const token = localStorage.getItem("authToken");
    if (!token) {
      showToast("Please log in to start quiz", "error");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/start-quiz",
        quizSettings,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.flashcards) {
        // Ensure we only take exactly the number of cards specified in settings
        const limitedCards = response.data.flashcards.slice(
          0,
          quizSettings.numberOfCards
        );
        setQuizFlashcards(limitedCards);
        setCurrentFlashcard(limitedCards[0] || null);
        setQuizMode(true);
        setCurrentFlashcardIndex(0);
        // Reset points and stats when starting a new quiz
        setPoints(0);
        setQuizStats({ correct: 0, incorrect: 0, total: 0 });
      } else {
        showToast("No flashcards available for quiz", "error");
      }
    } catch (error) {
      console.error("Error starting quiz:", error);
      showToast("Error starting quiz", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (isCorrect) => {
    if (!currentFlashcard) return;

    try {
      await axios.post(
        "http://localhost:5000/update-mnemonic-stats",
        {
          mnemonicId: currentFlashcard.id,
          isCorrect: isCorrect,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      setQuizStats((prev) => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
        total: prev.total + 1,
      }));

      if (isCorrect) {
        setPoints((prev) => prev + calculatePoints(currentFlashcard));
        showToast("Correct! 🎉", "success");
      } else {
        showToast("Incorrect. Keep trying! 💪", "error");
      }

      setTimeout(() => {
        nextFlashcard();
      }, 1500);
    } catch (error) {
      console.error("Error updating stats:", error);
      showToast("Error updating progress", "error");
    }
  };

  const calculatePoints = (flashcard) => {
    const basePoints = 10;
    const difficultyMultiplier = {
      Easy: 1,
      Medium: 1.5,
      Hard: 2,
    };
    return Math.round(
      basePoints * (difficultyMultiplier[flashcard.difficulty] || 1)
    );
  };

  const nextFlashcard = () => {
    if (currentFlashcardIndex < quizFlashcards.length - 1) {
      const nextIndex = currentFlashcardIndex + 1;
      setCurrentFlashcardIndex(nextIndex);
      setCurrentFlashcard(quizFlashcards[nextIndex]);
      setShowAnswer(false);
      setCurrentAnswer("");
    } else {
      endQuiz();
    }
  };

  const endQuiz = () => {
    setQuizMode(false);
    setCurrentFlashcard(null);

    // Calculate percentage score
    const percentage =
      quizStats.total > 0
        ? Math.round((quizStats.correct / quizStats.total) * 100)
        : 0;

    // Display end of quiz toast with more information
    showToast(
      `Quiz completed! Score: ${quizStats.correct}/${quizStats.total} (${percentage}%)`,
      percentage >= 70 ? "success" : "info"
    );

    // You could also save quiz results to the server here
  };

  const handleCategorySelection = (category) => {
    if (category === "All") {
      setQuizSettings((prev) => ({ ...prev, categories: ["All"] }));
    } else {
      setQuizSettings((prev) => {
        const newCategories = prev.categories.includes("All")
          ? [category]
          : prev.categories.includes(category)
          ? prev.categories.filter((c) => c !== category)
          : [...prev.categories.filter((c) => c !== "All"), category];
        return {
          ...prev,
          categories: newCategories.length > 0 ? newCategories : ["All"],
        };
      });
    }
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };

  const handleReset = () => {
    setQuizMode(false);
    setCurrentFlashcard(null);
    setQuizFlashcards([]);
    setCurrentFlashcardIndex(0);
    setPoints(0);
    setQuizStats({ correct: 0, incorrect: 0, total: 0 });
    setCurrentAnswer("");
    setShowAnswer(false);
  };

  if (loading) {
    return (
      <div className="flashcards-page">
        <div className="main-content">
          <p>Loading flashcards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flashcards-page">
      <div className="main-content">
        <h1 className="page-title">Flashcards Quiz</h1>

        {!quizMode ? (
          <div className="quiz-setup">
            <div className="setup-section">
              <h2>Quiz Settings</h2>
              <div className="setting-group">
                <label>Categories:</label>
                <div className="category-selection">
                  {categories.map((category) => (
                    <button
                      key={category}
                      className={`category-btn ${
                        quizSettings.categories.includes(category)
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleCategorySelection(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="setting-group">
                <label>Number of Cards:</label>
                <select
                  value={quizSettings.numberOfCards}
                  onChange={(e) =>
                    setQuizSettings((prev) => ({
                      ...prev,
                      numberOfCards: parseInt(e.target.value),
                    }))
                  }
                >
                  <option value={5}>5 Cards</option>
                  <option value={10}>10 Cards</option>
                  <option value={15}>15 Cards</option>
                  <option value={20}>20 Cards</option>
                  <option value={25}>25 Cards</option>
                </select>
              </div>

              <div className="setting-group">
                <label>Difficulty:</label>
                <select
                  value={quizSettings.difficulty}
                  onChange={(e) =>
                    setQuizSettings((prev) => ({
                      ...prev,
                      difficulty: e.target.value,
                    }))
                  }
                >
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="start-quiz-btn"
                onClick={startQuiz}
                disabled={flashcards.length === 0}
              >
                Start Quiz
              </button>
            </div>

            <div className="browse-section">
              <h2>Browse Flashcards</h2>
              <div className="browse-content">
                <div className="category-filter">
                  <h3>Categories</h3>
                  <ul className="category-filter-list">
                    {categories.map((category) => (
                      <li
                        key={category}
                        className={activeCategory === category ? "active" : ""}
                        onClick={() => handleCategoryClick(category)}
                      >
                        {category}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flashcards-grid">
                  {flashcards.map((flashcard) => (
                    <div key={flashcard.id} className="flashcard-preview">
                      <h4>{flashcard.acronym}</h4>
                      <p>{flashcard.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="quiz-active">
            <div className="quiz-header">
              <div className="quiz-progress">
                <span>
                  Card {currentFlashcardIndex + 1} of {quizFlashcards.length}
                </span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        ((currentFlashcardIndex + 1) / quizFlashcards.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="quiz-stats">
                <span>Points: {points}</span>
                <span>Correct: {quizStats.correct}</span>
                <span>Incorrect: {quizStats.incorrect}</span>
              </div>
              <button onClick={handleReset} className="end-quiz-btn">
                End Quiz
              </button>
            </div>

            {currentFlashcard && (
              <div className="quiz-card">
                <div className="card-question">
                  <h2>What does this acronym stand for?</h2>
                  <h1 className="acronym">{currentFlashcard.acronym}</h1>
                  <p className="category-hint">
                    Category: {currentFlashcard.category}
                  </p>
                </div>

                {!showAnswer ? (
                  <div className="answer-input">
                    <input
                      type="text"
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Type your answer..."
                      className="answer-field"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          setShowAnswer(true);
                        }
                      }}
                    />
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="reveal-btn"
                    >
                      Reveal Answer
                    </button>
                  </div>
                ) : (
                  <div className="answer-reveal">
                    <div className="correct-answer">
                      <h3>Correct Answer:</h3>
                      <p className="full-form">{currentFlashcard.full_form}</p>
                      {currentFlashcard.body_system && (
                        <p className="body-system">
                          Body System: {currentFlashcard.body_system}
                        </p>
                      )}
                    </div>

                    <div className="your-answer">
                      <h4>Your Answer:</h4>
                      <p>{currentAnswer || "No answer provided"}</p>
                    </div>

                    <div className="answer-buttons">
                      <button
                        onClick={() => handleAnswerSubmit(true)}
                        className="correct-btn"
                      >
                        ✓ I got it right
                      </button>
                      <button
                        onClick={() => handleAnswerSubmit(false)}
                        className="incorrect-btn"
                      >
                        ✗ I got it wrong
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardsPage;
