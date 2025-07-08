import React, { useState, useEffect } from 'react';

function PayrollForm({ fetchRecords, recordToEdit, onCancel }) {
  const initialState = {
    emp_code: '',
    emp_name: '',
    department: '',
    designation: '',
    category: '',
    basic_salary: '',
    da: '',
    hra: '',
    conveyance: '',
    special_allowance: '',
    dp: '',
    lop: '',
    advance: '',
    personal_bill: '',
    other_deduction: '',
    arrears: '',
    overtime: '',
    remarks: '',
    is_active: false,
    medical_deduction: '', // Added to match PayrollList.js
    loan: '', // Added to match PayrollList.js
  };

  const [formData, setFormData] = useState(initialState);
  const [calculatedSalary, setCalculatedSalary] = useState(null);
  const [error, setError] = useState(null);
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        const res = await fetch('https://backendpayroll-production.up.railway.app/api/cd_dcd?typecd=2');
        if (!res.ok) throw new Error(`Failed to fetch designations: ${res.status}`);
        const data = await res.json();
        setDesignations(data.map(item => ({ code: item.code, dcd: item.dcd })));
      } catch (err) {
        console.error('Error fetching designations:', err);
        setError(`Error fetching designations: ${err.message}`);
      }
    };

    const fetchDepartments = async () => {
      try {
        const res = await fetch('https://backendpayroll-production.up.railway.app/api/cd_dcd?typecd=1');
        if (!res.ok) throw new Error(`Failed to fetch departments: ${res.status}`);
        const data = await res.json();
        setDepartments(data.map(item => ({ code: item.code, dcd: item.dcd })));
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError(`Error fetching departments: ${err.message}`);
      }
    };

    fetchDesignations();
    fetchDepartments();

    if (recordToEdit) {
      console.log('Editing payroll:', recordToEdit);
      setFormData({
        emp_code: recordToEdit.emp_code || '',
        emp_name: recordToEdit.emp_name || '',
        department: recordToEdit.department || '',
        designation: recordToEdit.designation || '',
        category: recordToEdit.category || '',
        basic_salary: recordToEdit.basic_salary || '',
        da: recordToEdit.da || '',
        hra: recordToEdit.hra || '',
        conveyance: recordToEdit.conveyance || '',
        special_allowance: recordToEdit.special_allowance || '',
        dp: recordToEdit.dp || '',
        lop: recordToEdit.lop || '',
        advance: recordToEdit.advance || '',
        personal_bill: recordToEdit.personal_bill || '',
        other_deduction: recordToEdit.other_deduction || '',
        arrears: recordToEdit.arrears || '',
        overtime: recordToEdit.overtime || '',
        remarks: recordToEdit.remarks || '',
        is_active: !!recordToEdit.is_active,
        medical_deduction: recordToEdit.medical_deduction || '',
        loan: recordToEdit.loan || '',
      });
      setCalculatedSalary(recordToEdit.total_salary || null);
    } else {
      setFormData(initialState);
      setCalculatedSalary(null);
    }
  }, [recordToEdit]);

  const styles = {
    container: {
      maxWidth: '900px',
      margin: '30px auto',
      padding: '30px',
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    },
    title: {
      textAlign: 'center',
      marginBottom: '30px',
      color: '#333',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
    },
    group: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      marginBottom: '6px',
      fontWeight: 600,
      color: '#444',
      textTransform: 'capitalize',
    },
    input: {
      padding: '8px 10px',
      border: '1px solid #ccc',
      borderRadius: '6px',
      fontSize: '14px',
    },
    select: {
      padding: '8px 10px',
      border: '1px solid #ccc',
      borderRadius: '6px',
      fontSize: '14px',
    },
    checkboxGroup: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkboxLabel: {
      marginRight: '10px',
    },
    actions: {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      marginTop: '30px',
    },
    button: {
      padding: '10px 25px',
      fontSize: '14px',
      backgroundColor: '#0066cc',
      border: 'none',
      color: 'white',
      borderRadius: '5px',
      cursor: 'pointer',
    },
    buttonCancel: {
      backgroundColor: '#dc3545',
    },
    result: {
      marginTop: '20px',
      textAlign: 'center',
      fontWeight: 'bold',
      color: 'green',
    },
    error: {
      marginTop: '20px',
      textAlign: 'center',
      color: 'red',
    },
  };

  const numericFields = [
    'basic_salary', 'da', 'hra', 'conveyance', 'special_allowance', 'dp',
    'lop', 'advance', 'personal_bill', 'other_deduction', 'arrears', 'overtime',
    'medical_deduction', 'loan',
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const calculateSalary = () => {
    const earnings = numericFields.reduce((sum, key) => {
      if (['lop', 'advance', 'personal_bill', 'other_deduction', 'medical_deduction', 'loan'].includes(key)) {
        return sum;
      }
      return sum + parseFloat(formData[key] || 0);
    }, 0);

    const deductions = numericFields.reduce((sum, key) => {
      if (!['lop', 'advance', 'personal_bill', 'other_deduction', 'medical_deduction', 'loan'].includes(key)) {
        return sum;
      }
      return sum + parseFloat(formData[key] || 0);
    }, 0);

    const total = earnings - deductions;
    console.log('Calculated salary:', total);
    setCalculatedSalary(total);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.emp_code || !formData.emp_name) {
      setError('Employee Code and Name are required.');
      return;
    }

    try {
      const payload = { ...formData, total_salary: calculatedSalary };
      console.log('Submitting payload:', payload);

      const url = recordToEdit
        ? `https://backendpayroll-production.up.railway.app/api/payroll/${recordToEdit.id}`
        : 'https://backendpayroll-production.up.railway.app/api/payroll';
      const method = recordToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to save: ${res.statusText}`);
      }

      const result = await res.json();
      console.log('Backend response:', result);

      setFormData(initialState);
      setCalculatedSalary(null);
      if (onCancel) onCancel();
      if (fetchRecords) {
        await fetchRecords();
      }
    } catch (err) {
      console.error('Error saving:', err);
      setError(`Error saving record: ${err.message}. Please check the server logs for details.`);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        {recordToEdit ? 'Edit Payroll' : 'Employee Payroll Form'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={styles.grid}>
          {Object.entries(initialState).map(([key, _]) => {
            if (key === 'is_active') {
              return (
                <div key={key} style={{ ...styles.group, ...styles.checkboxGroup }}>
                  <label style={{ ...styles.label, ...styles.checkboxLabel }}>
                    {key.replace(/_/g, ' ')}
                  </label>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                </div>
              );
            }

            if (key === 'designation') {
              return (
                <div key={key} style={styles.group}>
                  <label style={styles.label}>{key.replace(/_/g, ' ')}</label>
                  <select
                    name={key}
                    value={formData[key] || ''}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="">Select Designation</option>
                    {designations.map((des) => (
                      <option key={des.code} value={des.dcd}>
                        {des.dcd}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            if (key === 'department') {
              return (
                <div key={key} style={styles.group}>
                  <label style={styles.label}>{key.replace(/_/g, ' ')}</label>
                  <select
                    name={key}
                    value={formData[key] || ''}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.code} value={dept.dcd}>
                        {dept.dcd}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            return (
              <div key={key} style={styles.group}>
                <label style={styles.label}>{key.replace(/_/g, ' ')}</label>
                <input
                  type={numericFields.includes(key) ? 'number' : 'text'}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  style={styles.input}
                  step={numericFields.includes(key) ? '0.01' : undefined}
                />
              </div>
            );
          })}
        </div>
        <div style={styles.actions}>
          <button type="button" onClick={calculateSalary} style={styles.button}>
            Calculate
          </button>
          <button type="submit" style={styles.button}>
            {recordToEdit ? 'Update' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData(initialState);
              setCalculatedSalary(null);
              if (onCancel) onCancel();
            }}
            style={{ ...styles.button, ...styles.buttonCancel }}
          >
            Cancel
          </button>
        </div>
        {calculatedSalary !== null && (
          <p style={styles.result}>Calculated Total Salary: ₹{calculatedSalary}</p>
        )}
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
}

export default PayrollForm;