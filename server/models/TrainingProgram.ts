import mongoose, { Schema, Document } from 'mongoose';

export interface ITrainingProgramDocument extends Document {
  title: string;
  description: string;
  instructor: string;
  department: string;
  startDate: string;
  endDate: string;
  status: 'Upcoming' | 'In Progress' | 'Completed';
  category: string;
  enrolledEmployees: {
    employeeId: string;
    employeeName: string;
    employeeAvatar?: string;
    department: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
    progressPercent: number;
    completedAt?: string;
  }[];
  createdById: string;
}

const EnrolledEmployeeSchema = new Schema(
  {
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    employeeAvatar: { type: String, default: '' },
    department: { type: String, required: true },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed'],
      default: 'Not Started',
    },
    progressPercent: { type: Number, default: 0 },
    completedAt: { type: String },
  },
  { _id: false }
);

const TrainingProgramSchema = new Schema<ITrainingProgramDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: { type: String, required: true },
    department: { type: String, default: 'All' },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    status: {
      type: String,
      enum: ['Upcoming', 'In Progress', 'Completed'],
      default: 'Upcoming',
    },
    category: { type: String, default: 'Professional Development' },
    enrolledEmployees: [EnrolledEmployeeSchema],
    createdById: { type: String, required: true },
  },
  { timestamps: true }
);

export const TrainingProgramModel =
  mongoose.models.TrainingProgram ||
  mongoose.model<ITrainingProgramDocument>('TrainingProgram', TrainingProgramSchema);
