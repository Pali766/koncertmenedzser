import { NavigationContainer } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

// 🔥 Globális változó a push tokenhez
export let expoPushToken = null;

// 🔥 Push értesítések beállítása (Android csatorna)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [notificationPermission, setNotificationPermission] = useState(false);

  useEffect(() => {
    const registerForPushNotifications = async () => {
      // Engedély kérése
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log("Push értesítés engedély megtagadva");
        return;
      }

      setNotificationPermission(true);

      // ÚJ Expo SDK 50/51 token lekérés
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: "IDE_KERÜL_MAJD_A_PROJECT_ID"
      });

      expoPushToken = token.data;
      console.log("Expo push token:", expoPushToken);

      // Android csatorna
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          sound: 'default',
        });
      }
    };

    registerForPushNotifications();
  }, []);

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
