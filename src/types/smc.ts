export interface SMCPoint {
  time: number;
  price: number;
  type: "HH" | "HL" | "LH" | "LL";
  bias: string;
}

export interface SMCMtfLevel {
  price: number;
  time: number;
}

export interface SMCStrongWeak {
  strong_high: SMCMtfLevel;
  weak_high: SMCMtfLevel;
  strong_low: SMCMtfLevel;
  weak_low: SMCMtfLevel;
}

export interface SMCZone {
  top: number;
  bottom: number;
}

export interface SMCZoneEquilibrium {
  price: number;
}

export interface SMCZones {
  premium: SMCZone;
  equilibrium: SMCZoneEquilibrium;
  discount: SMCZone;
}

export interface SMCStructure {
  time: number;
  price: number;
  tag: string;
  bias: string;
}

export interface SMCOrderBlock {
  start_time: number;
  end_time: number;
  high: number;
  low: number;
  bias: string;
}

export interface SMCFVG {
  start_time: number;
  end_time: number;
  top: number;
  bottom: number;
  bias: string;
}

export interface SMCEQHEQL {
  time: number;
  price: number;
  matched_time: number;
  matched_price: number;
  type: "EQH" | "EQL";
}

export interface SMCCandleColor {
  time: number;
  color: string;
}

export interface SMCData {
  trend: string;
  internal_trend: string;
  structures: {
    internal: SMCStructure[];
    swing: SMCStructure[];
  };
  order_blocks: {
    internal: SMCOrderBlock[];
    swing: SMCOrderBlock[];
  };
  fvgs: SMCFVG[];
  eqh_eql: SMCEQHEQL[];
  swing_points: SMCPoint[];
  strong_weak: SMCStrongWeak;
  zones: SMCZones;
  mtf_levels: Record<string, { high: SMCMtfLevel; low: SMCMtfLevel }>;
  candle_colors: SMCCandleColor[];
}

export interface SMCVisibility {
  internal_structure: boolean;
  swing_structure: boolean;
  swing_points: boolean;
  strong_weak: boolean;
  internal_order_blocks: boolean;
  swing_order_blocks: boolean;
  fvg: boolean;
  eqh_eql: boolean;
  zones: boolean;
  mtf_levels: boolean;
  trend_candles: boolean;
}
