// AppLayout.js
import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import DashboardPage from '../pages/DashboardPage';
import LibraryPage from '../pages/LibraryPage'; // Assuming LibraryPage is what 'AddMnemonic' and 'Flashcard' refer to
import AddMnemonicPage from '../pages/AddMnemonicPage';
import FlashcardsPage from '../pages/FlashcardsPage';
import '../styles/AppLayout.css'; // Make sure this CSS file is created as well

const AppLayout = () => {
  const [currentView, setCurrentView] = useState('dashboard'); // Default to dashboard
  const [editingMnemonic, setEditingMnemonic] = useState(null);
  const { auth } = useAuth();
  const showToast = useToast();

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
    setCurrentView('library'); // Assuming 'library' is the default view after clearing edit
  };

  const handleMnemonicAddedOrUpdated = () => {
    setCurrentView('library'); // Go to library after add/update
    setEditingMnemonic(null);
  };

  // Adjusting navItems to match the image's text links
  const navItems = [
    { view: 'dashboard', label: 'Dashboard' },
    { view: 'library', label: 'Library' }, // Renamed from AddMnemonic to Library to match image
    { view: 'add-edit-mnemonic', label: 'AddMnemonic' }, // Renamed from Add New to match image
    { view: 'quiz', label: 'FlashCard' }, // Renamed from Flashcard Quiz to match image
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
        {/* The image shows a blank content area, but we keep the rendering logic for functionality */}
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