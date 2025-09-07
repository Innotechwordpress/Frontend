import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  signupSchema,
  loginSchema,
  type SignupData,
  type LoginData,
} from "@shared/schema";
import Stripe from "stripe";
import express from "express";

const router = express.Router();

// === USER ROUTES ===
router.get("/user", (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  res.json(req.session.user);
});

// === DEBUG SESSION ROUTE ===
router.get("/debug/session", (req, res) => {
  if (req.session) {
    return res.json({
      hasSession: true,
      sessionId: req.sessionID,
      user: req.session.user || null,
      tokens: {
        accessToken: req.session.accessToken || null,
        refreshToken: req.session.refreshToken || null,
      },
    });
  }
  res.json({ hasSession: false });
});

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
});

// Simple in-memory storage for now
interface SimpleUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  companyName: string;
  companySize: string;
  industry: string;
  goals: string[];
  createdAt: Date;
}

const users: Map<string, SimpleUser> = new Map();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

// Helper functions
function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Register new user
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = signupSchema.parse(req.body);

      // Check if user already exists
      const existingUser = Array.from(users.values()).find(
        (u) => u.email === validatedData.email,
      );
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);

      // Create user
      const userId = generateId();
      const user: SimpleUser = {
        id: userId,
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: validatedData.role,
        companyName: validatedData.companyName,
        companySize: validatedData.companySize,
        industry: validatedData.industry,
        goals: validatedData.goals,
        createdAt: new Date(),
      };

      users.set(userId, user);

      // Generate JWT token
      const token = generateToken(userId);

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      res.status(201).json({
        message: "User created successfully",
        user: userWithoutPassword,
        token,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
      }

      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login user
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      // Find user
      const user = Array.from(users.values()).find(
        (u) => u.email === validatedData.email,
      );
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Check password
      const isMatch = await bcrypt.compare(
        validatedData.password,
        user.password,
      );
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Set session for authenticated user
      (req as any).session.userId = user.id;
      (req as any).session.user = user;

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      res.json({
        message: "Login successful",
        user: userWithoutPassword,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
      }

      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Middleware to verify JWT token
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = users.get(decoded.userId);
      if (!user) {
        return res.status(403).json({ message: "User not found" });
      }
      req.user = user;
      req.userId = decoded.userId;
      next();
    } catch (error) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
  };

  // Get current user (protected route)
  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    const { password, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  });

  // Google OAuth configuration
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

  console.log(
    "Using Client ID:",
    GOOGLE_CLIENT_ID ? GOOGLE_CLIENT_ID.substring(0, 20) + "..." : "Not found",
  );

  // Google OAuth login
  app.get("/api/auth/google", (req, res) => {
    console.log("Google OAuth initiated");

    if (!GOOGLE_CLIENT_ID) {
      console.log("Google Client ID not found");
      return res.status(400).json({
        message:
          "Google OAuth not configured. Please provide GOOGLE_CLIENT_ID.",
      });
    }

    // Use the current request domain to ensure SSL works
    const protocol =
      req.secure || req.headers["x-forwarded-proto"] === "https"
        ? "https"
        : "http";
    const host = req.get("host");
    const GOOGLE_REDIRECT_URI = `${protocol}://${host}/api/auth/google/callback`;
    console.log("Redirect URI:", GOOGLE_REDIRECT_URI);

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(
        [
          "email",
          "profile",
          "openid",
          "https://www.googleapis.com/auth/gmail.readonly",
        ].join(" "),
      )}&` +
      `access_type=offline&` +
      `prompt=consent`;

    console.log("Redirecting to:", authUrl);
    res.redirect(authUrl);
  });

  // Test endpoint to verify callback route
  app.get("/api/test/callback", (req, res) => {
    console.log("Test callback endpoint hit");
    res.json({ message: "Callback route working", query: req.query });
  });

  // Google OAuth callback
  app.get("/api/auth/google/callback", async (req, res) => {
    console.log("=== GOOGLE OAUTH CALLBACK TRIGGERED ===");
    console.log("Query params:", req.query);
    console.log("Headers:", req.headers);
    console.log("Session ID:", (req as any).sessionID);

    const { code } = req.query;

    if (!code || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.log("Missing required OAuth parameters:", {
        hasCode: !!code,
        hasClientId: !!GOOGLE_CLIENT_ID,
        hasClientSecret: !!GOOGLE_CLIENT_SECRET,
      });
      return res.redirect("/login?error=oauth_failed");
    }

    try {
      // Use the current request domain to ensure SSL works
      const protocol =
        req.secure || req.headers["x-forwarded-proto"] === "https"
          ? "https"
          : "http";
      const host = req.get("host");
      const GOOGLE_REDIRECT_URI = `${protocol}://${host}/api/auth/google/callback`;
      console.log("Using callback redirect URI:", GOOGLE_REDIRECT_URI);

      // Exchange code for access token
      console.log("Exchanging code for access token...");
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          code: code as string,
          grant_type: "authorization_code",
          redirect_uri: GOOGLE_REDIRECT_URI,
        }),
      });

      const tokenData = await tokenResponse.json();
      console.log("Token response status:", tokenResponse.status);
      console.log("Full token data:", JSON.stringify(tokenData, null, 2));
      console.log("Token data received:", {
        hasAccessToken: !!tokenData.access_token,
        hasRefreshToken: !!tokenData.refresh_token,
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in,
      });

      if (!tokenData.access_token) {
        console.log("No access token received:", tokenData);
        return res.redirect("/login?error=token_failed");
      }

      // Send the access token to FastAPI project to fetch initial emails
      try {
        const fastApiResponse = await fetch(
          "http://localhost:5000/fetch",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "oauth-token": tokenData.access_token,
            },
          },
        );

        if (!fastApiResponse.ok) {
          console.error(
            "FastAPI fetch failed with status:",
            fastApiResponse.status,
          );
          const errorText = await fastApiResponse.text();
          console.error("FastAPI error response:", errorText);
        } else {
          const data = await fastApiResponse.json();
          console.log("Initial emails fetched from FastAPI (fetch only):", data);
        }
      } catch (fastApiError) {
        console.error("Error sending token to FastAPI:", fastApiError);
      }

      // Get user info from Google
      const userResponse = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        },
      );

      const googleUser = await userResponse.json();

      // Check if user exists
      let user = Array.from(users.values()).find(
        (u) => u.email === googleUser.email,
      );

      if (!user) {
        // Create new user
        const userId = generateId();
        user = {
          id: userId,
          email: googleUser.email,
          password: "", // No password for OAuth users
          firstName: googleUser.given_name || "",
          lastName: googleUser.family_name || "",
          role: "CEO", // Default role
          companyName: "",
          companySize: "",
          industry: "",
          goals: [],
          createdAt: new Date(),
        };
        users.set(userId, user);
      }

      // Set session for authenticated user - Force session regeneration
      (req as any).session.regenerate((err: any) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.redirect("/login?error=session_failed");
        }

        // Set user data in session
        (req as any).session.userId = user.id;
        (req as any).session.user = user;
        // Store OAuth tokens for future API calls
        (req as any).session.accessToken = tokenData.access_token;
        (req as any).session.refreshToken = tokenData.refresh_token;

        console.log("Session regenerated for user:", {
          userId: user.id,
          email: user.email,
          sessionId: (req as any).sessionID,
          hasAccessToken: !!tokenData.access_token,
        });

        // Save session before redirect
        (req as any).session.save((saveErr: any) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            return res.redirect("/login?error=session_failed");
          }

          console.log("Session saved successfully, redirecting to home");
          // Redirect to home page after Google OAuth login
          res.redirect("/");
        });
      });
    } catch (error) {
      console.error("Google OAuth error:", error);
      res.redirect("/login?error=oauth_failed");
    }
  });

  // Get current user endpoint
  app.get("/api/user", (req: any, res) => {
    console.log("Session check:", {
      hasSession: !!req.session,
      sessionId: req.sessionID,
      userId: req.session?.userId,
      sessionData: req.session,
    });

    if (req.session && req.session.userId) {
      const user = users.get(req.session.userId);
      if (user) {
        console.log("User found in session:", user.email);
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      }
    }
    console.log("No valid session or user found");
    res.status(401).json({ message: "Not authenticated" });
  });

  // Update user profile endpoint
  app.put("/api/user/profile", (req: any, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = users.get(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      firstName,
      lastName,
      role,
      companyName,
      companySize,
      industry,
      goals,
    } = req.body;

    // Update user data
    const updatedUser = {
      ...user,
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      role: role || user.role,
      companyName: companyName || user.companyName,
      companySize: companySize || user.companySize,
      industry: industry || user.industry,
      goals: goals || user.goals,
    };

    users.set(req.session.userId, updatedUser);
    req.session.user = updatedUser;

    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req: any, res) => {
    if (req.session) {
      req.session.destroy((err: any) => {
        if (err) {
          return res.status(500).json({ message: "Could not log out" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
      });
    } else {
      res.json({ message: "Already logged out" });
    }
  });

  // Stripe payment endpoints
  app.post("/api/create-payment-intent", async (req: any, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { amount, plan } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          userId: req.session.userId,
          plan: plan || "pro",
        },
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Payment intent creation error:", error);
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Create setup intent for immediate payment form display
  app.post("/api/create-setup-intent", async (req: any, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = users.get(req.session.userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create or retrieve customer
      let customerId = (user as any).stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          metadata: {
            userId: user.id,
          },
        });
        customerId = customer.id;

        // Update user with customer ID
        const updatedUser = { ...user, stripeCustomerId: customerId };
        users.set(req.session.userId, updatedUser);
        req.session.user = updatedUser;
      }

      // Create setup intent for payment method collection
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        usage: "off_session",
        payment_method_types: ["card"],
      });

      res.json({
        clientSecret: setupIntent.client_secret,
      });
    } catch (error: any) {
      console.error("Setup intent creation error:", error);
      res
        .status(500)
        .json({ message: "Error creating setup intent: " + error.message });
    }
  });

  // Get unread emails endpoint for dashboard (basic count only)
  app.get("/api/emails/unread", async (req: any, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = users.get(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log("Fetching basic email count for dashboard for user:", user.email);

      // Check if we have stored OAuth tokens in session
      const accessToken = req.session.accessToken;

      if (!accessToken) {
        console.log("No OAuth token found in session for dashboard request");
        // Return empty data if no token
        return res.json({
          emails: [],
          count: 0,
          message: "OAuth token required. Please reconnect your Google account."
        });
      }

      // Try to fetch basic emails from FastAPI (without processing)
      try {
        const fastApiResponse = await fetch(
          "http://localhost:5000/fetch",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "oauth-token": accessToken,
            },
          },
        );

        if (fastApiResponse.ok) {
          const emailData = await fastApiResponse.json();
          console.log("Successfully fetched basic emails from FastAPI:", emailData);

          // Format the response for dashboard (basic info only)
          const emails = emailData.emails || [];

          return res.json({
            emails: emails,
            count: emails.length,
            credibility_analysis: [] // Empty until parsing is started
          });
        } else {
          console.log("FastAPI returned error for dashboard:", fastApiResponse.status);
          const errorText = await fastApiResponse.text();
          console.log("FastAPI error details:", errorText);

          // Return empty data if FastAPI fails
          return res.json({
            emails: [],
            count: 0,
            message: "Failed to fetch emails from FastAPI"
          });
        }
      } catch (fetchError) {
        console.error("Error fetching from FastAPI for dashboard:", fetchError);
        // Return empty data as fallback
        return res.json({
          emails: [],
          count: 0,
          message: "Network error while fetching emails"
        });
      }
    } catch (error) {
      console.error("Dashboard email fetch error:", error);
      res.status(500).json({ message: "Error fetching emails" });
    }
  });

  // Weekly email count endpoint
  app.get("/api/emails/weekly-count", async (req: any, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = users.get(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log("Fetching weekly email count for user:", user.email);
      const accessToken = req.session.accessToken;

      if (!accessToken) {
        console.log("No OAuth token found in session for weekly count request");
        return res.json({
          weekly_count: 0,
          message: "OAuth token required. Please reconnect your Google account."
        });
      }

      try {
        const fastApiResponse = await fetch(
          "http://localhost:5000/fetch/weekly-count",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "oauth-token": accessToken,
            },
          },
        );

        if (fastApiResponse.ok) {
          const countData = await fastApiResponse.json();
          console.log("Successfully fetched weekly count from FastAPI:", countData);

          return res.json({
            weekly_count: countData.weekly_count || 0,
            message: countData.message || "Weekly count retrieved"
          });
        } else {
          console.log("FastAPI returned error for weekly count:", fastApiResponse.status);
          return res.json({
            weekly_count: 0,
            message: "Failed to fetch weekly count"
          });
        }
      } catch (fetchError) {
        console.error("Error fetching weekly count from FastAPI:", fetchError);
        return res.json({
          weekly_count: 0,
          message: "Network error while fetching weekly count"
        });
      }
    } catch (error) {
      console.error("Weekly count fetch error:", error);
      res.status(500).json({ message: "Error fetching weekly email count" });
    }
  });

  // Start parsing endpoint for the "Start Parsing" button
  app.post("/api/emails/start-parsing", async (req: any, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = users.get(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log("Starting email parsing and credibility analysis for user:", user.email);
      console.log("Request body:", req.body);

      // Check if we have stored OAuth tokens in session
      const accessToken = req.session.accessToken;

      if (!accessToken) {
        console.log("No OAuth token found in session for parsing request");
        return res.status(401).json({
          message: "OAuth token required. Please reconnect your Google account."
        });
      }

      // Extract domain context from request body
      const domainContext = req.body?.domain_context || '';
      console.log("Domain context received:", domainContext);

      // Call the CORRECT FastAPI endpoint with domain context
      try {
        const fastApiResponse = await fetch(
          "http://localhost:5000/fetch/start-parsing",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "oauth-token": accessToken,
            },
            body: JSON.stringify({
              domain_context: domainContext
            })
          },
        );

        if (fastApiResponse.ok) {
          const processedData = await fastApiResponse.json();
          console.log("Successfully fetched processed emails with relevancy from FastAPI:", processedData);

          // Format the response for dashboard
          const emails = processedData.emails || [];
          const credibilityAnalysis = processedData.credibility_analysis || [];

          return res.json({
            emails: emails,
            count: emails.length,
            credibility_analysis: credibilityAnalysis
          });
        } else {
          console.log("FastAPI returned error for parsing:", fastApiResponse.status);
          const errorText = await fastApiResponse.text();
          console.log("FastAPI error details:", errorText);

          return res.status(500).json({
            message: "Failed to process emails from FastAPI"
          });
        }
      } catch (fetchError) {
        console.error("Error fetching processed data from FastAPI:", fetchError);
        return res.status(500).json({
          message: "Network error while processing emails"
        });
      }
    } catch (error) {
      console.error("Email parsing error:", error);
      res.status(500).json({ message: "Error processing emails" });
    }
  });

  // Weekly email count endpoint
  app.get("/api/emails/weekly-count", async (req: any, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = users.get(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log("Fetching weekly email count for user:", user.email);

      const accessToken = req.session.accessToken;
      if (!accessToken) {
        console.log("No OAuth token found in session for weekly count request");
        return res.json({
          weekly_count: 0,
          message: "OAuth token required. Please reconnect your Google account."
        });
      }

      try {
        const fastApiResponse = await fetch(
          "http://localhost:5000/fetch/weekly-count",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "oauth-token": accessToken,
            },
          },
        );

        if (fastApiResponse.ok) {
          const countData = await fastApiResponse.json();
          console.log("Successfully fetched weekly count from FastAPI:", countData);

          return res.json({
            weekly_count: countData.weekly_count || 0,
            message: countData.message || "Weekly count retrieved"
          });
        } else {
          console.log("FastAPI returned error for weekly count:", fastApiResponse.status);
          return res.json({
            weekly_count: 0,
            message: "Failed to fetch weekly count"
          });
        }
      } catch (fetchError) {
        console.error("Error fetching weekly count from FastAPI:", fetchError);
        return res.json({
          weekly_count: 0,
          message: "Network error while fetching weekly count"
        });
      }
    } catch (error) {
      console.error("Weekly count fetch error:", error);
      res.status(500).json({ message: "Error fetching weekly email count" });
    }
  });

  // Fetch emails from FastAPI
  app.get("/api/fetch-emails", async (req: any, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = users.get(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log("Attempting to fetch emails for user:", user.email);

      // Check if there's an active OAuth token
      const accessToken = req.session.accessToken;

      if (!accessToken) {
        console.log("No OAuth token found in session for fetch-emails request");
        // Return mock data if no token
        return res.json({
          emails: [
            {
              subject: "OAuth Connection Required",
              sender: "system@narrisia.ai",
              date: new Date().toISOString(),
              snippet: "Please reconnect your Google account to fetch real emails."
            }
          ]
        });
      }

      // Try to fetch from FastAPI with OAuth token
      try {
        const fastApiResponse = await fetch(
          "https://e4f5546c-33cd-42ea-a914-918d6295b1ae-00-1ru77f1hkb7nk.sisko.replit.dev/fetch",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "oauth-token": accessToken,
            },
          },
        );

        if (fastApiResponse.ok) {
          const emailData = await fastApiResponse.json();
          console.log("Successfully fetched emails from FastAPI:", emailData);
          return res.json(emailData);
        } else {
          console.log("FastAPI returned error for fetch-emails:", fastApiResponse.status);
          const errorText = await fastApiResponse.text();
          console.log("FastAPI error details:", errorText);
          // Return mock data if FastAPI fails
          return res.json({
            emails: [
              {
                subject: "Welcome to Narrisia.AI",
                sender: "welcome@narrisia.ai",
                date: new Date().toISOString(),
                snippet: "Thank you for signing up! Get started with your AI-powered dashboard."
              },
              {
                subject: "FastAPI Error",
                sender: "system@narrisia.ai",
                date: new Date().toISOString(),
                snippet: "Could not fetch emails due to an error. Please try again later."
              }
            ]
          });
        }
      } catch (fetchError) {
        console.error("Error fetching from FastAPI for fetch-emails:", fetchError);
        // Return mock data as fallback
        return res.json({
          emails: [
            {
              subject: "Sample Email 1",
              sender: "example@company.com",
              date: new Date().toISOString(),
              snippet: "This is a sample email to demonstrate the email fetching functionality."
            },
            {
              subject: "Sample Email 2",
              sender: "info@business.com",
              date: new Date().toISOString(),
              snippet: "Another sample email for testing purposes."
            }
          ]
        });
      }
    } catch (error) {
      console.error("Email fetch error:", error);
      res.status(500).json({ message: "Error fetching emails" });
    }
  });

  // Create subscription for recurring payments
  app.post("/api/create-subscription", async (req: any, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { priceId, planName, paymentMethodId, amount, tasks } = req.body;
      const user = users.get(req.session.userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get customer ID (should already exist from setup intent)
      const customerId = (user as any).stripeCustomerId;
      if (!customerId) {
        return res.status(400).json({ message: "Customer not found" });
      }

      // Handle free starter plan
      if (priceId === "starter" || (amount && parseFloat(amount) === 0)) {
        // Update user with free plan info
        const updatedUser = {
          ...user,
          subscriptionPlan: "starter",
          subscriptionStatus: "active",
          taskLimit: parseInt(tasks) || 100,
        };
        users.set(req.session.userId, updatedUser);
        req.session.user = updatedUser;

        return res.json({
          subscriptionId: "free_starter",
          status: "active",
          plan: "starter",
        });
      }

      // Create a product first
      const product = await stripe.products.create({
        name: `Narrisia.AI ${planName} Plan`,
        description: `${planName} subscription for AI productivity tools`,
      });

      // Get the actual amount from the request or calculate based on plan
      const unitAmount = amount
        ? Math.round(parseFloat(amount) * 100)
        : priceId === "professional"
          ? 4900
          : 9900;

      // Create subscription with the saved payment method
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        default_payment_method: paymentMethodId,
        items: [
          {
            price_data: {
              currency: "usd",
              product: product.id,
              unit_amount: unitAmount,
              recurring: {
                interval: "month",
              },
            },
          },
        ],
        expand: ["latest_invoice.payment_intent"],
      });

      // Update user with subscription info
      const updatedUser = {
        ...user,
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionPlan: priceId,
        taskLimit: parseInt(tasks) || 1000,
      };
      users.set(req.session.userId, updatedUser);
      req.session.user = updatedUser;

      res.json({
        subscriptionId: subscription.id,
        status: subscription.status,
      });
    } catch (error: any) {
      console.error("Subscription creation error:", error);
      res
        .status(500)
        .json({ message: "Error creating subscription: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}