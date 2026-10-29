import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'staffsync_enterprise_jwt_super_secret_key_2026_secure';

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  employeeId?: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access denied. No authorization token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired session token.' });
  }
};

export const requireRole = (allowedRoles: Array<'admin' | 'manager' | 'employee'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden: Action requires one of [${allowedRoles.join(', ')}] roles. Your role is '${req.user.role}'.`,
      });
      return;
    }

    next();
  };
};
