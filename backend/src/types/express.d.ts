import { Request } from 'express';
import { User } from './user';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}