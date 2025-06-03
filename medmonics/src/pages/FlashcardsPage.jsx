// FlashcardsPage.js
import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getMnemonicsCollectionPath } from '../firebase';

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
                    <button onClick={startQuiz} className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md">
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
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg text-center">
                <p className="text-sm text-slate-400 mb-2">
                    Card {currentCardIndex + 1} of {quizMnemonics.length}
                </p>
                <div className="bg-slate-700 p-8 rounded-lg min-h-[200px] flex flex-col items-center justify-center transition-all duration-300 ease-in-out">
                    <p className="text-2xl md:text-3xl font-bold text-sky-300 mb-4">{currentCard.acronym}</p>
                    {showAnswer && (
                        <p className="text-lg text-slate-200 whitespace-pre-wrap">{currentCard.fullForm}</p>
                    )}
                </div>
                <button 
                    onClick={() => setShowAnswer(!showAnswer)} 
                    className="mt-6 bg-yellow-500 hover:bg-yellow-400 text-slate-800 font-semibold py-2 px-6 rounded-lg shadow-md"
                >
                    {showAnswer ? 'Hide Answer' : 'Show Answer'}
                </button>
                <div className="mt-6 flex gap-3 justify-center">
                    <button onClick={handlePrevCard} disabled={currentCardIndex === 0} className="bg-slate-500 hover:bg-slate-400 text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50">Previous</button>
                    <button onClick={handleNextCard} disabled={currentCardIndex === quizMnemonics.length - 1} className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50">Next</button>
                </div>
                 <button onClick={startQuiz} className="mt-4 bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md">Restart Quiz</button>
            </div>
        </div>
    );
};

export default FlashcardsPage;
