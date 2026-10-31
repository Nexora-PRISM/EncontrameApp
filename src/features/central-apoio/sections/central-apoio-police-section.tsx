import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { BrandSelect } from '@/components/brand-select';
import { Radius, type BrandColors } from '@/constants/brand';
import type { CentralApoioController } from '@/features/central-apoio/central-apoio.controller';
import { RIGHTS_ITEMS } from '@/features/central-apoio/rights-content';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';
import { POLICE_REPORT_CHECKED_AT } from '@/lib/police-report-states';

type Props = { controller: CentralApoioController };

/** Boletim de ocorrência pela internet (por estado) e os direitos de quem procura alguém. */
export function CentralApoioPoliceSection({ controller: c }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const info = c.onlineReport;

  return (
    <>
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <MaterialCommunityIcons name="laptop" size={24} color={brand.blue} />
          <Text style={styles.cardTitle} accessibilityRole="header">
            {t('Boletim de ocorrência pela internet')}
          </Text>
        </View>
        <Text style={styles.item}>
          {t('Alguns estados aceitam o registro de desaparecimento pela internet; outros pedem que você vá à delegacia. Escolha o seu estado.')}
        </Text>
        <BrandSelect label={t('Estado')} value={c.stateLabel} options={c.stateOptions} onSelect={c.selectState} placeholder={t('Escolha o estado')} />

        {c.stateLabel ? (
          info ? (
            <View style={styles.result} accessibilityLiveRegion="polite">
              <Text style={styles.resultTitle}>
                {info.status === 'accepts'
                  ? t('Aceita o registro de desaparecimento pela internet')
                  : info.status === 'partial'
                    ? t('Aceita pela internet, com condições')
                    : t('Delegacia on-line: não confirmamos se aceita desaparecimento')}
              </Text>
              <Text style={styles.item}>{t(info.note)}</Text>
              {info.url ? (
                <BrandButton label={t('Abrir o site oficial')} variant="blue" trailingIcon="open-in-new" onPress={c.openOnlineReport} />
              ) : null}
            </View>
          ) : (
            <View style={styles.result} accessibilityLiveRegion="polite">
              <Text style={styles.resultTitle}>{t('Ainda não conferimos o site deste estado')}</Text>
              <Text style={styles.item}>
                {t('Vá à delegacia mais próxima. Se preferir tentar pela internet, procure a delegacia virtual no site oficial da Polícia Civil do estado (o endereço termina em .gov.br).')}
              </Text>
            </View>
          )
        ) : null}

        <Text style={styles.muted}>
          {t('Em risco agora, ligue 190. Links conferidos em {date}; os sites podem mudar.', { date: POLICE_REPORT_CHECKED_AT })}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHead}>
          <MaterialCommunityIcons name="scale-balance" size={24} color={brand.blue} />
          <Text style={styles.cardTitle} accessibilityRole="header">
            {t('Seus direitos')}
          </Text>
        </View>
        {RIGHTS_ITEMS.map((right) => (
          <View key={right.source} style={styles.right}>
            <Text style={styles.item}>• {t(right.text)}</Text>
            <Text style={styles.source}>{t(right.source)}</Text>
          </View>
        ))}
        <Text style={styles.item}>
          {t('Se a delegacia não quiser registrar, você pode procurar a Defensoria Pública ou o Ministério Público do seu estado.')}
        </Text>
        <Text style={styles.muted}>{t('Informação geral, não substitui orientação jurídica.')}</Text>
      </View>
    </>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    card: { gap: 10, padding: 16, borderRadius: Radius.lg, borderWidth: 1, borderColor: brand.divider, backgroundColor: brand.surface },
    cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    cardTitle: { flex: 1, fontSize: 19, fontWeight: '800', color: brand.textDark },
    item: { fontSize: 16, lineHeight: 23, color: brand.textDark },
    muted: { fontSize: 14, lineHeight: 20, color: brand.textMuted },
    result: { gap: 8, padding: 12, borderRadius: Radius.md, backgroundColor: brand.white },
    resultTitle: { fontSize: 16, fontWeight: '800', color: brand.textDark },
    right: { gap: 2 },
    source: { fontSize: 13, lineHeight: 18, fontWeight: '700', color: brand.textMuted, paddingLeft: 12 },
  });
}
