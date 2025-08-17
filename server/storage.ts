import bcrypt from 'bcryptjs';
import { UserModel } from './database';
import type { User, SignupData } from '@shared/schema';

export interface IStorage {
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(userData: SignupData): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User | null>;
}

export class MongoStorage implements IStorage {
  async getUserById(id: string): Promise<User | null> {
    try {
      return await UserModel.findById(id);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await UserModel.findOne({ email });
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async createUser(userData: SignupData): Promise<User> {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Remove confirmPassword from the data
      const { confirmPassword, ...userDataWithoutConfirm } = userData;
      
      const user = new UserModel({
        ...userDataWithoutConfirm,
        password: hashedPassword,
        isActive: true
      });

      return await user.save();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    try {
      return await UserModel.findByIdAndUpdate(
        id, 
        { ...userData, updatedAt: new Date() }, 
        { new: true }
      );
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }
}

export const storage = new MongoStorage();
