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
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).json({ message: "No code returned from Google" });
    }

    console.log("=== GOOGLE OAUTH CALLBACK TRIGGERED ===");
    console.log("Auth code received:", code);

    try {
      const { tokens } = await oauth2Client.getToken(code);

      console.log("Google tokens received:", tokens);
      console.log("Tokens object:", JSON.stringify(tokens));

      if (tokens && tokens.access_token) {
        console.log("Sending OAuth token to FastAPI fetch:", tokens.access_token);

        try {
          const response = await fetch(
            "https://e4f5546c-33cd-42ea-a914-918d6295b1ae-00-1ru77f1hkb7nk.sisko.replit.dev/fetch",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                oauth_token: tokens.access_token, // or "Authorization": `Bearer ${tokens.access_token}`
              },
            },
          );

          if (!response.ok) {
            console.error("FastAPI fetch failed with status:", response.status);
          } else {
            const data = await response.json();
            console.log("Emails fetched directly from FastAPI:", data);
          }
        } catch (err) {
          console.error("Error sending token to FastAPI:", err);
        }
      } else {
        console.warn("No access_token found in tokens.");
      }

      res.redirect("/"); // redirect to frontend dashboard
    } catch (error) {
      console.error("Error handling Google callback:", error);
      res.status(500).json({ message: "OAuth callback failed" });
    }
  } catch (error) {
    console.error("Error in handleGoogleCallback outer try:", error);
    res.status(500).json({ message: "Server error" });
  }
};
