import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';  // For making HTTP requests to the backend
import '../styles/common.css';
import '../styles/FlashcardsPage.css';

const FlashcardsPage = () => {
    const { userId } = useAuth();
    const [allMnemonics, setAllMnemonics] = useState([]);
    const [availableTopics, setAvailableTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [displayedMnemonics, setDisplayedMnemonics] = useState([]);
    const [showAnswersForDisplayedCards, setShowAnswersForDisplayedCards] = useState(false);
    const showToast = useToast();

    // Fetch mnemonics from PostgreSQL (via the backend API)
    useEffect(() => {
        if (!userId) return;
        const fetchMnemonics = async () => {
            try {
                const response = await axios.get('http://localhost:5000/get-mnemonics', {
                    params: { userId: userId }
                });
                const mnemonics = response.data;

                setAllMnemonics(mnemonics);

                // Extract unique categories for topic selection
                const topics = [...new Set(mnemonics.map(m => m.category).filter(Boolean))];
                setAvailableTopics(topics);
                if (topics.length > 0) {
                    setSelectedTopic(topics[0]); // Select the first topic by default
                } else {
                    setSelectedTopic('');
                }
            } catch (error) {
                console.error('Error fetching mnemonics:', error);
                showToast(`Error fetching mnemonics: ${error.message}`, 'error');
            }
        };

        fetchMnemonics();
    }, [userId, showToast]);

    // Function to shuffle and select 3 mnemonics for display based on topic
    const selectMnemonicsForDisplay = () => {
        let filteredMnemonics = allMnemonics;
        if (selectedTopic) {
            filteredMnemonics = allMnemonics.filter(m => m.category === selectedTopic);
        }

        if (filteredMnemonics.length === 0) {
            showToast("No mnemonics available for the selected topic.", "warning");
            setDisplayedMnemonics([]);
            return;
        }

        const shuffled = [...filteredMnemonics].sort(() => Math.random() - 0.5);
        // Display up to 3 cards
        setDisplayedMnemonics(shuffled.slice(0, 3));
        setShowAnswersForDisplayedCards(false); // Reset show answers when new cards are displayed
    };

    const handleBeginQuiz = () => {
        selectMnemonicsForDisplay();
    };

    const handleNextCards = () => {
        selectMnemonicsForDisplay(); // Get new set of 3 cards
    };

    const handleRevealCards = () => {
        setShowAnswersForDisplayedCards(prev => !prev);
    };

    if (allMnemonics.length === 0) {
        return (
            <div className="flashcards-page-container">
                <h2 className="flashcard-title">Flashcards</h2>
                <p className="flashcard-intro">Add some mnemonics to your library to start reviewing!</p>
            </div>
        );
    }

    return (
        <div className="flashcards-page-container">
            <h2 className="flashcard-title">Flashcards</h2>
            <p className="flashcard-intro">Select mnemonic to review</p>

            <div className="topic-selection-section">
                <select
                    className="topic-dropdown"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                >
                    <option value="">All Topics</option>
                    {availableTopics.map(topic => (
                        <option key={topic} value={topic}>{topic}</option>
                    ))}
                </select>
                <button onClick={handleBeginQuiz} className="begin-btn">
                    Begin
                </button>
            </div>

            <div className="flashcard-display-area">
                {displayedMnemonics.length > 0 ? (
                    displayedMnemonics.map((card, index) => (
                        <div key={card.id} className="flashcard-item">
                            <div className="flashcard-flip-container">
                                <div className={`flashcard-inner ${showAnswersForDisplayedCards ? 'show-answer' : ''}`}>
                                    <div className="flashcard-front">
                                        <p className="flashcard-acronym">{card.acronym}</p>
                                        {!showAnswersForDisplayedCards && (
                                            <p className="flashcard-hint">Hover or reveal to see answer</p>
                                        )}
                                    </div>
                                    <div className="flashcard-back">
                                        <p className="flashcard-acronym">{card.acronym}</p>
                                        <p className="flashcard-answer">{card.fullForm}</p>
                                        {card.category && (
                                            <span className="flashcard-category">{card.category}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <p className="flashcard-category-label">{card.category || 'No Category'}</p>
                            <h3 className="flashcard-heading">{card.acronym}</h3>
                            <p className="flashcard-description">
                                {showAnswersForDisplayedCards ? card.fullForm : "Click 'Reveal Cards' to see the full form."}
                            </p>
                        </div>
                    ))
                ) : (
                    // Placeholder cards if no mnemonics are displayed yet or after 'Begin'
                    Array.from({ length: 3 }).map((_, index) => (
                        <div key={`placeholder-${index}`} className="flashcard-item placeholder-card">
                            <div className="image-placeholder">Image Placeholder</div>
                            <p className="flashcard-category-label">Category</p>
                            <h3 className="flashcard-heading">Blog title heading goes here</h3>
                            <p className="flashcard-description">
                                Lorem ipsum dolor sit amet et delectus accommodare his consul copiosae.
                            </p>
                        </div>
                    ))
                )}
            </div>

            {displayedMnemonics.length > 0 && (
                <div className="flashcard-quiz-controls">
                    <button
                        onClick={handleRevealCards}
                        className="reveal-cards-btn"
                    >
                        {showAnswersForDisplayedCards ? "Hide Cards" : "Reveal Cards"}
                    </button>
                    <button
                        onClick={handleNextCards}
                        className="next-cards-btn"
                    >
                        Next Cards
                    </button>
                </div>
            )}
        </div>
    );
};

export default FlashcardsPage;
