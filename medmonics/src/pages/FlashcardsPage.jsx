import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import "../styles/common.css";
import "../styles/FlashcardsPage.css";

const FlashcardsPage = () => {
  const { currentUser } = useAuth();
  const [flashcards, setFlashcards] = useState([]);
  const [currentFlashcards, setCurrentFlashcards] = useState([]);
  const [answeredFlashcards, setAnsweredFlashcards] = useState([]);
  const [points, setPoints] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const showToast = useToast();
  const [revealedCards, setRevealedCards] = useState({}); // To track which card is revealed

  const categories = [
    "All",
    "Pathology",
    "Anatomy",
    "Histology",
    "Embryology",
    "Pharmacology",
    "Microbiology",
  ];

  // Fetch flashcards when category or search query changes
  useEffect(() => {
    if (!currentUser) return;

    const fetchFlashcards = async () => {
      setLoading(true);

      try {
        const response = await axios.get("http://localhost:5000/get-mnemonics", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          params: {
            category: activeCategory === "All" ? "" : activeCategory,
          },
        });

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

  // Set two random flashcards excluding the answered ones
  useEffect(() => {
    if (flashcards.length > 0) {
      const getRandomFlashcards = () => {
        const filteredFlashcards = flashcards.filter(
          (flashcard) => !answeredFlashcards.includes(flashcard.id)
        );
        const shuffled = [...filteredFlashcards].sort(() => Math.random() - 0.5);
        setCurrentFlashcards(shuffled.slice(0, 2));
      };

      getRandomFlashcards();
    }
  }, [flashcards, answeredFlashcards]);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };

  const handleAnswer = (flashcardId, isCorrect) => {
    if (isCorrect) {
      setAnsweredFlashcards((prev) => [...prev, flashcardId]);
      setPoints((prevPoints) => prevPoints + 1); // Add point if correct
    }
  };

  const handleReveal = (flashcardId) => {
    setRevealedCards((prevState) => ({
      ...prevState,
      [flashcardId]: !prevState[flashcardId], // Toggle reveal state for each flashcard
    }));
  };

  const handleReset = () => {
    setAnsweredFlashcards([]); // Clear answers
    setPoints(0); // Reset points
    setCurrentFlashcards([]); // Reset flashcards
    setRevealedCards({}); // Reset revealed state for all flashcards
  };

  const handleNextFlashcards = () => {
    setAnsweredFlashcards([]); // Reset answers when moving to next set
    setCurrentFlashcards([]); // Clear current flashcards to fetch new ones
  };

  return (
    <div className="flashcards-page">
      <div className="main-content">
        <h1 className="page-title">Flashcards Quiz</h1>

        {loading ? (
          <p>Loading flashcards...</p>
        ) : (
          <div className="flashcards-container">
            <div className="sidebar">
              <h3>Categories</h3>
              <ul className="category-list">
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

            <div className="flashcards-content">
              <div className="flashcards-header">
                <h2>Your Flashcards</h2>
                <p>Points: {points}</p>
                <button onClick={handleReset} className="reset-btn">
                  Reset
                </button>
              </div>

              <div className="flashcards-list">
                {currentFlashcards.length > 0 &&
                  currentFlashcards.map((flashcard) => (
                    <div key={flashcard.id} className="flashcard">
                      <h3>{flashcard.acronym}</h3>

                      {/* Show full form if revealed */}
                      {revealedCards[flashcard.id] ? (
                        <div>
                          <p>{flashcard.fullForm}</p>
                          <p>
                            <strong>Category:</strong> {flashcard.category}
                          </p>
                          <p>
                            <strong>Body System:</strong> {flashcard.bodySystem}
                          </p>
                          <p>
                            <strong>Exam Relevance:</strong> {flashcard.examRelevance}
                          </p>
                        </div>
                      ) : (
                        <p>Click "Reveal" to see the full mnemonic.</p>
                      )}

                      <button onClick={() => handleReveal(flashcard.id)}>
                        {revealedCards[flashcard.id] ? "Hide" : "Reveal"}
                      </button>

                      <div className="answer-checklist">
                        <label>
                          <input
                            type="checkbox"
                            onChange={(e) =>
                              handleAnswer(flashcard.id, e.target.checked)
                            }
                          />
                          Got it right?
                        </label>
                      </div>
                    </div>
                  ))}
              </div>

              <button onClick={handleNextFlashcards} className="next-btn">
                Next Flashcards
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardsPage;
