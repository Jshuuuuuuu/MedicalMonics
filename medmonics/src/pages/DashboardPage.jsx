import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import Modal from "../contexts/Modal";
import "../styles/common.css";
import "../styles/DashboardPage.css";

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [mnemonics, setMnemonics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMnemonic, setSelectedMnemonic] = useState(null);
  const showToast = useToast();

  const categories = [
    "All",
    "Pathology",
    "Anatomy",
    "Histology",
    "Embryology",
    "Pharmacology",
    "Microbiology",
    "Neurology",
  ];

  useEffect(() => {
    if (!currentUser) return;

    const fetchMnemonics = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/get-mnemonics", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          params: {
            category: activeCategory === "All" ? "" : activeCategory,
            searchQuery: searchQuery,
          },
        });
        setMnemonics(response.data);
      } catch (error) {
        console.error("Error fetching mnemonics:", error.response || error);
        showToast("Error fetching mnemonics", "error");
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

  const handleMnemonicClick = (mnemonic) => {
    setSelectedMnemonic(mnemonic);
  };

  const handleCloseModal = () => {
    setSelectedMnemonic(null);
  };

  return (
    <div className="dashboard-page">
      <div className="main-content">
        <h1 className="page-title">Welcome to MedMnemonics</h1>

        {/* Category Sidebar */}
        <aside className="category-sidebar">
          <h3>Categories</h3>
          <ul className="category-list vertical">
            {categories.map((category) => (
              <li
                key={category}
                className={activeCategory === category ? "active" : ""}
              >
                <a href="#" onClick={() => handleCategoryClick(category)}>
                  {category}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <div className="dashboard-layout with-sidebar">
          <div className="mnemonics-content">
            <div className="content-header">
              <h2 className="mnemonics-heading">Dashboard</h2>
              <div className="search-container right-align">
                <input
                  type="text"
                  placeholder="Search mnemonics..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="dashboard-panels">
              <div className="dashboard-overview">
                <div className="progress-box">
                  <h3>Progress Overview</h3>
                  <p>Coming soon: your daily learning stats</p>
                </div>

                <div className="analytics-box">
                  <h3>Analytical Report</h3>
                  <p>Track your mnemonic performance and trends.</p>
                </div>
              </div>

              <div className="mnemonics-section">
                <div className="mnemonics-grid">
                  {loading ? (
                    <p>Loading mnemonics...</p>
                  ) : mnemonics.length > 0 ? (
                    mnemonics.map((mnemonic) => (
                      <div
                        key={mnemonic.id}
                        className="mnemonic-card"
                        onClick={() => handleMnemonicClick(mnemonic)}
                      >
                        <h3>{mnemonic.acronym}</h3>
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

        {selectedMnemonic && (
          <Modal isOpen={true} onClose={handleCloseModal} title="Mnemonic Details">
            <div className="modal-content">
              <h3>{selectedMnemonic.acronym}</h3>
              <p><strong>Full Form:</strong> {selectedMnemonic.fullForm}</p>
              <p><strong>Category:</strong> {selectedMnemonic.category}</p>
              <p><strong>Tags:</strong> {selectedMnemonic.tags?.join(", ")}</p>
              <p><strong>Body System:</strong> {selectedMnemonic.bodySystem}</p>
              <p><strong>Exam Relevance:</strong> {selectedMnemonic.examRelevance}</p>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
