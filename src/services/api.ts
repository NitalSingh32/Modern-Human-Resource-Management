import {
  User,
  Employee,
  Department,
  Attendance,
  LeaveRequest,
  Announcement,
  TrainingProgram,
  AnalyticsOverview,
} from '../types';

const API_BASE = '/api';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('staffsync_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      const errorMsg = data.error || data.message || `HTTP Error ${response.status}`;
      throw new Error(errorMsg);
    }

    return data as T;
  }

  // System
  async getSystemStatus(): Promise<{
    status: string;
    database: {
      connectedToMongo: boolean;
      engine: string;
      modelsRegistered: string[];
      counts: Record<string, number>;
    };
  }> {
    return this.request('/status');
  }

  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User; message: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request('/auth/me');
  }

  // Employees
  async getEmployees(params?: { department?: string; search?: string; role?: string }): Promise<Employee[]> {
    const query = new URLSearchParams();
    if (params?.department) query.set('department', params.department);
    if (params?.search) query.set('search', params.search);
    if (params?.role) query.set('role', params.role);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/employees${qs}`);
  }

  async getEmployeeById(id: string): Promise<Employee> {
    return this.request(`/employees/${id}`);
  }

  async createEmployee(payload: Partial<Employee> & { password?: string; role?: string }): Promise<{ message: string; employee: Employee; defaultPassword?: string }> {
    return this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateEmployee(id: string, payload: Partial<Employee>): Promise<{ message: string; employee: Employee }> {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteEmployee(id: string): Promise<{ message: string }> {
    return this.request(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  // Departments
  async getDepartments(): Promise<Department[]> {
    return this.request('/departments');
  }

  async createDepartment(payload: Partial<Department>): Promise<Department> {
    return this.request('/departments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Attendance
  async getAttendance(params?: { date?: string; department?: string; employeeId?: string }): Promise<Attendance[]> {
    const query = new URLSearchParams();
    if (params?.date) query.set('date', params.date);
    if (params?.department) query.set('department', params.department);
    if (params?.employeeId) query.set('employeeId', params.employeeId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/attendance${qs}`);
  }

  async getTodayAttendance(): Promise<{
    todayDate: string;
    myAttendance: Attendance | null;
    summary: { totalPresent: number; totalLate: number; totalAbsent: number; allRecordsCount: number };
  }> {
    return this.request('/attendance/today');
  }

  async checkIn(location?: string): Promise<{ success: boolean; data: Attendance; message: string }> {
    return this.request('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ location }),
    });
  }

  async checkOut(): Promise<{ success: boolean; data: Attendance; message: string }> {
    return this.request('/attendance/check-out', {
      method: 'POST',
    });
  }

  // Leave Requests
  async getLeaves(status?: string): Promise<LeaveRequest[]> {
    const qs = status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : '';
    return this.request(`/leaves${qs}`);
  }

  async applyLeave(payload: {
    leaveType: 'Paid' | 'Sick' | 'Casual' | 'Unpaid';
    startDate: string;
    endDate: string;
    reason: string;
  }): Promise<{ success: boolean; data: LeaveRequest; message: string }> {
    return this.request('/leaves', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async reviewLeave(
    leaveId: string,
    status: 'Approved' | 'Rejected',
    reviewNotes: string
  ): Promise<{ success: boolean; data: LeaveRequest; message: string }> {
    return this.request(`/leaves/${leaveId}/review`, {
      method: 'PUT',
      body: JSON.stringify({ status, reviewNotes }),
    });
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return this.request('/announcements');
  }

  async createAnnouncement(payload: Partial<Announcement>): Promise<Announcement> {
    return this.request('/announcements', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async deleteAnnouncement(id: string): Promise<{ message: string }> {
    return this.request(`/announcements/${id}`, {
      method: 'DELETE',
    });
  }

  // Training & Development
  async getTrainingPrograms(): Promise<TrainingProgram[]> {
    return this.request('/training');
  }

  async createTrainingProgram(payload: {
    title: string;
    description: string;
    instructor: string;
    department?: string;
    startDate: string;
    endDate: string;
    category?: string;
    enrolledEmployeeIds?: string[];
  }): Promise<TrainingProgram> {
    return this.request('/training', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateTrainingProgress(
    programId: string,
    payload: { employeeId?: string; progressPercent: number; status?: 'Not Started' | 'In Progress' | 'Completed' }
  ): Promise<{ message: string; program: TrainingProgram }> {
    return this.request(`/training/${programId}/progress`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // Analytics
  async getAnalytics(): Promise<AnalyticsOverview> {
    return this.request('/analytics/overview');
  }
}

export const api = new ApiService();
