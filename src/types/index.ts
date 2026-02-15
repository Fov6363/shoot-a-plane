// 游戏类型定义

export interface GameConfig {
  WIDTH: number;
  HEIGHT: number;
  PLAYER: PlayerConfig;
  EXPERIENCE: ExperienceConfig;
  BOSS: BossConfig;
  DIFFICULTY: DifficultyConfig;
  GOLD: GoldConfig;
  ENEMY_TYPES: Record<string, EnemyTypeConfig>;
  PHYSICS: PhysicsConfig;
  COLORS: ColorConfig;
}

export interface PlayerConfig {
  INITIAL_HP: number;
  INITIAL_SPEED: number;
  FIRE_RATE: number;
  BULLET_SPEED: number;
  BULLET_DAMAGE: number;
}

export interface ExperienceConfig {
  BASE_LEVEL_XP: number;
  SMALL_ENEMY_XP: number;
  MEDIUM_ENEMY_XP: number;
  LARGE_ENEMY_XP: number;
  BOSS_XP: number;
}

export interface BossConfig {
  STAGE_DURATION: number;
  BASE_HP: number;
  HP_PER_STAGE: number;
  BASE_SCORE: number;
}

export interface DifficultyConfig {
  SPAWN_RATE_INCREASE: number;
  HP_INCREASE: number;
  BULLET_SPEED_INCREASE: number;
}

export interface EnemyTypeConfig {
  hp: number;
  score: number;
  xp: number;
  speed: number;
  gold: number;
}

export interface GoldConfig {
  BOSS_BASE_GOLD: number;
  BOSS_GOLD_PER_STAGE: number;
}

export interface PhysicsConfig {
  GRAVITY_Y: number;
}

export interface ColorConfig {
  PLAYER: number;
  ENEMY: number;
  BULLET: number;
  ENEMY_BULLET: number;
  XP_ORB: number;
  BOSS: number;
}

export interface UpgradeConfig {
  id: string;
  name: string;
  description: string;
  type: 'stat' | 'weapon' | 'skill';
  repeatable: boolean;
  maxLevel: number;
  value?: number;
  apply: (player: any, level: number) => void;
}

export interface UpgradeOption extends UpgradeConfig {
  currentLevel: number;
  nextLevel: number;
}

export interface EnemyKilledData {
  x: number;
  y: number;
  xp: number;
  score: number;
  gold: number;
}

export interface BossKilledData extends EnemyKilledData {
  stage: number;
}

export interface ShootData {
  x: number;
  y: number;
  velocityY?: number;
  angle?: number;
  speed?: number;
}

export interface InputState {
  x: number;
  y: number;
  shoot: boolean;
}

export interface SaveData {
  highScore: number;
  gamesPlayed: number;
  lastPlayed: number | null;
}
