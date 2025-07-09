import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import PayrollForm from './components/PayrollForm';
import PayrollList from './components/PayrollList';

function App() {
  const [fetchRecords, setFetchRecords] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const styles = {
    app: {
      display: 'flex',
      minHeight: '100vh',
    },
    content: {
      flex: 1,
      padding: '20px',
      background: '#f4f7fa',
      marginLeft: isSidebarOpen ? '250px' : '0',
      transition: 'margin-left 0.3s ease-in-out',
    },
    toggleBtn: {
      position: 'fixed',
      top: '15px',
      left: '15px',
      zIndex: 1100,
      background: '#3498db',
      color: '#fff',
      border: 'none',
      fontSize: '22px',
      padding: '5px 10px',
      cursor: 'pointer',
      display: 'none',
    },
    '@media (maxWidth: 768px)': {
      toggleBtn: {
        display: 'block',
      },
    },
  };

  return (
    <Router>
      <div style={styles.app}>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        {/* Toggle Button (only shows when closed) */}
        {!isSidebarOpen && (
          <button style={styles.toggleBtn} onClick={toggleSidebar}>☰</button>
        )}
        <main style={styles.content}>
          <Routes>
            <Route
              path="/"
              element={<PayrollForm fetchRecords={fetchRecords} />}
            />
            <Route
              path="/records"
              element={<PayrollList setFetchRecords={setFetchRecords} />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
