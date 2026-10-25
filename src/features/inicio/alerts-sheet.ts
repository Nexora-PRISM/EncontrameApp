import { useEffect, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useAnimatedReaction, useSharedValue, withTiming } from 'react-native-reanimated';

/** Como a fileira recolhida desenha cada pessoa. */
export type AlertViewMode = 'avatar' | 'card';

/** Altura da fileira de fotos, com o nome embaixo. */
export const ALERTS_AVATAR_TRACK = 92;
/** Altura da fileira de cartões. */
export const ALERTS_CARD_TRACK = 124;
/** Lista aberta: pelo menos isto, no máximo uma fatia da tela. */
export const ALERTS_LIST_MIN = 280;

const SNAP_MS = 220;

/**
 * Arrastar a borda de cima do mapa abre a lista (rola para ver mais pessoas).
 * Os botões do título escolhem foto ou cartão; isso só muda a altura da fileira recolhida.
 */
export function useAlertsSheetGesture() {
  const { height: windowHeight } = useWindowDimensions();
  const [view, setView] = useState<AlertViewMode>('avatar');
  const [expandedOn, setExpandedOn] = useState(false);
  const expanded = useSharedValue(0);
  const dragOrigin = useSharedValue(0);
  const collapsedHeight = useSharedValue(ALERTS_AVATAR_TRACK);
  const openedHeight = useSharedValue(ALERTS_LIST_MIN);
  const travel = useSharedValue(ALERTS_LIST_MIN - ALERTS_AVATAR_TRACK);

  useEffect(() => {
    const collapsed = view === 'avatar' ? ALERTS_AVATAR_TRACK : ALERTS_CARD_TRACK;
    const opened = Math.min(440, Math.max(ALERTS_LIST_MIN, Math.round(windowHeight * 0.42)));
    collapsedHeight.value = collapsed;
    openedHeight.value = opened;
    travel.value = Math.max(opened - collapsed, 1);
  }, [collapsedHeight, openedHeight, travel, view, windowHeight]);

  useAnimatedReaction(
    () => expanded.value > 0.5,
    (next, prev) => {
      if (next !== prev) runOnJS(setExpandedOn)(next);
    },
  );

  const gesture = useMemo(() => {
    const pan = Gesture.Pan()
      .activeOffsetY([-8, 8])
      .onStart(() => {
        dragOrigin.value = expanded.value;
      })
      .onUpdate((event) => {
        const next = dragOrigin.value + event.translationY / travel.value;
        expanded.value = Math.min(1, Math.max(0, next));
      })
      .onEnd((event) => {
        const projected = expanded.value + event.velocityY / 800;
        expanded.value = withTiming(projected > 0.5 ? 1 : 0, { duration: SNAP_MS });
      });

    const tap = Gesture.Tap().onEnd(() => {
      expanded.value = withTiming(expanded.value > 0.5 ? 0 : 1, { duration: SNAP_MS });
    });

    return Gesture.Exclusive(pan, tap);
    // Shared values são estáveis; não entram nas deps (o lint trata .value como mutação de argumento).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { expanded, expandedOn, gesture, view, setView, collapsedHeight, openedHeight };
}
