import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';

import { T } from '@/components/ui';
import { registry, scenes, type Layer } from '@/lib/scenes';
import { fonts } from '@/theme';

/** One layer of a scene: a part (or a short label) that may move, turn, scale or fade. */
function SceneLayer({ L }: { L: Layer }) {
  const reduce = useReducedMotion();
  const anims = L.anims ?? [];
  // One shared value per animation. A layer's animation list never changes, so hook order is stable.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const vals: SharedValue<number>[] = anims.map((a) => useSharedValue(a.from));

  useEffect(() => {
    if (reduce) return;
    const ease = Easing.inOut(Easing.quad);
    anims.forEach((a, i) => {
      const v = vals[i];
      v.value = a.from;
      v.value =
        a.mode === 'cycle'
          ? withDelay(a.delay ?? 0, withRepeat(withTiming(a.to, { duration: a.ms, easing: Easing.linear }), -1, false))
          : withDelay(a.delay ?? 0, withRepeat(withSequence(withTiming(a.to, { duration: a.ms, easing: ease }), withTiming(a.from, { duration: a.ms, easing: ease })), -1));
    });
  }, [reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  const props = anims.map((a) => a.p);
  const baseR = L.r ?? 0;
  const flip = L.flip ? -1 : 1;
  const style = useAnimatedStyle(() => {
    let x = 0;
    let y = 0;
    let r = baseR;
    let s = 1;
    let sy = 1;
    let o = 1;
    for (let i = 0; i < props.length; i++) {
      const v = vals[i].value;
      const p = props[i];
      if (p === 'x') x = v;
      else if (p === 'y') y = v;
      else if (p === 'r') r = v;
      else if (p === 's') s = v;
      else if (p === 'sy') sy = v;
      else if (p === 'o') o = v;
    }
    return {
      opacity: o,
      transform: [{ translateX: x }, { translateY: y }, { rotate: `${r}deg` }, { scale: s }, { scaleX: flip }, { scaleY: sy }],
    };
  });

  const k = L.s ?? 1;
  return (
    <Animated.View style={[{ position: 'absolute', left: L.x, top: L.y, transformOrigin: L.origin ?? 'center' }, style]}>
      {L.text ? (
        <T style={{ fontFamily: fonts.displayBold, fontSize: L.size ?? 22, color: L.color ?? '#FFFFFF', fontVariant: ['tabular-nums'] }}>{L.text}</T>
      ) : L.part && registry[L.part] ? (
        <SvgXml xml={registry[L.part].xml} width={registry[L.part].w * k} height={registry[L.part].h * k} />
      ) : null}
    </Animated.View>
  );
}

/**
 * An animated cartoon (natural colours) drawn from the scene data in lib/scenes.ts.
 * The 120×96 stage is scaled by `scale`. Everything holds still when Reduce Motion is on.
 */
export function Cartoon({ name, scale = 1 }: { name: string; scale?: number }) {
  const layers = scenes[name] ?? scenes.brush;
  return (
    <View style={{ width: 120 * scale, height: 96 * scale, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 120, height: 96, overflow: 'hidden', transform: [{ scale }] }}>
        {layers.map((L, i) => (
          <SceneLayer key={`${name}-${i}`} L={L} />
        ))}
      </View>
    </View>
  );
}

/** Kept for older callers. */
export function Part({ name, s = 1 }: { name: string; s?: number }) {
  const p = registry[name];
  return p ? <SvgXml xml={p.xml} width={p.w * s} height={p.h * s} /> : null;
}
