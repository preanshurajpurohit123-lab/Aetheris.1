import { Request } from 'express';
import { User } from './db.ts';

export interface AuthenticatedRequest extends Request {
  user: User;
}
