import { Apple, Baby, Droplets, ShieldCheck, Stethoscope } from 'lucide-react-native';

export function TopicIcon({ name, color, size = 24 }: { name: string; color: string; size?: number }) {
  const p = { color, size, strokeWidth: 2 };
  if (name === 'droplets') return <Droplets {...p} />;
  if (name === 'shield') return <ShieldCheck {...p} />;
  if (name === 'apple') return <Apple {...p} />;
  if (name === 'baby') return <Baby {...p} />;
  return <Stethoscope {...p} />;
}
