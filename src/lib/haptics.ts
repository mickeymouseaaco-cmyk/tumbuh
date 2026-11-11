import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Haptics are punctuation: one per user action, never the only feedback. No-op on the web. */
const on = Platform.OS !== 'web';

export const haptic = {
  tap: () => on && Haptics.selectionAsync().catch(() => {}),
  soft: () => on && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
  success: () => on && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
};
