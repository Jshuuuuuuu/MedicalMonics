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
  const [isEditing, setIsEditing] = useState(false);
  const [editedMnemonic, setEditedMnemonic] = useState(null);
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

  const [progress, setProgress] = useState({
    totalMnemonics: 0,
    reviewedToday: 0,
    progressPercentage: 0,
    isComplete: false,
    resetTime: { hoursUntilReset: 0, minutesUntilReset: 0 },
  });

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

    const intervalId = setInterval(fetchProgress, 5 * 60 * 1000);

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

    try {
      await axios.post(
        "http://localhost:5000/update-mnemonic-stats",
        {
          mnemonicId: mnemonic.id,
          isCorrect: true,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

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

  const handleEditClick = (mnemonic) => {
    setEditedMnemonic({
      id: mnemonic.id,
      acronym: mnemonic.acronym,
      fullForm: mnemonic.full_form,
      category: mnemonic.category,
      bodySystem: mnemonic.body_system,
      difficulty: mnemonic.difficulty,
      examRelevance: mnemonic.exam_relevance,
      tags: mnemonic.tags || [],
    });
    setIsEditing(true);
    setSelectedMnemonic(null);
  };

  const handleDeleteClick = async (mnemonicId) => {
    if (!window.confirm("Are you sure you want to delete this mnemonic?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/delete-mnemonic/${mnemonicId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      setMnemonics(mnemonics.filter((m) => m.id !== mnemonicId));
      setSelectedMnemonic(null);
      showToast("Mnemonic deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting mnemonic:", error);
      showToast("Error deleting mnemonic", "error");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `http://localhost:5000/update-mnemonic/${editedMnemonic.id}`,
        {
          acronym: editedMnemonic.acronym,
          fullForm: editedMnemonic.fullForm,
          category: editedMnemonic.category,
          bodySystem: editedMnemonic.bodySystem,
          difficulty: editedMnemonic.difficulty,
          examRelevance: editedMnemonic.examRelevance,
          tags: editedMnemonic.tags,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      setMnemonics(
        mnemonics.map((m) => (m.id === editedMnemonic.id ? response.data : m))
      );

      setIsEditing(false);
      setEditedMnemonic(null);
      showToast("Mnemonic updated successfully", "success");
    } catch (error) {
      console.error("Error updating mnemonic:", error);
      showToast("Error updating mnemonic", "error");
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditedMnemonic((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTagsChange = (e) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    setEditedMnemonic((prev) => ({
      ...prev,
      tags: tagsArray,
    }));
  };

  return (
    <div className="dashboard-page">
      <div className="main-content">
        <h1 className="page-title">Welcome to MedMnemonics</h1>

        <div className="dashboard-layout">
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
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${progress.progressPercentage}%` }}
                      ></div>
                    </div>

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
              
              <div className="modal-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleEditClick(selectedMnemonic)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDeleteClick(selectedMnemonic.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Add the Edit Modal */}
        {isEditing && editedMnemonic && (
          <Modal isOpen={true} onClose={() => setIsEditing(false)} title="Edit Mnemonic">
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-group">
                <label htmlFor="acronym">Acronym</label>
                <input
                  type="text"
                  id="acronym"
                  name="acronym"
                  value={editedMnemonic.acronym}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="fullForm">Full Form</label>
                <textarea
                  id="fullForm"
                  name="fullForm"
                  value={editedMnemonic.fullForm}
                  onChange={handleEditFormChange}
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={editedMnemonic.category}
                  onChange={handleEditFormChange}
                  required
                >
                  {categories.filter(c => c !== "All").map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="bodySystem">Body System</label>
                <input
                  type="text"
                  id="bodySystem"
                  name="bodySystem"
                  value={editedMnemonic.bodySystem}
                  onChange={handleEditFormChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="difficulty">Difficulty</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={editedMnemonic.difficulty}
                  onChange={handleEditFormChange}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="examRelevance">Exam Relevance</label>
                <input
                  type="text"
                  id="examRelevance"
                  name="examRelevance"
                  value={editedMnemonic.examRelevance}
                  onChange={handleEditFormChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="tags">Tags (comma-separated)</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={editedMnemonic.tags?.join(", ")}
                  onChange={handleTagsChange}
                />
              </div>
              
              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;