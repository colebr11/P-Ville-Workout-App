import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';

import LibraryScreen from './src/screens/LibraryScreen';
import ConfigScreen from './src/screens/ConfigScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import { COLORS } from './src/constants/theme';
import { useLibrary } from './src/hooks/useLibrary';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ focused, label }) {
  const icons = { Library: '📋', New: '＋' };
  return (
    <Text style={{ fontSize: label === 'New' ? 22 : 18, opacity: focused ? 1 : 0.4 }}>
      {icons[label]}
    </Text>
  );
}

// Tabs receives the shared library state and passes it into each screen
function Tabs({ library }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon focused={focused} label={route.name} />
        ),
        tabBarActiveTintColor: COLORS.sprint,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarStyle: {
          backgroundColor: COLORS.bg,
          borderTopColor: COLORS.border,
          borderTopWidth: 0.5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.5,
          marginBottom: 2,
        },
      })}
    >
      <Tab.Screen name="Library">
        {(props) => (
          <LibraryScreen
            {...props}
            workouts={library.workouts}
            loaded={library.loaded}
            deleteWorkout={library.deleteWorkout}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="New">
        {(props) => (
          <ConfigScreen
            {...props}
            saveWorkout={library.saveWorkout}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  // Single source of truth — one useLibrary call for the whole app
  const library = useLibrary();

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={COLORS.bg} />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.bg },
            animation: 'slide_from_bottom',
          }}
        >
          <Stack.Screen name="Tabs">
            {(props) => <Tabs {...props} library={library} />}
          </Stack.Screen>
          <Stack.Screen name="Workout" component={WorkoutScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
