import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import PayrollForm from './components/PayrollForm';
import PayrollList from './components/PayrollList';

function App() {
  const [fetchRecords, setFetchRecords] = useState(null);

  const styles = {
    app: {
      display: 'flex',
      minHeight: '100vh',
    },
    content: {
      flex: 1,
      padding: '20px',
      background: '#f4f7fa',
    },
  };

  return (
    <Router>
      <div style={styles.app}>
        <Sidebar />
        <main style={styles.content}>
          <Routes>
            <Route
              path="/"
              element={<PayrollForm fetchRecords={fetchRecords} />}
            />
            <Route
              path="/records"
              element={
                <PayrollList setFetchRecords={setFetchRecords} />
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;