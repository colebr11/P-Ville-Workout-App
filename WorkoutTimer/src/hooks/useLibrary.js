import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'workout_library';

export function useLibrary() {
  const [workouts, setWorkouts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setWorkouts(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const persist = useCallback((updater) => {
    setWorkouts((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const saveWorkout = useCallback((workout) => {
    const entry = {
      id: Date.now().toString(),
      createdAt: Date.now(),
      ...workout,
    };
    persist((prev) => [entry, ...(Array.isArray(prev) ? prev : [])]);
    return entry;
  }, [persist]);

  const deleteWorkout = useCallback((id) => {
    persist((prev) => prev.filter((w) => w.id !== id));
  }, [persist]);

  return { workouts, loaded, saveWorkout, deleteWorkout };
}
