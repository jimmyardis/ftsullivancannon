export type AmmoType = 'roundshot' | 'chainshot' | 'grapeshot' | 'heatedshot';
export type ShipType = 'sloop' | 'frigate' | 'shipoftheline' | 'bombvessel' | 'trooptransport';
export type WeatherType = 'calm' | 'lightwind' | 'heavywind' | 'storm';
export type GamePhase = 'wave_intro' | 'playing' | 'wave_complete' | 'game_over' | 'victory';

export interface Vec2 {
  x: number;
  y: number;
}

export interface Ship {
  id: string;
  type: ShipType;
  x: number;
  y: number;
  speed: number;
  baseSpeed: number;
  health: number;
  maxHealth: number;
  sailDamage: number;
  isOnFire: boolean;
  fireTimer: number;
  fireInterval: number;
  width: number;
  height: number;
  sunk: boolean;
  sinking: boolean;
  sinkTimer: number;
  counted: boolean;
}

export interface Cannonball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: AmmoType;
  fromPlayer: boolean;
  radius: number;
  trail: Vec2[];
  active: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'smoke' | 'spark' | 'splash' | 'debris' | 'fire';
  gravity: boolean;
}

export interface FortZoneState {
  label: string;
  health: number;
  maxHealth: number;
}

export interface Ability {
  type: 'volley' | 'repair' | 'fastload' | 'holdfire';
  label: string;
  key: string;
  cooldown: number;
  maxCooldown: number;
  activeTimer: number;
  activeDuration: number;
}

export interface WeatherState {
  type: WeatherType;
  windForce: number;
  label: string;
}

export interface SpawnEntry {
  type: ShipType;
  delay: number;
}

export interface WaveState {
  currentWave: number;
  spawnQueue: SpawnEntry[];
  nextSpawnTime: number;
  factTimer: number;
  currentFact: string | null;
  introTimer: number;
  cleared: boolean;
}

export interface ComboState {
  multiplier: number;
  count: number;
  idleTimer: number;
  displayText: string;
  displayTimer: number;
  displayX: number;
  displayY: number;
}

export interface AmmoState {
  selected: AmmoType;
  reloading: boolean;
  reloadProgress: number;
  reloadTime: number;
  heatedUnlocked: boolean;
}

export interface GameState {
  phase: GamePhase;
  ships: Ship[];
  cannonballs: Cannonball[];
  particles: Particle[];
  fort: {
    zones: FortZoneState[];
    totalHealth: number;
    maxTotalHealth: number;
  };
  crew: {
    total: number;
    alive: number;
  };
  score: number;
  combo: ComboState;
  ammo: AmmoState;
  aimAngle: number;
  weather: WeatherState;
  wave: WaveState;
  abilities: Ability[];
  totalShots: number;
  hits: number;
  totalShipsDestroyed: number;
  holdFireActive: boolean;
  fastLoadActive: boolean;
  volleyQueued: number;
  oceanOffset: number;
  time: number;
  cannonRecoil: number;
  smokeTimer: number;
}

export interface GameResult {
  won: boolean;
  score: number;
  accuracy: number;
  shipsDestroyed: number;
  crewSaved: number;
  waveReached: number;
  commanderRank: string;
}

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  accuracy: number;
  ships_destroyed: number;
  crew_saved: number;
  wave_reached: number;
  commander_rank: string;
  created_at: string;
}
