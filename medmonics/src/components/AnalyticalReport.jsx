// AnalyticalReport.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import '../styles/AnalyticalReport.css';

const AnalyticalReport = () => {
  const { currentUser } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const showToast = useToast();

  useEffect(() => {
    const fetchAnalyticalData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get-analytical-report', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        setReportData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytical data:', error);
        showToast('Unable to load performance data', 'error');
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchAnalyticalData();
    }
  }, [currentUser, showToast]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Determine color based on accuracy rate
  const getColorForAccuracy = (rate) => {
    if (rate >= 80) return '#4caf50';
    if (rate >= 60) return '#ffc107';
    return '#f44336';
  };

  if (loading) {
    return (
      <div className="analytical-report-container">
        <div className="report-header" onClick={toggleExpand}>
          <h3>Performance Analysis</h3>
          <div className="loading-indicator">Loading...</div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="analytical-report-container">
        <div className="report-header" onClick={toggleExpand}>
          <h3>Performance Analysis</h3>
          <div className="no-data-message">No data available</div>
        </div>
      </div>
    );
  }

  const { categoryPerformance, overallStats } = reportData;

  return (
    <div className="analytical-report-container">
      <div className="report-header" onClick={toggleExpand}>
        <div className="header-content">
          <h3>Performance Analysis</h3>
          {!isExpanded && (
            <div className="summary-stats">
              <span className="accuracy-pill">
                {overallStats.overallAccuracy}% overall
              </span>
            </div>
          )}
        </div>
        <button className="expand-button">
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {isExpanded && (
        <div className="report-content">
          <div className="overall-stats">
            <div className="stat-container">
              <div className="stat-circle">
                <span className="stat-value">{overallStats.overallAccuracy}%</span>
              </div>
              <p className="stat-label">Overall Accuracy</p>
            </div>
            <div className="total-answers">
              <div className="answers-detail">
                <span className="correct-count">{overallStats.totalCorrect}</span> correct
              </div>
              <div className="answers-detail">
                <span className="incorrect-count">{overallStats.totalIncorrect}</span> incorrect
              </div>
              <div className="answers-detail total">
                <span>{overallStats.totalAnswers}</span> total answers
              </div>
            </div>
          </div>

          <h4 className="category-header">Performance by Category</h4>
          
          {categoryPerformance.length > 0 ? (
            <div className="category-performance">
              {categoryPerformance.map(category => (
                <div 
                  key={category.category} 
                  className={`category-item ${hoveredCategory === category.category ? 'hovered' : ''}`}
                  onMouseEnter={() => setHoveredCategory(category.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div className="category-header">
                    <span className="category-name">{category.category}</span>
                    <span 
                      className="category-accuracy"
                      style={{ color: getColorForAccuracy(category.accuracyRate) }}
                    >
                      {category.accuracyRate}%
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill"
                      style={{ 
                        width: `${category.accuracyRate}%`,
                        backgroundColor: getColorForAccuracy(category.accuracyRate)
                      }}
                    ></div>
                  </div>
                  
                  {/* Basic stats always visible */}
                  <div className="category-stats">
                    <small>
                      {category.studiedMnemonics} of {category.totalMnemonics} mnemonics studied
                    </small>
                  </div>
                  
                  {/* Detailed stats visible on hover */}
                  {hoveredCategory === category.category && (
                    <div className="category-details">
                      <div className="detail-item">
                        <span className="detail-label">Correct answers:</span>
                        <span className="detail-value correct">{category.totalCorrect}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Incorrect answers:</span>
                        <span className="detail-value incorrect">{category.totalIncorrect}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Total attempts:</span>
                        <span className="detail-value">{category.totalAnswers}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Coverage:</span>
                        <span className="detail-value">{category.studiedPercentage}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data-message">Start answering questions to see category performance.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticalReport;