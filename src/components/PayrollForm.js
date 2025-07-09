import React, { useState, useEffect } from 'react';

const initialState = {
  emp_code: '', emp_name: '', department: '', designation: '', category: '',
  basic_salary: '', da: '', hra: '', conveyance: '', special_allowance: '', dp: '',
  lop: '', advance: '', personal_bill: '', other_deduction: '', arrears: '', overtime: '',
  remarks: '', is_active: false, medical_deduction: '', loan: ''
};

function PayrollForm({ fetchRecords, recordToEdit, onCancel }) {
  const [formData, setFormData] = useState(initialState);
  const [calculatedSalary, setCalculatedSalary] = useState(null);
  const [error, setError] = useState(null);

  // Hardcoded dropdown options
  const departments = ['Accounts', 'Administration', 'Marketing', 'HR'];
  const designations = ['Manager', 'Account Officer', 'Purchase Manager'];

  useEffect(() => {
    if (recordToEdit) {
      setFormData({ ...initialState, ...recordToEdit, is_active: !!recordToEdit.is_active });
      setCalculatedSalary(recordToEdit.total_salary || null);
    } else {
      setFormData(initialState);
      setCalculatedSalary(null);
    }
  }, [recordToEdit]);

  const numericFields = [
    'basic_salary', 'da', 'hra', 'conveyance', 'special_allowance', 'dp',
    'lop', 'advance', 'personal_bill', 'other_deduction', 'arrears', 'overtime',
    'medical_deduction', 'loan'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateSalary = () => {
    const earnings = numericFields.reduce((sum, key) => {
      if (!['lop', 'advance', 'personal_bill', 'other_deduction', 'medical_deduction', 'loan'].includes(key)) {
        sum += parseFloat(formData[key] || 0);
      }
      return sum;
    }, 0);

    const deductions = numericFields.reduce((sum, key) => {
      if (['lop', 'advance', 'personal_bill', 'other_deduction', 'medical_deduction', 'loan'].includes(key)) {
        sum += parseFloat(formData[key] || 0);
      }
      return sum;
    }, 0);

    setCalculatedSalary(earnings - deductions);
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
        throw new Error(errorData.error || 'Save failed.');
      }

      setFormData(initialState);
      setCalculatedSalary(null);
      onCancel?.();
      fetchRecords?.();
    } catch (err) {
      setError(`Error saving record: ${err.message}`);
    }
  };

  return (
    <div style={{
      maxWidth: '900px',
      margin: '30px auto',
      padding: '30px',
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        {recordToEdit ? 'Edit Payroll' : 'Employee Payroll Form'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {Object.keys(initialState).map((key) => {
            if (key === 'is_active') {
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ marginRight: '10px', fontWeight: 600 }}>
                    {key.replace(/_/g, ' ')}
                  </label>
                  <input
                    type="checkbox"
                    name={key}
                    checked={formData[key]}
                    onChange={handleChange}
                  />
                </div>
              );
            }

            if (key === 'designation') {
              return (
                <div key={key} style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ marginBottom: '6px', fontWeight: 600 }}>
                    Designation
                  </label>
                  <select
                    name={key}
                    value={formData[key] || ''}
                    onChange={handleChange}
                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }}
                  >
                    <option value="">Select Designation</option>
                    {designations.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              );
            }

            if (key === 'department') {
              return (
                <div key={key} style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ marginBottom: '6px', fontWeight: 600 }}>
                    Department
                  </label>
                  <select
                    name={key}
                    value={formData[key] || ''}
                    onChange={handleChange}
                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }}
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              );
            }

            return (
              <div key={key} style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '6px', fontWeight: 600 }}>
                  {key.replace(/_/g, ' ')}
                </label>
                <input
                  type={numericFields.includes(key) ? 'number' : 'text'}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  step={numericFields.includes(key) ? '0.01' : undefined}
                  style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }}
                />
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
          <button
            type="button"
            onClick={calculateSalary}
            style={{ padding: '10px 25px', backgroundColor: '#0066cc', color: '#fff', borderRadius: '5px', border: 'none' }}
          >
            Calculate
          </button>
          <button
            type="submit"
            style={{ padding: '10px 25px', backgroundColor: '#0066cc', color: '#fff', borderRadius: '5px', border: 'none' }}
          >
            {recordToEdit ? 'Update' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData(initialState);
              setCalculatedSalary(null);
              onCancel?.();
            }}
            style={{ padding: '10px 25px', backgroundColor: '#dc3545', color: '#fff', borderRadius: '5px', border: 'none' }}
          >
            Cancel
          </button>
        </div>

        {calculatedSalary !== null && (
          <p style={{ marginTop: '20px', textAlign: 'center', color: 'green', fontWeight: 'bold' }}>
            Calculated Total Salary: ₹{calculatedSalary}
          </p>
        )}
        {error && (
          <p style={{ marginTop: '20px', textAlign: 'center', color: 'red' }}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

export default PayrollForm;
