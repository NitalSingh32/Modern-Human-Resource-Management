import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncementDocument extends Document {
  title: string;
  content: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  targetDepartment: string;
  authorName: string;
  authorRole: string;
  postedAt: string;
  pinned: boolean;
}

const AnnouncementSchema = new Schema<IAnnouncementDocument>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    priority: { type: String, enum: ['Normal', 'Important', 'Urgent'], default: 'Normal' },
    targetDepartment: { type: String, default: 'All' },
    authorName: { type: String, required: true },
    authorRole: { type: String, required: true },
    postedAt: { type: String, required: true },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AnnouncementModel = mongoose.models.Announcement || mongoose.model<IAnnouncementDocument>('Announcement', AnnouncementSchema);
