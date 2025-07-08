import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
  const styles = {
    sidebar: {
      width: '250px',
      background: '#2c3e50',
      color: '#fff',
      padding: '20px',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
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
      transition: 'background 0.3s',
    },
    activeLink: {
      background: '#3498db',
      color: '#fff',
    },
    navLinkHover: {
      background: '#34495e',
    },
  };

  return (
    <div style={styles.sidebar}>
      <h2 style={styles.title}>Payroll System</h2>
      <NavLink
        to="/"
        style={({ isActive }) => ({
          ...styles.navLink,
          ...(isActive ? styles.activeLink : {}),
        })}
      >
        Employee Payroll Form
      </NavLink>
      <NavLink
        to="/records"
        style={({ isActive }) => ({
          ...styles.navLink,
          ...(isActive ? styles.activeLink : {}),
        })}
      >
        View Payroll Records
      </NavLink>
    </div>
  );
}

export default Sidebar;