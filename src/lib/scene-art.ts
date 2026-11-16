/**
 * Painted Belajar pictures (one finished illustration per card), used instead of the layered
 * animated scene whenever a picture exists for the chosen child.
 *
 * To add more: save the picture as public/learn-art/<boy|girl>/<scene>.webp (about 3:2, dark background
 * included) and list it here. A scene with no picture keeps its animated mascot scene.
 * Scene names are the `v` of each card in lib/content.ts (learnCards) and `topic-<id>` for the topic tiles.
 */
const boy: Record<string, number> = {
  'topic-clean': require('../../public/learn-art/boy/topic-clean.webp'),
  'topic-fluoride': require('../../public/learn-art/boy/topic-fluoride.webp'),
  'topic-food': require('../../public/learn-art/boy/topic-food.webp'),
  'topic-teething': require('../../public/learn-art/boy/topic-teething.webp'),
  'topic-dentist': require('../../public/learn-art/boy/topic-dentist.webp'),
  wipe: require('../../public/learn-art/boy/wipe.webp'),
  brush: require('../../public/learn-art/boy/brush.webp'),
  daynight: require('../../public/learn-art/boy/daynight.webp'),
  lap: require('../../public/learn-art/boy/lap.webp'),
  newbrush: require('../../public/learn-art/boy/newbrush.webp'),
  parent: require('../../public/learn-art/boy/parent.webp'),
};

// No girl pictures yet: a girl keeps the animated Yuki scenes so the child always matches.
const girl: Record<string, number> = {};

export function sceneArt(gender: '' | 'boy' | 'girl', scene: string): number | undefined {
  return (gender === 'girl' ? girl : boy)[scene];
}
