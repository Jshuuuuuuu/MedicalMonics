import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import DashboardPage from '../pages/DashboardPage';
import AddMnemonicPage from '../pages/AddMnemonicPage';
import FlashcardsPage from '../pages/FlashcardsPage';
import '../styles/AppLayout.css';

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
    { view: 'dashboard', label: 'Dashboard' },
    { view: 'add-edit-mnemonic', label: 'AddMnemonic' },
    { view: 'quiz', label: 'FlashCard' },
  ];

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-logo">MedMnemonics</div>
        <nav className="header-nav">
          <ul>
            {navItems.map(item => (
              <li key={item.view}>
                <button
                  onClick={() => {
                    setCurrentView(item.view);
                    if (item.view !== 'add-edit-mnemonic') setEditingMnemonic(null);
                  }}
                  className={`nav-link ${currentView === item.view ? 'active' : ''}`}
                >
                  {item.label}
                </button>
              </li>
            ))}
            <li>
              <button onClick={handleSignOut} className="nav-link log-out">
                Log out
              </button>
            </li>
          </ul>
        </nav>
      </header>

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
