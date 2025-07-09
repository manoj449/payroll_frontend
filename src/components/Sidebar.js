import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar({ isOpen, toggleSidebar }) {
  const styles = {
    sidebar: {
      width: '250px',
      background: '#2c3e50',
      color: '#fff',
      padding: '20px',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: isOpen ? '0' : '-260px', // slide effect
      transition: 'left 0.3s ease-in-out',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
    },
    title: {
      fontSize: '24px',
      marginBottom: '30px',
      textAlign: 'center',
      color: '#ecf0f1',
    },
    navLink: {
      color: '#bdc3c7',
      textDecoration: 'none',
      padding: '10px 15px',
      borderRadius: '5px',
      fontSize: '16px',
    },
    activeLink: {
      background: '#3498db',
      color: '#fff',
    },
    toggleButton: {
      display: 'none',
      position: 'absolute',
      top: 15,
      left: 15,
      fontSize: '24px',
      background: 'transparent',
      color: '#fff',
      border: 'none',
      cursor: 'pointer',
    },
    closeBtn: {
      display: 'block',
      background: 'transparent',
      color: '#fff',
      fontSize: '20px',
      alignSelf: 'flex-end',
      border: 'none',
      marginBottom: '20px',
      cursor: 'pointer',
    },

    // For mobile only
    '@media (maxWidth: 768px)': {
      toggleButton: {
        display: 'block',
      },
    },
  };

  return (
    <div style={styles.sidebar}>
      <button onClick={toggleSidebar} style={styles.closeBtn}>✖</button>
      <h2 style={styles.title}>Payroll System</h2>
      <NavLink to="/" style={({ isActive }) => ({
        ...styles.navLink, ...(isActive ? styles.activeLink : {})
      })}>
        Employee Payroll Form
      </NavLink>
      <NavLink to="/records" style={({ isActive }) => ({
        ...styles.navLink, ...(isActive ? styles.activeLink : {})
      })}>
        View Payroll Records
      </NavLink>
    </div>
  );
}

export default Sidebar;
