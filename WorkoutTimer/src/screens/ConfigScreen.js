import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../constants/theme';
import { formatDuration } from '../utils/formatTime';

function StepInput({ label, value, onChange, min = 1, max = 999 }) {
  const step = label.includes('sec') ? 5 : 1;
  return (
    <View style={styles.stepRow}>
      <Text style={styles.stepLabel}>{label}</Text>
      <View style={styles.stepControls}>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => onChange(Math.max(min, value - step))}
          activeOpacity={0.7}
        >
          <Text style={styles.stepBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.stepValue}>{value}</Text>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => onChange(Math.min(max, value + step))}
          activeOpacity={0.7}
        >
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const DEFAULT_CONFIG = { work: 20, rest: 10, reps: 8, sets: 3, setRest: 60 };

// saveWorkout comes from App.js — shared state
export default function ConfigScreen({ saveWorkout }) {
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);

  const update = (key) => (val) => setConfig((c) => ({ ...c, [key]: val }));

  const totalReps = config.sets * config.reps;
  const totalSec =
    (config.work + config.rest) * totalReps -
    config.rest +
    (config.sets - 1) * config.setRest;

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Please give your workout a name before saving.');
      return;
    }
    saveWorkout({ name: trimmed, ...config });
    setSaved(true);
    setTimeout(() => {
      setName('');
      setConfig(DEFAULT_CONFIG);
      setSaved(false);
    }, 1500);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>NEW WORKOUT</Text>

        <Text style={styles.fieldLabel}>Workout name</Text>
        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Morning Tabata"
          placeholderTextColor={COLORS.textTertiary}
          maxLength={40}
          returnKeyType="done"
        />

        <Text style={styles.fieldLabel}>Intervals</Text>
        <View style={styles.card}>
          <StepInput label="Work (sec)" value={config.work} onChange={update('work')} min={5} max={3600} />
          <View style={styles.divider} />
          <StepInput label="Rest (sec)" value={config.rest} onChange={update('rest')} min={5} max={3600} />
          <View style={styles.divider} />
          <StepInput label="Reps / set" value={config.reps} onChange={update('reps')} min={1} max={50} />
          <View style={styles.divider} />
          <StepInput label="Sets" value={config.sets} onChange={update('sets')} min={1} max={20} />
          <View style={styles.divider} />
          <StepInput label="Set rest (sec)" value={config.setRest} onChange={update('setRest')} min={10} max={600} />
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>{totalReps}</Text>
            <Text style={styles.summaryLbl}>Total Reps</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>{config.sets}</Text>
            <Text style={styles.summaryLbl}>Sets</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>{formatDuration(totalSec)}</Text>
            <Text style={styles.summaryLbl}>Est. Time</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.saveBtnSuccess]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>
            {saved ? '✓  SAVED' : 'SAVE WORKOUT'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 48 },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 4,
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  nameInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: COLORS.border },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
  },
  stepLabel: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '500' },
  stepControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepBtnText: { color: COLORS.textPrimary, fontSize: 20, lineHeight: 22, fontWeight: '300' },
  stepValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
    minWidth: 52,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, fontFamily: 'monospace' },
  summaryLbl: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2, letterSpacing: 0.5 },
  summaryDivider: { width: 1, backgroundColor: COLORS.border },
  saveBtn: {
    backgroundColor: COLORS.sprint,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  saveBtnSuccess: { backgroundColor: COLORS.rest },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 3,
  },
});
