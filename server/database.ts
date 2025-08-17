import mongoose from 'mongoose';
import { User, OAuthAccount } from '@shared/schema';

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/narrisia-ai';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// User Schema
const userSchema = new mongoose.Schema<User>({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  profileImageUrl: { type: String },
  role: { 
    type: String, 
    enum: ["CEO", "CFO", "COO", "CMO", "CTO", "Board Member", "Department Head", "Investor", "Founder", "Other"]
  },
  companyName: { type: String },
  companySize: { 
    type: String, 
    enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"]
  },
  industry: { type: String },
  goals: [{ 
    type: String, 
    enum: ["Strategy", "Finance", "Operations", "Marketing", "Technology", "R&D", "Sales", "HR"]
  }],
  isActive: { type: Boolean, default: true },
  googleId: { type: String },
  githubId: { type: String },
}, {
  timestamps: true
});

// OAuth Account Schema
const oauthAccountSchema = new mongoose.Schema<OAuthAccount>({
  userId: { type: String, required: true },
  provider: { type: String, required: true },
  providerAccountId: { type: String, required: true },
  accessToken: { type: String },
  refreshToken: { type: String },
  expiresAt: { type: Date },
  tokenType: { type: String },
  scope: { type: String },
}, {
  timestamps: true
});

export const UserModel = mongoose.model<User>('User', userSchema);
export const OAuthAccountModel = mongoose.model<OAuthAccount>('OAuthAccount', oauthAccountSchema);

export default connectDB;