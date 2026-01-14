import { z } from 'zod';
import { loginSchema, createAdminSchema } from '../schemas/auth.schema';

/**
 * Authentication Types
 * Inferred from Zod schemas
 */

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;

/**
 * Admin Entity (from Database)
 */
export interface Admin {
  id: string;
  username: string;
  passwordHash: string;
  email?: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Auth Response (without password hash)
 */
export interface AdminPublic {
  id: string;
  username: string;
  email?: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  admin?: AdminPublic;
  message?: string;
}
