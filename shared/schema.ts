import { z } from "zod";

// User roles for executive-level users
export const userRoles = [
  "CEO",
  "CFO", 
  "COO",
  "CMO",
  "CTO",
  "Board Member",
  "Department Head",
  "Investor",
  "Founder",
  "Other"
] as const;

// Company sizes
export const companySizes = [
  "1-10",
  "11-50", 
  "51-200",
  "201-500",
  "501-1000",
  "1000+"
] as const;

// Goal categories
export const goalCategories = [
  "Strategy",
  "Finance", 
  "Operations",
  "Marketing",
  "Technology",
  "R&D",
  "Sales",
  "HR"
] as const;

// MongoDB User Interface
export interface User {
  _id: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role?: typeof userRoles[number];
  companyName?: string;
  companySize?: typeof companySizes[number];
  industry?: string;
  goals?: typeof goalCategories[number][];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // OAuth fields
  googleId?: string;
  githubId?: string;
  // Mongoose document methods
  toObject?: () => any;
  save?: () => Promise<User>;
}

// OAuth Account Interface
export interface OAuthAccount {
  _id: string;
  userId: string;
  provider: string;
  providerAccountId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  tokenType?: string;
  scope?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Validation schemas
export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(userRoles, { required_error: "Please select your role" }),
  companyName: z.string().min(1, "Company name is required"),
  companySize: z.enum(companySizes, { required_error: "Please select company size" }),
  industry: z.string().min(1, "Industry is required"),
  goals: z.array(z.enum(goalCategories)).min(1, "Please select at least one goal"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignupData = z.infer<typeof signupSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type UserRole = typeof userRoles[number];
export type CompanySize = typeof companySizes[number];
export type GoalCategory = typeof goalCategories[number];
