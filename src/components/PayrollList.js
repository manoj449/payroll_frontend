import React, { useState, useEffect, useCallback } from 'react';
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
    { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
    { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
    { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' }
  ];
  const years = Array.from({ length: 6 }, (_, i) => 2020 + i);
  const statusOptions = [
    { value: '', label: 'All' },
    { value: '1', label: 'Active' },
    { value: '0', label: 'Inactive' }
  ];

  const styles = {
    container: {
      maxWidth: '1000px',
      margin: '30px auto',
      padding: '30px',
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    },
    title: { textAlign: 'center', marginBottom: '25px', fontSize: '24px', color: '#333' },
    downloadButton: {
      display: 'block', margin: '0 auto 20px auto', padding: '10px 20px', fontSize: '14px',
      backgroundColor: '#f39c12', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer'
    },
    filterContainer: {
      display: 'flex', gap: '20px', marginBottom: '20px',
      justifyContent: 'center', flexWrap: 'wrap'
    },
    filterGroup: { display: 'flex', flexDirection: 'column' },
    filterLabel: { marginBottom: '5px', fontWeight: 600, color: '#444' },
    select: {
      padding: '8px', border: '1px solid #ccc', borderRadius: '5px',
      fontSize: '14px', width: '150px'
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { background: '#0066cc', color: 'white', padding: '12px', textAlign: 'left' },
    td: { padding: '10px', borderBottom: '1px solid #eee' },
    actions: { display: 'flex', gap: '10px' },
    btn: {
      padding: '6px 12px', fontSize: '13px',
      border: 'none', borderRadius: '4px', cursor: 'pointer'
    },
    editBtn: { background: '#28a745', color: 'white' },
    deleteBtn: { background: '#dc3545', color: 'white' },
    downloadBtn: { background: '#f39c12', color: 'white' },
    noData: { textAlign: 'center', padding: '20px', fontStyle: 'italic', color: '#777' },
    error: { textAlign: 'center', padding: '20px', color: 'red' }
  };

  const fetchRecords = useCallback(async () => {
    try {
      setError(null);
      let url = 'https://backendpayroll-production.up.railway.app/api/payroll/all';
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      if (status !== '') params.append('is_active', status);
      if (params.toString()) url += `?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch payroll data.');
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setRecords([]);
    }
  }, [month, year, status]);

  useEffect(() => {
    fetchRecords();
    setFetchRecords(() => fetchRecords);
  }, [fetchRecords, setFetchRecords]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      const res = await fetch(`https://backendpayroll-production.up.railway.app/api/payroll/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete record.');
      fetchRecords();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = async (id) => {
    try {
      setError(null);
      const res = await fetch(`https://backendpayroll-production.up.railway.app/api/payroll/${id}`);
      if (!res.ok) throw new Error('Failed to fetch record.');
      const record = await res.json();
      setEditingRecord(record);
    } catch (err) {
      setError(err.message);
    }
  };

  const generatePayslip = (record) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 40;

    doc.setFontSize(16);
    doc.text('Payslip', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
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

    const addItems = (items, startX, startY) => {
      items.forEach(item => {
        const value = parseFloat(item.value || 0);
        if (value > 0) {
          doc.setFontSize(12);
          doc.text(`${item.label}: ₹${value.toFixed(2)}`, startX, startY);
          startY += 10;
        }
      });
      return startY;
    };

    const earnings = [
      { label: 'Basic Salary', value: record.basic_salary },
      { label: 'DA', value: record.da },
      { label: 'HRA', value: record.hra },
      { label: 'Conveyance', value: record.conveyance },
      { label: 'Special Allowance', value: record.special_allowance },
      { label: 'DP', value: record.dp },
      { label: 'Arrears', value: record.arrears },
      { label: 'Overtime', value: record.overtime }
    ];

    const deductions = [
      { label: 'LOP', value: record.lop },
      { label: 'Advance', value: record.advance },
      { label: 'Medical Deduction', value: record.medical_deduction },
      { label: 'Loan', value: record.loan },
      { label: 'Personal Bill', value: record.personal_bill },
      { label: 'Other Deduction', value: record.other_deduction }
    ];

    const earningsY = addItems(earnings, margin, y);
    const deductionsY = addItems(deductions, pageWidth / 2 + margin, y);

    y = Math.max(earningsY, deductionsY) + 20;
    doc.setFontSize(14);
    doc.text(`Total Salary: ₹${parseFloat(record.total_salary || 0).toFixed(2)}`, pageWidth / 2, y, { align: 'center' });
    y += 10;
    doc.text(`Date: ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, y, { align: 'center' });

    doc.save(`payslip_${record.emp_code || 'unknown'}.pdf`);
  };

  const getNoRecordsMessage = () => {
    let msg = 'No records found';
    if (month || year || status !== '') {
      msg += ' for';
      if (month && year) msg += ` ${months.find(m => m.value === month)?.label} ${year}`;
      else if (month) msg += ` ${months.find(m => m.value === month)?.label}`;
      else if (year) msg += ` ${year}`;
      if (status !== '') msg += `${month || year ? ' and' : ''} ${statusOptions.find(s => s.value === status)?.label}`;
    }
    return msg + '.';
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Payroll Records</h2>
      <button style={styles.downloadButton} onClick={() => {}}>Download Monthly Statement (coming soon)</button>

      <div style={styles.filterContainer}>
        {[{ label: 'Month', value: month, setter: setMonth, options: months },
          { label: 'Year', value: year, setter: setYear, options: years.map(y => ({ value: y, label: y })) },
          { label: 'Status', value: status, setter: setStatus, options: statusOptions }]
          .map(({ label, value, setter, options }) => (
            <div key={label} style={styles.filterGroup}>
              <label style={styles.filterLabel}>{label}</label>
              <select value={value} onChange={(e) => setter(e.target.value)} style={styles.select}>
                <option value="">{`All ${label}s`}</option>
                {options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          ))}
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
              <th style={styles.th}>Designation</th> {/* ✅ Added */}
              <th style={styles.th}>Salary</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map(record => (
              <tr key={record.id}>
                <td style={styles.td}>{record.emp_code}</td>
                <td style={styles.td}>{record.emp_name}</td>
                <td style={styles.td}>{record.department}</td>
                <td style={styles.td}>{record.designation}</td> {/* ✅ Added */}
                <td style={styles.td}>₹{record.total_salary}</td>
                <td style={styles.td}>{record.is_active ? 'Active' : 'Inactive'}</td>
                <td style={styles.td}>
                  <div style={styles.actions}>
                    <button style={{ ...styles.btn, ...styles.editBtn }} onClick={() => handleEdit(record.id)}>Edit</button>
                    <button style={{ ...styles.btn, ...styles.deleteBtn }} onClick={() => handleDelete(record.id)}>Delete</button>
                    <button style={{ ...styles.btn, ...styles.downloadBtn }} onClick={() => generatePayslip(record)}>Download Payslip</button>
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
