import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { UserModel } from "./database";
import type { User } from "@shared/schema";
import { OAuth2Client } from "google-auth-library";

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// OAuth2 client for exchanging codes
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

// Passport Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        const user = await UserModel.findOne({ email }).select("+password");
        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }

        if (!user.password) {
          return done(null, false, { message: "Please sign in with Google" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid email or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_REDIRECT_URI,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Find or create user
          let user = await UserModel.findOne({ googleId: profile.id });
          if (!user) {
            user = await UserModel.findOne({
              email: profile.emails?.[0]?.value,
            });

            if (user) {
              user.googleId = profile.id;
              if (profile.photos?.[0]?.value) {
                user.profileImageUrl = profile.photos[0].value;
              }
              await user.save();
            } else {
              user = new UserModel({
                email: profile.emails?.[0]?.value,
                googleId: profile.id,
                firstName: profile.name?.givenName,
                lastName: profile.name?.familyName,
                profileImageUrl: profile.photos?.[0]?.value,
                isActive: true,
              });
              await user.save();
            }
          }

          // ✅ Attach tokens temporarily so handleGoogleCallback can persist
          (user as any)._tokens = { accessToken, refreshToken };

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );
}

// Serialize user
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// Deserialize user
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Generate JWT
export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

// Verify JWT
export const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
};

// Auth middleware for protecting routes
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }

  try {
    const user = await UserModel.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(403).json({ message: "User not found or inactive" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
// Middleware for checking session-based auth
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
};

// ====== NEW: Store Google tokens after OAuth callback ======
export const handleGoogleCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user) {
      return res.redirect("/login?error=oauth_failed");
    }

    console.log("=== GOOGLE OAUTH CALLBACK TRIGGERED ===");
    console.log("User authenticated:", user.email);

    // Check if we have tokens from the OAuth strategy
    if (user._tokens) {
      console.log("Storing Google tokens for user:", user.email);
      
      // Store the tokens in the user document
      user.googleAccessToken = user._tokens.accessToken;
      user.googleRefreshToken = user._tokens.refreshToken;
      
      // Remove temporary tokens
      delete user._tokens;
      
      await user.save();
      console.log("Tokens saved successfully");
    }

    // Generate JWT token for our app
    const token = generateToken(user._id);
    
    // Redirect to frontend with token
    res.redirect(`/login?token=${token}`);
  } catch (error) {
    console.error("Error in handleGoogleCallback:", error);
    res.redirect("/login?error=oauth_failed");
  }
};
