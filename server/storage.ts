import { 
  users, type User, type InsertUser,
  transactions, type Transaction, type InsertTransaction,
  gameHistory, type GameHistory, type InsertGameHistory,
  gameStates, type GameState, type InsertGameState
} from "@shared/schema";

// Interface defining all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, newBalance: number): Promise<User | undefined>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  
  // Game history operations
  createGameHistory(history: InsertGameHistory): Promise<GameHistory>;
  getGameHistoryByUserId(userId: number, limit?: number): Promise<GameHistory[]>;
  getRecentGameHistory(limit: number): Promise<GameHistory[]>;
  
  // Game state operations
  getGameState(gameType: string): Promise<GameState | undefined>;
  setGameState(gameState: InsertGameState): Promise<GameState>;
}

// In-memory implementation of storage interface
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private gameHistory: Map<number, GameHistory>;
  private gameStates: Map<string, GameState>;
  
  private userId: number = 1;
  private transactionId: number = 1;
  private gameHistoryId: number = 1;
  private gameStateId: number = 1;
  
  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.gameHistory = new Map();
    this.gameStates = new Map();
    
    // Initialize default game states
    this.setGameState({ gameType: "crash", currentState: JSON.stringify({ status: "waiting", countdown: 0, crashPoint: 0 }) });
    this.setGameState({ gameType: "dice", currentState: JSON.stringify({ lastRoll: 50 }) });
    this.setGameState({ gameType: "slots", currentState: JSON.stringify({ lastResult: [0, 0, 0] }) });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      balance: 100, // Start with 100 credits
      vipLevel: 0,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserBalance(userId: number, newBalance: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, balance: newBalance };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Transaction operations
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const now = new Date();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: now
    };
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(tx => tx.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  // Game history operations
  async createGameHistory(insertGameHistory: InsertGameHistory): Promise<GameHistory> {
    const id = this.gameHistoryId++;
    const now = new Date();
    const history: GameHistory = {
      ...insertGameHistory,
      id,
      createdAt: now
    };
    this.gameHistory.set(id, history);
    return history;
  }
  
  async getGameHistoryByUserId(userId: number, limit: number = 20): Promise<GameHistory[]> {
    return Array.from(this.gameHistory.values())
      .filter(h => h.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  
  async getRecentGameHistory(limit: number = 20): Promise<GameHistory[]> {
    return Array.from(this.gameHistory.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  
  // Game state operations
  async getGameState(gameType: string): Promise<GameState | undefined> {
    return this.gameStates.get(gameType);
  }
  
  async setGameState(insertGameState: InsertGameState): Promise<GameState> {
    const existingState = this.gameStates.get(insertGameState.gameType);
    const now = new Date();
    
    let gameState: GameState;
    
    if (existingState) {
      gameState = {
        ...existingState,
        currentState: insertGameState.currentState,
        lastUpdated: now
      };
    } else {
      const id = this.gameStateId++;
      gameState = {
        id,
        ...insertGameState,
        lastUpdated: now
      };
    }
    
    this.gameStates.set(insertGameState.gameType, gameState);
    return gameState;
  }
}

// Export a singleton instance of MemStorage
export const storage = new MemStorage();
