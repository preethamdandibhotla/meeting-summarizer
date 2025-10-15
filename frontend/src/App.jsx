import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Use relative URL since frontend and backend are on same origin
const API_URL = 'http://localhost:5000/api';


// Rest of your code remains EXACTLY the same
function App() {
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Fetch all meetings
  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/meetings`);
      setMeetings(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch meetings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single meeting details
  const fetchMeetingDetails = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/meetings/${id}`);
      setSelectedMeeting(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch meeting details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Upload meeting
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!title || !audioFile) {
      setError('Please provide both title and audio file');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('audio', audioFile);

    try {
      setUploading(true);
      setError('');
      await axios.post(`${API_URL}/meetings/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setTitle('');
      setAudioFile(null);
      alert('Meeting uploaded successfully! Processing in background...');
      fetchMeetings();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload meeting');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Delete meeting
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/meetings/${id}`);
      setMeetings(meetings.filter(m => m._id !== id));
      if (selectedMeeting?._id === id) {
        setSelectedMeeting(null);
      }
      alert('Meeting deleted successfully');
    } catch (err) {
      setError('Failed to delete meeting');
      console.error(err);
    }
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setAudioFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'transcribing': return 'status-transcribing';
      case 'summarizing': return 'status-summarizing';
      case 'failed': return 'status-failed';
      default: return 'status-uploaded';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  useEffect(() => {
    fetchMeetings();
    // Auto-refresh every 10 seconds to check processing status
    const interval = setInterval(fetchMeetings, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>🎤 Meeting Summarizer</h1>
        <p>Upload meeting audio and get AI-powered summaries</p>
      </header>

      <div className="container">
        {/* Upload Section */}
        <section className="upload-section">
          <h2>Upload New Meeting</h2>
          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-group">
              <label htmlFor="title">Meeting Title *</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Team Standup - Jan 15"
                required
              />
            </div>

            <div className="form-group">
              <label>Audio File *</label>
              <div
                className={`file-drop-zone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="audio"
                  accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.mp4"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="audio" className="file-label">
                  {audioFile ? (
                    <div className="file-selected">
                      <span>✓</span>
                      <span>{audioFile.name}</span>
                      <span className="file-size">
                        ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  ) : (
                    <div className="file-placeholder">
                      <span className="upload-icon">📁</span>
                      <p>Drag & drop audio file or click to browse</p>
                      <p className="file-hint">Supports: MP3, WAV, M4A, OGG (Max 100MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Meeting'}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}
        </section>

        {/* Meetings List */}
        <section className="meetings-section">
          <div className="section-header">
            <h2>Recent Meetings</h2>
            <button onClick={fetchMeetings} className="btn-refresh" disabled={loading}>
              🔄 Refresh
            </button>
          </div>

          {loading && meetings.length === 0 ? (
            <div className="loading">Loading meetings...</div>
          ) : meetings.length === 0 ? (
            <div className="empty-state">
              <p>No meetings yet. Upload your first meeting above!</p>
            </div>
          ) : (
            <div className="meetings-grid">
              {meetings.map((meeting) => (
                <div
                  key={meeting._id}
                  className="meeting-card"
                  onClick={() => fetchMeetingDetails(meeting._id)}
                >
                  <div className="meeting-header">
                    <h3>{meeting.title}</h3>
                    <span className={`status-badge ${getStatusColor(meeting.status)}`}>
                      {meeting.status}
                    </span>
                  </div>
                  <p className="meeting-date">
                    {new Date(meeting.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {meeting.status === 'completed' && (
                    <div className="meeting-stats">
                      <span>✓ {meeting.keyDecisions?.length || 0} decisions</span>
                      <span>✓ {meeting.actionItems?.length || 0} action items</span>
                    </div>
                  )}
                  <div className="card-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(meeting._id);
                      }}
                      className="btn-delete"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Meeting Details Modal */}
        {selectedMeeting && (
          <div className="modal-overlay" onClick={() => setSelectedMeeting(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedMeeting(null)}>
                ✕
              </button>

              <h2>{selectedMeeting.title}</h2>
              <span className={`status-badge ${getStatusColor(selectedMeeting.status)}`}>
                {selectedMeeting.status}
              </span>

              {selectedMeeting.status === 'completed' ? (
                <div className="meeting-details">
                  {/* Summary */}
                  <section className="detail-section">
                    <h3>📝 Summary</h3>
                    <p className="summary-text">{selectedMeeting.summary}</p>
                  </section>

                  {/* Key Decisions */}
                  {selectedMeeting.keyDecisions?.length > 0 && (
                    <section className="detail-section">
                      <h3>💡 Key Decisions</h3>
                      <ul className="decisions-list">
                        {selectedMeeting.keyDecisions.map((decision, idx) => (
                          <li key={idx}>{decision}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Action Items */}
                  {selectedMeeting.actionItems?.length > 0 && (
                    <section className="detail-section">
                      <h3>✅ Action Items</h3>
                      <div className="action-items">
                        {selectedMeeting.actionItems.map((item, idx) => (
                          <div key={idx} className="action-item">
                            <div className="action-header">
                              <span className={`priority-badge ${getPriorityColor(item.priority)}`}>
                                {item.priority || 'medium'}
                              </span>
                              {item.assignee && (
                                <span className="assignee">👤 {item.assignee}</span>
                              )}
                            </div>
                            <p className="action-task">{item.task}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Transcript */}
                  {selectedMeeting.transcript && (
                    <section className="detail-section">
                      <h3>📄 Full Transcript</h3>
                      <div className="transcript-box">
                        {selectedMeeting.transcript}
                      </div>
                    </section>
                  )}
                </div>
              ) : (
                <div className="processing-state">
                  <div className="spinner"></div>
                  <p>Processing your meeting...</p>
                  <p className="processing-hint">
                    Status: {selectedMeeting.status}. This may take a few minutes.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;