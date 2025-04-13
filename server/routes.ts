import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTransactionSchema, insertGameHistorySchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as DiscordStrategy } from "passport-discord";

// Extend Express Session
declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

// Extend Express Request
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      balance: number;
      vipLevel: number;
      email?: string;
      oauthProvider?: string;
      oauthId?: string;
      createdAt: string;
    }
  }
}

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(
    session({
      cookie: { maxAge: 86400000 }, // 24 hours
      store: new SessionStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "nexus-casino-secret"
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(new Error("User not found"), null);
      }
      
      // Don't send password to client
      const { password, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } catch (error) {
      done(error, null);
    }
  });

  // Configure Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.VITE_GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.VITE_GOOGLE_CLIENT_SECRET || "",
        callbackURL: `${process.env.VITE_REDIRECT_URI}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          let user = await storage.getUserByUsername(`google:${profile.id}`);
          
          // If not, create a new user
          if (!user) {
            user = await storage.createUser({
              username: `google:${profile.id}`,
              password: crypto.randomBytes(20).toString('hex'), // Random password since login is via OAuth
              oauthProvider: "google",
              oauthId: profile.id,
              email: profile.emails && profile.emails[0] ? profile.emails[0].value : undefined
            });
          }
          
          // Convert to User type for TypeScript compatibility
          if (user) {
            const { password, ...userWithoutPassword } = user;
            return done(null, userWithoutPassword as Express.User);
          }
          
          return done(null, undefined);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );

  // Configure Discord OAuth Strategy
  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.VITE_DISCORD_CLIENT_ID || "",
        clientSecret: process.env.VITE_DISCORD_CLIENT_SECRET || "",
        callbackURL: `${process.env.VITE_REDIRECT_URI}/api/auth/discord/callback`,
        scope: ["identify", "email"]
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          let user = await storage.getUserByUsername(`discord:${profile.id}`);
          
          // If not, create a new user
          if (!user) {
            user = await storage.createUser({
              username: `discord:${profile.id}`,
              password: crypto.randomBytes(20).toString('hex'), // Random password since login is via OAuth
              oauthProvider: "discord",
              oauthId: profile.id,
              email: profile.email
            });
          }
          
          // Convert to User type for TypeScript compatibility
          if (user) {
            const { password, ...userWithoutPassword } = user;
            return done(null, userWithoutPassword as Express.User);
          }
          
          return done(null, undefined);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );

  // OAuth routes
  app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
      // Successful authentication, set session and redirect to dashboard
      if (req.user && typeof req.user === 'object' && 'id' in req.user) {
        req.session.userId = req.user.id as number;
      }
      res.redirect("/dashboard");
    }
  );

  app.get("/api/auth/discord", passport.authenticate("discord"));

  app.get(
    "/api/auth/discord/callback",
    passport.authenticate("discord", { failureRedirect: "/login" }),
    (req, res) => {
      // Successful authentication, set session and redirect to dashboard
      if (req.user && typeof req.user === 'object' && 'id' in req.user) {
        req.session.userId = req.user.id as number;
      }
      res.redirect("/dashboard");
    }
  );

  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash password
      const hashedPassword = crypto
        .createHash("sha256")
        .update(userData.password)
        .digest("hex");
      
      // Create user with hashed password
      const user = await storage.createUser({
        username: userData.username,
        password: hashedPassword
      });
      
      // Return user info (without password)
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      // Validate inputs
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Verify password
      const hashedPassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");
      
      if (user.password !== hashedPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set user session
      req.session.userId = user.id;
      
      // Return user info (without password)
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user info (without password)
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Transaction routes
  app.post("/api/transactions", async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Validate transaction data
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        userId
      });
      
      // Get user to check balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // For withdrawals, check if user has sufficient balance
      if (transactionData.type === "withdraw" && user.balance < transactionData.amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Update user balance
      let newBalance = user.balance;
      if (transactionData.type === "deposit") {
        newBalance += transactionData.amount;
      } else if (transactionData.type === "withdraw") {
        newBalance -= transactionData.amount;
      }
      
      // Create transaction record
      const transaction = await storage.createTransaction(transactionData);
      
      // Update user balance
      await storage.updateUserBalance(userId, newBalance);
      
      return res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/transactions", async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const transactions = await storage.getTransactionsByUserId(userId);
      return res.status(200).json(transactions);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Game history routes
  app.get("/api/game-history", async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const gameHistory = await storage.getGameHistoryByUserId(userId, limit);
      return res.status(200).json(gameHistory);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/recent-bets", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const recentBets = await storage.getRecentGameHistory(limit);
      
      // Fetch usernames for all bets
      const betsWithUsernames = await Promise.all(
        recentBets.map(async (bet) => {
          const user = await storage.getUser(bet.userId);
          return {
            ...bet,
            username: user ? user.username : "Unknown"
          };
        })
      );
      
      return res.status(200).json(betsWithUsernames);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Game routes
  app.post("/api/games/crash/bet", async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { betAmount, autoPayoutMultiplier } = req.body;
      
      // Validate inputs
      if (!betAmount || betAmount <= 0) {
        return res.status(400).json({ message: "Invalid bet amount" });
      }
      
      // Check user balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.balance < betAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Get current game state
      const gameState = await storage.getGameState("crash");
      if (!gameState) {
        return res.status(500).json({ message: "Game state not initialized" });
      }
      
      const parsedState = JSON.parse(gameState.currentState);
      
      // If game is not in waiting state, can't place bet
      if (parsedState.status !== "waiting") {
        return res.status(400).json({ message: "Cannot place bet at this time" });
      }
      
      // Deduct bet amount from user balance
      await storage.updateUserBalance(userId, user.balance - betAmount);
      
      // Generate a random crash point between 1.00 and 10.00 with higher probability of lower values
      const randomValue = Math.random();
      const crashPoint = Math.max(1.00, Math.min(10.00, 1.00 + Math.pow(randomValue, 2) * 9.00));
      
      // Update game state to in-progress
      await storage.setGameState({
        gameType: "crash",
        currentState: JSON.stringify({
          status: "in-progress",
          crashPoint,
          startTime: Date.now()
        })
      });
      
      // Return the auto payout multiplier for the front-end to handle
      return res.status(200).json({ 
        message: "Bet placed successfully",
        autoPayoutMultiplier: autoPayoutMultiplier || 0
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/games/crash/cashout", async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { betAmount, currentMultiplier } = req.body;
      
      // Validate inputs
      if (!betAmount || betAmount <= 0 || !currentMultiplier || currentMultiplier <= 1) {
        return res.status(400).json({ message: "Invalid bet or multiplier" });
      }
      
      // Get current game state
      const gameState = await storage.getGameState("crash");
      if (!gameState) {
        return res.status(500).json({ message: "Game state not initialized" });
      }
      
      const parsedState = JSON.parse(gameState.currentState);
      
      // If game is not in-progress, can't cash out
      if (parsedState.status !== "in-progress") {
        return res.status(400).json({ message: "Cannot cash out at this time" });
      }
      
      // Check if player cashed out before crash
      if (currentMultiplier <= parsedState.crashPoint) {
        // Cash out successful
        const winAmount = betAmount * currentMultiplier;
        
        // Get user
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        // Update user balance
        await storage.updateUserBalance(userId, user.balance + winAmount);
        
        // Create game history record
        await storage.createGameHistory({
          userId,
          gameType: "crash",
          betAmount,
          multiplier: currentMultiplier,
          payout: winAmount
        });
        
        return res.status(200).json({
          message: "Cash out successful",
          payout: winAmount
        });
      } else {
        // Cash out failed (player tried to cash out after crash)
        return res.status(400).json({ message: "Cash out failed - game has already crashed" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/games/crash/state", async (req: Request, res: Response) => {
    try {
      const gameState = await storage.getGameState("crash");
      if (!gameState) {
        return res.status(500).json({ message: "Game state not initialized" });
      }
      
      return res.status(200).json({ state: JSON.parse(gameState.currentState) });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/games/dice/roll", async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { betAmount, prediction, isUnder } = req.body;
      
      // Validate inputs
      if (!betAmount || betAmount <= 0 || prediction < 1 || prediction > 99) {
        return res.status(400).json({ message: "Invalid bet parameters" });
      }
      
      // Check user balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.balance < betAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Generate random roll between 1 and 100
      const roll = Math.floor(Math.random() * 100) + 1;
      
      // Determine if user won
      const won = isUnder ? roll < prediction : roll > prediction;
      
      // Calculate multiplier (based on probability)
      // For "under", multiplier = 100 / prediction
      // For "over", multiplier = 100 / (100 - prediction)
      const multiplier = isUnder 
        ? parseFloat((100 / prediction).toFixed(2)) 
        : parseFloat((100 / (100 - prediction)).toFixed(2));
      
      // Calculate payout
      const payout = won ? betAmount * multiplier : 0;
      
      // Update user balance
      const newBalance = won 
        ? user.balance + (payout - betAmount) // Add winnings (minus the original bet)
        : user.balance - betAmount; // Subtract loss
      
      await storage.updateUserBalance(userId, newBalance);
      
      // Update dice game state
      await storage.setGameState({
        gameType: "dice",
        currentState: JSON.stringify({ lastRoll: roll })
      });
      
      // Create game history record
      await storage.createGameHistory({
        userId,
        gameType: "dice",
        betAmount,
        multiplier: won ? multiplier : 0,
        payout: won ? payout : 0
      });
      
      return res.status(200).json({
        roll,
        won,
        multiplier,
        payout,
        newBalance
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/games/slots/spin", async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { betAmount } = req.body;
      
      // Validate inputs
      if (!betAmount || betAmount <= 0) {
        return res.status(400).json({ message: "Invalid bet amount" });
      }
      
      // Check user balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.balance < betAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Define slot symbols (0-4) and their multipliers
      const symbols = [
        { id: 0, multiplier: 0.5 },   // Common - low multiplier
        { id: 1, multiplier: 1 },     // Common - money back
        { id: 2, multiplier: 1.5 },   // Uncommon - small win
        { id: 3, multiplier: 3 },     // Rare - medium win
        { id: 4, multiplier: 10 }     // Very rare - big win
      ];
      
      // Weight the symbols to make higher multipliers less common
      const weights = [40, 30, 15, 10, 5]; // Must sum to 100
      
      // Generate 3 random symbols based on weights
      const getRandomSymbol = () => {
        const random = Math.random() * 100;
        let cumulativeWeight = 0;
        
        for (let i = 0; i < weights.length; i++) {
          cumulativeWeight += weights[i];
          if (random <= cumulativeWeight) {
            return symbols[i].id;
          }
        }
        
        return symbols[0].id; // Fallback to first symbol
      };
      
      const reels = [
        getRandomSymbol(),
        getRandomSymbol(),
        getRandomSymbol()
      ];
      
      // Determine win
      let multiplier = 0;
      let won = false;
      
      // Check for matches
      if (reels[0] === reels[1] && reels[1] === reels[2]) {
        // All three match - big win
        multiplier = symbols[reels[0]].multiplier * 3;
        won = true;
      } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
        // Two match - small win
        const matchValue = reels[0] === reels[1] ? reels[0] : 
                          reels[1] === reels[2] ? reels[1] : reels[0];
        multiplier = symbols[matchValue].multiplier * 1.5;
        won = true;
      }
      
      // Calculate payout
      const payout = won ? betAmount * multiplier : 0;
      
      // Update user balance
      const newBalance = won 
        ? user.balance + (payout - betAmount) // Add winnings (minus the original bet)
        : user.balance - betAmount; // Subtract loss
      
      await storage.updateUserBalance(userId, newBalance);
      
      // Update slots game state
      await storage.setGameState({
        gameType: "slots",
        currentState: JSON.stringify({ lastResult: reels })
      });
      
      // Create game history record
      await storage.createGameHistory({
        userId,
        gameType: "slots",
        betAmount,
        multiplier: won ? multiplier : 0,
        payout: won ? payout : 0
      });
      
      return res.status(200).json({
        reels,
        won,
        multiplier,
        payout,
        newBalance
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
