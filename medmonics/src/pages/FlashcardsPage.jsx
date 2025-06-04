// FlashcardsPage.js
import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getMnemonicsCollectionPath } from '../firebase';
import '../styles/FlashcardsPage.css';

const FlashcardsPage = () => {
    const { userId, db } = useAuth();
    const [allMnemonics, setAllMnemonics] = useState([]);
    const [quizMnemonics, setQuizMnemonics] = useState([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const showToast = useToast();

    useEffect(() => {
        if (!userId || !db) return;
        const mnemonicsColPath = getMnemonicsCollectionPath(userId);
        const q = query(collection(db, mnemonicsColPath));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMnemonics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllMnemonics(fetchedMnemonics);
        }, (error) => {
            console.error("Error fetching mnemonics for quiz:", error);
            showToast(`Error fetching mnemonics: ${error.message}`, 'error');
        });
        return () => unsubscribe();
    }, [userId, db, showToast]);

    const startQuiz = () => {
        if (allMnemonics.length === 0) {
            showToast("No mnemonics available to start a quiz.", "warning");
            return;
        }
        const shuffled = [...allMnemonics].sort(() => Math.random() - 0.5);
        setQuizMnemonics(shuffled);
        setCurrentCardIndex(0);
        setShowAnswer(false);
    };

    const handleNextCard = () => {
        if (currentCardIndex < quizMnemonics.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
            setShowAnswer(false);
        } else {
            showToast("Quiz finished!", "success");
        }
    };

    const handlePrevCard = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(prev => prev - 1);
            setShowAnswer(false);
        }
    };

    if (allMnemonics.length === 0) {
        return (
            <div>
                <h2 className="flashcard-title">Flashcard Quiz</h2>
                <p className="flashcard-intro">Add some mnemonics to your library to start a quiz!</p>
            </div>
        );
    }

    if (quizMnemonics.length === 0) {
        return (
            <div>
                <h2 className="flashcard-title">Flashcard Quiz</h2>
                <div className="flashcard-intro">
                    <p className="flashcard-intro">Ready to test your knowledge?</p>
                    <button onClick={startQuiz} className="start-quiz-btn">
                        Start Quiz ({allMnemonics.length} mnemonics)
                    </button>
                </div>
            </div>
        );
    }

    const currentCard = quizMnemonics[currentCardIndex];

    return (
        <div>
            <h2 className="flashcard-title">Flashcard Quiz</h2>
            <div className="flashcard-container">
                <p className="flashcard-progress">
                    Card {currentCardIndex + 1} of {quizMnemonics.length}
                </p>

                <div className="flashcard-flip-container">
                    <div className={`flashcard-inner ${showAnswer ? 'show-answer' : ''}`}>
                        <div className="flashcard-front">
                            <p className="flashcard-acronym">{currentCard.acronym}</p>
                            {!showAnswer && (
                                <p className="flashcard-hint">Click "Show Answer" to reveal</p>
                            )}
                        </div>
                        <div className="flashcard-back">
                            <p className="flashcard-acronym">{currentCard.acronym}</p>
                            <p className="flashcard-answer">{currentCard.fullForm}</p>
                            {currentCard.category && (
                                <span className="flashcard-category">{currentCard.category}</span>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="toggle-answer-btn"
                >
                    {showAnswer ? "Hide Answer" : "Show Answer"}
                </button>

                <div className="flashcard-controls">
                    <button
                        onClick={handlePrevCard}
                        disabled={currentCardIndex === 0}
                        className="prev-btn"
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNextCard}
                        disabled={currentCardIndex === quizMnemonics.length - 1}
                        className="next-btn"
                    >
                        Next
                    </button>
                </div>

                <button
                    onClick={startQuiz}
                    className="restart-quiz-btn"
                >
                    Restart Quiz
                </button>
            </div>
        </div>
    );
};

export default FlashcardsPage;
