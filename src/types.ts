export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar: string;
  employeeId?: string;
  employee?: Employee | null;
}

export interface Employee {
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
  createdAt?: string;
  updatedAt?: string;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description: string;
  headOfDepartment: string;
  budget: number;
  employeeCount?: number;
  designations: string[];
  createdAt: string;
}

export interface Attendance {
  _id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workHours: number;
  status: 'Present' | 'Late' | 'Half-day' | 'Absent' | 'On-Leave';
  location: string;
  notes?: string;
  createdAt: string;
}

export interface LeaveRequest {
  _id: string;
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

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  targetDepartment: string;
  authorName: string;
  authorRole: string;
  postedAt: string;
  pinned: boolean;
}

export interface EnrolledMember {
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progressPercent: number;
  completedAt?: string;
}

export interface TrainingProgram {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  department: string;
  startDate: string;
  endDate: string;
  status: 'Upcoming' | 'In Progress' | 'Completed';
  category: string;
  enrolledEmployees: EnrolledMember[];
  createdById: string;
  createdAt: string;
}

export interface AnalyticsOverview {
  summary: {
    totalEmployees: number;
    presentToday: number;
    absentToday: number;
    lateToday: number;
    pendingLeaves: number;
    activeDepartments: number;
    activeTrainingPrograms: number;
  };
  attendanceTrend: Array<{
    date: string;
    present: number;
    late: number;
    absent: number;
  }>;
  departmentDistribution: Array<{
    name: string;
    code: string;
    employees: number;
    budget: number;
  }>;
  leaveTypeCounts: {
    Paid: number;
    Sick: number;
    Casual: number;
    Unpaid: number;
  };
  teamStats?: {
    totalTeamMembers: number;
    teamPresent: number;
    teamAbsent: number;
    teamPendingLeaves: number;
    teamMembers: Employee[];
  } | null;
}
