import { CandyType, Station, Train, BOARD_SIZE } from '@/types';

export const CANDY_CONFIG: Record<CandyType, { name: string; color: string; points: number; emoji: string }> = {
  strawberry: { name: '草莓糖', color: '#FF6B9D', points: 10, emoji: '🍓' },
  lemon: { name: '柠檬糖', color: '#FFD93D', points: 10, emoji: '🍋' },
  mint: { name: '薄荷糖', color: '#6BCB77', points: 10, emoji: '🍀' },
  blueberry: { name: '蓝莓糖', color: '#4D96FF', points: 10, emoji: '🫐' },
  grape: { name: '葡萄糖', color: '#9B59B6', points: 10, emoji: '🍇' },
  rainbow: { name: '彩虹糖', color: 'linear-gradient(135deg, #FF6B9D, #FFD93D, #6BCB77, #4D96FF, #9B59B6)', points: 50, emoji: '🌈' },
  bomb: { name: '炸弹糖', color: '#FF4757', points: 30, emoji: '💣' },
};

export const STATIONS: Station[] = [
  {
    id: 'candy-town',
    name: '糖果小镇',
    reputationRequired: 0,
    themeColor: '#FF6B9D',
    description: '甜蜜的起点，适合新手列车长',
  },
  {
    id: 'lemon-estate',
    name: '柠檬庄园',
    reputationRequired: 100,
    themeColor: '#FFD93D',
    description: '酸爽的柠檬订单，需要更多技巧',
  },
  {
    id: 'mint-forest',
    name: '薄荷森林',
    reputationRequired: 300,
    themeColor: '#6BCB77',
    description: '急单频发的森林车站',
  },
  {
    id: 'blueberry-port',
    name: '蓝莓港口',
    reputationRequired: 600,
    themeColor: '#4D96FF',
    description: '大额订单的港口贸易站',
  },
  {
    id: 'grape-castle',
    name: '葡萄城堡',
    reputationRequired: 1000,
    themeColor: '#9B59B6',
    description: '皇家级别的复杂订单',
  },
];

export const INITIAL_TRAIN: Train = {
  id: 'candy-express',
  name: '糖果快车',
  carriages: [
    { id: 'car-1', candyType: 'strawberry', capacity: 20, currentLoad: 0 },
    { id: 'car-2', candyType: 'lemon', capacity: 20, currentLoad: 0 },
    { id: 'car-3', candyType: 'mint', capacity: 20, currentLoad: 0 },
    { id: 'car-4', candyType: 'blueberry', capacity: 20, currentLoad: 0 },
    { id: 'car-5', candyType: 'grape', capacity: 20, currentLoad: 0 },
  ],
};

export const RESCUE_CONFIG = {
  SPAWN_CHANCE: 0.25,
  MIN_MOVES_BEFORE_SPAWN: 3,
  TIME_LIMIT_MS: 120000,
  MIN_REWARD_BADGE: 1,
  MAX_REWARD_BADGE: 3,
  MIN_REWARD_COINS: 20,
  MAX_REWARD_COINS: 80,
  MIN_STATION_FAVOR: 5,
  MAX_STATION_FAVOR: 20,
  BADGE_DISCOUNT_RATE: 0.05,
  FAVOR_BONUS_RATE: 0.1,
};

export const RESCUE_MISSION_TEMPLATES: Record<string, {
  titles: string[];
  descriptions: string[];
}> = {
  stranded_train: {
    titles: ['🚂 被困糖车求助', '⚠️ 列车紧急求救', '🆘 铁路救援委托'],
    descriptions: [
      '一列糖车在山区铁路故障，急需糖果补给维持物资供应！',
      '偏远地区的糖车遭遇雪崩被困，需要紧急运送糖果救援！',
      '铁路线路中断，被困列车上的乘客急需糖果补给！',
    ],
  },
  out_of_stock_station: {
    titles: ['🏪 站台缺货紧急', '📦 物资告急', '🏭 工厂缺货求助'],
    descriptions: [
      '热门旅游车站糖果售罄，游客强烈不满，急需补货！',
      '节日期间糖果需求暴增，站台库存告急需要支援！',
      '附近糖果工厂临时停产，急需从其他渠道调配糖果！',
    ],
  },
};

export const GAME_CONFIG = {
  BOARD_SIZE,
  INITIAL_MOVES: 30,
  COMBO_BONUS_MULTIPLIER: 0.5,
  MATCH_MIN: 3,
  FOUR_MATCH_SPECIAL: 'bomb' as const,
  FIVE_MATCH_SPECIAL: 'rainbow' as const,
  DISPATCH_BASE_REWARD: 50,
  MISMATCH_PENALTY_RATE: 0.3,
  URGENT_BONUS_RATE: 0.5,
  REPUTATION_PER_SUCCESS: 10,
  REPUTATION_PER_FAIL: -5,
  LOAD_PER_MATCH: 1,
};
