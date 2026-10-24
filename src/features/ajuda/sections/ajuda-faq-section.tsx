import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Radius, type BrandColors } from '@/constants/brand';
import type { AjudaController } from '@/features/ajuda/ajuda.controller';
import { useBrand } from '@/lib/brand-theme';
import { useT } from '@/lib/i18n';

type Props = { controller: AjudaController };

/** Busca + categorias + perguntas frequentes em sanfona. */
export function AjudaFaqSection({ controller }: Props) {
  const t = useT();
  const brand = useBrand();
  const styles = useMemo(() => makeStyles(brand), [brand]);
  const showList = controller.searching || controller.category != null;

  return (
    <View style={styles.wrap}>
      <View style={styles.search}>
        <MaterialCommunityIcons name="magnify" size={22} color={brand.label} />
        <TextInput
          style={styles.searchInput}
          value={controller.query}
          onChangeText={controller.setQuery}
          placeholder={t('Pesquisar na ajuda (ex.: senha, avistamento)')}
          placeholderTextColor={brand.placeholder}
          returnKeyType="search"
          accessibilityLabel={t('Pesquisar na ajuda')}
        />
        {controller.query.length > 0 ? (
          <Pressable
            onPress={controller.clearQuery}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={t('Limpar pesquisa')}
          >
            <MaterialCommunityIcons name="close-circle" size={20} color={brand.placeholder} />
          </Pressable>
        ) : null}
      </View>

      {!showList ? (
        <View style={styles.grid}>
          {controller.categories.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => controller.selectCategory(category.id)}
              style={styles.categoryCard}
              accessibilityRole="button"
              accessibilityLabel={t(category.title)}
            >
              <MaterialCommunityIcons name={category.icon} size={26} color={brand.blue} />
              <Text style={styles.categoryTitle}>{t(category.title)}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.listWrap}>
          {!controller.searching && controller.selectedCategory ? (
            <Pressable
              onPress={controller.clearCategory}
              style={styles.backRow}
              accessibilityRole="button"
              accessibilityLabel={t('Voltar para as categorias')}
            >
              <MaterialCommunityIcons name="chevron-left" size={22} color={brand.blue} />
              <Text style={styles.backText}>{t('Todas as categorias')}</Text>
            </Pressable>
          ) : null}
          <Text style={styles.listTitle} accessibilityRole="header">
            {controller.searching
              ? controller.articles.length === 1
                ? t('1 resultado')
                : t('{count} resultados', { count: controller.articles.length })
              : controller.selectedCategory
                ? t(controller.selectedCategory.title)
                : null}
          </Text>

          {controller.articles.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {t('Não encontramos nada com essas palavras. Tente outro termo ou fale com o suporte.')}
              </Text>
            </View>
          ) : (
            <View style={styles.card}>
              {controller.articles.map((article, index) => {
                const open = controller.openId === article.id;
                return (
                  <View
                    key={article.id}
                    style={[styles.item, index > 0 && styles.itemDivider]}
                  >
                    <Pressable
                      onPress={() => controller.toggleArticle(article.id)}
                      style={styles.question}
                      accessibilityRole="button"
                      accessibilityState={{ expanded: open }}
                      accessibilityLabel={t(article.question)}
                    >
                      <Text style={styles.questionText}>{t(article.question)}</Text>
                      <MaterialCommunityIcons
                        name={open ? 'chevron-up' : 'chevron-down'}
                        size={22}
                        color={brand.label}
                      />
                    </Pressable>
                    {open ? (
                      <Text style={styles.answer}>{t(article.answer)}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function makeStyles(brand: BrandColors) {
  return StyleSheet.create({
    wrap: {
      gap: 16,
    },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minHeight: 52,
      paddingHorizontal: 14,
      borderRadius: Radius.pill,
      backgroundColor: brand.fieldBackground,
      borderWidth: 1,
      borderColor: brand.fieldBorder,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 10,
      color: brand.textDark,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    categoryCard: {
      flexGrow: 1,
      flexBasis: '45%',
      minHeight: 96,
      gap: 10,
      padding: 14,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    categoryTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: brand.textDark,
    },
    listWrap: {
      gap: 10,
    },
    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      alignSelf: 'flex-start',
      minHeight: 40,
    },
    backText: {
      fontSize: 15,
      fontWeight: '700',
      color: brand.blue,
    },
    listTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: brand.textDark,
    },
    card: {
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
      overflow: 'hidden',
    },
    item: {
      paddingHorizontal: 14,
    },
    itemDivider: {
      borderTopWidth: 1,
      borderTopColor: brand.divider,
    },
    question: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minHeight: 56,
      paddingVertical: 12,
    },
    questionText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: brand.textDark,
    },
    answer: {
      fontSize: 15,
      lineHeight: 22,
      color: brand.textMuted,
      paddingBottom: 14,
    },
    empty: {
      padding: 16,
      borderRadius: Radius.lg,
      backgroundColor: brand.surface,
      borderWidth: 1,
      borderColor: brand.divider,
    },
    emptyText: {
      fontSize: 15,
      lineHeight: 22,
      color: brand.textMuted,
    },
  });
}
