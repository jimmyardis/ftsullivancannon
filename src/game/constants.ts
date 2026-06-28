import type { SpawnEntry, WeatherType } from '../types/game';

export const CANVAS_W = 1280;
export const CANVAS_H = 720;

export const WATER_Y = 460;
export const FORT_RIGHT = 215;
export const CANNON_X = 192;
export const CANNON_Y = 412;

export const GRAVITY = 420;

export const AMMO = {
  roundshot:  { label: 'Round Shot',   key: '1', speed: 660, reload: 3.5,  radius: 7,  hullDmg: 38,  sailDmg: 0,    crewDmg: 5,  firePct: 0,   color: '#2a2a2a', range: 1400 },
  chainshot:  { label: 'Chain Shot',   key: '2', speed: 540, reload: 5.0,  radius: 11, hullDmg: 10,  sailDmg: 0.35, crewDmg: 8,  firePct: 0,   color: '#4a2a0a', range: 900  },
  grapeshot:  { label: 'Grape Shot',   key: '3', speed: 480, reload: 4.0,  radius: 13, hullDmg: 8,   sailDmg: 0.05, crewDmg: 45, firePct: 0,   color: '#5a4a2a', range: 600  },
  heatedshot: { label: 'Heated Shot',  key: '4', speed: 580, reload: 9.0,  radius: 8,  hullDmg: 32,  sailDmg: 0.1,  crewDmg: 10, firePct: 0.7, color: '#cc4400', range: 1200 },
} as const;

export const SHIPS = {
  sloop:        { w: 82,  h: 42,  hp: 80,  speed: 44, interval: 9.0, score: 100, shotDmg: 12 },
  frigate:      { w: 135, h: 58,  hp: 190, speed: 28, interval: 5.5, score: 250, shotDmg: 22 },
  shipoftheline:{ w: 205, h: 78,  hp: 420, speed: 14, interval: 3.2, score: 500, shotDmg: 38 },
  bombvessel:   { w: 115, h: 52,  hp: 140, speed: 11, interval: 5.8, score: 350, shotDmg: 48 },
  trooptransport:{ w: 155, h: 64, hp: 240, speed: 32, interval: 11.0,score: 420, shotDmg: 16 },
} as const;

export const BOMB_HOLD_X = 720;
export const SHORE_X = 250;

export const WAVES: SpawnEntry[][] = [
  // Wave 1 — training
  [
    { type: 'sloop', delay: 2 },
    { type: 'sloop', delay: 9 },
  ],
  // Wave 2 — light attack
  [
    { type: 'sloop', delay: 1 },
    { type: 'frigate', delay: 5 },
    { type: 'sloop', delay: 11 },
  ],
  // Wave 3 — mixed, crosswinds
  [
    { type: 'frigate', delay: 2 },
    { type: 'bombvessel', delay: 5 },
    { type: 'sloop', delay: 9 },
    { type: 'frigate', delay: 14 },
  ],
  // Wave 4 — heavy fleet, heated shot unlocked
  [
    { type: 'frigate', delay: 1 },
    { type: 'shipoftheline', delay: 4 },
    { type: 'sloop', delay: 7 },
    { type: 'trooptransport', delay: 10 },
    { type: 'bombvessel', delay: 13 },
  ],
  // Wave 5 — historical attack
  [
    { type: 'sloop', delay: 0 },
    { type: 'frigate', delay: 2 },
    { type: 'frigate', delay: 5 },
    { type: 'shipoftheline', delay: 6 },
    { type: 'bombvessel', delay: 8 },
    { type: 'trooptransport', delay: 10 },
    { type: 'shipoftheline', delay: 13 },
    { type: 'sloop', delay: 16 },
  ],
];

export const WEATHER_BY_WAVE: WeatherType[] = ['calm', 'calm', 'lightwind', 'heavywind', 'lightwind'];

export const WEATHER_CONFIG = {
  calm:      { windForce: 0,    label: 'Calm' },
  lightwind: { windForce: 35,   label: 'Light Wind' },
  heavywind: { windForce: 90,   label: 'Heavy Wind' },
  storm:     { windForce: 160,  label: 'Storm' },
} as const;

export const HISTORICAL_FACTS = [
  'The palmetto log walls absorbed British cannon fire rather than shattering — the soft wood simply swallowed the iron balls.',
  'Colonel William Moultrie commanded the fort with fewer than 500 men against a British fleet of over 2,800 soldiers and sailors.',
  'Sergeant William Jasper famously retrieved the fallen fort flag under heavy fire and remounted it on his spontoon.',
  'The battle on June 28, 1776 — just days before the Declaration of Independence — was a decisive American victory.',
  'The fort was renamed Fort Moultrie in honor of Colonel Moultrie after the victory.',
  'The British fleet, commanded by Sir Peter Parker, suffered heavy casualties and was forced to retreat to New York.',
  'Fort Sullivan was still under construction during the battle. The men fought from an unfinished position.',
  'The engagement lasted about nine hours. The Americans held throughout.',
];

export const COMMANDER_RANKS = [
  { min: 0,     rank: 'Powder Monkey' },
  { min: 400,   rank: 'Gunner' },
  { min: 1200,  rank: 'Master Gunner' },
  { min: 2500,  rank: 'Lieutenant' },
  { min: 4500,  rank: 'Captain' },
  { min: 7500,  rank: 'Colonel' },
  { min: 11000, rank: 'William Moultrie' },
];

export const FORT_ZONES = [
  { label: 'Walls',          maxHp: 120 },
  { label: 'Cannon',         maxHp: 80  },
  { label: 'Powder Magazine',maxHp: 60  },
  { label: 'Observation Tower', maxHp: 50 },
];

export const TOTAL_CREW = 28;
