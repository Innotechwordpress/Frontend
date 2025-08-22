// server/index.ts
import express3 from "express";
import session from "express-session";

// server/routes.ts
import { createServer } from "http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// shared/schema.ts
import { z } from "zod";
var userRoles = [
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
];
var companySizes = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+"
];
var goalCategories = [
  "Strategy",
  "Finance",
  "Operations",
  "Marketing",
  "Technology",
  "R&D",
  "Sales",
  "HR"
];
var signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(userRoles, { required_error: "Please select your role" }),
  companyName: z.string().min(1, "Company name is required"),
  companySize: z.enum(companySizes, { required_error: "Please select company size" }),
  industry: z.string().min(1, "Industry is required"),
  goals: z.array(z.enum(goalCategories)).min(1, "Please select at least one goal")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
var loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

// server/routes.ts
import Stripe from "stripe";
import express from "express";
var router = express.Router();
router.get("/user", (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  res.json(req.session.user);
});
router.get("/debug/session", (req, res) => {
  if (req.session) {
    return res.json({
      hasSession: true,
      sessionId: req.sessionID,
      user: req.session.user || null,
      tokens: {
        accessToken: req.session.accessToken || null,
        refreshToken: req.session.refreshToken || null
      }
    });
  }
  res.json({ hasSession: false });
});
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil"
});
var users = /* @__PURE__ */ new Map();
var JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}
function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
async function registerRoutes(app2) {
  app2.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      const existingUser = Array.from(users.values()).find(
        (u) => u.email === validatedData.email
      );
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);
      const userId = generateId();
      const user = {
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
        createdAt: /* @__PURE__ */ new Date()
      };
      users.set(userId, user);
      const token = generateToken(userId);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({
        message: "User created successfully",
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const user = Array.from(users.values()).find(
        (u) => u.email === validatedData.email
      );
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      const isMatch = await bcrypt.compare(
        validatedData.password,
        user.password
      );
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      req.session.userId = user.id;
      req.session.user = user;
      const { password, ...userWithoutPassword } = user;
      res.json({
        message: "Login successful",
        user: userWithoutPassword
      });
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
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
  app2.get("/api/auth/me", authenticateToken, (req, res) => {
    const { password, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  });
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  console.log(
    "Using Client ID:",
    GOOGLE_CLIENT_ID ? GOOGLE_CLIENT_ID.substring(0, 20) + "..." : "Not found"
  );
  app2.get("/api/auth/google", (req, res) => {
    console.log("Google OAuth initiated");
    if (!GOOGLE_CLIENT_ID) {
      console.log("Google Client ID not found");
      return res.status(400).json({
        message: "Google OAuth not configured. Please provide GOOGLE_CLIENT_ID."
      });
    }
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const host = req.get("host");
    const GOOGLE_REDIRECT_URI = `${protocol}://${host}/api/auth/google/callback`;
    console.log("Redirect URI:", GOOGLE_REDIRECT_URI);
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(
      [
        "email",
        "profile",
        "openid",
        "https://www.googleapis.com/auth/gmail.readonly"
      ].join(" ")
    )}&access_type=offline&prompt=consent`;
    console.log("Redirecting to:", authUrl);
    res.redirect(authUrl);
  });
  app2.get("/api/test/callback", (req, res) => {
    console.log("Test callback endpoint hit");
    res.json({ message: "Callback route working", query: req.query });
  });
  app2.get("/api/auth/google/callback", async (req, res) => {
    console.log("=== GOOGLE OAUTH CALLBACK TRIGGERED ===");
    console.log("Query params:", req.query);
    console.log("Headers:", req.headers);
    console.log("Session ID:", req.sessionID);
    const { code } = req.query;
    if (!code || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.log("Missing required OAuth parameters:", {
        hasCode: !!code,
        hasClientId: !!GOOGLE_CLIENT_ID,
        hasClientSecret: !!GOOGLE_CLIENT_SECRET
      });
      return res.redirect("/login?error=oauth_failed");
    }
    try {
      const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const host = req.get("host");
      const GOOGLE_REDIRECT_URI = `${protocol}://${host}/api/auth/google/callback`;
      console.log("Using callback redirect URI:", GOOGLE_REDIRECT_URI);
      console.log("Exchanging code for access token...");
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: GOOGLE_REDIRECT_URI
        })
      });
      const tokenData = await tokenResponse.json();
      console.log("Token response status:", tokenResponse.status);
      console.log("Full token data:", JSON.stringify(tokenData, null, 2));
      console.log("Token data received:", {
        hasAccessToken: !!tokenData.access_token,
        hasRefreshToken: !!tokenData.refresh_token,
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in
      });
      if (!tokenData.access_token) {
        console.log("No access token received:", tokenData);
        return res.redirect("/login?error=token_failed");
      }
      try {
        const fastApiResponse = await fetch(
          "http://localhost:5000/fetch",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "oauth-token": tokenData.access_token
            }
          }
        );
        if (!fastApiResponse.ok) {
          console.error(
            "FastAPI fetch failed with status:",
            fastApiResponse.status
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
      const userResponse = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`
          }
        }
      );
      const googleUser = await userResponse.json();
      let user = Array.from(users.values()).find(
        (u) => u.email === googleUser.email
      );
      if (!user) {
        const userId = generateId();
        user = {
          id: userId,
          email: googleUser.email,
          password: "",
          // No password for OAuth users
          firstName: googleUser.given_name || "",
          lastName: googleUser.family_name || "",
          role: "CEO",
          // Default role
          companyName: "",
          companySize: "",
          industry: "",
          goals: [],
          createdAt: /* @__PURE__ */ new Date()
        };
        users.set(userId, user);
      }
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.redirect("/login?error=session_failed");
        }
        req.session.userId = user.id;
        req.session.user = user;
        req.session.accessToken = tokenData.access_token;
        req.session.refreshToken = tokenData.refresh_token;
        console.log("Session regenerated for user:", {
          userId: user.id,
          email: user.email,
          sessionId: req.sessionID,
          hasAccessToken: !!tokenData.access_token
        });
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            return res.redirect("/login?error=session_failed");
          }
          console.log("Session saved successfully, redirecting to home");
          res.redirect("/");
        });
      });
    } catch (error) {
      console.error("Google OAuth error:", error);
      res.redirect("/login?error=oauth_failed");
    }
  });
  app2.get("/api/user", (req, res) => {
    console.log("Session check:", {
      hasSession: !!req.session,
      sessionId: req.sessionID,
      userId: req.session?.userId,
      sessionData: req.session
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
  app2.put("/api/user/profile", (req, res) => {
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
      goals
    } = req.body;
    const updatedUser = {
      ...user,
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      role: role || user.role,
      companyName: companyName || user.companyName,
      companySize: companySize || user.companySize,
      industry: industry || user.industry,
      goals: goals || user.goals
    };
    users.set(req.session.userId, updatedUser);
    req.session.user = updatedUser;
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  });
  app2.post("/api/auth/logout", (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
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
  app2.post("/api/create-payment-intent", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const { amount, plan } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        // Convert to cents
        currency: "usd",
        metadata: {
          userId: req.session.userId,
          plan: plan || "pro"
        }
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Payment intent creation error:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });
  app2.post("/api/create-setup-intent", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = users.get(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          metadata: {
            userId: user.id
          }
        });
        customerId = customer.id;
        const updatedUser = { ...user, stripeCustomerId: customerId };
        users.set(req.session.userId, updatedUser);
        req.session.user = updatedUser;
      }
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        usage: "off_session",
        payment_method_types: ["card"]
      });
      res.json({
        clientSecret: setupIntent.client_secret
      });
    } catch (error) {
      console.error("Setup intent creation error:", error);
      res.status(500).json({ message: "Error creating setup intent: " + error.message });
    }
  });
  app2.get("/api/emails/unread", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = users.get(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log("Fetching basic email count for dashboard for user:", user.email);
      const accessToken = req.session.accessToken;
      if (!accessToken) {
        console.log("No OAuth token found in session for dashboard request");
        return res.json({
          emails: [],
          count: 0,
          message: "OAuth token required. Please reconnect your Google account."
        });
      }
      try {
        const fastApiResponse = await fetch(
          "http://localhost:5000/fetch",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "oauth-token": accessToken
            }
          }
        );
        if (fastApiResponse.ok) {
          const emailData = await fastApiResponse.json();
          console.log("Successfully fetched basic emails from FastAPI:", emailData);
          const emails = emailData.emails || [];
          return res.json({
            emails,
            count: emails.length,
            credibility_analysis: []
            // Empty until parsing is started
          });
        } else {
          console.log("FastAPI returned error for dashboard:", fastApiResponse.status);
          const errorText = await fastApiResponse.text();
          console.log("FastAPI error details:", errorText);
          return res.json({
            emails: [],
            count: 0,
            message: "Failed to fetch emails from FastAPI"
          });
        }
      } catch (fetchError) {
        console.error("Error fetching from FastAPI for dashboard:", fetchError);
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
  app2.get("/api/emails/weekly-count", async (req, res) => {
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
              "oauth-token": accessToken
            }
          }
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
  app2.post("/api/emails/start-parsing", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = users.get(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log("Starting email parsing and credibility analysis for user:", user.email);
      const accessToken = req.session.accessToken;
      if (!accessToken) {
        console.log("No OAuth token found in session for parsing request");
        return res.status(401).json({
          message: "OAuth token required. Please reconnect your Google account."
        });
      }
      try {
        const fastApiResponse = await fetch(
          "http://localhost:5000/fetch/processed",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "oauth-token": accessToken
            }
          }
        );
        if (fastApiResponse.ok) {
          const processedData = await fastApiResponse.json();
          console.log("Successfully fetched processed emails and credibility from FastAPI:", processedData);
          const emails = processedData.emails || [];
          const credibilityAnalysis = processedData.credibility_analysis || [];
          return res.json({
            emails,
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
  app2.get("/api/fetch-emails", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = users.get(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log("Attempting to fetch emails for user:", user.email);
      const accessToken = req.session.accessToken;
      if (!accessToken) {
        console.log("No OAuth token found in session for fetch-emails request");
        return res.json({
          emails: [
            {
              subject: "OAuth Connection Required",
              sender: "system@narrisia.ai",
              date: (/* @__PURE__ */ new Date()).toISOString(),
              snippet: "Please reconnect your Google account to fetch real emails."
            }
          ]
        });
      }
      try {
        const fastApiResponse = await fetch(
          "https://e4f5546c-33cd-42ea-a914-918d6295b1ae-00-1ru77f1hkb7nk.sisko.replit.dev/fetch",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "oauth-token": accessToken
            }
          }
        );
        if (fastApiResponse.ok) {
          const emailData = await fastApiResponse.json();
          console.log("Successfully fetched emails from FastAPI:", emailData);
          return res.json(emailData);
        } else {
          console.log("FastAPI returned error for fetch-emails:", fastApiResponse.status);
          const errorText = await fastApiResponse.text();
          console.log("FastAPI error details:", errorText);
          return res.json({
            emails: [
              {
                subject: "Welcome to Narrisia.AI",
                sender: "welcome@narrisia.ai",
                date: (/* @__PURE__ */ new Date()).toISOString(),
                snippet: "Thank you for signing up! Get started with your AI-powered dashboard."
              },
              {
                subject: "FastAPI Error",
                sender: "system@narrisia.ai",
                date: (/* @__PURE__ */ new Date()).toISOString(),
                snippet: "Could not fetch emails due to an error. Please try again later."
              }
            ]
          });
        }
      } catch (fetchError) {
        console.error("Error fetching from FastAPI for fetch-emails:", fetchError);
        return res.json({
          emails: [
            {
              subject: "Sample Email 1",
              sender: "example@company.com",
              date: (/* @__PURE__ */ new Date()).toISOString(),
              snippet: "This is a sample email to demonstrate the email fetching functionality."
            },
            {
              subject: "Sample Email 2",
              sender: "info@business.com",
              date: (/* @__PURE__ */ new Date()).toISOString(),
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
  app2.post("/api/create-subscription", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const { priceId, planName, paymentMethodId, amount, tasks } = req.body;
      const user = users.get(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const customerId = user.stripeCustomerId;
      if (!customerId) {
        return res.status(400).json({ message: "Customer not found" });
      }
      if (priceId === "starter" || amount && parseFloat(amount) === 0) {
        const updatedUser2 = {
          ...user,
          subscriptionPlan: "starter",
          subscriptionStatus: "active",
          taskLimit: parseInt(tasks) || 100
        };
        users.set(req.session.userId, updatedUser2);
        req.session.user = updatedUser2;
        return res.json({
          subscriptionId: "free_starter",
          status: "active",
          plan: "starter"
        });
      }
      const product = await stripe.products.create({
        name: `Narrisia.AI ${planName} Plan`,
        description: `${planName} subscription for AI productivity tools`
      });
      const unitAmount = amount ? Math.round(parseFloat(amount) * 100) : priceId === "professional" ? 4900 : 9900;
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
                interval: "month"
              }
            }
          }
        ],
        expand: ["latest_invoice.payment_intent"]
      });
      const updatedUser = {
        ...user,
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionPlan: priceId,
        taskLimit: parseInt(tasks) || 1e3
      };
      users.set(req.session.userId, updatedUser);
      req.session.user = updatedUser;
      res.json({
        subscriptionId: subscription.id,
        status: subscription.status
      });
    } catch (error) {
      console.error("Subscription creation error:", error);
      res.status(500).json({ message: "Error creating subscription: " + error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
  resave: true,
  saveUninitialized: true,
  name: "sessionId",
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1e3,
    // 24 hours
    sameSite: "lax"
  }
}));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
