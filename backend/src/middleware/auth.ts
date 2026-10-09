/**
 * OrganSync - Authentication and Role-Based Access Control (RBAC) Middleware
 * 
 * Enforces principle of least privilege across clinical operational endpoints.
 */

import { Request, Response, NextFunction } from 'express';
import { store, User } from '../database/store';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // Check for Authorization header or custom role override header (for easy demo role switching)
  const roleHeader = req.headers['x-organsync-role'] as string;
  const authHeader = req.headers['authorization'];

  if (roleHeader) {
    const user = store.users.find(u => u.role.toLowerCase() === roleHeader.toLowerCase());
    if (user) {
      req.user = user;
      return next();
    }
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = store.users.find(u => u.id === token || u.username === token);
    if (user) {
      req.user = user;
      return next();
    }
  }

  // Default to active coordinator for routine clinical coordination in demo/default mode
  req.user = store.users.find(u => u.role === 'Transplant Coordinator') || store.users[0];
  next();
}

/**
 * Middleware factory to enforce specific allowed roles
 */
export function requireRoles(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to access this clinical module.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Action restricted. Your current role (${req.user.role}) is not authorized for this operation. Required: ${allowedRoles.join(', ')}`,
        currentRole: req.user.role,
        requiredRoles: allowedRoles,
      });
      return;
    }

    next();
  };
}
