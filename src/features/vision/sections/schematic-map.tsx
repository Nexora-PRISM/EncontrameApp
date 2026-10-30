import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

import { Radius, type BrandColors } from '@/constants/brand';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import type { LatLng } from '@/lib/vision-rules';

export type SchematicPoint = LatLng & {
  id: string;
  color: string;
  /** Diâmetro em pixels (padrão 14). */
  size?: number;
  /** Texto curto ao lado do ponto (ex.: horário). */
  label?: string;
  /** Contorno sem preenchimento (ex.: registro inconclusivo). */
  hollow?: boolean;
  /** Ponto de referência (último local conhecido): quadrado. */
  square?: boolean;
};

export type SchematicLine = { id: string; from: LatLng; to: LatLng; color: string; dashed?: boolean };

type Props = {
  points: SchematicPoint[];
  lines?: SchematicLine[];
  center?: LatLng;
  radiusKm?: number;
  height?: number;
  /** Resumo do que o mapa mostra, para leitores de tela. */
  accessibilityLabel: string;
};

const KM_PER_DEG = 111.32;
const PAD = 26;
const SCALE_STEPS_KM = [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 20];

/**
 * Mapa esquemático leve (sem ruas, sem serviço externo): posições aproximadas, raio da busca e trajeto.
 * Funciona igual no celular e no navegador e não depende de chave de mapa.
 */
export function SchematicMap({ points, lines = [], center, radiusKm, height = 260, accessibilityLabel }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const [width, setWidth] = useState(0);

  const projection = useMemo(() => {
    const all: LatLng[] = [...points, ...lines.flatMap((line) => [line.from, line.to])];
    if (center) all.push(center);
    if (all.length === 0 || width === 0) return null;
    const refLat = (center ?? all[0]).latitude;
    const kmPerDegLng = KM_PER_DEG * Math.cos((refLat * Math.PI) / 180);
    const toKm = (p: LatLng) => ({ x: p.longitude * kmPerDegLng, y: p.latitude * KM_PER_DEG });
    const xs = all.map((p) => toKm(p).x);
    const ys = all.map((p) => toKm(p).y);
    if (center && radiusKm) {
      const c = toKm(center);
      xs.push(c.x - radiusKm, c.x + radiusKm);
      ys.push(c.y - radiusKm, c.y + radiusKm);
    }
    let minX = Math.min(...xs);
    let maxX = Math.max(...xs);
    let minY = Math.min(...ys);
    let maxY = Math.max(...ys);
    const minExtent = 0.3;
    if (maxX - minX < minExtent) {
      const mid = (maxX + minX) / 2;
      minX = mid - minExtent / 2;
      maxX = mid + minExtent / 2;
    }
    if (maxY - minY < minExtent) {
      const mid = (maxY + minY) / 2;
      minY = mid - minExtent / 2;
      maxY = mid + minExtent / 2;
    }
    const scale = Math.min((width - PAD * 2) / (maxX - minX), (height - PAD * 2) / (maxY - minY));
    const offsetX = (width - (maxX - minX) * scale) / 2;
    const offsetY = (height - (maxY - minY) * scale) / 2;
    const toPx = (p: LatLng) => {
      const k = toKm(p);
      return { x: offsetX + (k.x - minX) * scale, y: offsetY + (maxY - k.y) * scale };
    };
    const target = Math.min(110, width / 3) / scale;
    const scaleKm = [...SCALE_STEPS_KM].reverse().find((step) => step <= target) ?? SCALE_STEPS_KM[0];
    return { toPx, scale, scaleKm };
  }, [points, lines, center, radiusKm, width, height]);

  const onLayout = (event: LayoutChangeEvent) => setWidth(Math.round(event.nativeEvent.layout.width));

  return (
    <View>
      <View
        style={[styles.box, { height }]}
        onLayout={onLayout}
        accessible
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
      >
        {projection ? (
          <>
            {center && radiusKm ? (
              <RadiusCircle at={projection.toPx(center)} radiusPx={radiusKm * projection.scale} color={brand.blue} />
            ) : null}
            {lines.map((line) => (
              <Segment
                key={line.id}
                from={projection.toPx(line.from)}
                to={projection.toPx(line.to)}
                color={line.color}
                dashed={line.dashed}
              />
            ))}
            {points.map((point) => {
              const p = projection.toPx(point);
              const size = point.size ?? 14;
              return (
                <View key={point.id} pointerEvents="none" style={[styles.pointWrap, { left: p.x - size / 2, top: p.y - size / 2 }]}>
                  <View
                    style={{
                      width: size,
                      height: size,
                      borderRadius: point.square ? 3 : size / 2,
                      borderWidth: 2,
                      borderColor: point.hollow ? point.color : brand.white,
                      backgroundColor: point.hollow ? brand.white : point.color,
                    }}
                  />
                  {point.label ? <Text style={styles.pointLabel}>{point.label}</Text> : null}
                </View>
              );
            })}
            <View style={styles.north} pointerEvents="none">
              <MaterialCommunityIcons name="navigation" size={16} color={brand.navy} />
              <Text style={styles.northText}>N</Text>
            </View>
            <View style={styles.scale} pointerEvents="none">
              <View style={[styles.scaleBar, { width: projection.scaleKm * projection.scale }]} />
              <Text style={styles.scaleText}>
                {projection.scaleKm < 1
                  ? t('{value} m', { value: String(Math.round(projection.scaleKm * 1000)) })
                  : t('{value} km', { value: String(projection.scaleKm) })}
              </Text>
            </View>
          </>
        ) : null}
      </View>
      <Text style={styles.caption}>{t('Mapa esquemático: posições aproximadas, sem ruas.')}</Text>
    </View>
  );
}

type Px = { x: number; y: number };

function RadiusCircle({ at, radiusPx, color }: { at: Px; radiusPx: number; color: string }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: at.x - radiusPx,
        top: at.y - radiusPx,
        width: radiusPx * 2,
        height: radiusPx * 2,
        borderRadius: radiusPx,
        borderWidth: 1.5,
        borderColor: color,
        opacity: 0.7,
      }}
    />
  );
}

function Segment({ from, to, color, dashed }: { from: Px; to: Px; color: string; dashed?: boolean }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (length < 1) return null;
  const angle = Math.atan2(dy, dx);
  const thickness = dashed ? 2.5 : 3.5;
  if (!dashed) {
    return (
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: (from.x + to.x) / 2 - length / 2,
          top: (from.y + to.y) / 2 - thickness / 2,
          width: length,
          height: thickness,
          borderRadius: thickness,
          backgroundColor: color,
          transform: [{ rotate: `${angle}rad` }],
        }}
      />
    );
  }
  const dash = 6;
  const gap = 5;
  const count = Math.max(1, Math.floor(length / (dash + gap)));
  return (
    <>
      {Array.from({ length: count }, (_, index) => {
        const start = index * (dash + gap) + dash / 2;
        const cx = from.x + (dx / length) * start;
        const cy = from.y + (dy / length) * start;
        return (
          <View
            key={index}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: cx - dash / 2,
              top: cy - thickness / 2,
              width: dash,
              height: thickness,
              borderRadius: thickness,
              backgroundColor: color,
              transform: [{ rotate: `${angle}rad` }],
            }}
          />
        );
      })}
    </>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    box: {
      width: '100%',
      overflow: 'hidden',
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: brand.divider,
      backgroundColor: brand.mapBackground,
    },
    pointWrap: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 3 },
    pointLabel: {
      fontSize: 11,
      fontWeight: '800',
      color: brand.textDark,
      backgroundColor: brand.white,
      paddingHorizontal: 3,
      borderRadius: 4,
      overflow: 'hidden',
    },
    north: { position: 'absolute', top: 8, right: 10, alignItems: 'center' },
    northText: { fontSize: 11, fontWeight: '900', color: brand.navy },
    scale: { position: 'absolute', left: 10, bottom: 8, gap: 2 },
    scaleBar: { height: 4, borderRadius: 2, backgroundColor: brand.navy },
    scaleText: { fontSize: 11, fontWeight: '700', color: brand.navy },
    caption: { marginTop: 6, fontSize: 13, color: brand.textMuted },
  });
}
