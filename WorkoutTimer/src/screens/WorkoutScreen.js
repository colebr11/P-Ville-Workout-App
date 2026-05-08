import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import CircularProgress from '../components/CircularProgress';
import { COLORS, PHASE, PHASE_CONFIG, SPACING } from '../constants/theme';
import { formatTime } from '../utils/formatTime';
import { useAudio } from '../hooks/useAudio';

const TICK_MS = 100;

export default function WorkoutScreen({ route, navigation }) {
  useKeepAwake();

  const insets = useSafeAreaInsets();
  const { config } = route.params;
  const { handleTick, resetAnnouncements } = useAudio();

  const [phase, setPhase] = useState(PHASE.SPRINT);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(config.work);
  const [phaseDuration, setPhaseDuration] = useState(config.work);
  const [paused, setPaused] = useState(false);

  const phaseRef = useRef(PHASE.SPRINT);
  const timeRef = useRef(config.work);
  const phaseDurRef = useRef(config.work);
  const setRef = useRef(1);
  const repRef = useRef(1);
  const pausedRef = useRef(false);
  const lastTickRef = useRef(Date.now());

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const triggerHaptic = useCallback((type) => {
    try {
      if (type === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      else if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  }, []);

  const triggerPulse = useCallback(() => {
    pulseAnim.setValue(1.06);
    Animated.spring(pulseAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  }, [pulseAnim]);

  const doTransition = useCallback(() => {
    const p = phaseRef.current;
    const rep = repRef.current;
    const set = setRef.current;

    let nextPhase, nextDur, nextRep = rep, nextSet = set;

    if (p === PHASE.SPRINT) {
      if (rep < config.reps) {
        nextPhase = PHASE.REST;
        nextDur = config.rest;
        triggerHaptic('medium');
      } else if (set < config.sets) {
        nextPhase = PHASE.SET_REST;
        nextDur = config.setRest;
        triggerHaptic('heavy');
        nextRep = config.reps;
      } else {
        nextPhase = PHASE.DONE;
        nextDur = 0;
        triggerHaptic('success');
        setPaused(true);
        pausedRef.current = true;
      }
    } else if (p === PHASE.REST) {
      nextPhase = PHASE.SPRINT;
      nextDur = config.work;
      nextRep = rep + 1;
      triggerHaptic('medium');
    } else if (p === PHASE.SET_REST) {
      nextPhase = PHASE.SPRINT;
      nextDur = config.work;
      nextRep = 1;
      nextSet = set + 1;
      triggerHaptic('heavy');
    }

    if (nextPhase) {
      // Reset announcements whenever phase changes
      resetAnnouncements();

      phaseRef.current = nextPhase;
      repRef.current = nextRep;
      setRef.current = nextSet;
      timeRef.current = nextDur;
      phaseDurRef.current = nextDur;
      setPhase(nextPhase);
      setCurrentRep(nextRep);
      setCurrentSet(nextSet);
      setTimeRemaining(nextDur);
      setPhaseDuration(nextDur);
      triggerPulse();
    }
  }, [config, triggerHaptic, triggerPulse, resetAnnouncements]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (pausedRef.current || phaseRef.current === PHASE.DONE || phaseRef.current === PHASE.IDLE) return;

      const now = Date.now();
      const elapsed = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      const newTime = timeRef.current - elapsed;

      // Fire audio on every tick
      handleTick(phaseRef.current, newTime, phaseDurRef.current);

      if (newTime <= 0) {
        timeRef.current = 0;
        setTimeRemaining(0);
        doTransition();
      } else {
        timeRef.current = newTime;
        setTimeRemaining(newTime);
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [doTransition, handleTick]);

  const handlePauseResume = () => {
    if (phase === PHASE.DONE) return;
    const next = !paused;
    setPaused(next);
    pausedRef.current = next;
    if (!next) lastTickRef.current = Date.now();
    triggerHaptic('medium');
  };

  const handleExit = () => navigation.goBack();

  const pc = PHASE_CONFIG[phase] || PHASE_CONFIG[PHASE.IDLE];
  const progress = phaseDuration > 0 ? timeRemaining / phaseDuration : 1;
  const urgent = phase === PHASE.SPRINT && timeRemaining <= 3 && timeRemaining > 0;
  const completedReps = (currentSet - 1) * config.reps + (currentRep - 1);
  const totalReps = config.sets * config.reps;
  const overallProgress = totalReps > 0 ? completedReps / totalReps : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.exitBtn} activeOpacity={0.7}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WORKOUT</Text>
        <View style={styles.exitBtn} />
      </View>

      <View style={styles.chipsRow}>
        <View style={[styles.chip, phase === PHASE.DONE && { borderColor: pc.color }]}>
          <Text style={styles.chipLabel}>SET</Text>
          <Text style={[styles.chipVal, { color: pc.color }]}>
            {phase === PHASE.DONE ? config.sets : currentSet}
            <Text style={styles.chipOf}>/{config.sets}</Text>
          </Text>
        </View>
        <View style={[styles.chip, phase === PHASE.DONE && { borderColor: pc.color }]}>
          <Text style={styles.chipLabel}>REP</Text>
          <Text style={[styles.chipVal, { color: pc.color }]}>
            {phase === PHASE.DONE ? config.reps : currentRep}
            <Text style={styles.chipOf}>/{config.reps}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.timerWrap}>
        <CircularProgress
          progress={progress}
          color={urgent ? '#FF6B6B' : pc.color}
          dimColor={pc.dimColor}
        />
        <Animated.View style={[styles.timerCenter, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.phaseLabel}>{paused && phase !== PHASE.DONE ? 'PAUSED' : pc.label}</Text>
          <Text style={[styles.countdown, urgent && styles.countdownUrgent]}>
            {phase === PHASE.DONE ? '🏁' : formatTime(timeRemaining)}
          </Text>
          {phase === PHASE.DONE && (
            <Text style={[styles.doneText, { color: pc.color }]}>COMPLETE</Text>
          )}
        </Animated.View>
      </View>

      <View style={styles.overallWrap}>
        <Text style={styles.overallLabel}>{completedReps} / {totalReps} REPS</Text>
        <View style={styles.overallTrack}>
          <View style={[styles.overallFill, { width: `${overallProgress * 100}%`, backgroundColor: pc.color }]} />
        </View>
      </View>

      <View style={styles.controls}>
        {phase !== PHASE.DONE ? (
          <TouchableOpacity
            style={[styles.mainBtn, { borderColor: pc.color }]}
            onPress={handlePauseResume}
            activeOpacity={0.8}
          >
            <Text style={[styles.mainBtnText, { color: pc.color }]}>
              {paused ? 'RESUME' : 'PAUSE'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.mainBtn, { backgroundColor: pc.color, borderColor: pc.color }]}
            onPress={handleExit}
            activeOpacity={0.8}
          >
            <Text style={[styles.mainBtnText, { color: '#000' }]}>DONE</Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center' },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  exitBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  exitText: { color: COLORS.textSecondary, fontSize: 18 },
  headerTitle: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 4 },
  chipsRow: { flexDirection: 'row', gap: 12, marginVertical: SPACING.md },
  chip: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 100,
  },
  chipLabel: { fontSize: 10, color: COLORS.textSecondary, letterSpacing: 2, fontWeight: '600', marginBottom: 2 },
  chipVal: { fontSize: 22, fontWeight: '800', fontFamily: 'monospace' },
  chipOf: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  timerWrap: {
    width: 260, height: 260,
    alignItems: 'center', justifyContent: 'center',
    marginVertical: SPACING.lg,
  },
  timerCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  phaseLabel: { fontSize: 12, color: COLORS.textSecondary, letterSpacing: 4, fontWeight: '700', marginBottom: 4 },
  countdown: { fontSize: 64, fontWeight: '800', color: COLORS.textPrimary, fontFamily: 'monospace', letterSpacing: -2 },
  countdownUrgent: { color: COLORS.sprint },
  doneText: { fontSize: 13, fontWeight: '700', letterSpacing: 3, marginTop: 4 },
  overallWrap: { width: '100%', paddingHorizontal: SPACING.xl, marginBottom: SPACING.xl },
  overallLabel: { fontSize: 11, color: COLORS.textSecondary, letterSpacing: 2, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  overallTrack: { height: 3, backgroundColor: COLORS.surfaceAlt, borderRadius: 2, overflow: 'hidden' },
  overallFill: { height: '100%', borderRadius: 2 },
  controls: { width: '100%', paddingHorizontal: SPACING.xl },
  mainBtn: { borderRadius: 14, paddingVertical: 18, alignItems: 'center', borderWidth: 2 },
  mainBtnText: { fontSize: 16, fontWeight: '800', letterSpacing: 4 },
});
