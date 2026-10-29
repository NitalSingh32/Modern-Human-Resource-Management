export interface IUser {
  _id: string;
  email: string;
  password?: string;
  role: 'admin' | 'manager' | 'employee';
  employeeId?: string;
  name: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

export interface IEmployee {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface IDepartment {
  _id: string;
  name: string;
  code: string;
  description: string;
  headOfDepartment: string; // employee name or id
  budget: number;
  employeeCount?: number;
  designations: string[];
  createdAt: string;
}

export interface IAttendance {
  _id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // e.g. "09:05 AM" or ISO
  checkOut: string | null; // e.g. "05:30 PM" or ISO
  workHours: number;
  status: 'Present' | 'Late' | 'Half-day' | 'Absent' | 'On-Leave';
  location: string;
  notes?: string;
  createdAt: string;
}

export interface ILeaveRequest {
  _id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  managerId?: string;
  leaveType: 'Paid' | 'Sick' | 'Casual' | 'Unpaid';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysCount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface IAnnouncement {
  _id: string;
  title: string;
  content: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  targetDepartment: string; // "All" or Department name
  authorName: string;
  authorRole: string;
  postedAt: string;
  pinned: boolean;
}

export interface ITrainingProgram {
  _id: string;
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
  createdAt: string;
}
