import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await dbConnect();

  const { empId ,name} = req.body;
  const today = new Date().toISOString().split('T')[0];

  const existing = await Attendance.findOne({ empId,name, date: today });
  //console.log("check", existing)

  if (!existing) {
    const punchIn = new Date();
    await Attendance.create({ empId, name,date: today, punchIn });
    res.status(200).json({ status: 'punchIn', punchIn });
  } else if (!existing.punchOut) {
    const punchOut = new Date();
    const diff = (punchOut - existing.punchIn) / 1000 / 60; // in minutes
    const timeDiff = `${Math.floor(diff)} minutes`;
    existing.punchOut = punchOut;
    existing.timeDiff = timeDiff;
    await existing.save();
    res.status(200).json({ status: 'punchOut', punchOut, timeDiff });
  } else {
    res.status(200).json({ status: 'done' });
  }
}
