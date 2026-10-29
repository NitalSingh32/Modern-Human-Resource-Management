import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveRequestDocument extends Document {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  managerId?: string;
  leaveType: 'Paid' | 'Sick' | 'Casual' | 'Unpaid';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

const LeaveRequestSchema = new Schema<ILeaveRequestDocument>(
  {
    employeeId: { type: String, required: true },
    employeeCode: { type: String, required: true },
    employeeName: { type: String, required: true },
    department: { type: String, required: true },
    managerId: { type: String },
    leaveType: {
      type: String,
      enum: ['Paid', 'Sick', 'Casual', 'Unpaid'],
      required: true,
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    daysCount: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    appliedAt: { type: String, required: true },
    reviewedBy: { type: String },
    reviewedAt: { type: String },
    reviewNotes: { type: String },
  },
  { timestamps: true }
);

export const LeaveRequestModel = mongoose.models.LeaveRequest || mongoose.model<ILeaveRequestDocument>('LeaveRequest', LeaveRequestSchema);
