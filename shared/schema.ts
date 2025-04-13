import { pgTable, text, serial, integer, boolean, timestamp, real, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  oauthProvider: text("oauth_provider"),
  oauthId: text("oauth_id"),
  balance: doublePrecision("balance").notNull().default(0),
  vipLevel: integer("vip_level").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  oauthProvider: true,
  oauthId: true,
});

// Transaction schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // "deposit" or "withdraw"
  amount: doublePrecision("amount").notNull(),
  status: text("status").notNull(), // "pending", "completed", "failed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  type: true,
  amount: true,
  status: true,
});

// Game History schema
export const gameHistory = pgTable("game_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  gameType: text("game_type").notNull(), // "crash", "dice", "slots"
  betAmount: doublePrecision("bet_amount").notNull(),
  multiplier: doublePrecision("multiplier").notNull(),
  payout: doublePrecision("payout").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGameHistorySchema = createInsertSchema(gameHistory).pick({
  userId: true,
  gameType: true,
  betAmount: true,
  multiplier: true,
  payout: true,
});

// Game state schema
export const gameStates = pgTable("game_states", {
  id: serial("id").primaryKey(),
  gameType: text("game_type").notNull().unique(),
  currentState: text("current_state").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const insertGameStateSchema = createInsertSchema(gameStates).pick({
  gameType: true,
  currentState: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type GameHistory = typeof gameHistory.$inferSelect;
export type InsertGameHistory = z.infer<typeof insertGameHistorySchema>;

export type GameState = typeof gameStates.$inferSelect;
export type InsertGameState = z.infer<typeof insertGameStateSchema>;
