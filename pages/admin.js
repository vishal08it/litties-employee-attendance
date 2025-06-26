import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from '../styles/Home.module.css';

import { FaEdit } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAdminAuth from '@/lib/withAdminAuth';



 function Admin() {
  const [data, setData] = useState([]);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [pdfEmpId, setPdfEmpId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [empId, setEmpId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [image, setImage] = useState(null);
  const [searchEmp, setSearchEmp] = useState('');
  const router = useRouter();
 const [showDeleteModal, setShowDeleteModal] = useState(false);
const [selectedDeleteEmpId, setSelectedDeleteEmpId] = useState('');
const [employeeList, setEmployeeList] = useState([]);
const [selectedEmpId, setSelectedEmpId] = useState('');
const [showDeleteAttendanceModal, setShowDeleteAttendanceModal] = useState(false);
const [deleteDateFrom, setDeleteDateFrom] = useState(null);
const [deleteDateTo, setDeleteDateTo] = useState(null);
const [deleteEmpId, setDeleteEmpId] = useState('');
const [showEditModal, setShowEditModal] = useState(false);
const [editRecord, setEditRecord] = useState(null);
const [editPunchIn, setEditPunchIn] = useState('');
const [editPunchOut, setEditPunchOut] = useState('');
const [showEditForm, setShowEditForm] = useState(false);
const [editData, setEditData] = useState({
  empId: '',
  name: '',
  date: '',
  punchIn: '',
  punchOut: ''
});
const [currentPage, setCurrentPage] = useState(1);
const recordsPerPage = 5;



  // Get unique employees for dropdown and filter
  const uniqueEmployees = Array.from(
    new Map(data.map(emp => [`${emp.empId}_${emp.name}`, emp])).values()
  );

  useEffect(() => {
    const r = localStorage.getItem('role');
    if (r !== 'admin') router.push('/');
    else fetchAttendances();
  }, []);
  

  const fetchAttendances = async () => {
    const res = await fetch('/api/attendances');
    const json = await res.json();
    setData(json);
  };
useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await fetch('/api/get-employee');
        const data = await res.json();

        // Your unique filtering logic here
        const uniqueEmployees = Array.from(
          new Map(data.map(emp => [`${emp.empId}_${emp.name}`, emp])).values()
        );

        setEmployeeList(uniqueEmployees);
      } catch (error) {
        //console.error('Error fetching employees:', error);
      }
    }
    fetchEmployees();
  }, []);

  const handleEditClick = (record) => {
    debugger
  setEditRecord(record);
  setEditPunchIn(record.punchIn ? new Date(record.punchIn).toISOString().slice(0, 16) : '');
  setEditPunchOut(record.punchOut ? new Date(record.punchOut).toISOString().slice(0, 16) : '');
  setShowEditModal(true);
};

const handleUpdateAttendance = async () => {
  if (!editRecord) return;

  try {
    const res = await fetch('/api/edit-attendance', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        empId: editRecord.empId,
        date: editRecord.date,
        punchIn: editPunchIn ? new Date(editPunchIn).toISOString() : null,
        punchOut: editPunchOut ? new Date(editPunchOut).toISOString() : null,
      }),
    });

    const result = await res.json();
    if (res.ok) {
      toast.success('Attendance updated successfully');
      setShowEditModal(false);
      fetchAttendances();
    } else {
      toast.error(result.message || 'Failed to update attendance');
    }
  } catch (error) {
    //console.error('Update error:', error);
    toast.error('Server error while updating attendance');
  }
};

  const handleDelete = async () => {
    if (!selectedEmpId) {
      toast.error('Please select an employee to delete');
      return;
    }

    try {
      const res = await fetch('/api/delete-employee', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ empId: selectedEmpId }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success('Employee deleted successfully', { autoClose: 2000 });
        setShowDeleteModal(false);
        await router.push('/admin');
        window.location.reload(); // redirect to admin page
      } else {
         toast.error(result.message ||'Failed to delete employee.');
      }
    } catch (error) {
      //console.error('Delete employee error:', error);
      toast.error('server error')
    }
  };
  const logout = () => {
    localStorage.clear();
    router.push('/');
     toast.success('Logout successfully!', { autoClose: 2000 });
  };

  const uploadImageToCloudinary = async () => {
    if (!image) return '';
    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', 'litties_unsigned');
    const cloudName = 'depov4b4l';

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      return data.secure_url || '';
    } catch (err) {
      //console.error('Cloudinary upload failed:', err);
      toast.error('Cloudinary upload failed:', err);
      return '';
    }
  };

  const handleAddEmployee = async (e) => {
  e.preventDefault();
  const imageUrl = await uploadImageToCloudinary();

  const res = await fetch('/api/add-employee', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ empId, name, password, role, image: imageUrl }),
  });

  const json = await res.json();
  //alert(json.message);
  toast.success(json.message,'Employee added successfully.', { autoClose: 2000 })

  if (res.ok) {
    setEmpId('');
    setName('');
    setPassword('');
    setImage(null);
    setShowForm(false);

    // Redirect and refresh page
    router.push('/admin').then(() => {
      window.location.reload();
    });
  }
};

const handleDeleteAttendance = async () => {
  if (!deleteDateFrom || !deleteDateTo) {
    toast.error('Please select both date from and date to.');
    return;
  }
  if (deleteDateFrom > deleteDateTo) {
    toast.error('Date From cannot be after Date To.');
    return;
  }

  // Confirm deletion with user
  const confirmed = toast.confirm(
    `Are you sure you want to delete attendance records from ${formatDate(deleteDateFrom)} to ${formatDate(deleteDateTo)}${deleteEmpId ? ' for employee ' + deleteEmpId : ' for all employees'}?`
  );

  if (!confirmed) return;

  try {
    const res = await fetch('/api/delete-attendance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    _method: 'DELETE',  // Trick to simulate DELETE
    dateFrom: deleteDateFrom,
    dateTo: deleteDateTo,
    empId: deleteEmpId || undefined,
  }),
});


    const result = await res.json();

    if (res.ok) {
      toast.success('Attendance records deleted successfully.');
      setShowDeleteAttendanceModal(false);
      setDeleteDateFrom(null);
      setDeleteDateTo(null);
      setDeleteEmpId('');
      fetchAttendances();  // Refresh attendance list after delete
    } else {
      toast.error(result.message || 'Failed to delete attendance records.');
    }
  } catch (error) {
    //console.error('Error deleting attendance:', error);
    toast.error('Server error while deleting attendance.');
    
  }
};

  const handleDownloadClick = () => {
    setShowDownloadModal(true);
  };

  const getBase64Image = (url) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  
  const isSameOrAfter = (a, b) => !b || a.setHours(0, 0, 0, 0) >= b.setHours(0, 0, 0, 0);
  const isSameOrBefore = (a, b) => !b || a.setHours(0, 0, 0, 0) <= b.setHours(0, 0, 0, 0);

 const generatePDF = async () => {
  try {
    const doc = new jsPDF();
    const logoData = await getBase64Image('https://res.cloudinary.com/depov4b4l/image/upload/v1747723678/va6o3y0edaied536mjlv.jpg');

    const grouped = data.reduce((acc, curr) => {
      const key = `${curr.empId}_${curr.name}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(curr);
      return acc;
    }, {});

    let hasData = false;
    let pageIndex = 0;
    let empName = '';
    let empIdKey = '';

    for (const key in grouped) {
      [empIdKey, empName] = key.split('_');

      if (pdfEmpId && empIdKey !== pdfEmpId.trim()) continue;

      const records = grouped[key].filter((record) => {
        const recDate = new Date(record.date);
        const from = dateFrom ? new Date(dateFrom) : null;
        const to = dateTo ? new Date(dateTo) : null;
        return isSameOrAfter(recDate, from) && isSameOrBefore(recDate, to);
      });

      records.sort((a, b) => new Date(a.date) - new Date(b.date));

      if (records.length === 0) continue;
      hasData = true;
      if (pageIndex > 0) doc.addPage();

      const rows = records.map((r) => {
        const punchIn = r.punchIn ? new Date(r.punchIn).toLocaleTimeString() : '';
        const punchOut = r.punchOut ? new Date(r.punchOut).toLocaleTimeString() : '';
        let timeDiff = '', dayType = '';

        if (r.punchIn && r.punchOut) {
          const inTime = new Date(r.punchIn), outTime = new Date(r.punchOut);
          const diffMs = outTime - inTime;
          const hrs = Math.floor(diffMs / 3600000);
          const mins = Math.floor((diffMs % 3600000) / 60000);
          timeDiff = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
          dayType = diffMs / 3600000 >= 6 ? 1.0 : 0.5;
        } else {
          dayType = 0.0;
        }

        return [formatDate(r.date), r.empId, r.name, punchIn, punchOut, timeDiff, dayType.toString()];
      });

      const totalDays = rows.reduce((acc, r) => acc + parseFloat(r[6]), 0).toFixed(1);

      // 👇 Bonus Logic & Salary Calculation
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const month = fromDate ? fromDate.getMonth() : null;
      const year = fromDate ? fromDate.getFullYear() : null;
      const totalMonthDays = month !== null && year !== null
        ? new Date(year, month + 1, 0).getDate()
        : 30; // fallback if undefined

      const presentDays = parseFloat(totalDays);
      let baseSalary = empIdKey === '1004' ? 20000 : 5000;
      let bonus = 0;

      if (
        (totalMonthDays === 30 && presentDays > 29) ||
        (totalMonthDays === 31 && presentDays > 30)
      ) {
        bonus = empIdKey === '1004' ? 666.66 : 166.66;
      }

      const dailyRate = baseSalary / totalMonthDays;
      const totalSalary = ((presentDays * dailyRate) + bonus).toFixed(2);

      // ⬇️ Add rows to PDF
      rows.push(['', '', '', '', '', 'Total Days:', totalDays]);
      rows.push(['', '', '', '', '', 'Bonus:', `Rs. ${bonus.toFixed(2)}`]);
      rows.push(['', '', '', '', '', 'Total Salary:', `Rs. ${totalSalary}`]);

      doc.addImage(logoData, 'jpg', 14, 10, 20, 20);
      doc.setFontSize(14);
      doc.text('Litties Multi Cuisine Family Restaurant', 40, 16);
      doc.setFontSize(10);
      doc.text('Shanti Prayag, Lalganj, Sasaram - 821115', 40, 22);
      doc.setFontSize(12);
      doc.text(`Attendance for ${empName} (${empIdKey})`, 14, 35);

      const fromText = dateFrom ? formatDate(dateFrom) : '-';
      const toText = dateTo ? formatDate(dateTo) : '-';
      doc.setFontSize(11);
      doc.text(`Date Range: ${fromText} to ${toText}`, 14, 42);

      autoTable(doc, {
        startY: 47,
        head: [['Date', 'Emp ID', 'Name', 'Punch In', 'Punch Out', 'Time Diff', 'Day Type']],
        body: rows,
      });

      pageIndex++;
    }

    if (!hasData) {
      toast.error('No attendance records found for selected criteria.');
    } else {
      const filename = `Attendance_${empName}_${empIdKey}.pdf`;
      const pdfBlob = doc.output('blob');
      const reader = new FileReader();

      reader.onload = () => {
        const base64 = reader.result;

        if (window.AndroidBridge && window.AndroidBridge.savePdfFile) {
          window.AndroidBridge.savePdfFile(base64, filename);
        } else {
          const a = document.createElement("a");
          a.href = base64;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      };

      reader.readAsDataURL(pdfBlob);
    }

    setShowDownloadModal(false);
  } catch (err) {
    toast.error('Failed to generate PDF.');
  }
};



  // Filter data based on searchEmp input (case-insensitive)
  const filteredData = data.filter(
    (a) =>
      a.empId.toLowerCase().includes(searchEmp.toLowerCase()) ||
      a.name.toLowerCase().includes(searchEmp.toLowerCase())
  );
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
const paginatedData = filteredData.slice(
  (currentPage - 1) * recordsPerPage,
  currentPage * recordsPerPage
);

const goToNextPage = () => {
  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
};

const goToPrevPage = () => {
  if (currentPage > 1) setCurrentPage(currentPage - 1);
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

      <div style={{ padding: '1rem', overflowX: 'auto' }}>
       <div style={{ marginBottom: '2rem' }}>
  <h2 style={{ color: '#facc15', fontWeight: 'bold', marginBottom: '1rem' }}>
    Admin Dashboard
  </h2>

  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    }}
  >
    <button onClick={() => window.location.href = '/items'} className={styles.addemployeeButton}>
      Item Menu
    </button>
    <button onClick={() => window.location.href = '/add-category'} className={styles.addemployeeButton}>
      Add Category
    </button>
    <button onClick={() => window.location.href = '/orders'} className={styles.addemployeeButton}>
     Order Management
    </button>
    <button onClick={() => setShowForm(true)} className={styles.addemployeeButton}>
      Add Employee
    </button>
    <button onClick={() => setShowDeleteModal(true)} className={styles.addemployeeButton}>
      Delete Employee
    </button>
    <button onClick={() => setShowDeleteAttendanceModal(true)} className={styles.addemployeeButton}>
      Delete Attendance
    </button>
    <button onClick={handleDownloadClick} className={styles.addemployeeButton}>
      Download Attendance
    </button>
  </div>
</div>
 {showForm && (
          <>
          <div className={styles.overlay1} onClick={() => setShowForm(false)} />
<div className={styles.popup1}>
  <button className={styles.closeButton1} onClick={() => setShowForm(false)}>&times;</button>
   <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',  // Optional: for vertical centering
    width: '100%'    // Optional: for horizontal centering
  }}>
    <Image src="/litties.png" alt="Litties Logo" width={60} height={60} />
  </div>
  <h2>Add New Employee</h2>
  <form onSubmit={handleAddEmployee}>
    <input className={styles.input1} placeholder="Employee ID" value={empId} onChange={(e) => setEmpId(e.target.value)} />
    <input className={styles.input1} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
    <input className={styles.input1} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
    <select className={styles.selectBackground } value={role} onChange={(e) => setRole(e.target.value)}>
      <option value="employee">Employee</option>
      <option value="admin">Admin</option>
    </select>
    <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className={styles.input1} />
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
      <button type="submit" className={styles.submitButton1}>Submit</button>
      <button type="button" onClick={() => setShowForm(false)} className={styles.submitButton1} style={{ backgroundColor: '#999' }}>Cancel</button>
    </div>
  </form>
</div>
</>
        )}
        

        {/* Delete Employee Modal */}
   {showDeleteModal && (
    <>
  <div className={styles.overlay1} onClick={() => setShowDeleteModal(false)} />
<div className={styles.popup1}>
  <button className={styles.closeButton1} onClick={() => setShowDeleteModal(false)}>
    &times;
  </button>
   <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',  // Optional: for vertical centering
    width: '100%'    // Optional: for horizontal centering
  }}>
    <Image src="/litties.png" alt="Litties Logo" width={60} height={60} />
  </div>
  <h2>Delete Employee</h2>
  <select
  value={selectedEmpId}
  onChange={(e) => setSelectedEmpId(e.target.value)}
  className={styles.selectBackground}
>
  <option value="">Select Employee</option>
  {employeeList
    .filter(emp =>
      emp.empId && // empId not null
      emp.empId !== "1001" &&
      emp.role?.toLowerCase() !== "customer"
    )
    .map(emp => (
      <option key={emp.empId} value={emp.empId}>
        {emp.empId} - {emp.name}
      </option>
    ))}
</select>
 <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
    <button
      onClick={() => setShowDeleteModal(false)}
      className={styles.submitButton1}
      style={{ backgroundColor: '#999' }}
    >
      Cancel
    </button>
    <button
      onClick={handleDelete}
      className={styles.submitButton1}
      style={{ backgroundColor: '#e74c3c' }}
    >
      Delete
    </button>
  </div>
</div>
</>
)}

{showDeleteAttendanceModal && (
 <>
 <div className={styles.overlay1} onClick={() => setShowDeleteAttendanceModal(false)} />
<div className={styles.popup1}>
  <button className={styles.closeButton1} onClick={() => setShowDeleteAttendanceModal(false)}>
    &times;
  </button>
   <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',  // Optional: for vertical centering
    width: '100%'    // Optional: for horizontal centering
  }}>
    <Image src="/litties.png" alt="Litties Logo" width={60} height={60} />
  </div>
  <h2>Delete Attendance Records</h2>

 <select
  value={deleteEmpId}
  onChange={(e) => setDeleteEmpId(e.target.value)}
  className={styles.selectBackground}
>
  <option value="">All Employees</option>
  {employeeList
    .filter(emp =>
      emp.empId &&                     // empId is not null
      emp.empId !== "1001" &&          // not Admin
      emp.role?.toLowerCase() !== "customer" // not Customer
    )
    .map((emp) => (
      <option key={emp.empId} value={emp.empId}>
        {emp.name} ({emp.empId})
      </option>
    ))}
</select>


  <div style={{ display: 'flex', gap: '10px', marginTop: '10px', marginBottom: '10px' }}>
    <DatePicker
      selected={deleteDateFrom}
      onChange={setDeleteDateFrom}
      maxDate={new Date()}
      isClearable
      placeholderText="From"
      className={styles.input1}
    />
    <DatePicker
      selected={deleteDateTo}
      onChange={setDeleteDateTo}
      maxDate={new Date()}
      isClearable
      placeholderText="To"
      className={styles.input1}
    />
  </div>

  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
    <button
      onClick={handleDeleteAttendance}
      className={styles.submitButton1}
      style={{ backgroundColor: '#e74c3c' }}
    >
      Delete
    </button>
    <button
      onClick={() => setShowDeleteAttendanceModal(false)}
      className={styles.submitButton1}
      style={{ backgroundColor: '#999' }}
    >
      Cancel
    </button>
  </div>
</div>

 </>

)}
{showEditForm && (
 <>
 <div className={styles.overlay1} onClick={() => setShowEditForm(false)} />
<div className={styles.popup1}>
  <button className={styles.closeButton1} onClick={() => setShowEditForm(false)}>
    &times;
  </button>
   <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',  // Optional: for vertical centering
    width: '100%'    // Optional: for horizontal centering
  }}>
    <Image src="/litties.png" alt="Litties Logo" width={60} height={60} />
  </div>
  <h2>Edit Attendance</h2>

  <form
    onSubmit={async (e) => {
      e.preventDefault();

      const res = await fetch('/api/edit-attendance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empId: editData.empId,
          date: editData.date,
          punchIn: `${editData.date}T${editData.punchIn}`,
          punchOut: `${editData.date}T${editData.punchOut}`,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success('Attendance updated successfully!');
        setShowEditForm(false);
        fetchAttendances();
      } else {
        toast.error(json.message || 'Failed to update attendance');
      }
    }}
  >
    <input className={styles.input1} value={editData.empId} readOnly />
    <input className={styles.input1} value={editData.name} readOnly />
    <input className={styles.input1} value={editData.date} readOnly />

    <input
      className={styles.input1}
      type="time"
      value={editData.punchIn}
      onChange={(e) => setEditData({ ...editData, punchIn: e.target.value })}
      required
    />
    <input
      className={styles.input1}
      type="time"
      value={editData.punchOut}
      onChange={(e) => setEditData({ ...editData, punchOut: e.target.value })}
      required
    />

    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
      <button type="submit" className={styles.submitButton1}>
        Save
      </button>
      <button
        type="button"
        className={styles.submitButton1}
        style={{ backgroundColor: '#999' }}
        onClick={() => setShowEditForm(false)}
      >
        Cancel
      </button>
    </div>
  </form>
</div>

 </>
)}


        {showDownloadModal && (
          <>
          <div className={styles.overlay1} onClick={() => setShowDownloadModal(false)} />
<div className={styles.popup1}>
  <button className={styles.closeButton1} onClick={() => setShowDownloadModal(false)}>
    &times;
  </button>
   <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',  // Optional: for vertical centering
    width: '100%'    // Optional: for horizontal centering
  }}>
    <Image src="/litties.png" alt="Litties Logo" width={60} height={60} />
  </div>
  <h2>Select Employee and Date Range</h2>

  <select
    value={pdfEmpId}
    onChange={(e) => setPdfEmpId(e.target.value)}
    className={styles.selectBackground}
  >
    <option value="">-- Select Employee --</option>
    {uniqueEmployees.map((emp) => (
      <option key={emp.empId} value={emp.empId}>
        {emp.name} ({emp.empId})
      </option>
    ))}
  </select>

  <div style={{ display: 'flex', gap: '10px', marginTop: '10px', marginBottom: '10px' }}>
    <DatePicker
      selected={dateFrom}
      onChange={(date) => setDateFrom(date)}
      placeholderText="From"
      className={styles.input1}
    />
    <DatePicker
      selected={dateTo}
      onChange={(date) => setDateTo(date)}
      placeholderText="To"
      className={styles.input1}
    />
  </div>

  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
    <button
      onClick={generatePDF}
      className={styles.submitButton1}
    >
      Download
    </button>
    <button
      onClick={() => setShowDownloadModal(false)}
      className={styles.submitButton1}
      style={{ backgroundColor: '#999' }}
    >
      Cancel
    </button>
  </div>
</div>

          </>
        )}

        {/* Filter Dropdown below "Employee Attendance Records" */}
        <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
          <h2 style={{ color: '#facc15' }}>Employee Attendance Records</h2>

          <select
            value={searchEmp}
            onChange={(e) => setSearchEmp(e.target.value)}
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem',
              borderRadius: '8px',
              border: '1.5px solid #facc15',
              backgroundColor: '#1f2937',
              color: 'white',
              boxShadow:
                '4px 4px 6px #121827, -4px -4px 6px #374151',
              minWidth: '220px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            <option value="">-- All Employees --</option>
            {uniqueEmployees.map((emp) => (
              <option key={emp.empId} value={emp.empId}>
                {emp.empId} ({emp.name})
              </option>
            ))}
          </select>
        </div>

       <div style={{ overflowX: 'auto', width: '100%' }}>
  <table
    style={{
      minWidth: '800px', // allows scrolling on small screens
      borderCollapse: 'separate',
      borderSpacing: '0 10px',
      background: '#111827',
      borderRadius: '10px',
      boxShadow: '0 4px 15px rgba(250, 204, 21, 0.6), inset 0 0 10px #facc15',
      color: 'white',
      width: '100%'
    }}
  >
    <thead style={{ backgroundColor: '#facc15', color: '#111827' }}>
      <tr>
        <th style={{ padding: '10px 15px', borderRadius: '10px 0 0 10px' }}>Date</th>
        <th>Emp ID</th>
        <th>Name</th>
        <th>Punch In</th>
        <th>Punch Out</th>
        <th>Time Diff</th>
        <th>Day Type</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {filteredData.length === 0 ? (
        <tr>
          <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>
            No attendance records found.
          </td>
        </tr>
      ) : (
       paginatedData.map((record, i) => {
  const punchInTime = record.punchIn ? new Date(record.punchIn).toLocaleTimeString() : '';
  const punchOutTime = record.punchOut ? new Date(record.punchOut).toLocaleTimeString() : '';

  let timeDiff = '';
  let dayType = '';

  if (record.punchIn && record.punchOut) {
    const inTime = new Date(record.punchIn);
    const outTime = new Date(record.punchOut);
    const diffMs = outTime - inTime;
    const hrs = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    timeDiff = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    dayType = diffMs / 3600000 >= 6 ? 1.0 : 0.5;
  } else {
    dayType = 0.0;
  }

  return (
    <tr
      key={i}
      style={{
        background: i % 2 === 0 ? '#1f2937' : '#374151',
        borderRadius: '8px',
        boxShadow: 'inset 2px 2px 5px #111827, inset -2px -2px 5px #4b5563',
        transition: 'transform 0.2s',
        textAlign: 'center',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <td style={{ padding: '10px 15px' }}>{formatDate(record.date)}</td>
      <td>{record.empId}</td>
      <td>{record.name}</td>
      <td>{punchInTime}</td>
      <td>{punchOutTime}</td>
      <td>{timeDiff}</td>
      <td>{dayType}</td>
      <td>
        <button
          onClick={() => {
            setEditData({
              empId: record.empId,
              name: record.name,
              date: record.date,
              punchIn: record.punchIn?.slice(11, 16) || '',
              punchOut: record.punchOut?.slice(11, 16) || ''
            });
            setShowEditForm(true);
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#facc15',
            fontSize: '18px'
          }}
          title="Edit"
        >
          ✏️
        </button>
      </td>
    </tr>
  );
})

      )}
    </tbody>
  </table>
</div>
<div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
  <button
    onClick={goToPrevPage}
    disabled={currentPage === 1}
    style={{
      padding: '10px 25px',
      borderRadius: '999px', // fully oval
      border: 'none',
      fontWeight: 'bold',
      color: 'black',
      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
      background: 'linear-gradient(to right, #FF9933, white, #138808)',
      opacity: currentPage === 1 ? 0.6 : 1,
    }}
  >
    Previous
  </button>

  <span style={{ fontWeight: 'bold', color: 'white', alignSelf: 'center' }}>
    Page {currentPage} of {totalPages}
  </span>

  <button
    onClick={goToNextPage}
    disabled={currentPage === totalPages}
    style={{
      padding: '10px 25px',
      borderRadius: '999px',
      border: 'none',
      fontWeight: 'bold',
      color: 'black',
      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
      background: 'linear-gradient(to right, #FF9933, white, #138808)',
      opacity: currentPage === totalPages ? 0.6 : 1,
    }}
  >
    Next
  </button>
</div>


      </div>
    </div>
  );
}
export default withAdminAuth(Admin);