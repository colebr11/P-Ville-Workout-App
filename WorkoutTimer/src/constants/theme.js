export const COLORS = {
  bg: '#0A0E14',
  surface: '#121921',
  surfaceAlt: '#1C1C1C',
  border: '#2A2A2A',

  sprint: '#B3541E',
  sprintDim: '#3D1410',
  rest: '#00407A',
  restDim: '#0D3318',
  setRest: '#4A5568',
  setRestDim: '#051F3D',
  done: '#FFD60A',
  doneDim: '#3D3200',

  textPrimary: '#FFFFFF',
  textSecondary: '#8A8A8E',
  textTertiary: '#48484A',

  accent: '#B3541E',
};

export const FONTS = {
  mono: 'monospace',
  sans: 'System',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const PHASE = {
  IDLE: 'IDLE',
  SPRINT: 'SPRINT',
  REST: 'REST',
  SET_REST: 'SET_REST',
  DONE: 'DONE',
};

export const PHASE_CONFIG = {
  [PHASE.SPRINT]: {
    label: 'WORK',
    color: '#FF3B30',
    dimColor: '#3D1410',
  },
  [PHASE.REST]: {
    label: 'REST',
    color: '#30D158',
    dimColor: '#0D3318',
  },
  [PHASE.SET_REST]: {
    label: 'SET REST',
    color: '#0A84FF',
    dimColor: '#051F3D',
  },
  [PHASE.DONE]: {
    label: 'DONE',
    color: '#FFD60A',
    dimColor: '#3D3200',
  },
  [PHASE.IDLE]: {
    label: 'READY',
    color: '#8A8A8E',
    dimColor: '#1C1C1C',
  },
};
