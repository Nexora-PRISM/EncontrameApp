import { BrandFab } from '@/components/brand-fab';
import { contentGutter } from '@/constants/theme';
import type { CadastrarPessoaController } from '@/features/cadastrar-pessoa/cadastrar-pessoa.controller';
import { useFloatingPlacement } from '@/lib/bottom-bar-metrics';
import { useT } from '@/lib/i18n';
import { useWideLayout } from '@/lib/use-wide-layout';

interface CadastrarPessoaSubmitFabSectionProps {
  controller: CadastrarPessoaController;
}

/**
 * Botão flutuante de cadastro. Fica sempre acima da barra inferior (altura medida), some
 * quando o botão "Cadastrar" do fim do formulário aparece e enquanto o teclado está aberto —
 * assim não cobre o campo em edição nem a navegação. O formulário tem folga no fim para que
 * nenhum campo fique preso embaixo dele.
 */
export function CadastrarPessoaSubmitFabSection({
  controller,
}: CadastrarPessoaSubmitFabSectionProps) {
  const t = useT();
  const { width } = useWideLayout();
  const placement = useFloatingPlacement();

  // Alinha à margem direita do formulário, que acompanha a largura da janela.
  const right = contentGutter(width);

  return (
    <BrandFab
      accessibilityLabel={controller.reviewingDraft ? t('Enviar cadastro') : t('Cadastrar')}
      icon={controller.reviewingDraft ? 'send' : 'plus'}
      loading={controller.submitting}
      visible={!controller.nearFormEnd && !placement.hidden}
      onPress={controller.handleRegister}
      style={{ bottom: placement.bottom, right }}
    />
  );
}
