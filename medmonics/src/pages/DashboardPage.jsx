import React, { useState } from 'react';
// import { collection, query, onSnapshot } from 'firebase/firestore'; // Uncomment if fetching data from Firebase
// import { useAuth } from '../contexts/AuthContext'; // Uncomment if using AuthContext
// import { getMnemonicsCollectionPath } from '../firebase'; // Uncomment if using Firebase
import '../styles/common.css';
import '../styles/DashboardPage.css'; // Using the provided CSS


const FamousMnemonicsPage = () => {
    // const { userId, db } = useAuth(); // Uncomment if using AuthContext
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Pathology'); // Default active category based on image

    // This data would typically come from a database fetch,
    // but for demonstration based on the image, we'll use a placeholder.
    const categories = [
        'Pathology',
        'Anatomy',
        'Histology',
        'Embryology',
        'Pharmacology',
        'Microbiology',
    ];

    // You would typically fetch and filter mnemonics based on activeCategory and searchQuery
    const famousMnemonics = []; // Placeholder for mnemonics data

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleCategoryClick = (category) => {
        setActiveCategory(category);
        // In a real application, you'd trigger a data fetch/filter here
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        // In a real application, you'd trigger a search here
        console.log('Searching for:', searchQuery);
    };

    return (
        <div className="dashboard-page">
            <div className="main-content">
                <h1 className="page-title">Famous Mnemonics</h1> {/* Changed to h1 as it's the main page title */}
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
                            <h2>Famous Mnemonics</h2> {/* This title is also present in the main content area */}
                            <div className="search-container">
                                <form onSubmit={handleSearchSubmit}>
                                    <input
                                        type="text"
                                        placeholder="Search mnemonics..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                    />
                                    <button type="submit">
                                        <i className="fas fa-search"></i> {/* Assuming Font Awesome for search icon */}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* This is where the mnemonics grid would be rendered if there were any */}
                        <div className="mnemonics-grid">
                            {/* {famousMnemonics.length > 0 ? (
                                famousMnemonics.map(mnemonic => (
                                    // Render mnemonic card here
                                ))
                            ) : (
                                <p>No famous mnemonics found for this category or search.</p>
                            )} */}
                            {/* Placeholder for no mnemonics, as per the image's empty content area */}
                            <p>Select a category or use the search bar to find mnemonics.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FamousMnemonicsPage;