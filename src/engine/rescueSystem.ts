import {
  RescueMission,
  RescueMissionType,
  RescueReward,
  OrderItem,
  CandyType,
  Train,
  PlayerProfile,
  BASIC_CANDY_TYPES,
  RescueResult,
} from '@/types';
import { STATIONS, RESCUE_CONFIG, RESCUE_MISSION_TEMPLATES } from '@/data/config';
import { getCandyLoad } from './loadingSystem';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function shouldSpawnRescue(movesUsed: number, activeMission: RescueMission | null): boolean {
  if (activeMission) return false;
  if (movesUsed < RESCUE_CONFIG.MIN_MOVES_BEFORE_SPAWN) return false;
  return Math.random() < RESCUE_CONFIG.SPAWN_CHANCE;
}

export function generateRescueMission(
  currentStationId: string,
  reputation: number
): RescueMission {
  const availableStations = STATIONS.filter(s => s.reputationRequired <= reputation);
  const otherStations = availableStations.filter(s => s.id !== currentStationId);
  const targetStation = otherStations.length > 0 && Math.random() > 0.3
    ? otherStations[Math.floor(Math.random() * otherStations.length)]
    : availableStations[Math.floor(Math.random() * availableStations.length)];

  const missionType: RescueMissionType = Math.random() > 0.5
    ? 'stranded_train'
    : 'out_of_stock_station';

  const templates = RESCUE_MISSION_TEMPLATES[missionType];
  const title = templates.titles[Math.floor(Math.random() * templates.titles.length)];
  const description = templates.descriptions[Math.floor(Math.random() * templates.descriptions.length)];

  const difficultyLevel = Math.min(
    Math.floor(reputation / 200) + 1,
    5
  );

  const itemCount = Math.min(2 + Math.floor(difficultyLevel / 2), 4);
  const baseQuantity = 3 + difficultyLevel * 2;

  const availableTypes = shuffle([...BASIC_CANDY_TYPES]);
  const selectedTypes = availableTypes.slice(0, itemCount);

  const requirements: OrderItem[] = selectedTypes.map(type => ({
    candyType: type,
    quantity: baseQuantity + Math.floor(Math.random() * 4),
  }));

  const totalQuantity = requirements.reduce((sum, r) => sum + r.quantity, 0);
  const rewardMultiplier = 1 + (difficultyLevel - 1) * 0.2;

  const reward: RescueReward = {
    badge: Math.min(
      RESCUE_CONFIG.MIN_REWARD_BADGE + Math.floor(Math.random() * 2),
      RESCUE_CONFIG.MAX_REWARD_BADGE
    ),
    emergencyCoins: Math.floor(
      (RESCUE_CONFIG.MIN_REWARD_COINS + totalQuantity * 3) * rewardMultiplier
    ),
    stationFavor: Math.min(
      RESCUE_CONFIG.MIN_STATION_FAVOR + Math.floor(difficultyLevel * 3),
      RESCUE_CONFIG.MAX_STATION_FAVOR
    ),
    stationId: targetStation.id,
  };

  const mapPosition = {
    row: 1 + Math.floor(Math.random() * 6),
    col: 1 + Math.floor(Math.random() * 6),
  };

  return {
    id: generateId(),
    type: missionType,
    title,
    description,
    stationName: targetStation.name,
    stationId: targetStation.id,
    requirements,
    reward,
    timeLimit: RESCUE_CONFIG.TIME_LIMIT_MS,
    createdAt: Date.now(),
    isActive: true,
    mapPosition,
  };
}

export function getRemainingTime(mission: RescueMission): number {
  const elapsed = Date.now() - mission.createdAt;
  return Math.max(0, mission.timeLimit - elapsed);
}

export function isMissionExpired(mission: RescueMission): boolean {
  return getRemainingTime(mission) <= 0;
}

export function canCompleteRescue(
  train: Train,
  mission: RescueMission,
  rescueItems: OrderItem[]
): boolean {
  for (const req of mission.requirements) {
    const allocated = rescueItems.find(r => r.candyType === req.candyType)?.quantity || 0;
    if (allocated < req.quantity) {
      return false;
    }
  }
  return true;
}

export function calculateRescueResult(
  train: Train,
  mission: RescueMission,
  rescueItems: OrderItem[]
): RescueResult {
  const itemsSent: OrderItem[] = [];
  const itemsMissing: OrderItem[] = [];

  for (const req of mission.requirements) {
    const allocated = rescueItems.find(r => r.candyType === req.candyType)?.quantity || 0;
    if (allocated >= req.quantity) {
      itemsSent.push({ ...req });
    } else if (allocated > 0) {
      itemsSent.push({ candyType: req.candyType, quantity: allocated });
      itemsMissing.push({ candyType: req.candyType, quantity: req.quantity - allocated });
    } else {
      itemsMissing.push({ ...req });
    }
  }

  const success = itemsMissing.length === 0;

  return {
    success,
    missionId: mission.id,
    reward: mission.reward,
    itemsSent,
    itemsMissing,
  };
}

export function applyRescueToTrain(
  train: Train,
  rescueItems: OrderItem[]
): Train {
  const newCarriages = train.carriages.map(c => ({ ...c }));

  for (const item of rescueItems) {
    const carriage = newCarriages.find(c => c.candyType === item.candyType);
    if (carriage) {
      carriage.currentLoad = Math.max(0, carriage.currentLoad - item.quantity);
    }
  }

  return {
    ...train,
    carriages: newCarriages,
  };
}

export function applyRescueReward(
  profile: PlayerProfile,
  result: RescueResult
): PlayerProfile {
  const newFavors = { ...profile.stationFavors };

  if (result.success) {
    newFavors[result.reward.stationId] =
      (newFavors[result.reward.stationId] || 0) + result.reward.stationFavor;

    return {
      ...profile,
      rescueBadges: profile.rescueBadges + result.reward.badge,
      emergencyCoins: profile.emergencyCoins + result.reward.emergencyCoins,
      stationFavors: newFavors,
      totalRescues: profile.totalRescues + 1,
    };
  }

  return {
    ...profile,
    totalRescues: profile.totalRescues + 1,
  };
}

export function getAvailableForRescue(
  train: Train,
  candyType: CandyType,
  rescueItems: OrderItem[]
): number {
  const loaded = getCandyLoad(train, candyType);
  const allocated = rescueItems.find(r => r.candyType === candyType)?.quantity || 0;
  return Math.max(0, loaded - allocated);
}

export function allocateToRescue(
  rescueItems: OrderItem[],
  candyType: CandyType,
  amount: number
): OrderItem[] {
  const existing = rescueItems.find(r => r.candyType === candyType);
  if (existing) {
    return rescueItems.map(r =>
      r.candyType === candyType
        ? { ...r, quantity: Math.max(0, r.quantity + amount) }
        : r
    );
  }
  return [...rescueItems, { candyType, quantity: Math.max(0, amount) }];
}

export function deallocateFromRescue(
  rescueItems: OrderItem[],
  candyType: CandyType,
  amount: number
): OrderItem[] {
  return rescueItems
    .map(r =>
      r.candyType === candyType
        ? { ...r, quantity: Math.max(0, r.quantity - amount) }
        : r
    )
    .filter(r => r.quantity > 0);
}

export function getTotalAllocated(rescueItems: OrderItem[]): number {
  return rescueItems.reduce((sum, r) => sum + r.quantity, 0);
}

export function getBadgeDiscount(badges: number): number {
  return Math.min(badges * RESCUE_CONFIG.BADGE_DISCOUNT_RATE, 0.5);
}

export function getStationFavorBonus(stationId: string, favors: Record<string, number>): number {
  return (favors[stationId] || 0) * RESCUE_CONFIG.FAVOR_BONUS_RATE;
}
