/**
 * ASCEND Staking Logic
 *
 * This is a client-side staking system using Solana token accounts.
 * For production, you'd want an on-chain program (Anchor/Seahorse).
 * This simplified version uses time-locked token accounts.
 *
 * Staking tiers:
 *   - Seeker (100+ ASCEND):    1% monthly yield
 *   - Initiate (1000+ ASCEND): 2% monthly yield + premium card access
 *   - Master (10000+ ASCEND):  3% monthly yield + all decks + governance
 *   - Oracle (100000+ ASCEND): 5% monthly yield + all decks + governance + exclusive content
 *
 * To migrate to on-chain: port this logic to an Anchor program.
 */

export const STAKING_TIERS = [
  {
    name: 'Seeker',
    minStake: 100,
    monthlyYield: 0.01,
    benefits: ['Basic card readings'],
  },
  {
    name: 'Initiate',
    minStake: 1000,
    monthlyYield: 0.02,
    benefits: ['Premium card access', 'All readings'],
  },
  {
    name: 'Master',
    minStake: 10000,
    monthlyYield: 0.03,
    benefits: ['All decks', 'Governance voting', 'Priority support'],
  },
  {
    name: 'Oracle',
    minStake: 100000,
    monthlyYield: 0.05,
    benefits: ['Exclusive content', 'Early access', 'Revenue share', 'Custom readings'],
  },
];

export function getTier(stakedAmount) {
  for (let i = STAKING_TIERS.length - 1; i >= 0; i--) {
    if (stakedAmount >= STAKING_TIERS[i].minStake) {
      return STAKING_TIERS[i];
    }
  }
  return null;
}

export function calculateRewards(stakedAmount, tier, daysStaked) {
  const dailyRate = tier.monthlyYield / 30;
  return stakedAmount * dailyRate * daysStaked;
}

// Governance proposals
export const GOVERNANCE_PROPOSALS = [
  {
    id: 1,
    title: 'Create "Past Life" expansion deck',
    description: 'Fund development of a 30-card Past Life oracle deck',
    votesFor: 0,
    votesAgainst: 0,
    status: 'active',
  },
  {
    id: 2,
    title: 'Reduce staking lock period to 7 days',
    description: 'Allow faster unstaking for better liquidity',
    votesFor: 0,
    votesAgainst: 0,
    status: 'active',
  },
  {
    id: 3,
    title: 'Allocate 10% of treasury to LP pool',
    description: 'Add liquidity on Raydium for ASCEND/SOL pair',
    votesFor: 0,
    votesAgainst: 0,
    status: 'active',
  },
];
