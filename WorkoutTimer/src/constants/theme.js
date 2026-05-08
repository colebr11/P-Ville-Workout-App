export const COLORS = {
  bg: '#0A0E14',         // Deep navy-black
  surface: '#121921',    // Darker blue-gray
  surfaceAlt: '#1B2531',
  border: '#2D3748',

  sprint: '#B3541E',     // Muted Burnt Orange (Work)
  sprintDim: '#3D1D0A',
  rest: '#00407A',       // Deep Pioneer Blue (Rest)
  restDim: '#051A2E',
  setRest: '#4A5568',    // Slate Gray (Neutral)
  setRestDim: '#1A202C',
  done: '#718096',
  doneDim: '#2D3748',

  textPrimary: '#F7FAFC',
  textSecondary: '#A0AEC0',
  textTertiary: '#4A5568',

  accent: '#B3541E',     // Orange accent
};

export const PHASE_CONFIG = {
  [PHASE.SPRINT]: {
    label: 'WORK',
    color: COLORS.sprint,
    dimColor: COLORS.sprintDim,
  },
  [PHASE.REST]: {
    label: 'REST',
    color: COLORS.rest,
    dimColor: COLORS.restDim,
  },
  [PHASE.SET_REST]: {
    label: 'SET REST',
    color: COLORS.setRest,
    dimColor: COLORS.setRestDim,
  },
  [PHASE.DONE]: {
    label: 'DONE',
    color: COLORS.done,
    dimColor: COLORS.doneDim,
  },
  [PHASE.IDLE]: {
    label: 'READY',
    color: COLORS.textSecondary,
    dimColor: COLORS.surfaceAlt,
  },
};