// import connectMongo from '../../lib/mongodb';
// import Attendance from '@/models/Attendance';

// function formatDateToYYYYMMDD(date) {
//   const d = new Date(date);
//   const year = d.getFullYear();
//   const month = `${d.getMonth() + 1}`.padStart(2, '0');
//   const day = `${d.getDate()}`.padStart(2, '0');
//   return `${year}-${month}-${day}`;
// }

// export default async function handler(req, res) {
//   if (req.method !== 'DELETE') {
//     return res.status(405).json({ message: 'Method Not Allowed' });
//   }

//   await connectMongo();

//   const { dateFrom, dateTo, empId } = req.body;

//   if (!dateFrom || !dateTo) {
//     return res.status(400).json({ message: 'dateFrom and dateTo are required' });
//   }

//   try {
//     const fromStr = formatDateToYYYYMMDD(dateFrom);
//     const toStr = formatDateToYYYYMMDD(dateTo);

//     const query = {
//       date: { $gte: fromStr, $lte: toStr },
//     };

//     if (empId) {
//       query.empId = empId;
//     }

//     const result = await Attendance.deleteMany(query);

//     if (result.deletedCount === 0) {
//       return res.status(404).json({ message: 'No attendance records found to delete' });
//     }

//     return res.status(200).json({ message: `Deleted ${result.deletedCount} attendance records.` });
//   } catch (error) {
//     console.error('Error deleting attendance:', error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// }
import connectMongo from '../../lib/mongodb';
import Attendance from '@/models/Attendance';

function formatDateToYYYYMMDD(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default async function handler(req, res) {
  // Accept POST with override method
  if (req.method !== 'POST' || req.body._method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await connectMongo();

  const { dateFrom, dateTo, empId } = req.body;

  if (!dateFrom || !dateTo) {
    return res.status(400).json({ message: 'dateFrom and dateTo are required' });
  }

  try {
    const fromStr = formatDateToYYYYMMDD(dateFrom);
    const toStr = formatDateToYYYYMMDD(dateTo);

    const query = {
      date: { $gte: fromStr, $lte: toStr },
    };

    if (empId) {
      query.empId = empId;
    }

    const result = await Attendance.deleteMany(query);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No attendance records found to delete' });
    }

    return res.status(200).json({ message: `Deleted ${result.deletedCount} attendance records.` });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
