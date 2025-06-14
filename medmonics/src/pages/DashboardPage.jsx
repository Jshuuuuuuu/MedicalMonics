import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import Modal from "../contexts/Modal";
import AnalyticalReport from "../components/AnalyticalReport";
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

  // Add this new state at the beginning of your DashboardPage component
  const [progress, setProgress] = useState({
    totalMnemonics: 0,
    reviewedToday: 0,
    progressPercentage: 0,
    isComplete: false,
    resetTime: { hoursUntilReset: 0, minutesUntilReset: 0 },
  });

  // Add this new useEffect to fetch progress data
  useEffect(() => {
    if (!currentUser) return;

    const fetchProgress = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/get-progress-overview",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        setProgress(response.data);
      } catch (error) {
        console.error("Error fetching progress:", error);
      }
    };

    fetchProgress();

    // Refresh progress every 5 minutes
    const intervalId = setInterval(fetchProgress, 5 * 60 * 1000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [currentUser]);

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

  const handleMnemonicClick = async (mnemonic) => {
    setSelectedMnemonic(mnemonic);

    // Update last_reviewed when a mnemonic is clicked
    try {
      await axios.post(
        "http://localhost:5000/update-mnemonic-stats",
        {
          mnemonicId: mnemonic.id,
          isCorrect: true, // We'll count viewing as a correct interaction
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      // Refresh progress data after updating stats
      const progressResponse = await axios.get(
        "http://localhost:5000/get-progress-overview",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setProgress(progressResponse.data);
    } catch (error) {
      console.error("Error updating mnemonic stats:", error);
    }
  };

  const handleCloseModal = () => {
    setSelectedMnemonic(null);
  };

  return (
    <div className="dashboard-page">
      <div className="main-content">
        <h1 className="page-title">Welcome to MedMnemonics</h1>

        <div className="dashboard-layout">
          {/* Category List Inside Dashboard Panel */}
          <div className="category-list-container">
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
          </div>

          {/* Mnemonics Section */}
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
                  <div className="progress-content">
                    {/* Progress bar */}
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${progress.progressPercentage}%` }}
                      ></div>
                    </div>

                    {/* Progress stats */}
                    <div className="progress-stats">
                      <p>
                        <strong>{progress.reviewedToday}</strong> of{" "}
                        <strong>{progress.totalMnemonics}</strong> mnemonics studied
                        today
                        <span className="progress-percentage">
                          {" ("}
                          {progress.progressPercentage}
                          %)
                        </span>
                      </p>

                      {/* Show completion message or remaining count */}
                      {progress.isComplete ? (
                        <p className="progress-complete">
                          🎉 All mnemonics reviewed today!
                        </p>
                      ) : (
                        progress.totalMnemonics > 0 && (
                          <p className="progress-remaining">
                            {progress.totalMnemonics - progress.reviewedToday}{" "}
                            mnemonics remaining
                          </p>
                        )
                      )}
                    </div>

                    {/* Reset timer */}
                    <div className="reset-timer">
                      <small>
                        Progress resets in {progress.resetTime.hoursUntilReset}h{" "}
                        {progress.resetTime.minutesUntilReset}m
                      </small>
                    </div>
                  </div>
                </div>

                <div className="analytics-box">
                  <h3>Analytical Report</h3>
                  <AnalyticalReport />
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
              <p>
                <strong>Full Form:</strong> {selectedMnemonic.full_form}
              </p>
              <p>
                <strong>Category:</strong> {selectedMnemonic.category}
              </p>
              <p>
                <strong>Tags:</strong> {selectedMnemonic.tags?.join(", ")}
              </p>
              <p>
                <strong>Body System:</strong> {selectedMnemonic.body_system}
              </p>
              <p>
                <strong>Exam Relevance:</strong> {selectedMnemonic.exam_relevance}
              </p>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;