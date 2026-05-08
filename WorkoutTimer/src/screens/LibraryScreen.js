import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../constants/theme';
import { formatDuration } from '../utils/formatTime';

const ACCENT_COLORS = [
  '#FF3B30', '#0A84FF', '#30D158', '#FFD60A',
  '#FF9F0A', '#BF5AF2', '#FF375F', '#5AC8FA',
];

function getAccentColor(id) {
  const index = parseInt(id, 10) % ACCENT_COLORS.length;
  return ACCENT_COLORS[index] || ACCENT_COLORS[0];
}

// workouts, loaded, deleteWorkout all come from App.js — shared state
export default function LibraryScreen({ navigation, workouts, loaded, deleteWorkout }) {
  const insets = useSafeAreaInsets();

  const handleDelete = (workout) => {
    Alert.alert(
      'Delete workout',
      `Remove "${workout.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteWorkout(workout.id) },
      ]
    );
  };

  const handleStart = (workout) => {
    navigation.navigate('Workout', { config: workout });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>MY WORKOUTS</Text>

        {!loaded ? null : workouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏋️</Text>
            <Text style={styles.emptyTitle}>No workouts yet</Text>
            <Text style={styles.emptyBody}>
              Tap the New tab to build your first workout and it will appear here.
            </Text>
          </View>
        ) : (
          workouts.map((workout) => {
            const accent = getAccentColor(workout.id);
            const totalReps = workout.sets * workout.reps;
            const totalSec =
              (workout.work + workout.rest) * totalReps -
              workout.rest +
              (workout.sets - 1) * workout.setRest;

            return (
              <View key={workout.id} style={styles.card}>
                <View style={[styles.cardAccent, { backgroundColor: accent }]} />
                <View style={styles.cardBody}>
                  <Text style={styles.cardName}>{workout.name}</Text>
                  <Text style={styles.cardMeta}>
                    {workout.work}s work · {workout.rest}s rest · {workout.reps} reps · {workout.sets} {workout.sets === 1 ? 'set' : 'sets'} · {formatDuration(totalSec)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => handleDelete(workout)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.deleteIcon}>🗑</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.playBtn, { borderColor: accent }]}
                  onPress={() => handleStart(workout)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.playBtnText, { color: accent }]}>▶</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 32 },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 4,
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },

  emptyState: {
    marginTop: 60,
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  emptyBody: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  cardAccent: {
    width: 4,
    alignSelf: 'stretch',
  },
  cardBody: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  cardMeta: {
    fontSize: 11,
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
  },
  iconBtn: {
    paddingHorizontal: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: { fontSize: 16 },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  playBtnText: { fontSize: 14 },
});
