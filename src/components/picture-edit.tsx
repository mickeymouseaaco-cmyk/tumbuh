/**
 * TEMPORARY editing tools for Belajar pictures (see lib/admin.ts). While ADMIN_EDITING is on, every picture
 * gets a camera button to choose a new photo, and a reset button once it has been changed.
 * Pictures are kept per child: one set for the boy, one for the girl (whichever is chosen right now).
 */
import { Camera, RotateCcw } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { pickPhoto, useAdmin } from '@/lib/admin';
import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme';

/** The storage key for a Belajar picture: learn:<boy|girl>:<scene>. */
export const learnPicKey = (gender: string, scene: string) => `learn:${gender === 'girl' ? 'girl' : 'boy'}:${scene}`;

/** The changed picture for this scene, if one was chosen with the editing tools. */
export function useLearnPic(scene: string): string | undefined {
  const { gender } = useStore();
  const admin = useAdmin();
  return admin.enabled ? admin.photos[learnPicKey(gender, scene)] : undefined;
}

export function PictureEditButtons({ scene }: { scene: string }) {
  const { c } = useTheme();
  const { gender, lang } = useStore();
  const admin = useAdmin();
  if (!admin.enabled) return null;
  const key = learnPicKey(gender, scene);
  const changed = !!admin.photos[key];
  const btn = { width: 36, height: 36, borderRadius: 18, alignItems: 'center' as const, justifyContent: 'center' as const, backgroundColor: c.scrim, borderWidth: 1, borderColor: c.borderStrong };
  return (
    <View style={{ position: 'absolute', left: 6, bottom: 6, flexDirection: 'row', gap: 6, zIndex: 5 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={lang === 'bm' ? 'Tukar gambar' : 'Change picture'}
        hitSlop={6}
        onPress={async () => {
          haptic.tap();
          // smaller than Masalah photos: the phone's storage has to hold up to ~60 of these
          const uri = await pickPhoto(640);
          if (uri) {
            admin.setPhoto(key, uri);
            haptic.success();
          }
        }}
        style={[btn, { backgroundColor: c.accent, borderColor: c.accent }]}>
        <Camera size={17} color={c.onAccent} strokeWidth={2.4} />
      </Pressable>
      {changed ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={lang === 'bm' ? 'Kembali ke gambar asal' : 'Back to the original picture'}
          hitSlop={6}
          onPress={() => {
            haptic.soft();
            admin.setPhoto(key, null);
          }}
          style={btn}>
          <RotateCcw size={16} color={c.white} strokeWidth={2.4} />
        </Pressable>
      ) : null}
    </View>
  );
}
