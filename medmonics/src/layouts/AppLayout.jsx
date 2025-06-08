import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import DashboardPage from '../pages/DashboardPage';
import LibraryPage from '../pages/LibraryPage';
import AddMnemonicPage from '../pages/AddMnemonicPage';
import FlashcardsPage from '../pages/FlashcardsPage';
import '../styles/AppLayout.css'; // Make sure this CSS file is created as well

const AppLayout = () => {
  const [currentView, setCurrentView] = useState('dashboard'); // Default to dashboard
  const [editingMnemonic, setEditingMnemonic] = useState(null);
  const { user, setUser } = useAuth();  // Assuming user context handles user session
  const showToast = useToast();

  const handleSignOut = async () => {
    try {
      // Call to your backend to log the user out (e.g., invalidate JWT token)
      await fetch('http://localhost:5000/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`, // Send current JWT token to server
        },
      });

      // Clear user data from context or localStorage
      setUser(null);
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
    setCurrentView('library'); // Assuming 'library' is the default view after clearing edit
  };

  const handleMnemonicAddedOrUpdated = () => {
    setCurrentView('library'); // Go to library after add/update
    setEditingMnemonic(null);
  };

  // Adjusting navItems to match the image's text links
  const navItems = [
    { view: 'dashboard', label: 'Dashboard' },
    { view: 'library', label: 'Library' },
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
  );
};

export default AppLayout;
