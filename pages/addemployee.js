// Updated AddEmployee Page with working Add/Edit, PDF download in popup, pagination, and search

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import withAdminAuth from '@/lib/withAdminAuth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import Footer from '@/components/Footer';

function AddEmployee() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [empId, setEmpId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [image, setImage] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showDocPopup, setShowDocPopup] = useState(false);
  const [docUrl, setDocUrl] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 7;

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employee/all');
      const data = await res.json();
      if (data.success) setEmployees(data.data);
    } catch {
      toast.error('Failed to load employees');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.empId.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const indexOfLast = currentPage * employeesPerPage;
  const indexOfFirst = indexOfLast - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirst, indexOfLast);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!empId || !name || !password || !role) {
      toast.error('Please fill all required fields.');
      return;
    }

    const cloudName = 'depov4b4l';
    const preset = 'litties_unsigned';
    let imageUrl = '';
    let documentUrl = '';

    try {
      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', preset);
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.secure_url;
      }

      if (documentFile) {
        const docForm = new FormData();
        docForm.append('file', documentFile);
        docForm.append('upload_preset', preset);
        const docRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: 'POST',
          body: docForm,
        });
        const docData = await docRes.json();
        documentUrl = docData.secure_url;
      }

      const payload = {
        empId,
        name,
        password,
        role,
        image: imageUrl || undefined,
        document: documentUrl || '',
        status: 'yes',
      };

      const url = editId ? `/api/employee/${editId}` : '/api/add-employee';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editId ? 'Employee updated' : 'Employee added');
        resetForm();
        fetchEmployees();
      } else {
        toast.error(data.message || 'Something went wrong');
      }
    } catch (err) {
      toast.error('Failed to save employee');
    }
  };

  const resetForm = () => {
    setEmpId('');
    setName('');
    setPassword('');
    setRole('employee');
    setImage(null);
    setDocumentFile(null);
    setShowForm(false);
    setEditId(null);
  };

  const handleEdit = (emp) => {
    setEditId(emp._id);
    setEmpId(emp.empId);
    setName(emp.name);
    setPassword(emp.password);
    setRole(emp.role);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/employee/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Employee deleted');
        fetchEmployees();
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch {
      toast.error('Error deleting employee');
    }
  };

  const toggleStatus = async (emp) => {
    try {
      const res = await fetch(`/api/employee/${emp._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: emp.status === 'yes' ? 'no' : 'yes' }),
      });
      const data = await res.json();
      if (data.success) fetchEmployees();
      else toast.error(data.message);
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  const logout = () => {
    router.push('/');
    toast.success('Logout Successfully');
  };

  const openDocument = (url) => {
    setDocUrl(url);
    setShowDocPopup(true);
  };

  const closeDocument = () => {
    setDocUrl('');
    setShowDocPopup(false);
  };

  return (
    <div className={styles.container}>
       <header className={styles.header}>
        <div className={styles.logo}>
          <Image src="/litties.png" alt="Litties Logo" width={60} height={60} />
        </div>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Litties Multi Cuisine Family Restaurant</h1>
          <p className={styles.address}>Shanti Prayag, Lalganj, Sasaram - 821115</p>
        </div>
        <button onClick={logout} className={styles.logoutButton}>Logout</button>
      </header>
       {/* <h2 style={{ color: '#facc15', margin: '1rem 0', textAlign: 'left' }}>
        Add Employee 
      </h2> */}

      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => setShowForm(true)} className={styles.addemployeeButton}>Add Employee</button>
        <button onClick={() => router.push('/admin')} className={styles.addemployeeButton} style={{ backgroundColor: '#1f2937' }}>Admin Dashboard</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search by Employee ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.input1}
          style={{ maxWidth: 300 }}
        />
      </div>
      <h2 style={{ color: '#facc15', margin: '1rem 0', textAlign: 'left' }}>
        Employees List
      </h2>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', background: '#111827', color: 'white', borderRadius: 8 }}>
          <thead style={{ backgroundColor: '#facc15', color: '#111827' }}>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Image</th>
              <th>Document</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.map(emp => (
              <tr key={emp._id} style={{ textAlign: 'center' }}>
                <td>{emp.empId}</td>
                <td>{emp.name}</td>
                <td><img src={emp.image} alt="profile" style={{ width: 50, height: 50, borderRadius: 6 }} /></td>
                <td>
                  {emp.document ? (
                    <button
                      style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}
                      onClick={() => openDocument(emp.document)}
                    >
                      View
                    </button>
                  ) : '—'}
                </td>
                <td>
                  <button
                    onClick={() => toggleStatus(emp)}
                    style={{ backgroundColor: emp.status === 'yes' ? 'green' : 'red', color: 'white', borderRadius: 999, padding: '6px 16px', border: 'none', cursor: 'pointer' }}
                  >
                    {emp.status === 'yes' ? 'Yes' : 'No'}
                  </button>
                </td>
                <td>
                  <button onClick={() => handleEdit(emp)} style={{ marginRight: 8 }}>✏️</button>
                  <button onClick={() => handleDelete(emp._id)} style={{ backgroundColor: '#dc2626', color: 'white' }}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: 'center', marginTop: 10 }}>
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</button>
        <span style={{ margin: '0 10px' }}>Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
      </div>

      {showForm && (
        <div className={styles.popup1}>
          <button className={styles.closeButton1} onClick={() => setShowForm(false)}>&times;</button>
          <h2>{editId ? 'Edit' : 'Add New'} Employee</h2>
          <form onSubmit={handleAddEmployee}>
            <input className={styles.input1} placeholder="Employee ID" value={empId} onChange={(e) => setEmpId(e.target.value)} />
            <input className={styles.input1} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className={styles.input1} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <select className={styles.selectBackground} value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
            <label style={{ color: 'white', marginTop: '10px' }}>Upload Profile Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className={styles.input1} />
            <label style={{ color: 'white', marginTop: '10px' }}>Upload Document (PDF or Image)</label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setDocumentFile(e.target.files[0])} className={styles.input1} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
              <button type="submit" className={styles.submitButton1}>{editId ? 'Update' : 'Submit'}</button>
              <button type="button" onClick={() => setShowForm(false)} className={styles.submitButton1} style={{ backgroundColor: '#999' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showDocPopup && (
        <div className={styles.popup1} style={{ maxWidth: 400, height: 300 }}>
          <button className={styles.closeButton1} onClick={closeDocument}>&times;</button>
          <iframe src={docUrl} width="100%" height="220px" style={{ border: 'none' }} />
          <div style={{ textAlign: 'right', marginTop: 10 }}>
            <button
              className={styles.submitButton1}
              onClick={async () => {
                try {
                  const response = await fetch(docUrl);
                  const blob = await response.blob();
                  const link = document.createElement('a');
                  link.href = window.URL.createObjectURL(blob);
                  link.download = 'document.pdf';
                  link.click();
                  window.URL.revokeObjectURL(link.href);
                } catch (err) {
                  toast.error('Failed to download document');
                }
              }}
            >
              Download
            </button>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
      <Footer />
    </div>
  );
}

export default withAdminAuth(AddEmployee);
