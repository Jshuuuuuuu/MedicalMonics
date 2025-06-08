import React, { useState, useEffect } from 'react';
import axios from 'axios'; // For making HTTP requests to the backend
import { useAuth } from '../contexts/AuthContext'; // Assuming we use useAuth to manage current user
import { useToast } from '../contexts/ToastContext';
import '../styles/common.css';
import '../styles/DashboardPage.css'; // Using the provided CSS

const FamousMnemonicsPage = () => {
  const { currentUser } = useAuth();  // Accessing the logged-in user from context
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Pathology'); // Default active category
  const [mnemonics, setMnemonics] = useState([]);
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  const categories = [
    'Pathology',
    'Anatomy',
    'Histology',
    'Embryology',
    'Pharmacology',
    'Microbiology',
  ];

  // Fetch mnemonics when the category or search query changes
  useEffect(() => {
    if (!currentUser) return; // Ensure user is logged in

    const fetchMnemonics = async () => {
      setLoading(true);

      try {
        const response = await axios.get('http://localhost:5000/get-mnemonics', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Send JWT token
          },
          params: {
            category: activeCategory,
            searchQuery: searchQuery,
          },
        });

        setMnemonics(response.data);  // Set fetched mnemonics data
      } catch (error) {
        console.error('Error fetching mnemonics:', error);
        showToast('Error fetching mnemonics', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchMnemonics();
  }, [activeCategory, searchQuery, currentUser, showToast]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    // Trigger a search fetch (useEffect hook will handle this)
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="dashboard-page">
      <div className="main-content">
        <h1 className="page-title">Famous Mnemonics</h1> {/* Main page title */}
        <div className="library-container">
          <aside className="sidebar">
            <h3>Categories</h3>
            <ul className="category-list">
              {categories.map((category) => (
                <li key={category} className={activeCategory === category ? 'active' : ''}>
                  <a href="#" onClick={() => handleCategoryClick(category)}>
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          <div className="mnemonics-content">
            <div className="content-header">
              <h2>Famous Mnemonics</h2>
              <div className="search-container">
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    placeholder="Search mnemonics..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  <button type="submit">
                    <i className="fas fa-search"></i> {/* FontAwesome search icon */}
                  </button>
                </form>
              </div>
            </div>

            {/* Displaying the fetched mnemonics */}
            <div className="mnemonics-grid">
              {loading ? (
                <p>Loading mnemonics...</p>  // Display loading message while fetching
              ) : mnemonics.length > 0 ? (
                mnemonics.map((mnemonic) => (
                  <div key={mnemonic.id} className="mnemonic-card">
                    <h3>{mnemonic.title}</h3>
                    <p>{mnemonic.content}</p>
                  </div>
                ))
              ) : (
                <p>No mnemonics found for this category or search.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamousMnemonicsPage;
