// Constants for game configurations
export const GAME_TYPES = {
  CASE_BATTLES: "case_battles",
  ROULETTE: "roulette",
  CRASH: "crash",
  DICE: "dice",
  SLOTS: "slots"
};

// Game result types
export interface GameResult {
  won: boolean;
  payout: number;
  multiplier: number;
}

export interface CrashGameResult extends GameResult {
  crashPoint: number;
  cashedOutAt?: number;
}

export interface DiceGameResult extends GameResult {
  roll: number;
  prediction: number;
  isUnder: boolean;
}

export interface SlotsGameResult extends GameResult {
  reels: number[];
}

export interface RouletteGameResult extends GameResult {
  number: number;
  color: 'red' | 'black' | 'green';
  betType: 'red' | 'black' | 'green' | 'odd' | 'even' | 'high' | 'low' | 'dozen1' | 'dozen2' | 'dozen3' | 'column1' | 'column2' | 'column3' | 'number';
  betValue?: number; // For number bets
}

export interface CaseBattlesGameResult extends GameResult {
  playerItems: Array<{id: number, name: string, rarity: string, value: number}>;
  opponentItems: Array<{id: number, name: string, rarity: string, value: number}>;
  playerTotal: number;
  opponentTotal: number;
}

// Define slot symbol icons and their values
export const SLOT_SYMBOLS = [
  { id: 0, icon: "gem", color: "bg-accent-purple", textColor: "text-white" },
  { id: 1, icon: "crown", color: "bg-accent-orange", textColor: "text-white" },
  { id: 2, icon: "diamond", color: "bg-accent-teal", textColor: "text-white" },
  { id: 3, icon: "star", color: "bg-yellow-500", textColor: "text-white" },
  { id: 4, icon: "rocket", color: "bg-red-500", textColor: "text-white" },
];

// Utility function to get random number in range (for frontend visualization)
export function getRandomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Calculate crash animation duration based on crash point
export function calculateCrashDuration(crashPoint: number): number {
  // Lower multipliers crash faster, higher ones take longer
  return Math.min(10000, 1000 + crashPoint * 500);
}

// Calculate dice win probability
export function calculateDiceWinProbability(prediction: number, isUnder: boolean): number {
  return isUnder ? prediction - 1 : 100 - prediction;
}

// Calculate dice multiplier
export function calculateDiceMultiplier(prediction: number, isUnder: boolean): number {
  const probability = calculateDiceWinProbability(prediction, isUnder);
  return parseFloat((99 / probability).toFixed(2));
}

// Format currency display
export function formatCurrency(amount: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Get crash background color based on multiplier
export function getCrashColorClass(multiplier: number): string {
  if (multiplier < 1.5) return "bg-status-error";
  if (multiplier < 3) return "bg-accent-purple";
  if (multiplier < 5) return "bg-accent-teal";
  return "bg-yellow-500";
}

// Check if slots result is a win and calculate payout multiplier
export function calculateSlotsResult(reels: number[]): { isWin: boolean, multiplier: number } {
  // All three match
  if (reels[0] === reels[1] && reels[1] === reels[2]) {
    // Higher value symbols have higher payouts
    const multiplier = (reels[0] + 1) * 3;
    return { isWin: true, multiplier };
  }
  
  // Two match
  if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
    const matchedSymbol = reels[0] === reels[1] ? reels[0] : 
                         reels[1] === reels[2] ? reels[1] : reels[0];
    const multiplier = (matchedSymbol + 1) * 1.5;
    return { isWin: true, multiplier };
  }
  
  // No match
  return { isWin: false, multiplier: 0 };
}

// Roulette constants
export const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

export const ROULETTE_COLORS: Record<number, 'red' | 'black' | 'green'> = {
  0: 'green',
  1: 'red', 2: 'black', 3: 'red', 4: 'black', 5: 'red', 6: 'black',
  7: 'red', 8: 'black', 9: 'red', 10: 'black', 11: 'black', 12: 'red',
  13: 'black', 14: 'red', 15: 'black', 16: 'red', 17: 'black', 18: 'red',
  19: 'red', 20: 'black', 21: 'red', 22: 'black', 23: 'red', 24: 'black',
  25: 'red', 26: 'black', 27: 'red', 28: 'black', 29: 'black', 30: 'red',
  31: 'black', 32: 'red', 33: 'black', 34: 'red', 35: 'black', 36: 'red'
};

// Calculate roulette bet result and payout
export function calculateRouletteResult(
  betType: 'red' | 'black' | 'green' | 'odd' | 'even' | 'high' | 'low' | 'dozen1' | 'dozen2' | 'dozen3' | 'column1' | 'column2' | 'column3' | 'number',
  betValue: number | undefined,
  result: number
): { won: boolean, multiplier: number } {
  const color = ROULETTE_COLORS[result];
  const isOdd = result !== 0 && result % 2 === 1;
  const isLow = result >= 1 && result <= 18;
  const isHigh = result >= 19 && result <= 36;
  const dozen = result === 0 ? 0 : Math.ceil(result / 12);
  const column = result === 0 ? 0 : (result % 3 === 0 ? 3 : result % 3);
  
  switch(betType) {
    case 'red':
      return { won: color === 'red', multiplier: 2 };
    case 'black':
      return { won: color === 'black', multiplier: 2 };
    case 'green':
      return { won: color === 'green', multiplier: 36 };
    case 'odd':
      return { won: isOdd, multiplier: 2 };
    case 'even':
      return { won: !isOdd && result !== 0, multiplier: 2 };
    case 'high':
      return { won: isHigh, multiplier: 2 };
    case 'low':
      return { won: isLow, multiplier: 2 };
    case 'dozen1':
      return { won: dozen === 1, multiplier: 3 };
    case 'dozen2':
      return { won: dozen === 2, multiplier: 3 };
    case 'dozen3':
      return { won: dozen === 3, multiplier: 3 };
    case 'column1':
      return { won: column === 1, multiplier: 3 };
    case 'column2':
      return { won: column === 2, multiplier: 3 };
    case 'column3':
      return { won: column === 3, multiplier: 3 };
    case 'number':
      return { won: result === betValue, multiplier: 36 };
    default:
      return { won: false, multiplier: 0 };
  }
}

// Case battles constants
export const CASE_RARITIES = [
  { name: 'Common', color: 'bg-gray-400', chance: 0.40, valueRange: [1, 5] },
  { name: 'Uncommon', color: 'bg-blue-500', chance: 0.30, valueRange: [5, 10] },
  { name: 'Rare', color: 'bg-purple-500', chance: 0.15, valueRange: [10, 25] },
  { name: 'Epic', color: 'bg-pink-500', chance: 0.10, valueRange: [25, 50] },
  { name: 'Legendary', color: 'bg-yellow-400', chance: 0.04, valueRange: [50, 100] },
  { name: 'Mythical', color: 'bg-red-500', chance: 0.01, valueRange: [100, 500] }
];

export const CASE_ITEMS = [
  { id: 1, name: 'Bronze Knife', rarity: 'Common' },
  { id: 2, name: 'Steel Sword', rarity: 'Common' },
  { id: 3, name: 'Wooden Shield', rarity: 'Common' },
  { id: 4, name: 'Leather Armor', rarity: 'Common' },
  { id: 5, name: 'Iron Helmet', rarity: 'Uncommon' },
  { id: 6, name: 'Silver Dagger', rarity: 'Uncommon' },
  { id: 7, name: 'Reinforced Boots', rarity: 'Uncommon' },
  { id: 8, name: 'Enchanted Gloves', rarity: 'Rare' },
  { id: 9, name: 'Mystic Staff', rarity: 'Rare' },
  { id: 10, name: 'Dragon Scale', rarity: 'Epic' },
  { id: 11, name: 'Phoenix Feather', rarity: 'Epic' },
  { id: 12, name: 'Excalibur', rarity: 'Legendary' },
  { id: 13, name: 'Holy Grail', rarity: 'Mythical' }
];

// Get random item based on rarity chances
export function getRandomCaseItem() {
  const rand = Math.random();
  let cumulativeProbability = 0;
  
  for (const rarity of CASE_RARITIES) {
    cumulativeProbability += rarity.chance;
    if (rand <= cumulativeProbability) {
      // Choose a random item of this rarity
      const itemsOfRarity = CASE_ITEMS.filter(item => item.rarity === rarity.name);
      const randomItem = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];
      
      // Assign a random value within the rarity's range
      const [min, max] = rarity.valueRange;
      const value = parseFloat((Math.random() * (max - min) + min).toFixed(2));
      
      return { ...randomItem, value };
    }
  }
  
  // Fallback (should never happen)
  const defaultItem = CASE_ITEMS[0];
  return { ...defaultItem, value: 1 };
}

// Calculate case battle outcome
export function calculateCaseBattleResult(numItems: number) {
  const playerItems = Array.from({ length: numItems }, () => getRandomCaseItem());
  const opponentItems = Array.from({ length: numItems }, () => getRandomCaseItem());
  
  const playerTotal = playerItems.reduce((sum, item) => sum + item.value, 0);
  const opponentTotal = opponentItems.reduce((sum, item) => sum + item.value, 0);
  
  const won = playerTotal > opponentTotal;
  // Payout is 1.9x the bet if player wins (accounting for house edge)
  const multiplier = won ? 1.9 : 0;
  
  return {
    won,
    multiplier,
    playerItems,
    opponentItems,
    playerTotal,
    opponentTotal
  };
}
