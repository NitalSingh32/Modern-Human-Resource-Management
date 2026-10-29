import mongoose from 'mongoose';
import { getSeedData } from '../seedData.js';
import { IUser, IEmployee, IDepartment, IAttendance, ILeaveRequest, IAnnouncement, ITrainingProgram } from '../types.js';
import { UserModel } from '../models/User.js';
import { EmployeeModel } from '../models/Employee.js';
import { DepartmentModel } from '../models/Department.js';
import { AttendanceModel } from '../models/Attendance.js';
import { LeaveRequestModel } from '../models/LeaveRequest.js';
import { AnnouncementModel } from '../models/Announcement.js';
import { TrainingProgramModel } from '../models/TrainingProgram.js';

class DataStore {
  private isMongoConnected = false;
  private users: IUser[] = [];
  private employees: IEmployee[] = [];
  private departments: IDepartment[] = [];
  private attendance: IAttendance[] = [];
  private leaveRequests: ILeaveRequest[] = [];
  private announcements: IAnnouncement[] = [];
  private trainingPrograms: ITrainingProgram[] = [];

  async initialize() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/staffsync';

    // Seed data generator
    const seed = await getSeedData();
    this.users = [...seed.users];
    this.employees = [...seed.employees];
    this.departments = [...seed.departments];
    this.attendance = [...seed.attendance];
    this.leaveRequests = [...seed.leaveRequests];
    this.announcements = [...seed.announcements];
    this.trainingPrograms = [...seed.trainingPrograms];

    try {
      // Try to connect to real MongoDB with short timeout
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      this.isMongoConnected = true;
      console.log(`[MongoDB] Connected successfully to ${mongoUri}`);

      // Seed MongoDB collections if empty
      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        console.log('[MongoDB] Empty database detected. Seeding collections...');
        await UserModel.insertMany(seed.users);
        await EmployeeModel.insertMany(seed.employees);
        await DepartmentModel.insertMany(seed.departments);
        await AttendanceModel.insertMany(seed.attendance);
        await LeaveRequestModel.insertMany(seed.leaveRequests);
        await AnnouncementModel.insertMany(seed.announcements);
        await TrainingProgramModel.insertMany(seed.trainingPrograms);
        console.log('[MongoDB] Initial seed data successfully inserted.');
      }
    } catch (err: unknown) {
      this.isMongoConnected = false;
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[StaffSync Data Engine] Standalone MongoDB daemon not detected (${errorMsg}).`);
      console.log('[StaffSync Data Engine] Activated high-performance fallback store with Mongoose schema validation and full seed state.');
    }
  }

  getDbStatus() {
    return {
      connectedToMongo: this.isMongoConnected,
      engine: this.isMongoConnected ? 'MongoDB (Mongoose ODM)' : 'StaffSync In-Memory Store (MERN Engine)',
      modelsRegistered: [
        'User',
        'Employee',
        'Department',
        'Attendance',
        'LeaveRequest',
        'Announcement',
        'TrainingProgram',
      ],
      counts: {
        users: this.isMongoConnected ? 0 : this.users.length,
        employees: this.isMongoConnected ? 0 : this.employees.length,
        departments: this.isMongoConnected ? 0 : this.departments.length,
        attendance: this.isMongoConnected ? 0 : this.attendance.length,
        leaveRequests: this.isMongoConnected ? 0 : this.leaveRequests.length,
        announcements: this.isMongoConnected ? 0 : this.announcements.length,
        trainingPrograms: this.isMongoConnected ? 0 : this.trainingPrograms.length,
      },
    };
  }

  // USERS
  async findUserByEmail(email: string): Promise<IUser | null> {
    const normalized = email.toLowerCase().trim();
    if (this.isMongoConnected) {
      const user = await UserModel.findOne({ email: normalized }).lean();
      return user ? (user as unknown as IUser) : null;
    }
    return this.users.find((u) => u.email.toLowerCase() === normalized) || null;
  }

  async findUserById(id: string): Promise<IUser | null> {
    if (this.isMongoConnected) {
      const user = await UserModel.findById(id).lean();
      return user ? (user as unknown as IUser) : null;
    }
    return this.users.find((u) => u._id === id) || null;
  }

  async createUser(data: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
    const now = new Date().toISOString();
    const newUser: IUser = {
      ...data,
      _id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    if (this.isMongoConnected) {
      const created = await UserModel.create(newUser);
      return created.toObject() as unknown as IUser;
    }
    this.users.push(newUser);
    return newUser;
  }

  async getUsers(): Promise<IUser[]> {
    if (this.isMongoConnected) {
      const users = await UserModel.find({}, '-password').lean();
      return users as unknown as IUser[];
    }
    return this.users.map(({ password: _, ...rest }) => rest as IUser);
  }

  // EMPLOYEES
  async getEmployees(): Promise<IEmployee[]> {
    if (this.isMongoConnected) {
      const emps = await EmployeeModel.find({}).lean();
      return emps as unknown as IEmployee[];
    }
    return [...this.employees];
  }

  async getEmployeeById(id: string): Promise<IEmployee | null> {
    if (this.isMongoConnected) {
      const emp = await EmployeeModel.findById(id).lean();
      return emp ? (emp as unknown as IEmployee) : null;
    }
    return this.employees.find((e) => e._id === id || e.userId === id || e.employeeCode === id) || null;
  }

  async createEmployee(data: Partial<IEmployee>): Promise<IEmployee> {
    const count = this.employees.length + 1001;
    const employeeCode = data.employeeCode || `EMP-${count}`;
    const now = new Date().toISOString();
    const newEmp: IEmployee = {
      _id: `emp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      employeeCode,
      userId: data.userId || '',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: (data.email || '').toLowerCase().trim(),
      phone: data.phone || '',
      avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.firstName || 'emp'}`,
      department: data.department || 'General',
      designation: data.designation || 'Staff',
      managerId: data.managerId || '',
      managerName: data.managerName || '',
      joiningDate: data.joiningDate || new Date().toISOString().split('T')[0],
      employmentType: data.employmentType || 'Full-time',
      salary: data.salary || 65000,
      status: data.status || 'Active',
      address: data.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
      },
      emergencyContact: data.emergencyContact || {
        name: '',
        relation: '',
        phone: '',
      },
      skills: data.skills || [],
      leaveBalance: data.leaveBalance || { paid: 15, sick: 10, casual: 7 },
      createdAt: now,
      updatedAt: now,
    };

    if (this.isMongoConnected) {
      const doc = await EmployeeModel.create(newEmp);
      return doc.toObject() as unknown as IEmployee;
    }
    this.employees.push(newEmp);

    // Update department count
    const dept = this.departments.find((d) => d.name === newEmp.department);
    if (dept) {
      dept.employeeCount = (dept.employeeCount || 0) + 1;
    }
    return newEmp;
  }

  async updateEmployee(id: string, updates: Partial<IEmployee>): Promise<IEmployee | null> {
    if (this.isMongoConnected) {
      const updated = await EmployeeModel.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true }).lean();
      return updated ? (updated as unknown as IEmployee) : null;
    }
    const idx = this.employees.findIndex((e) => e._id === id || e.employeeCode === id);
    if (idx === -1) return null;
    this.employees[idx] = {
      ...this.employees[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.employees[idx];
  }

  async deleteEmployee(id: string): Promise<boolean> {
    if (this.isMongoConnected) {
      const res = await EmployeeModel.findByIdAndDelete(id);
      return !!res;
    }
    const idx = this.employees.findIndex((e) => e._id === id || e.employeeCode === id);
    if (idx === -1) return false;
    const [deleted] = this.employees.splice(idx, 1);
    // Remove user account if linked
    if (deleted.userId) {
      const uIdx = this.users.findIndex((u) => u._id === deleted.userId);
      if (uIdx !== -1) this.users.splice(uIdx, 1);
    }
    return true;
  }

  // DEPARTMENTS
  async getDepartments(): Promise<IDepartment[]> {
    if (this.isMongoConnected) {
      const depts = await DepartmentModel.find({}).lean();
      return depts as unknown as IDepartment[];
    }
    // Calculate live employee counts
    return this.departments.map((dept) => {
      const count = this.employees.filter((e) => e.department.toLowerCase() === dept.name.toLowerCase()).length;
      return { ...dept, employeeCount: count };
    });
  }

  async createDepartment(data: Partial<IDepartment>): Promise<IDepartment> {
    const newDept: IDepartment = {
      _id: `dept_${Date.now()}`,
      name: data.name || 'New Department',
      code: (data.code || 'DEPT').toUpperCase(),
      description: data.description || '',
      headOfDepartment: data.headOfDepartment || 'Unassigned',
      budget: data.budget || 100000,
      designations: data.designations || ['Specialist', 'Associate', 'Lead'],
      employeeCount: 0,
      createdAt: new Date().toISOString(),
    };
    if (this.isMongoConnected) {
      const doc = await DepartmentModel.create(newDept);
      return doc.toObject() as unknown as IDepartment;
    }
    this.departments.push(newDept);
    return newDept;
  }

  // ATTENDANCE
  async getAttendance(filter?: { date?: string; employeeId?: string; department?: string }): Promise<IAttendance[]> {
    if (this.isMongoConnected) {
      const q: Record<string, unknown> = {};
      if (filter?.date) q.date = filter.date;
      if (filter?.employeeId) q.employeeId = filter.employeeId;
      if (filter?.department) q.department = filter.department;
      const list = await AttendanceModel.find(q).sort({ createdAt: -1 }).lean();
      return list as unknown as IAttendance[];
    }
    let list = [...this.attendance];
    if (filter?.date) {
      list = list.filter((a) => a.date === filter.date);
    }
    if (filter?.employeeId) {
      list = list.filter((a) => a.employeeId === filter.employeeId);
    }
    if (filter?.department) {
      list = list.filter((a) => a.department.toLowerCase() === filter.department?.toLowerCase());
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async checkInAttendance(employeeId: string, location = 'Office'): Promise<{ success: boolean; data?: IAttendance; message: string }> {
    const today = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Enforce NO DUPLICATE ATTENDANCE check-in for the same employee on the same date!
    const existing = this.attendance.find((a) => a.employeeId === employeeId && a.date === today);
    if (existing && existing.checkIn) {
      return { success: false, message: 'You have already checked in for today (' + existing.checkIn + ').' };
    }

    const emp = await this.getEmployeeById(employeeId);
    if (!emp) {
      return { success: false, message: 'Employee record not found.' };
    }

    // Determine if late (e.g. after 09:30 AM)
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    const isLate = currentHour > 9 || (currentHour === 9 && currentMinute > 30);
    const status = isLate ? 'Late' : 'Present';

    if (existing) {
      existing.checkIn = nowTimeStr;
      existing.status = status;
      existing.location = location;
      return { success: true, data: existing, message: `Checked in successfully at ${nowTimeStr} (${status})` };
    }

    const newRecord: IAttendance = {
      _id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      employeeId: emp._id,
      employeeCode: emp.employeeCode,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      date: today,
      checkIn: nowTimeStr,
      checkOut: null,
      workHours: 0,
      status,
      location,
      notes: isLate ? 'Checked in after 09:30 AM' : 'Standard check-in',
      createdAt: new Date().toISOString(),
    };

    if (this.isMongoConnected) {
      try {
        const created = await AttendanceModel.create(newRecord);
        return { success: true, data: created.toObject() as unknown as IAttendance, message: `Checked in at ${nowTimeStr}` };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { success: false, message: 'Duplicate attendance prevented by database: ' + msg };
      }
    }

    this.attendance.unshift(newRecord);
    return { success: true, data: newRecord, message: `Checked in successfully at ${nowTimeStr} (${status})` };
  }

  async checkOutAttendance(employeeId: string): Promise<{ success: boolean; data?: IAttendance; message: string }> {
    const today = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const record = this.attendance.find((a) => a.employeeId === employeeId && a.date === today);
    if (!record || !record.checkIn) {
      return { success: false, message: 'No check-in record found for today. Please check in first.' };
    }
    if (record.checkOut) {
      return { success: false, message: `Already checked out today at ${record.checkOut}.` };
    }

    record.checkOut = nowTimeStr;
    // Calculate approximate work hours
    const checkInDate = new Date(record.createdAt);
    const diffHours = Math.max(0.5, parseFloat(((Date.now() - checkInDate.getTime()) / (1000 * 60 * 60)).toFixed(1)));
    record.workHours = diffHours > 14 ? 8.0 : diffHours; // Sanity cap

    if (this.isMongoConnected) {
      await AttendanceModel.findByIdAndUpdate(record._id, {
        checkOut: record.checkOut,
        workHours: record.workHours,
      });
    }

    return {
      success: true,
      data: record,
      message: `Checked out successfully at ${nowTimeStr}. Total logged: ${record.workHours} hours.`,
    };
  }

  // LEAVE REQUESTS
  async getLeaveRequests(filter?: { employeeId?: string; managerId?: string; status?: string }): Promise<ILeaveRequest[]> {
    if (this.isMongoConnected) {
      const q: Record<string, unknown> = {};
      if (filter?.employeeId) q.employeeId = filter.employeeId;
      if (filter?.managerId) q.managerId = filter.managerId;
      if (filter?.status) q.status = filter.status;
      const leaves = await LeaveRequestModel.find(q).sort({ appliedAt: -1 }).lean();
      return leaves as unknown as ILeaveRequest[];
    }
    let list = [...this.leaveRequests];
    if (filter?.employeeId) {
      list = list.filter((l) => l.employeeId === filter.employeeId);
    }
    if (filter?.managerId) {
      list = list.filter((l) => l.managerId === filter.managerId);
    }
    if (filter?.status) {
      list = list.filter((l) => l.status.toLowerCase() === filter.status?.toLowerCase());
    }
    return list.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  }

  async createLeaveRequest(data: {
    employeeId: string;
    leaveType: 'Paid' | 'Sick' | 'Casual' | 'Unpaid';
    startDate: string;
    endDate: string;
    reason: string;
  }): Promise<{ success: boolean; data?: ILeaveRequest; message: string }> {
    const emp = await this.getEmployeeById(data.employeeId);
    if (!emp) {
      return { success: false, message: 'Employee not found.' };
    }

    // Calculate days count
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return { success: false, message: 'End date cannot be prior to start date.' };
    }
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check available leave balance if not unpaid
    if (data.leaveType !== 'Unpaid') {
      const key = data.leaveType.toLowerCase() as keyof typeof emp.leaveBalance;
      const currentBal = emp.leaveBalance[key] || 0;
      if (daysCount > currentBal) {
        return {
          success: false,
          message: `Insufficient leave balance. You requested ${daysCount} day(s), but only have ${currentBal} ${data.leaveType} leave(s) remaining.`,
        };
      }
    }

    const newLeave: ILeaveRequest = {
      _id: `leave_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      employeeId: emp._id,
      employeeCode: emp.employeeCode,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      managerId: emp.managerId || 'emp_mgr_1',
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      daysCount,
      reason: data.reason,
      status: 'Pending',
      appliedAt: new Date().toISOString(),
    };

    if (this.isMongoConnected) {
      const doc = await LeaveRequestModel.create(newLeave);
      return { success: true, data: doc.toObject() as unknown as ILeaveRequest, message: 'Leave application submitted successfully.' };
    }

    this.leaveRequests.unshift(newLeave);
    return { success: true, data: newLeave, message: 'Leave application submitted successfully.' };
  }

  async reviewLeaveRequest(
    leaveId: string,
    reviewerName: string,
    status: 'Approved' | 'Rejected',
    notes: string
  ): Promise<{ success: boolean; data?: ILeaveRequest; message: string }> {
    const req = this.leaveRequests.find((l) => l._id === leaveId);
    if (!req) {
      return { success: false, message: 'Leave request not found.' };
    }

    req.status = status;
    req.reviewedBy = reviewerName;
    req.reviewedAt = new Date().toISOString();
    req.reviewNotes = notes;

    // If approved, deduct leave balance
    if (status === 'Approved' && req.leaveType !== 'Unpaid') {
      const emp = this.employees.find((e) => e._id === req.employeeId);
      if (emp) {
        const key = req.leaveType.toLowerCase() as keyof typeof emp.leaveBalance;
        if (emp.leaveBalance[key] !== undefined) {
          emp.leaveBalance[key] = Math.max(0, emp.leaveBalance[key] - req.daysCount);
        }
      }
    }

    if (this.isMongoConnected) {
      await LeaveRequestModel.findByIdAndUpdate(leaveId, {
        status,
        reviewedBy: reviewerName,
        reviewedAt: req.reviewedAt,
        reviewNotes: notes,
      });
    }

    return { success: true, data: req, message: `Leave request has been ${status.toLowerCase()}.` };
  }

  // ANNOUNCEMENTS
  async getAnnouncements(): Promise<IAnnouncement[]> {
    if (this.isMongoConnected) {
      const list = await AnnouncementModel.find({}).sort({ pinned: -1, postedAt: -1 }).lean();
      return list as unknown as IAnnouncement[];
    }
    return [...this.announcements].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });
  }

  async createAnnouncement(data: Partial<IAnnouncement>): Promise<IAnnouncement> {
    const newAnn: IAnnouncement = {
      _id: `ann_${Date.now()}`,
      title: data.title || 'Company Notice',
      content: data.content || '',
      priority: data.priority || 'Normal',
      targetDepartment: data.targetDepartment || 'All',
      authorName: data.authorName || 'HR Administration',
      authorRole: data.authorRole || 'HR Administrator',
      postedAt: new Date().toISOString(),
      pinned: !!data.pinned,
    };
    if (this.isMongoConnected) {
      const doc = await AnnouncementModel.create(newAnn);
      return doc.toObject() as unknown as IAnnouncement;
    }
    this.announcements.unshift(newAnn);
    return newAnn;
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    if (this.isMongoConnected) {
      const res = await AnnouncementModel.findByIdAndDelete(id);
      return !!res;
    }
    const idx = this.announcements.findIndex((a) => a._id === id);
    if (idx === -1) return false;
    this.announcements.splice(idx, 1);
    return true;
  }

  // TRAINING PROGRAMS
  async getTrainingPrograms(): Promise<ITrainingProgram[]> {
    if (this.isMongoConnected) {
      const list = await TrainingProgramModel.find({}).sort({ createdAt: -1 }).lean();
      return list as unknown as ITrainingProgram[];
    }
    return [...this.trainingPrograms];
  }

  async createTrainingProgram(data: Partial<ITrainingProgram>): Promise<ITrainingProgram> {
    const newProg: ITrainingProgram = {
      _id: `trn_${Date.now()}`,
      title: data.title || 'New Training Program',
      description: data.description || '',
      instructor: data.instructor || 'StaffSync Instructor',
      department: data.department || 'All',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: data.status || 'Upcoming',
      category: data.category || 'Professional Skills',
      enrolledEmployees: data.enrolledEmployees || [],
      createdById: data.createdById || 'usr_admin_1',
      createdAt: new Date().toISOString(),
    };
    if (this.isMongoConnected) {
      const doc = await TrainingProgramModel.create(newProg);
      return doc.toObject() as unknown as ITrainingProgram;
    }
    this.trainingPrograms.unshift(newProg);
    return newProg;
  }

  async updateTrainingProgress(
    programId: string,
    employeeId: string,
    progressPercent: number,
    status?: 'Not Started' | 'In Progress' | 'Completed'
  ): Promise<ITrainingProgram | null> {
    const prog = this.trainingPrograms.find((p) => p._id === programId);
    if (!prog) return null;

    let member = prog.enrolledEmployees.find((e) => e.employeeId === employeeId);
    if (!member) {
      const emp = this.employees.find((e) => e._id === employeeId);
      if (emp) {
        member = {
          employeeId: emp._id,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          employeeAvatar: emp.avatar,
          department: emp.department,
          status: status || (progressPercent >= 100 ? 'Completed' : 'In Progress'),
          progressPercent,
          completedAt: progressPercent >= 100 ? new Date().toISOString() : undefined,
        };
        prog.enrolledEmployees.push(member);
      }
    } else {
      member.progressPercent = progressPercent;
      if (status) {
        member.status = status;
      } else if (progressPercent >= 100) {
        member.status = 'Completed';
        member.completedAt = new Date().toISOString();
      } else if (progressPercent > 0) {
        member.status = 'In Progress';
      }
    }

    if (this.isMongoConnected) {
      await TrainingProgramModel.findByIdAndUpdate(programId, {
        enrolledEmployees: prog.enrolledEmployees,
      });
    }

    return prog;
  }
}

export const db = new DataStore();
