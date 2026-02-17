export type ReplayTurnData = {
  id: number;
  name: string;
  password: string | null;
  creator: number;
  start_date: string;       // Date
  end_date: string;         // Date
  activity_date: string;    // Date
  maps_id: number;
  weather_type: string;
  weather_start: string | null;
  weather_code: string;
  win_condition: string | null;
  turn: number;
  day: number;
  active: string;           // boolean
  funds: number;
  capture_win: number;
  fog: string;              // boolean
  comment: string | null;
  type: string;
  boot_interval: number;
  starting_funds: number;
  official: string;         // boolean
  min_rating: number | null;
  max_rating: number | null;
  league: string;           // boolean
  team: string;             // boolean
  aet_interval: number;
  aet_date: string;         // Date
  use_powers: string;       // boolean
  players: Player[];
  buildings: Building[];
  units: Unit[];
  timers_initial: number;
  timers_incremental: number;
  timers_max_turn: number;
};

type Player = {
  id: number;
  users_id: number;
  games_id: number;
  countries_id: number;
  co_id: number;
  funds: number;
  turn: string | null;
  email: string | null;
  uniq_id: string | null;
  eliminated: string;   // boolean
  last_read: string;    // Date
  last_read_broadcasts: string | null;
  emailpress: string | null;
  signature: string | null;
  co_power: number;
  co_power_on: string;
  order: number;
  accept_draw: string;  // boolean
  co_max_power: number | null;
  co_max_spower: number | null;
  co_image: string;
  team: string;
  aet_count: number;
  turn_start: string;   // Date
  turn_clock: number;
  tags_co_id: number | null;
  tags_co_power: number | null;
  tags_co_max_power: number | null;
  tags_co_max_spower: number | null;
  interface: string;    // boolean
};

type Building = {
  id: number;
  games_id: number;
  terrain_id: number;
  x: number;
  y: number;
  capture: number;
  last_capture: number;
  last_updated: string; // Date
};

type Unit = {
  id: number;
  games_id: number;
  players_id: number;
  name: string;
  movement_points: number;
  vision: number;
  fuel: number;
  fuel_per_turn: number;
  sub_dive: string;         // boolean
  ammo: number;
  short_range: number;
  long_range: number;
  second_weapon: string;    // boolean
  symbol: string;
  cost: number;
  movement_type: string;
  x: number;
  y: number;
  moved: number;
  capture: number;
  fired: number;
  hit_points: number;
  cargo1_units_id: number;
  cargo2_units_id: number;
  carried: string;          // boolean
};
