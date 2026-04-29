export interface RewardTier {
  name: "Silver" | "Gold" | "Platinum";
  minPoints: number;
  benefits: string[];
  color: string;
}

export const rewardTiers: RewardTier[] = [
  {
    name: "Silver",
    minPoints: 0,
    benefits: ["Earn 1 point per $1 spent", "Birthday bonus: 500 points"],
    color: "bg-slate-400",
  },
  {
    name: "Gold",
    minPoints: 10000,
    benefits: [
      "Earn 1.5 points per $1 spent",
      "Free seat selection",
      "Priority check-in",
      "Birthday bonus: 1000 points",
    ],
    color: "bg-amber-500",
  },
  {
    name: "Platinum",
    minPoints: 50000,
    benefits: [
      "Earn 2 points per $1 spent",
      "Complimentary lounge access",
      "No change fees",
      "Dedicated support line",
      "Birthday bonus: 2500 points",
    ],
    color: "bg-indigo-600",
  },
];

export interface RewardTransaction {
  id: string;
  type: "Earned" | "Redeemed";
  source: string;
  points: number;
  date: string;
  status: "Completed" | "Pending";
}

export const mockRewardHistory: RewardTransaction[] = [
  {
    id: "tx-1",
    type: "Earned",
    source: "Flight to London (EF-9021)",
    points: 1250,
    date: "2024-04-20",
    status: "Completed",
  },
  {
    id: "tx-2",
    type: "Earned",
    source: "Hotel: Address Downtown Dubai",
    points: 800,
    date: "2024-04-18",
    status: "Completed",
  },
  {
    id: "tx-3",
    type: "Redeemed",
    source: "Flight Discount - DXB to LHR",
    points: -2000,
    date: "2024-04-05",
    status: "Completed",
  },
  {
    id: "tx-4",
    type: "Earned",
    source: "Birthday Bonus",
    points: 1000,
    date: "2024-03-12",
    status: "Completed",
  },
  {
    id: "tx-5",
    type: "Earned",
    source: "Referral Bonus: Syed Shah",
    points: 1000,
    date: "2024-02-28",
    status: "Completed",
  },
];

export interface MilestoneBadge {
  id: string;
  name: string;
  icon: string;
  earned: boolean;
  description: string;
}

export const mockBadges: MilestoneBadge[] = [
  {
    id: "badge-1",
    name: "Early Bird",
    icon: "🌅",
    earned: true,
    description: "Booked a flight 3 months in advance",
  },
  {
    id: "badge-2",
    name: "Globetrotter",
    icon: "🌍",
    earned: true,
    description: "Visited 5 different countries",
  },
  {
    id: "badge-3",
    name: "Reviewer",
    icon: "✍️",
    earned: false,
    description: "Leave 10 verified hotel reviews",
  },
  {
    id: "badge-4",
    name: "Bundle King",
    icon: "📦",
    earned: true,
    description: "Booked 3+ packages in a year",
  },
];

export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  isCurrentUser?: boolean;
}

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Ahmed Khan", points: 85400 },
  { rank: 2, name: "Sarah Miller", points: 72100 },
  { rank: 3, name: "Fatima Syed", points: 68900 },
  { rank: 12, name: "You", points: 12450, isCurrentUser: true },
  { rank: 13, name: "John Doe", points: 11200 },
];

export const mockUserData = {
  currentPoints: 12450,
  tier: "Gold" as const,
  expiringSoon: 450,
  expiryDate: "2025-04-20",
  referralCode: "EZEE-99-PROMO",
  totalReferrals: 12,
};
