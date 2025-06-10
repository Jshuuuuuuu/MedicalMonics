import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBrain, faSearch, faHeartbeat, faPills, faVirus, faDna, faFlask, faEnvelope, faMoon } from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons'; 
import LoginPage from './LoginPage';
import "../styles/HomePage.css";


function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [mnemonics, setMnemonics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const fetchMnemonics = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/get-mnemonics', {
          params: { searchQuery },
        });
        setMnemonics(response.data);
      } catch (error) {
        console.error('Error fetching mnemonics:', error);
        // Don't let API errors block the UI
        setMnemonics([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if there's a search query, otherwise show empty state
    if (searchQuery.trim()) {
      fetchMnemonics();
    } else {
      setMnemonics([]);
      setLoading(false);
    }
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryClick = (category) => {
    console.log('Category clicked:', category);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    setShowLoginPopup(true);
  };

  const handleCloseLoginPopup = () => {
    setShowLoginPopup(false);
  };

  const handleLoginSuccess = () => {
    setShowLoginPopup(false);
    // Handle successful login (e.g., redirect to dashboard)
    console.log('Login successful!');
  };

  return (
    <>
      <header>
        <nav>
          <a href="#" className="logo">
            <FontAwesomeIcon icon={faBrain} />Med<span>Mnemonics</span>
          </a>
          <div className="nav-links">
            <a href="#">Home</a>
            <a href="#">Browse</a>
            <a href="#">Contribute</a>
            <a href="/frontEnd/aboutpage/index.html">About</a>
            <a href="#" id="loginLink" onClick={handleLoginClick}>Login</a>
          </div>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1>Master Medicine with Powerful Mnemonics</h1>
          <p>Discover, create, and share medical mnemonics to boost your learning and retention</p>
          <div className="search-container">
            <input
              type="text"
              id="search"
              placeholder="Search for mnemonics (e.g., 'cranial nerves', 'antibiotics')"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button className="search-btn" onClick={handleSearchSubmit}><FontAwesomeIcon icon={faSearch} /></button>
          </div>
        </div>
      </section>

      <div className="main-content">
        <section className="filter-section">
          <h3>Filter Mnemonics</h3>
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="category">Category</label>
              <select id="category">
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="system">Body System</label>
              <select id="system">
                <option value="">All Systems</option>
                <option value="cardiovascular">Cardiovascular</option>
                <option value="respiratory">Respiratory</option>
                <option value="gastrointestinal">Gastrointestinal</option>
                <option value="neurology">Neurology</option>
                <option value="endocrine">Endocrine</option>
                <option value="renal">Renal</option>
              </select>
            </div>
          </div>
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select id="difficulty">
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="exam">Exam Relevance</label>
              <select id="exam">
                <option value="">All Exams</option>
                <option value="usmle">USMLE</option>
                <option value="ncle">NCLEX</option>
                <option value="plab">PLAB</option>
                <option value="medical-school">Medical School</option>
              </select>
            </div>
          </div>
          <button className="reset-btn">Reset Filters</button>
        </section>

        <section>
          <div className="section-title">
            <h2>Popular Mnemonics</h2>
          </div>
          <div className="mnemonics-grid" id="mnemonics-grid">
            {loading ? (
              <p>Loading mnemonics...</p>
            ) : mnemonics.length > 0 ? (
              mnemonics.map((mnemonic, index) => (
                <div key={mnemonic.id || index} className="mnemonic-card">
                  <h3>{mnemonic.title}</h3>
                  <p>{mnemonic.content}</p>
                </div>
              ))
            ) : searchQuery.trim() ? (
              <p>No mnemonics found for "{searchQuery}".</p>
            ) : (
              <p>Start typing to search for mnemonics...</p>
            )}
          </div>
        </section>

        <section className="categories-section">
          <div className="section-title">
            <h2>Browse by Category</h2>
          </div>
          <div className="categories-grid">
            <div className="category-card">
              <FontAwesomeIcon icon={faHeartbeat} />
              <h3>Anatomy</h3>
              <p>200+ mnemonics</p>
            </div>
            <div className="category-card">
              <FontAwesomeIcon icon={faPills} />
              <h3>Pharmacology</h3>
              <p>150+ mnemonics</p>
            </div>
            <div className="category-card">
              <FontAwesomeIcon icon={faVirus} />
              <h3>Pathology</h3>
              <p>180+ mnemonics</p>
            </div>
            <div className="category-card">
              <FontAwesomeIcon icon={faDna} />
              <h3>Microbiology</h3>
              <p>120+ mnemonics</p>
            </div>
            <div className="category-card">
              <FontAwesomeIcon icon={faFlask} />
              <h3>Biochemistry</h3>
              <p>90+ mnemonics</p>
            </div>
          </div>
        </section>
      </div>

      <footer>
        <div className="footer-content">
          <div className="footer-column">
            <h3>MedMnemonics</h3>
            <p>A comprehensive library of medical mnemonics to help students and professionals master complex medical concepts.</p>
          </div>
          <div className="footer-column">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#">Browse Mnemonics</a></li>
              <li><a href="#">Contribute</a></li>
              <li><a href="#">About Us</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Categories</h3>
            <ul>
              <li><a href="#">Anatomy</a></li>
              <li><a href="#">Pharmacology</a></li>
              <li><a href="#">Pathology</a></li>
              <li><a href="#">Microbiology</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Connect</h3>
            <ul>
              <li><a href="#"><FontAwesomeIcon icon={faTwitter} /> Twitter</a></li>
              <li><a href="#"><FontAwesomeIcon icon={faFacebook} /> Facebook</a></li>
              <li><a href="#"><FontAwesomeIcon icon={faInstagram} /> Instagram</a></li>
              <li><a href="#"><FontAwesomeIcon icon={faEnvelope} /> Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="copyright">
          &copy; 2023 MedMnemonics. All rights reserved.
        </div>
      </footer>

      <div className="dark-mode-toggle" id="darkModeToggle" onClick={toggleDarkMode}>
        <FontAwesomeIcon icon={faMoon} />
      </div>

      {showLoginPopup && (
        <div className="login-popup-overlay">
          <div className="login-popup-content">
            <button className="close-popup-btn" onClick={handleCloseLoginPopup}>&times;</button>
            <LoginPage onClose={handleCloseLoginPopup} onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}
    </>
  );
}

export default HomePage;