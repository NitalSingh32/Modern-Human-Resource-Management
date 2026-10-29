import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartmentDocument extends Document {
  name: string;
  code: string;
  description: string;
  headOfDepartment: string;
  budget: number;
  designations: string[];
}

const DepartmentSchema = new Schema<IDepartmentDocument>(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    headOfDepartment: { type: String, default: 'Unassigned' },
    budget: { type: Number, default: 0 },
    designations: [{ type: String }],
  },
  { timestamps: true }
);

export const DepartmentModel = mongoose.models.Department || mongoose.model<IDepartmentDocument>('Department', DepartmentSchema);
