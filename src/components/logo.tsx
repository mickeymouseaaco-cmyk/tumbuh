import Svg, { ClipPath, Defs, G, Path, RadialGradient, Rect, Stop, Circle } from 'react-native-svg';

// Kept here (not imported from ui.tsx) so the two files don't import each other.
const TOOTH_PATH =
  'M8.5 3C6.5 3 5 4.6 5 7c0 2 .8 3.4 1.3 5 .6 2 .7 5 1.7 7.6.4 1 1.6 1 1.9-.1L11.1 14c.3-1 1.5-1 1.8 0l1.2 5.5c.3 1.1 1.5 1.1 1.9.1 1-2.6 1.1-5.6 1.7-7.6.5-1.6 1.3-3 1.3-5 0-2.4-1.5-4-3.5-4-1.6 0-2.2 1-4 1S10.1 3 8.5 3z';

/** Tumbuh's logo, "Terbit": a first tooth rising from the gum like a sunrise. */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="tbBg" cx="50%" cy="62%" r="60%">
          <Stop offset="0" stopColor="#3A1B52" />
          <Stop offset="1" stopColor="#0B0A1A" />
        </RadialGradient>
        <RadialGradient id="tbGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#FF7AB0" stopOpacity="0.75" />
          <Stop offset="1" stopColor="#FF7AB0" stopOpacity="0" />
        </RadialGradient>
        <ClipPath id="tbClip">
          <Rect width={100} height={100} rx={26} />
        </ClipPath>
      </Defs>
      <G clipPath="url(#tbClip)">
        <Rect width={100} height={100} fill="url(#tbBg)" />
        <Circle cx={50} cy={58} r={34} fill="url(#tbGlow)" />
        <Path d="M30 34 A24 24 0 0 1 70 34" stroke="#FF9CC4" strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.55} />
        <Path d="M24 26 A32 32 0 0 1 76 26" stroke="#FF9CC4" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.3} />
        <G transform="translate(26 30) scale(2)">
          <Path d={TOOTH_PATH} fill="#FFFDF8" />
        </G>
        <Path d="M-4 68 C22 57 78 57 104 68 L104 104 L-4 104Z" fill="#E8798F" />
        <Path d="M-4 68 C22 57 78 57 104 68" stroke="#FFB3C1" strokeWidth={3} fill="none" />
      </G>
    </Svg>
  );
}
