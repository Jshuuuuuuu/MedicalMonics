// AppLayout.js
import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import DashboardPage from '../pages/DashboardPage';
import LibraryPage from '../pages/LibraryPage';
import AddMnemonicPage from '../pages/AddMnemonicPage';
import FlashcardsPage from '../pages/FlashcardsPage';
import '../styles/AppLayout.css';

const DashboardIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
  </svg>
);

const LibraryIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
  </svg>
);

const AddNewIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const QuizIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.33 10.67a2.5 2.5 0 11-4.66 0 2.5 2.5 0 014.66 0zM12 17.5V14.5"></path>
  </svg>
);

const LogoutIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
  </svg>
);

const MenuIcon = () => (
  <svg className="icon menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
  </svg>
);

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
    <div className="app-container">
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="sidebar-overlay"
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="title">Mnemonics</h1>
          <p className="subtitle">Library & Quiz</p>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {navItems.map(item => (
              <li key={item.view}>
                <button
                  onClick={() => {
                    setCurrentView(item.view);
                    if (item.view !== 'add-edit-mnemonic') setEditingMnemonic(null);
                    setIsSidebarOpen(false);
                  }}
                  className={`nav-button ${currentView === item.view ? 'active' : ''}`}
                >
                  {item.icon} <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleSignOut} className="nav-button logout-button">
            <LogoutIcon /> <span>Logout</span>
          </button>
          <div className="copyright">
            &copy; {new Date().getFullYear()} Mnemonic Master
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-content">
        {/* Mobile header */}
        <header className="mobile-header">
          <button onClick={() => setIsSidebarOpen(true)} className="menu-button">
            <MenuIcon />
          </button>
          <h2 className="page-title">{currentView.replace(/-/g, ' ')}</h2>
        </header>

        <main className="content-area">
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
