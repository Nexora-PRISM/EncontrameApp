import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, type BrandColors } from '@/constants/brand';
import { AppInfo } from '@/lib/app-info';
import { msg } from '@/lib/i18n-msg';
import type { SegurancaInfantilController } from '@/features/seguranca-infantil/seguranca-infantil.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = { controller: SegurancaInfantilController };

const SECTIONS = [
  {
    title: msg('Compromisso com a segurança infantil'),
    body: msg('O Encontra-me, produto da Nexora Prism, não tolera abuso ou exploração sexual infantil (CSAE) nem material de abuso sexual infantil (CSAM). Esta regra vale para qualquer pessoa que use o app e para todo conteúdo ou interação nele.'),
  },
  {
    title: msg('Condutas proibidas'),
    body: msg('É proibido usar o Encontra-me para aliciar ou preparar crianças para exploração sexual (grooming), praticar extorsão sexual, facilitar tráfico ou exploração sexual de crianças, solicitar ou compartilhar CSAM, ou de qualquer outra forma sexualizar, abusar ou colocar uma criança em risco. Não publique, envie, peça, armazene nem compartilhe esse material.'),
  },
  {
    title: msg('Como denunciar'),
    body: msg('Denuncie conteúdo ou comportamento preocupante no app em Ajuda e suporte › Denunciar conteúdo ou golpe. Você também pode escrever para {email}. A denúncia só chega à equipe quando você envia o e-mail. Se uma criança estiver em perigo imediato, procure os serviços de emergência e as autoridades locais.'),
  },
  {
    title: msg('Tratamento de denúncias e medidas'),
    body: msg('A Nexora Prism analisará as denúncias recebidas e tomará as medidas cabíveis conforme as leis aplicáveis. Quando tivermos conhecimento de CSAM ou de exploração sexual infantil, poderemos restringir conteúdo ou contas e comunicar as autoridades competentes, conforme exigido por lei. Não use nem reenvie o material para comprovar uma denúncia; informe o contexto e onde ele aparece no app.'),
  },
  {
    title: msg('Leis e cooperação'),
    body: msg('Cumprimos as leis aplicáveis de proteção infantil e cooperamos com autoridades competentes quando exigido por lei. Esta política complementa as Regras de uso do Encontra-me.'),
  },
  {
    title: msg('Contato de segurança infantil'),
    body: msg('O ponto de contato de segurança infantil da Nexora Prism é {name}. Para questões sobre prevenção de CSAM e conformidade com os padrões de segurança infantil do Google Play, contate {email}.'),
  },
] as const;

export function SegurancaInfantilContentSection({ controller }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);

  return (
    <View style={styles.content}>
      <Text style={styles.updated}>{t('Última atualização: 19 de novembro de 2026')}</Text>
      {SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.heading} accessibilityRole="header">
            {t(section.title)}
          </Text>
          <Text style={styles.body}>
            {t(section.body, {
              email: AppInfo.supportEmail,
              name: AppInfo.childSafetyContact,
            })}
          </Text>
        </View>
      ))}
      <Pressable
        onPress={controller.openSupportEmail}
        accessibilityRole="link"
        style={styles.emailLink}
      >
        <Text style={styles.emailText}>{AppInfo.supportEmail}</Text>
      </Pressable>
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    content: { gap: 20 },
    updated: { color: brand.label, fontSize: 14 },
    section: { gap: 8 },
    heading: { color: brand.textDark, fontSize: 18, fontWeight: '800' },
    body: { color: brand.textDark, fontSize: 16, lineHeight: 24 },
    emailLink: {
      alignSelf: 'flex-start',
      borderRadius: Radius.md,
      paddingVertical: 8,
    },
    emailText: { color: brand.blue, fontSize: 16, fontWeight: '700', textDecorationLine: 'underline' },
  });
}
