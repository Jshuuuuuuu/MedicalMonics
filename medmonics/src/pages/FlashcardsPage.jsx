// FlashcardsPage.js
import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getMnemonicsCollectionPath } from '../firebase';
// Optional: If you have Heroicons installed
import { ArrowLeftIcon, ArrowRightIcon, ArrowPathIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

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
                <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-purple-400">Flashcard Quiz</h2>
                <p className="text-slate-400 text-center">Add some mnemonics to your library to start a quiz!</p>
            </div>
        );
    }
    
    if (quizMnemonics.length === 0) {
        return (
            <div>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-purple-400">Flashcard Quiz</h2>
                <div className="text-center">
                    <p className="text-slate-300 mb-4">Ready to test your knowledge?</p>
                    <button onClick={startQuiz} className="bg-gradient-to-r from-purple-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition">
                        Start Quiz ({allMnemonics.length} mnemonics)
                    </button>
                </div>
            </div>
        );
    }

    const currentCard = quizMnemonics[currentCardIndex];

    return (
        <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-purple-400">Flashcard Quiz</h2>
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-8 rounded-2xl shadow-2xl max-w-lg mx-auto text-center border border-slate-700">
                <p className="text-sm text-slate-400 mb-2">
                    Card {currentCardIndex + 1} of {quizMnemonics.length}
                </p>
                {/* Flashcard flip effect */}
                <div className="relative flex justify-center items-center min-h-[220px] mb-6">
                    <div className={`transition-transform duration-500 ease-in-out w-full`} style={{ perspective: 1000 }}>
                        <div className={`relative w-full h-full ${showAnswer ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d', transition: 'transform 0.5s' }}>
                            {/* Front */}
                            <div className={`absolute w-full h-full backface-hidden flex flex-col items-center justify-center bg-slate-700 rounded-xl shadow-lg p-8`}>
                                <p className="text-3xl md:text-4xl font-bold text-sky-300 mb-2">{currentCard.acronym}</p>
                                {!showAnswer && (
                                    <p className="text-base text-slate-400 italic">Click "Show Answer" to reveal</p>
                                )}
                            </div>
                            {/* Back */}
                            <div className={`absolute w-full h-full backface-hidden flex flex-col items-center justify-center bg-sky-900 rounded-xl shadow-lg p-8 rotate-y-180`}>
                                <p className="text-3xl md:text-4xl font-bold text-sky-300 mb-2">{currentCard.acronym}</p>
                                <p className="text-lg text-slate-200 whitespace-pre-wrap">{currentCard.fullForm}</p>
                                {currentCard.category && (
                                    <span className="mt-3 text-xs text-sky-400 bg-slate-800 px-2 py-1 rounded">{currentCard.category}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => setShowAnswer(!showAnswer)} 
                    className="mt-2 bg-yellow-500 hover:bg-yellow-400 text-slate-800 font-semibold py-2 px-6 rounded-lg shadow-md flex items-center justify-center gap-2 transition"
                >
                    {showAnswer ? (
                        <>
                            {/* <EyeSlashIcon className="h-5 w-5" /> */} Hide Answer
                        </>
                    ) : (
                        <>
                            {/* <EyeIcon className="h-5 w-5" /> */} Show Answer
                        </>
                    )}
                </button>
                <div className="mt-6 flex gap-3 justify-center">
                    <button
                        onClick={handlePrevCard}
                        disabled={currentCardIndex === 0}
                        className="flex items-center gap-1 bg-slate-500 hover:bg-slate-400 text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50 transition"
                    >
                        {/* <ArrowLeftIcon className="h-5 w-5" /> */}
                        Previous
                    </button>
                    <button
                        onClick={handleNextCard}
                        disabled={currentCardIndex === quizMnemonics.length - 1}
                        className="flex items-center gap-1 bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50 transition"
                    >
                        Next
                        {/* <ArrowRightIcon className="h-5 w-5" /> */}
                    </button>
                </div>
                <button
                    onClick={startQuiz}
                    className="mt-6 flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition"
                >
                    {/* <ArrowPathIcon className="h-5 w-5" /> */}
                    Restart Quiz
                </button>
            </div>
        </div>
    );
};

export default FlashcardsPage;
