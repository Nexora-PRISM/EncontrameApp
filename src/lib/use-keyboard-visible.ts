import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * True enquanto o teclado do celular está aberto. Usado para esconder a barra inferior e os
 * botões flutuantes, que no Android sobem junto com o teclado e cobrem o campo em edição.
 * No web não há eventos de teclado: fica sempre false.
 */
export function useKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, () => setVisible(true));
    const hide = Keyboard.addListener(hideEvent, () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return visible;
}
