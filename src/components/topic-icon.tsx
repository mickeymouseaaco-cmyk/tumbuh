import Svg, { Path } from 'react-native-svg';

import { topicArt } from '@/lib/art';

/** Hand-drawn topic icons: toothbrush, toothpaste, baby bottle, teether, dental mirror. */
export function ArtIcon({ id, color, size = 24 }: { id: string; color: string; size?: number }) {
  const art = topicArt[id] ?? topicArt.clean;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {art.map((s) => (
        <Path key={s.d} d={s.d} stroke={color} strokeWidth={s.width ?? 1.8} strokeLinecap="round" strokeLinejoin="round" opacity={s.opacity ?? 1} fill="none" />
      ))}
    </Svg>
  );
}

/** Kept for older callers: the topic's own icon. */
export function TopicIcon({ name, color, size = 24 }: { name: string; color: string; size?: number }) {
  return <ArtIcon id={name} color={color} size={size} />;
}
