import React, { useState, useEffect } from "react";
import axios from "axios"; // Import Axios for API calls
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import Modal from "../contexts/Modal";
import "../styles/common.css";
import "../styles/LibraryPage.css";

const LibraryPage = ({ onEditMnemonic }) => {
  const { currentUser } = useAuth(); // Access current user from context
  const [mnemonics, setMnemonics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [mnemonicToDelete, setMnemonicToDelete] = useState(null);
  const showToast = useToast();

  useEffect(() => {
    if (!currentUser) return; // Ensure user is authenticated before fetching mnemonics

    const fetchMnemonics = async () => {
      try {
        const token = localStorage.getItem("authToken"); // Get JWT token from localStorage
        const headers = { Authorization: `Bearer ${token}` }; // Include token for authorization

        const response = await axios.get(
          "http://localhost:5000/get-mnemonics",
          {
            headers,
            params: { searchQuery: searchTerm, category: categoryFilter },
          }
        );

        // Log the response data to verify it's being fetched
        console.log("Fetched mnemonics:", response.data);

        // Set the fetched data into state
        setMnemonics(response.data);
        const categories = new Set(
          response.data.map((m) => m.category).filter(Boolean)
        );
        setUniqueCategories(["", ...Array.from(categories).sort()]);
      } catch (error) {
        console.error("Error fetching mnemonics:", error);
        showToast("Error fetching mnemonics", "error");
      }
    };

    fetchMnemonics();
  }, [currentUser, searchTerm, categoryFilter, showToast]);

  const handleDelete = async () => {
    if (!mnemonicToDelete || !currentUser) return;
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(
        `http://localhost:5000/delete-mnemonic/${mnemonicToDelete.id}`,
        { headers }
      );

      showToast("Mnemonic deleted successfully!", "warning");
      setMnemonicToDelete(null);
    } catch (error) {
      console.error("Error deleting mnemonic:", error);
      showToast(`Error deleting mnemonic: ${error.message}`, "error");
    }
  };

  // Handle search and category filters
  const filteredMnemonics = mnemonics.slice(0, 6).filter((m) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      m.acronym.toLowerCase().includes(lowerSearchTerm) ||
      m.fullForm.toLowerCase().includes(lowerSearchTerm) ||
      (m.description && m.description.toLowerCase().includes(lowerSearchTerm))
    );
  });

  return (
    <div className="library-page">
      <h2 className="library-title">📚 My Mnemonics</h2>

      <div className="library-filters">
        <div className="filter-group">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="text"
            placeholder="Search by acronym, full form, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="category">Filter by Category</label>
          <select
            id="category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {uniqueCategories.map((cat) => (
              <option key={cat || "all"} value={cat}>
                {cat || "All Categories"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mnemonic-list">
        {filteredMnemonics.length > 0 ? (
          filteredMnemonics.map((m) => (
            <div key={m.id} className="mnemonic-card">
              <div className="mnemonic-content">
                <div>
                  <h3 className="mnemonic-acronym">{m.acronym}</h3>
                  <p className="mnemonic-fullform">{m.full_form}</p>
                  {m.category && (
                    <p className="mnemonic-category">
                      <strong>Category:</strong> {m.category}
                    </p>
                  )}
                  {m.description && (
                    <p className="mnemonic-notes">
                      <strong>Notes:</strong> {m.description}
                    </p>
                  )}
                </div>
                <div className="mnemonic-actions">
                  <button
                    onClick={() => onEditMnemonic(m)}
                    className="btn edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setMnemonicToDelete(m)}
                    className="btn delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-message">
            <p>🤔 No mnemonics found.</p>
            <p>
              Try adjusting your filters or add new mnemonics from the
              dashboard.
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!mnemonicToDelete}
        onClose={() => setMnemonicToDelete(null)}
        title="Confirm Deletion"
      >
        <p className="modal-text">
          Are you sure you want to delete the mnemonic "
          <strong>{mnemonicToDelete?.acronym}</strong>"? This action cannot be
          undone.
        </p>
        <div className="modal-actions">
          <button
            onClick={() => setMnemonicToDelete(null)}
            className="btn cancel"
          >
            Cancel
          </button>
          <button onClick={handleDelete} className="btn confirm">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default LibraryPage;
