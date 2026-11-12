import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

// Kept here (not imported from ui.tsx) so the two files don't import each other.
const TOOTH_PATH =
  'M8.5 3C6.5 3 5 4.6 5 7c0 2 .8 3.4 1.3 5 .6 2 .7 5 1.7 7.6.4 1 1.6 1 1.9-.1L11.1 14c.3-1 1.5-1 1.8 0l1.2 5.5c.3 1.1 1.5 1.1 1.9.1 1-2.6 1.1-5.6 1.7-7.6.5-1.6 1.3-3 1.3-5 0-2.4-1.5-4-3.5-4-1.6 0-2.2 1-4 1S10.1 3 8.5 3z';

/** Tumbuh's logo, "Tunas": a tooth with a sprout growing from it (tumbuh = to grow). */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="tunas" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FF7AB0" />
          <Stop offset="1" stopColor="#6D5BFF" />
        </LinearGradient>
      </Defs>
      <Rect width={100} height={100} rx={26} fill="url(#tunas)" />
      <G transform="translate(22 34) scale(2.35)">
        <Path d={TOOTH_PATH} fill="#FFFFFF" />
      </G>
      <Path d="M50 42 C50 34 50 28 50 22" stroke="#4ADE80" strokeWidth={3.6} strokeLinecap="round" fill="none" />
      <Path d="M50 30 C42 30 36 25 35 18 C43 17 49 22 50 30Z" fill="#4ADE80" />
      <Path d="M50 26 C57 26 63 21 64 14 C56 13 50 18 50 26Z" fill="#86EFAC" />
    </Svg>
  );
}
