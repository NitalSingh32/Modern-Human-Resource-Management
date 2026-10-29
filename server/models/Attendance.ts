import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceDocument extends Document {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null;
  checkOut: string | null;
  workHours: number;
  status: 'Present' | 'Late' | 'Half-day' | 'Absent' | 'On-Leave';
  location: string;
  notes?: string;
}

const AttendanceSchema = new Schema<IAttendanceDocument>(
  {
    employeeId: { type: String, required: true },
    employeeCode: { type: String, required: true },
    employeeName: { type: String, required: true },
    department: { type: String, required: true },
    date: { type: String, required: true },
    checkIn: { type: String, default: null },
    checkOut: { type: String, default: null },
    workHours: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Half-day', 'Absent', 'On-Leave'],
      default: 'Present',
    },
    location: { type: String, default: 'Headquarters - On-site' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate attendance entries for same employee on the same date
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const AttendanceModel = mongoose.models.Attendance || mongoose.model<IAttendanceDocument>('Attendance', AttendanceSchema);
