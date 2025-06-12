import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import DashboardPage from '../pages/DashboardPage';
import AddMnemonicPage from '../pages/AddMnemonicPage';
import FlashcardsPage from '../pages/FlashcardsPage';
import '../styles/AppLayout.css';

// You can import icons from a library like react-icons or lucide-react
// For example: import { Home, Plus, BookOpen, LogOut } from 'lucide-react';

const AppLayout = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [editingMnemonic, setEditingMnemonic] = useState(null);
  const { currentUser, logout } = useAuth();
  const showToast = useToast();

  const handleSignOut = () => {
    try {
      logout();
      showToast('Logged out successfully.', 'success');
    } catch (error) {
      console.error('Sign out error', error);
      showToast(`Sign out error: ${error.message}`, 'error');
    }
  };

  const handleEditMnemonic = (mnemonic) => {
    setEditingMnemonic(mnemonic);
    setCurrentView('add-edit-mnemonic');
  };

  const clearEditingState = () => {
    setEditingMnemonic(null);
    setCurrentView('dashboard');
  };

  const handleMnemonicAddedOrUpdated = () => {
    setCurrentView('dashboard');
    setEditingMnemonic(null);
  };

  const navItems = [
    { 
      view: 'dashboard', 
      label: 'Dashboard',
      icon: '🏠' // Replace with actual icon component: <Home className="nav-icon" />
    },
    { 
      view: 'add-edit-mnemonic', 
      label: 'Add Mnemonic',
      icon: '➕' // Replace with: <Plus className="nav-icon" />
    },
    { 
      view: 'quiz', 
      label: 'FlashCard',
      icon: '📚' // Replace with: <BookOpen className="nav-icon" />
    },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="app-logo">
          <span>MedMnemonics</span>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {navItems.map(item => (
              <li key={item.view}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentView(item.view);
                    if (item.view !== 'add-edit-mnemonic') setEditingMnemonic(null);
                  }}
                  className={`nav-link ${currentView === item.view ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.label}</span>
                </a>
              </li>
            ))}
            <li>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  handleSignOut();
                }} 
                className="nav-link log-out"
              >
                <span className="nav-icon">🚪</span> {/* Replace with: <LogOut className="nav-icon" /> */}
                <span className="nav-text">Log out</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Content Area */}
      <main className="content-area">
        {currentView === 'dashboard' && <DashboardPage />}
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
  );
};

export default AppLayout;