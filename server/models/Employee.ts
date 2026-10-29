import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployeeDocument extends Document {
  employeeCode: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  department: string;
  designation: string;
  managerId?: string;
  managerName?: string;
  joiningDate: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract';
  salary: number;
  status: 'Active' | 'On Leave' | 'Terminated';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  skills: string[];
  leaveBalance: {
    paid: number;
    sick: number;
    casual: number;
  };
}

const EmployeeSchema = new Schema<IEmployeeDocument>(
  {
    employeeCode: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    managerId: { type: String },
    managerName: { type: String },
    joiningDate: { type: String, required: true },
    employmentType: { type: String, enum: ['Full-time', 'Part-time', 'Contract'], default: 'Full-time' },
    salary: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'On Leave', 'Terminated'], default: 'Active' },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: 'USA' },
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relation: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    skills: [{ type: String }],
    leaveBalance: {
      paid: { type: Number, default: 15 },
      sick: { type: Number, default: 10 },
      casual: { type: Number, default: 7 },
    },
  },
  { timestamps: true }
);

export const EmployeeModel = mongoose.models.Employee || mongoose.model<IEmployeeDocument>('Employee', EmployeeSchema);
