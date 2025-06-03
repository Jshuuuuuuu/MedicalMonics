// AppLayout.js
import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import DashboardPage from '../pages/DashboardPage';
import LibraryPage from '../pages/LibraryPage';
import AddMnemonicPage from '../pages/AddMnemonicPage';
import FlashcardsPage from '../pages/FlashcardsPage';


const DashboardIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;
const LibraryIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>;
const AddNewIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const QuizIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.33 10.67a2.5 2.5 0 11-4.66 0 2.5 2.5 0 014.66 0zM12 17.5V14.5"></path></svg>;
const LogoutIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>;
const MenuIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>;


const AppLayout = () => {
    const [currentView, setCurrentView] = useState('dashboard');
    const [editingMnemonic, setEditingMnemonic] = useState(null);
    const { auth } = useAuth();
    const showToast = useToast();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            showToast("Logged out successfully.", "success");
        } catch (error) {
            console.error("Sign out error", error);
            showToast(`Sign out error: ${error.message}`, "error");
        }
    };
    
    const handleEditMnemonic = (mnemonic) => {
        setEditingMnemonic(mnemonic);
        setCurrentView('add-edit-mnemonic');
    };

    const clearEditingState = () => {
        setEditingMnemonic(null);
        setCurrentView('library'); 
    };
    
    const handleMnemonicAddedOrUpdated = () => {
        setCurrentView('library');
        setEditingMnemonic(null);
    };

    const navItems = [
        { view: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
        { view: 'library', label: 'View Library', icon: <LibraryIcon /> },
        { view: 'add-edit-mnemonic', label: 'Add New', icon: <AddNewIcon /> },
        { view: 'quiz', label: 'Flashcard Quiz', icon: <QuizIcon /> },
    ];

    return (
        <div className="w-full h-screen flex bg-slate-900 text-slate-100">
            {isSidebarOpen && (
                 <div 
                    onClick={() => setIsSidebarOpen(false)} 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                ></div>
            )}
            <aside className={`fixed md:static inset-y-0 left-0 bg-slate-800 shadow-lg w-64 p-4 space-y-4 flex flex-col z-40 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
                <div className="text-center py-2 border-b border-slate-700">
                    <h1 className="text-2xl font-bold text-sky-400">Mnemonics</h1>
                    <p className="text-xs text-slate-400">Library & Quiz</p>
                </div>
                <nav className="flex-grow sidebar-content overflow-y-auto">
                    <ul className="space-y-2">
                        {navItems.map(item => (
                            <li key={item.view}>
                                <button 
                                    onClick={() => { setCurrentView(item.view); if (item.view !== 'add-edit-mnemonic') setEditingMnemonic(null); setIsSidebarOpen(false); }}
                                    className={`nav-btn w-full text-left flex items-center gap-3 font-medium py-2.5 px-3 rounded-lg transition-colors duration-150 ${currentView === item.view ? 'bg-slate-700 text-sky-300' : 'text-slate-200 hover:bg-slate-700 hover:text-sky-300'}`}
                                >
                                    {item.icon} {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="border-t border-slate-700 pt-2">
                     <button onClick={handleSignOut} className="nav-btn w-full text-left flex items-center gap-3 hover:bg-red-700/50 hover:text-red-300 text-slate-300 font-medium py-2.5 px-3 rounded-lg transition-colors duration-150">
                        <LogoutIcon /> Logout
                    </button>
                </div>
                <div className="mt-auto text-center text-xs text-slate-500 p-2">
                    &copy; {new Date().getFullYear()} Mnemonic Master
                </div>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="md:hidden bg-slate-800 p-3 shadow-md flex items-center justify-between">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-sky-400 p-2">
                        <MenuIcon />
                    </button>
                    <h2 className="text-lg font-semibold text-sky-300 capitalize">
                        {currentView.replace(/-/g, ' ')}
                    </h2>
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-700/30">
                    {currentView === 'dashboard' && <DashboardPage />}
                    {currentView === 'library' && <LibraryPage onEditMnemonic={handleEditMnemonic} />}
                    {currentView === 'add-edit-mnemonic' && (
                        <AddMnemonicPage 
                            editingMnemonic={editingMnemonic}
                            onMnemonicAdded={handleMnemonicAddedOrUpdated}
                            onMnemonicUpdated={handleMnemonicAddedOrUpdated}
                            clearEditing={clearEditingState}
                        />
                    )}
                    {currentView === 'quiz' && <FlashcardsPage />}
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
