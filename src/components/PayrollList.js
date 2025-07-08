import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import PayrollForm from './PayrollForm';

function PayrollList({ setFetchRecords }) {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [status, setStatus] = useState('');

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = Array.from({ length: 6 }, (_, i) => 2020 + i); // 2020–2025

  const statusOptions = [
    { value: '', label: 'All' },
    { value: '1', label: 'Active' },
    { value: '0', label: 'Inactive' },
  ];

  const styles = {
    container: {
      maxWidth: '1000px',
      margin: '30px auto',
      padding: '30px',
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    },
    title: {
      textAlign: 'center',
      marginBottom: '25px',
      fontSize: '24px',
      color: '#333',
    },
    downloadButton: {
      display: 'block',
      margin: '0 auto 20px auto',
      padding: '10px 20px',
      fontSize: '14px',
      backgroundColor: '#f39c12',
      border: 'none',
      color: 'white',
      borderRadius: '5px',
      cursor: 'pointer',
    },
    filterContainer: {
      display: 'flex',
      gap: '20px',
      marginBottom: '20px',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    filterLabel: {
      marginBottom: '5px',
      fontWeight: 600,
      color: '#444',
    },
    select: {
      padding: '8px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '14px',
      width: '150px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      background: '#0066cc',
      color: 'white',
      padding: '12px',
      textAlign: 'left',
    },
    td: {
      padding: '10px',
      borderBottom: '1px solid #eee',
    },
    actions: {
      display: 'flex',
      gap: '10px',
    },
    btn: {
      padding: '6px 12px',
      fontSize: '13px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    editBtn: {
      background: '#28a745',
      color: 'white',
    },
    deleteBtn: {
      background: '#dc3545',
      color: 'white',
    },
    downloadBtn: {
      background: '#f39c12',
      color: 'white',
    },
    noData: {
      textAlign: 'center',
      padding: '20px',
      fontStyle: 'italic',
      color: '#777',
    },
    error: {
      textAlign: 'center',
      padding: '20px',
      color: 'red',
    },
  };

  const fetchRecords = async () => {
    try {
      setError(null);
      let url = 'https://backendpayroll-production.up.railway.app/api/payroll/all';
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      if (status !== '') params.append('is_active', status);
      if (params.toString()) url += `?${params.toString()}`;
      
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to fetch: ${res.statusText}`);
      }
      const data = await res.json();
      console.log('Fetched records:', data); // Debug: Check all fields
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching records:', err);
      setError(`Error fetching records: ${err.message}. Please check the server logs for details.`);
      setRecords([]);
    }
  };

  useEffect(() => {
    fetchRecords();
    setFetchRecords(() => fetchRecords);
  }, [setFetchRecords, month, year, status]);

  const handleDelete = async (id) => {
    try {
      const confirm = window.confirm('Are you sure you want to delete this payroll record?');
      if (!confirm) return;

      const res = await fetch(`https://backendpayroll-production.up.railway.app/api/payroll/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to delete: ${res.statusText}`);
      }

      console.log(`Deleted record with id: ${id}`);
      await fetchRecords();
    } catch (err) {
      console.error('Error deleting record:', err);
      setError(`Error deleting record: ${err.message}. Please check the server logs for details.`);
    }
  };

  const handleEdit = async (id) => {
    try {
      setError(null);
      const res = await fetch(`https://backendpayroll-production.up.railway.app/api/payroll/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to fetch record: ${res.statusText}`);
      }
      const record = await res.json();
      console.log('Editing record:', record);
      setEditingRecord(record);
    } catch (err) {
      console.error('Error fetching record for edit:', err);
      setError(`Error fetching record for edit: ${err.message}. Please check the server logs for details.`);
    }
  };

  const generatePayslip = (record) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    doc.setFontSize(16);
    doc.text('Payslip', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    let y = 40;
    doc.text(`Employee Code: ${record.emp_code || 'N/A'}`, margin, y);
    y += 10;
    doc.text(`Employee Name: ${record.emp_name || 'N/A'}`, margin, y);
    y += 10;
    doc.text(`Department: ${record.department || 'N/A'}`, margin, y);
    y += 10;
    doc.text(`Designation: ${record.designation || 'N/A'}`, margin, y);
    y += 10;
    doc.text(`Status: ${record.is_active ? 'Active' : 'Inactive'}`, margin, y);
    y += 20;

    doc.setFontSize(14);
    doc.text('Earnings', margin, y);
    doc.text('Deductions', pageWidth / 2 + margin, y);
    y += 10;

    doc.setFontSize(12);
    const earnings = [
      { label: 'Basic Salary', value: record.basic_salary },
      { label: 'DA', value: record.da },
      { label: 'HRA', value: record.hra },
      { label: 'Conveyance', value: record.conveyance },
      { label: 'Special Allowance', value: record.special_allowance },
      { label: 'DP', value: record.dp },
      { label: 'Arrears', value: record.arrears },
      { label: 'Overtime', value: record.overtime },
    ].filter(item => parseFloat(item.value) > 0 || item.label === 'Basic Salary');

    let earningsY = y;
    earnings.forEach((item, index) => {
      const value = parseFloat(item.value || 0).toFixed(2);
      doc.text(`${item.label}: ₹${value}`, margin, earningsY);
      earningsY += 10;
    });

    const deductions = [
      { label: 'LOP', value: record.lop },
      { label: 'Advance', value: record.advance },
      { label: 'Medical Deduction', value: record.medical_deduction },
      { label: 'Loan', value: record.loan },
      { label: 'Personal Bill', value: record.personal_bill },
      { label: 'Other Deduction', value: record.other_deduction },
    ].filter(item => parseFloat(item.value) > 0);

    let deductionsY = y;
    deductions.forEach((item, index) => {
      const value = parseFloat(item.value || 0).toFixed(2);
      doc.text(`${item.label}: ₹${value}`, pageWidth / 2 + margin, deductionsY);
      deductionsY += 10;
    });

    y = Math.max(earningsY, deductionsY) + 20;
    doc.setFontSize(14);
    doc.text(`Total Salary: ₹${parseFloat(record.total_salary || 0).toFixed(2)}`, pageWidth / 2, y, { align: 'center' });
    y += 10;
    doc.text(`Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}`, pageWidth / 2, y, { align: 'center' });

    doc.save(`payslip_${record.emp_code || 'unknown'}.pdf`);
  };

  const generateMonthlyStatement = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const tableStartY = 40;

    doc.setFontSize(16);
    doc.text(
      month && year
        ? `Monthly Statement - ${months.find(m => m.value === month)?.label} ${year}`
        : 'Monthly Statement - All Records',
      pageWidth / 2,
      20,
      { align: 'center' }
    );

    doc.setFontSize(12);
    const headers = [
      'Employee Code', 'Name', 'Department', 'Status',
      'Basic Salary', 'DA', 'HRA', 'Conveyance', 'Special Allowance', 'DP', 'Arrears', 'Overtime',
      'LOP', 'Advance', 'Medical Deduction', 'Loan', 'Personal Bill', 'Other Deduction', 'Total Salary'
    ];
    const headerX = [
      margin, margin + 35, margin + 75, margin + 115,
      margin + 155, margin + 195, margin + 235, margin + 275, margin + 315, margin + 355, margin + 395, margin + 435,
      margin + 475, margin + 515, margin + 555, margin + 595, margin + 635, margin + 675, margin + 715
    ];
    headers.forEach((header, index) => {
      doc.text(header, headerX[index], tableStartY);
    });

    let url = 'https://backendpayroll-production.up.railway.app/api/payroll/all';
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    if (status !== '') params.append('is_active', status);
    if (params.toString()) url += `?${params.toString()}`;
    
    const res = await fetch(url);
    if (!res.ok) {
      console.error('Failed to fetch records for monthly statement');
      return;
    }
    const data = await res.json();
    const statementRecords = Array.isArray(data) ? data : [];

    let y = tableStartY + 10;
    statementRecords.forEach((record, index) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
        headers.forEach((header, index) => {
          doc.text(header, headerX[index], y);
        });
        y += 10;
      }
      const rowData = [
        record.emp_code || 'N/A',
        record.emp_name || 'N/A',
        record.department || 'N/A',
        record.is_active ? 'Active' : 'Inactive',
        `₹${parseFloat(record.basic_salary || 0).toFixed(2)}`,
        `₹${parseFloat(record.da || 0).toFixed(2)}`,
        `₹${parseFloat(record.hra || 0).toFixed(2)}`,
        `₹${parseFloat(record.conveyance || 0).toFixed(2)}`,
        `₹${parseFloat(record.special_allowance || 0).toFixed(2)}`,
        `₹${parseFloat(record.dp || 0).toFixed(2)}`,
        `₹${parseFloat(record.arrears || 0).toFixed(2)}`,
        `₹${parseFloat(record.overtime || 0).toFixed(2)}`,
        `₹${parseFloat(record.lop || 0).toFixed(2)}`,
        `₹${parseFloat(record.advance || 0).toFixed(2)}`,
        `₹${parseFloat(record.medical_deduction || 0).toFixed(2)}`,
        `₹${parseFloat(record.loan || 0).toFixed(2)}`,
        `₹${parseFloat(record.personal_bill || 0).toFixed(2)}`,
        `₹${parseFloat(record.other_deduction || 0).toFixed(2)}`,
        `₹${parseFloat(record.total_salary || 0).toFixed(2)}`
      ];
      rowData.forEach((data, idx) => {
        doc.text(data, headerX[idx], y);
      });
      y += 10;
    });

    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}`, pageWidth / 2, y + 10, { align: 'center' });

    const filename = month && year
      ? `monthly_statement_${months.find(m => m.value === month)?.label}_${year}.pdf`
      : 'monthly_statement_all.pdf';
    doc.save(filename);
  };

  const getNoRecordsMessage = () => {
    let message = 'No records found';
    if (month || year || status !== '') {
      message += ' for';
      if (month && year) {
        message += ` ${months.find(m => m.value === month)?.label} ${year}`;
      } else if (month) {
        message += ` ${months.find(m => m.value === month)?.label}`;
      } else if (year) {
        message += ` ${year}`;
      }
      if (status !== '') {
        message += `${month || year ? ' and' : ''} ${statusOptions.find(s => s.value === status)?.label} status`;
      }
    }
    return message + '.';
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Payroll Records</h2>
      <button
        style={styles.downloadButton}
        onClick={generateMonthlyStatement}
      >
        Download Monthly Statement of All Employees
      </button>
      <div style={styles.filterContainer}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={styles.select}
          >
            <option value="">All Months</option>
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Year</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={styles.select}
          >
            <option value="">All Years</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={styles.select}
          >
            {statusOptions.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
      {error && <div style={styles.error}>{error}</div>}
      {editingRecord && (
        <PayrollForm
          fetchRecords={fetchRecords}
          recordToEdit={editingRecord}
          onCancel={() => setEditingRecord(null)}
        />
      )}
      {records.length === 0 && !error ? (
        <div style={styles.noData}>{getNoRecordsMessage()}</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Emp Code</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Department</th>
              <th style={styles.th}>Salary</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td style={styles.td}>{record.emp_code}</td>
                <td style={styles.td}>{record.emp_name}</td>
                <td style={styles.td}>{record.department}</td>
                <td style={styles.td}>₹{record.total_salary}</td>
                <td style={styles.td}>{record.is_active ? 'Active' : 'Inactive'}</td>
                <td style={styles.td}>
                  <div style={styles.actions}>
                    <button
                      style={{ ...styles.btn, ...styles.editBtn }}
                      onClick={() => handleEdit(record.id)}
                    >
                      Edit
                    </button>
                    <button
                      style={{ ...styles.btn, ...styles.deleteBtn }}
                      onClick={() => handleDelete(record.id)}
                    >
                      Delete
                    </button>
                    <button
                      style={{ ...styles.btn, ...styles.downloadBtn }}
                      onClick={() => generatePayslip(record)}
                    >
                      Download Payslip
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PayrollList;