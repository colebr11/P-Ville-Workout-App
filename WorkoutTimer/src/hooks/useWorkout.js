import { useCallback, useEffect, useRef, useState } from 'react';
import { PHASE } from '../constants/theme';

const DEFAULT_CONFIG = {
  work: 20,
  rest: 10,
  reps: 8,
  sets: 3,
  setRest: 60,
};

export function useWorkout() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  const [workoutState, setWorkoutState] = useState({
    phase: PHASE.IDLE,
    currentSet: 1,
    currentRep: 1,
    timeRemaining: 0,
    phaseDuration: 0,
    paused: true,
  });

  const intervalRef = useRef(null);
  const lastTickRef = useRef(null);
  const stateRef = useRef(workoutState);
  const configRef = useRef(config);

  useEffect(() => { stateRef.current = workoutState; }, [workoutState]);
  useEffect(() => { configRef.current = config; }, [config]);

  const setState = useCallback((updater) => {
    setWorkoutState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      stateRef.current = next;
      return next;
    });
  }, []);

  const transition = useCallback((current, cfg) => {
    const { phase, currentSet, currentRep } = current;

    if (phase === PHASE.SPRINT) {
      if (currentRep < cfg.reps) {
        return { phase: PHASE.REST, duration: cfg.rest, currentRep, currentSet };
      } else if (currentSet < cfg.sets) {
        return { phase: PHASE.SET_REST, duration: cfg.setRest, currentRep, currentSet };
      } else {
        return { phase: PHASE.DONE, duration: 0, currentRep, currentSet };
      }
    } else if (phase === PHASE.REST) {
      return { phase: PHASE.SPRINT, duration: cfg.work, currentRep: currentRep + 1, currentSet };
    } else if (phase === PHASE.SET_REST) {
      return { phase: PHASE.SPRINT, duration: cfg.work, currentRep: 1, currentSet: currentSet + 1 };
    }
    return null;
  }, []);

  const tick = useCallback(() => {
    const now = Date.now();
    const elapsed = (now - (lastTickRef.current ?? now)) / 1000;
    lastTickRef.current = now;

    const current = stateRef.current;
    const cfg = configRef.current;

    if (current.paused || current.phase === PHASE.IDLE || current.phase === PHASE.DONE) return;

    const newTime = current.timeRemaining - elapsed;

    if (newTime <= 0) {
      const next = transition(current, cfg);
      if (!next) return;
      if (next.phase === PHASE.DONE) {
        setState((s) => ({
          ...s,
          phase: PHASE.DONE,
          timeRemaining: 0,
          phaseDuration: 0,
          paused: true,
        }));
      } else {
        setState((s) => ({
          ...s,
          phase: next.phase,
          timeRemaining: next.duration,
          phaseDuration: next.duration,
          currentRep: next.currentRep,
          currentSet: next.currentSet,
        }));
      }
    } else {
      setState((s) => ({ ...s, timeRemaining: newTime }));
    }
  }, [setState, transition]);

  useEffect(() => {
    intervalRef.current = setInterval(tick, 100);
    return () => clearInterval(intervalRef.current);
  }, [tick]);

  const start = useCallback(() => {
    const cfg = configRef.current;
    lastTickRef.current = Date.now();
    setState({
      phase: PHASE.SPRINT,
      currentSet: 1,
      currentRep: 1,
      timeRemaining: cfg.work,
      phaseDuration: cfg.work,
      paused: false,
    });
  }, [setState]);

  const pause = useCallback(() => {
    setState((s) => ({ ...s, paused: true }));
  }, [setState]);

  const resume = useCallback(() => {
    lastTickRef.current = Date.now();
    setState((s) => ({ ...s, paused: false }));
  }, [setState]);

  const reset = useCallback(() => {
    setState({
      phase: PHASE.IDLE,
      currentSet: 1,
      currentRep: 1,
      timeRemaining: 0,
      phaseDuration: 0,
      paused: true,
    });
  }, [setState]);

  const totalReps = config.sets * config.reps;
  const totalSeconds =
    (config.work + config.rest) * totalReps - config.rest +
    (config.sets - 1) * config.setRest;

  return {
    config,
    setConfig,
    workoutState,
    start,
    pause,
    resume,
    reset,
    totalReps,
    totalSeconds,
  };
}
