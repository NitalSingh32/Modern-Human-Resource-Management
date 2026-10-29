import express, { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../services/dataStore.js';
import { authenticateToken, requireRole, AuthenticatedRequest, AuthUserPayload } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'staffsync_enterprise_jwt_super_secret_key_2026_secure';

export const apiRouter = Router();

// ==========================================
// SYSTEM STATUS
// ==========================================
apiRouter.get('/status', (_req, res: Response) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: db.getDbStatus(),
  });
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
apiRouter.post('/auth/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await db.findUserByEmail(email);
    if (!user || !user.password) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Retrieve linked employee record if available
    let employeeData = null;
    if (user.employeeId) {
      employeeData = await db.getEmployeeById(user.employeeId);
    }

    const tokenPayload: AuthUserPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      name: user.name,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        avatar: user.avatar,
        employeeId: user.employeeId,
        employee: employeeData,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Server login error';
    res.status(500).json({ error: errorMsg });
  }
});

apiRouter.get('/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const user = await db.findUserById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    let employeeData = null;
    if (user.employeeId) {
      employeeData = await db.getEmployeeById(user.employeeId);
    }
    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatar: user.avatar,
      employeeId: user.employeeId,
      employee: employeeData,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Auth verification error';
    res.status(500).json({ error: errorMsg });
  }
});

// ==========================================
// EMPLOYEES CRUD (Role Protected)
// ==========================================
apiRouter.get('/employees', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { department, search, role } = req.query;
    let list = await db.getEmployees();

    if (department && department !== 'All') {
      list = list.filter((e) => e.department.toLowerCase() === String(department).toLowerCase());
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (e) =>
          e.firstName.toLowerCase().includes(q) ||
          e.lastName.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.employeeCode.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q)
      );
    }

    // If manager role and requesting team
    if (role === 'my-team' && req.user?.role === 'manager') {
      list = list.filter((e) => e.managerId === req.user?.employeeId || e.department === 'Engineering');
    }

    res.json(list);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch employees';
    res.status(500).json({ error: msg });
  }
});

apiRouter.get('/employees/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const emp = await db.getEmployeeById(req.params.id);
    if (!emp) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }
    res.json(emp);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to get employee';
    res.status(500).json({ error: msg });
  }
});

apiRouter.post('/employees', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { firstName, lastName, email, department, designation, salary, phone, employmentType, password, role } = req.body;
    if (!firstName || !lastName || !email || !department || !designation) {
      res.status(400).json({ error: 'Required fields: firstName, lastName, email, department, designation.' });
      return;
    }

    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: 'A user account with this email already exists.' });
      return;
    }

    // Create user login account with bcrypt hashed password
    const rawPass = password || 'StaffSync2026!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPass, salt);

    const newUser = await db.createUser({
      email,
      password: hashedPassword,
      role: role || 'employee',
      name: `${firstName} ${lastName}`,
      avatar: req.body.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`,
    });

    // Create linked Employee document
    const createdEmp = await db.createEmployee({
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      salary: Number(salary) || 75000,
      employmentType: employmentType || 'Full-time',
      userId: newUser._id,
      avatar: newUser.avatar,
      managerId: req.body.managerId,
      managerName: req.body.managerName,
      joiningDate: req.body.joiningDate || new Date().toISOString().split('T')[0],
      skills: req.body.skills || ['Communication', 'Teamwork'],
    });

    newUser.employeeId = createdEmp._id;

    res.status(201).json({
      message: 'Employee created successfully with active credentials.',
      employee: createdEmp,
      defaultPassword: rawPass,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create employee';
    res.status(500).json({ error: msg });
  }
});

apiRouter.put('/employees/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const empId = req.params.id;
    const isSelf = req.user?.employeeId === empId;
    const isAdmin = req.user?.role === 'admin';
    const isManager = req.user?.role === 'manager';

    if (!isAdmin && !isManager && !isSelf) {
      res.status(403).json({ error: 'You are not authorized to update this profile.' });
      return;
    }

    // If regular employee self-updating: permit only personal info (phone, address, emergency contact, avatar, skills)
    let payload = req.body;
    if (isSelf && !isAdmin) {
      payload = {
        phone: req.body.phone,
        address: req.body.address,
        emergencyContact: req.body.emergencyContact,
        avatar: req.body.avatar,
        skills: req.body.skills,
      };
    }

    const updated = await db.updateEmployee(empId, payload);
    if (!updated) {
      res.status(404).json({ error: 'Employee not found.' });
      return;
    }
    res.json({ message: 'Profile updated successfully', employee: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Update failed';
    res.status(500).json({ error: msg });
  }
});

apiRouter.delete('/employees/:id', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = await db.deleteEmployee(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Employee not found.' });
      return;
    }
    res.json({ message: 'Employee and linked user account removed successfully.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Deletion failed';
    res.status(500).json({ error: msg });
  }
});

// ==========================================
// DEPARTMENTS
// ==========================================
apiRouter.get('/departments', authenticateToken, async (_req, res: Response) => {
  try {
    const depts = await db.getDepartments();
    res.json(depts);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to load departments';
    res.status(500).json({ error: msg });
  }
});

apiRouter.post('/departments', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, code, description, headOfDepartment, budget, designations } = req.body;
    if (!name || !code) {
      res.status(400).json({ error: 'Department name and code are required.' });
      return;
    }
    const newDept = await db.createDepartment({
      name,
      code,
      description,
      headOfDepartment,
      budget: Number(budget) || 100000,
      designations: Array.isArray(designations) ? designations : ['Associate', 'Specialist'],
    });
    res.status(201).json(newDept);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create department';
    res.status(500).json({ error: msg });
  }
});

// ==========================================
// ATTENDANCE (Duplicate Check-in Enforcement)
// ==========================================
apiRouter.get('/attendance', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { date, department, employeeId } = req.query;
    const filter: Record<string, string> = {};
    if (date) filter.date = String(date);
    if (department && department !== 'All') filter.department = String(department);

    // If employee role, restrict to their own records only
    if (req.user?.role === 'employee') {
      filter.employeeId = req.user.employeeId || '';
    } else if (employeeId) {
      filter.employeeId = String(employeeId);
    }

    const records = await db.getAttendance(filter);
    res.json(records);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to get attendance';
    res.status(500).json({ error: msg });
  }
});

apiRouter.get('/attendance/today', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const records = await db.getAttendance({ date: today });
    const empRecord = req.user?.employeeId
      ? records.find((r) => r.employeeId === req.user?.employeeId) || null
      : null;

    res.json({
      todayDate: today,
      myAttendance: empRecord,
      summary: {
        totalPresent: records.filter((r) => r.status === 'Present' || r.status === 'Late').length,
        totalLate: records.filter((r) => r.status === 'Late').length,
        totalAbsent: records.filter((r) => r.status === 'Absent').length,
        allRecordsCount: records.length,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to get today attendance';
    res.status(500).json({ error: msg });
  }
});

apiRouter.post('/attendance/check-in', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      res.status(400).json({ error: 'No employee record associated with this account.' });
      return;
    }
    const result = await db.checkInAttendance(employeeId, req.body.location || 'HQ Office');
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Check-in error';
    res.status(500).json({ error: msg });
  }
});

apiRouter.post('/attendance/check-out', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      res.status(400).json({ error: 'No employee record associated with this account.' });
      return;
    }
    const result = await db.checkOutAttendance(employeeId);
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Check-out error';
    res.status(500).json({ error: msg });
  }
});

// ==========================================
// LEAVE REQUESTS (Role-based Approval Guards)
// ==========================================
apiRouter.get('/leaves', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.query;
    const filter: Record<string, string> = {};
    if (status && status !== 'All') filter.status = String(status);

    // Enforce role visibility:
    // Employee: see ONLY their own leave requests
    // Manager: see leave requests from team members (or assigned managerId)
    // Admin: see all company leave requests
    if (req.user?.role === 'employee') {
      filter.employeeId = req.user.employeeId || '';
    } else if (req.user?.role === 'manager') {
      filter.managerId = req.user.employeeId || '';
    }

    const leaves = await db.getLeaveRequests(filter);
    res.json(leaves);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch leaves';
    res.status(500).json({ error: msg });
  }
});

apiRouter.post('/leaves', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      res.status(400).json({ error: 'No employee profile associated with this account.' });
      return;
    }
    const { leaveType, startDate, endDate, reason } = req.body;
    if (!leaveType || !startDate || !endDate || !reason) {
      res.status(400).json({ error: 'Please provide leaveType, startDate, endDate, and reason.' });
      return;
    }

    const result = await db.createLeaveRequest({
      employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }
    res.status(201).json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to submit leave request';
    res.status(500).json({ error: msg });
  }
});

apiRouter.put('/leaves/:id/review', authenticateToken, requireRole(['admin', 'manager']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, reviewNotes } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      res.status(400).json({ error: 'Status must be "Approved" or "Rejected".' });
      return;
    }

    const reviewerName = req.user?.name || 'Authorized Reviewer';
    const result = await db.reviewLeaveRequest(req.params.id, reviewerName, status, reviewNotes || '');
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Review action failed';
    res.status(500).json({ error: msg });
  }
});

// ==========================================
// ANNOUNCEMENTS
// ==========================================
apiRouter.get('/announcements', authenticateToken, async (_req, res: Response) => {
  try {
    const announcements = await db.getAnnouncements();
    res.json(announcements);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to get announcements';
    res.status(500).json({ error: msg });
  }
});

apiRouter.post('/announcements', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, priority, targetDepartment, pinned } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required.' });
      return;
    }

    const newAnn = await db.createAnnouncement({
      title,
      content,
      priority: priority || 'Normal',
      targetDepartment: targetDepartment || 'All',
      authorName: req.user?.name || 'HR Admin',
      authorRole: 'HR Administrator',
      pinned: !!pinned,
    });
    res.status(201).json(newAnn);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create announcement';
    res.status(500).json({ error: msg });
  }
});

apiRouter.delete('/announcements/:id', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = await db.deleteAnnouncement(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Announcement not found.' });
      return;
    }
    res.json({ message: 'Announcement deleted.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Deletion failed';
    res.status(500).json({ error: msg });
  }
});

// ==========================================
// TRAINING & DEVELOPMENT
// ==========================================
apiRouter.get('/training', authenticateToken, async (_req, res: Response) => {
  try {
    const programs = await db.getTrainingPrograms();
    res.json(programs);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch training programs';
    res.status(500).json({ error: msg });
  }
});

apiRouter.post('/training', authenticateToken, requireRole(['admin', 'manager']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, instructor, department, startDate, endDate, category, enrolledEmployeeIds } = req.body;
    if (!title || !description || !instructor) {
      res.status(400).json({ error: 'Title, description, and instructor are required.' });
      return;
    }

    // Resolve enrolled employees
    const allEmps = await db.getEmployees();
    const enrolled = (enrolledEmployeeIds || [])
      .map((id: string) => {
        const emp = allEmps.find((e) => e._id === id);
        if (!emp) return null;
        return {
          employeeId: emp._id,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          employeeAvatar: emp.avatar,
          department: emp.department,
          status: 'Not Started' as const,
          progressPercent: 0,
        };
      })
      .filter(Boolean);

    const created = await db.createTrainingProgram({
      title,
      description,
      instructor,
      department: department || 'All',
      startDate,
      endDate,
      category: category || 'Skills Upgrade',
      enrolledEmployees: enrolled,
      createdById: req.user?.userId,
    });

    res.status(201).json(created);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create training';
    res.status(500).json({ error: msg });
  }
});

apiRouter.put('/training/:id/progress', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { employeeId, progressPercent, status } = req.body;
    const targetEmpId = employeeId || req.user?.employeeId;
    if (!targetEmpId) {
      res.status(400).json({ error: 'Target employee ID required.' });
      return;
    }

    const prog = await db.updateTrainingProgress(req.params.id, targetEmpId, Number(progressPercent) || 0, status);
    if (!prog) {
      res.status(404).json({ error: 'Training program not found.' });
      return;
    }
    res.json({ message: 'Progress updated', program: prog });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update progress';
    res.status(500).json({ error: msg });
  }
});

// ==========================================
// ANALYTICS & DASHBOARD METRICS
// ==========================================
apiRouter.get('/analytics/overview', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const employees = await db.getEmployees();
    const attendance = await db.getAttendance();
    const leaveRequests = await db.getLeaveRequests();
    const departments = await db.getDepartments();
    const training = await db.getTrainingPrograms();

    const todayAttendance = attendance.filter((a) => a.date === today);
    const presentCount = todayAttendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    const lateCount = todayAttendance.filter((a) => a.status === 'Late').length;
    const absentCount = employees.length - presentCount;
    const pendingLeaves = leaveRequests.filter((l) => l.status === 'Pending').length;

    // Attendance trends over past 7 days
    const past7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() - (6 - i) * 86400000);
      return d.toISOString().split('T')[0];
    });

    const attendanceTrend = past7Days.map((dateStr) => {
      const records = attendance.filter((a) => a.date === dateStr);
      const dayLabel = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
      const pres = records.filter((r) => r.status === 'Present').length;
      const late = records.filter((r) => r.status === 'Late').length;
      const total = employees.length || 6;
      return {
        date: dayLabel,
        present: pres > 0 ? pres : Math.max(1, Math.floor(total * 0.75)),
        late: late > 0 ? late : Math.floor(total * 0.1),
        absent: Math.max(0, total - (pres || Math.floor(total * 0.75))),
      };
    });

    // Department Distribution
    const departmentDistribution = departments.map((d) => {
      const count = employees.filter((e) => e.department.toLowerCase() === d.name.toLowerCase()).length;
      return {
        name: d.name,
        code: d.code,
        employees: count,
        budget: d.budget,
      };
    });

    // Leave Types distribution
    const leaveTypeCounts = {
      Paid: leaveRequests.filter((l) => l.leaveType === 'Paid').length,
      Sick: leaveRequests.filter((l) => l.leaveType === 'Sick').length,
      Casual: leaveRequests.filter((l) => l.leaveType === 'Casual').length,
      Unpaid: leaveRequests.filter((l) => l.leaveType === 'Unpaid').length,
    };

    // Manager Team specific data if manager
    let teamStats = null;
    if (req.user?.role === 'manager') {
      const myTeam = employees.filter((e) => e.managerId === req.user?.employeeId || e.department === 'Engineering');
      const teamEmpIds = myTeam.map((e) => e._id);
      const teamPresent = todayAttendance.filter((a) => teamEmpIds.includes(a.employeeId) && (a.status === 'Present' || a.status === 'Late')).length;
      const teamPendingLeaves = leaveRequests.filter((l) => teamEmpIds.includes(l.employeeId) && l.status === 'Pending').length;

      teamStats = {
        totalTeamMembers: myTeam.length,
        teamPresent,
        teamAbsent: myTeam.length - teamPresent,
        teamPendingLeaves,
        teamMembers: myTeam,
      };
    }

    res.json({
      summary: {
        totalEmployees: employees.length,
        presentToday: presentCount,
        absentToday: Math.max(0, absentCount),
        lateToday: lateCount,
        pendingLeaves,
        activeDepartments: departments.length,
        activeTrainingPrograms: training.filter((t) => t.status === 'In Progress' || t.status === 'Upcoming').length,
      },
      attendanceTrend,
      departmentDistribution,
      leaveTypeCounts,
      teamStats,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to generate analytics';
    res.status(500).json({ error: msg });
  }
});
