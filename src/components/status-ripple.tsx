import { type ReactNode, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const DURATION = 2200;

type Props = {
  /** Liga as ondas (pessoa em busca ativa). Desligado, só mostra a foto. */
  active: boolean;
  /** Cor do status: a mesma do anel da foto e do pin do mapa. */
  color: string;
  size: number;
  radius: number;
  /** Quanto a onda cresce além da foto (1.2 = 20%). Em listas fica curta para não ser cortada. */
  spread?: number;
  children: ReactNode;
};

/**
 * Ondas saindo da foto de quem está sendo procurado — o mesmo efeito dos pins do mapa.
 * Com "reduzir movimento" ligado no sistema, a foto aparece sem animação.
 */
export function StatusRipple({ active, color, size, radius, spread = 1.2, children }: Props) {
  const reduceMotion = useReducedMotion();
  const animate = active && !reduceMotion;

  return (
    <View style={{ width: size, height: size }}>
      {animate ? (
        <>
          <Ring color={color} size={size} radius={radius} spread={spread} delay={0} />
          <Ring color={color} size={size} radius={radius} spread={spread} delay={DURATION / 2} />
        </>
      ) : null}
      {children}
    </View>
  );
}

function Ring({
  color,
  size,
  radius,
  spread,
  delay,
}: {
  color: string;
  size: number;
  radius: number;
  spread: number;
  delay: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: DURATION, easing: Easing.linear }), -1, false),
    );
    return () => cancelAnimation(progress);
  }, [delay, progress]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.15, 1], [0, 0.55, 0]),
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, spread]) }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ring,
        { width: size, height: size, borderRadius: radius, borderColor: color },
        ringStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 2,
  },
});
