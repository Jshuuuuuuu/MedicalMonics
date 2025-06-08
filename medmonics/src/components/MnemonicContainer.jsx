import React from 'react';
import '../styles/MnemonicContainer.css';  // You can create a separate CSS file for the container

const MnemonicContainer = ({ mnemonic, expandedMnemonic, onToggleExpand }) => {
  const isExpanded = mnemonic.id === expandedMnemonic;  // Check if the mnemonic is expanded

  return (
    <div className="mnemonic-card">
      <div className="mnemonic-header" onClick={() => onToggleExpand(mnemonic.id)}>
        <h3>{mnemonic.acronym}</h3> {/* Display Acronym */}
        <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
      </div>

      {/* Only display additional details if expanded */}
      {isExpanded && (
        <div className="mnemonic-details">
          <p><strong>Full Form:</strong> {mnemonic.fullForm}</p>
          <p><strong>Category:</strong> {mnemonic.category}</p>
          <p><strong>Tags:</strong> {mnemonic.tags.join(', ')}</p> {/* Assuming tags is an array */}
          <p><strong>Body System:</strong> {mnemonic.bodySystem}</p>
          <p><strong>Exam Relevance:</strong> {mnemonic.examRelevance}</p>
        </div>
      )}
    </div>
  );
};

export default MnemonicContainer;
