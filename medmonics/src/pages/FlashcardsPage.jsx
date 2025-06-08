import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import '../styles/common.css';
import '../styles/FlashcardsPage.css';

const FlashcardsPage = () => {
  const { currentUser } = useAuth();
  const [flashcards, setFlashcards] = useState([]);
  const [currentFlashcards, setCurrentFlashcards] = useState([]);
  const [answeredFlashcards, setAnsweredFlashcards] = useState([]);
  const [points, setPoints] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [revealedCards, setRevealedCards] = useState({});
  const showToast = useToast();

  const categories = [
    'All',
    'Pathology',
    'Anatomy',
    'Histology',
    'Embryology',
    'Pharmacology',
    'Microbiology',
  ];

  useEffect(() => {
    if (!currentUser) return;

    const fetchFlashcards = async () => {
      setLoading(true);

      try {
        const response = await axios.get('http://localhost:5000/get-mnemonics', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          params: {
            category: activeCategory === 'All' ? '' : activeCategory,
          },
        });

        setFlashcards(response.data);
      } catch (error) {
        console.error('Error fetching flashcards:', error);
        showToast('Error fetching flashcards', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [activeCategory, currentUser, showToast]);

  useEffect(() => {
    if (flashcards.length > 0) {
      const getRandomFlashcards = () => {
        const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
        setCurrentFlashcards(shuffled.slice(0, 2));
      };
      getRandomFlashcards();
    }
  }, [flashcards]);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };

  const handleAnswer = (flashcardId, isCorrect) => {
    if (!answeredFlashcards.includes(flashcardId)) {
      setAnsweredFlashcards(prev => [...prev, flashcardId]);
      if (isCorrect) {
        setPoints(prevPoints => prevPoints + 1);
      }
    }
  };

  const handleReveal = (flashcardId) => {
    setRevealedCards(prevState => ({
      ...prevState,
      [flashcardId]: !prevState[flashcardId],
    }));
  };

  const handleReset = () => {
    setAnsweredFlashcards([]);
    setPoints(0);
    setCurrentFlashcards([]);
    setRevealedCards({});
  };

  const handleNextFlashcards = () => {
    setAnsweredFlashcards([]);
    setCurrentFlashcards([]);
    setPoints(prev => prev);
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
                    className={activeCategory === category ? 'active' : ''}
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
                <button onClick={handleReset} className="reset-btn">Reset</button>
              </div>

              <div className="flashcards-list">
                {currentFlashcards.length > 0 &&
                  currentFlashcards.map((flashcard) => (
                    <div key={flashcard.id} className="flashcard">
                      <h3>{flashcard.acronym}</h3>

                      {revealedCards[flashcard.id] ? (
                        <div>
                          <p>{flashcard.fullForm}</p>
                          <p><strong>Category:</strong> {flashcard.category}</p>
                          <p><strong>Body System:</strong> {flashcard.bodySystem}</p>
                          <p><strong>Exam Relevance:</strong> {flashcard.examRelevance}</p>
                        </div>
                      ) : (
                        <p>Click "Reveal" to see the full mnemonic.</p>
                      )}

                      <button onClick={() => handleReveal(flashcard.id)}>
                        {revealedCards[flashcard.id] ? 'Hide' : 'Reveal'}
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
