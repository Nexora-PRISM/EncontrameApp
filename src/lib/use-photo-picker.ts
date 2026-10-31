import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';

import { showAlert } from '@/lib/dialog';
import { useT } from '@/lib/i18n';

const DEFAULT_MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_WEB_MIME = new Set(['image/png', 'image/jpeg', 'image/jpg']);
const LOGO_WEB_MIME = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);

type PhotoPickerOptions = {
  /**
   * Logotipo: só galeria/arquivo, sem recorte nem recompressão (preserva PNG transparente e proporção)
   * e aceita WebP. Usado no cadastro de apoiadores do Painel da equipe.
   */
  logo?: boolean;
};

/**
 * Escolha de foto (câmera/galeria no celular, arquivo no web), com limite de tamanho.
 * Mesmas regras do cadastro de pessoa: PNG/JPG, até 2 MB, enviada em base64.
 */
export function usePhotoPicker(maxBytes = DEFAULT_MAX_BYTES, options: PhotoPickerOptions = {}) {
  const t = useT();
  const [photoUri, setPhotoUri] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');
  const logo = options.logo === true;

  const showTooLarge = () => {
    if (maxBytes < 1024 * 1024) {
      showAlert(t('Foto muito grande'), t('A imagem deve ter no máximo {maxKb} KB.', { maxKb: Math.round(maxBytes / 1024) }));
      return;
    }
    showAlert(t('Foto muito grande'), t('A foto deve ter no máximo {maxMb} MB.', { maxMb: Math.round(maxBytes / (1024 * 1024)) }));
  };

  const applyPhoto = (uri: string, base64OrDataUrl: string) => {
    const normalized = stripDataUrlPrefix(base64OrDataUrl);
    const size = estimateBase64Bytes(normalized);
    if (size > maxBytes) {
      showTooLarge();
      return;
    }
    if (size <= 0) {
      showAlert(t('Foto inválida'), t('Não foi possível ler a imagem selecionada.'));
      return;
    }
    setPhotoUri(uri);
    setPhotoBase64(normalized);
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert(t('Permissão necessária'), t('Autorize o acesso à galeria para escolher uma foto.'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: !logo,
      quality: logo ? 1 : 0.7,
      base64: true,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    if (!asset.base64) {
      showAlert(t('Foto inválida'), t('Não foi possível ler a imagem selecionada.'));
      return;
    }
    applyPhoto(asset.uri, asset.base64);
  };

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showAlert(t('Permissão necessária'), t('Autorize o acesso à câmera para tirar uma foto.'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    if (!asset.base64) {
      showAlert(t('Foto inválida'), t('Não foi possível ler a imagem capturada.'));
      return;
    }
    applyPhoto(asset.uri, asset.base64);
  };

  const pickFromWebFile = () => {
    if (typeof document === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = logo ? 'image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp' : 'image/png,image/jpeg,.png,.jpg,.jpeg';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const allowed = logo
        ? LOGO_WEB_MIME.has(file.type) || /\.(png|jpe?g|webp)$/i.test(file.name)
        : ALLOWED_WEB_MIME.has(file.type) || /\.(png|jpe?g)$/i.test(file.name);
      if (!allowed) {
        showAlert(t('Formato inválido'), logo ? t('Envie apenas imagens PNG, JPG ou WebP.') : t('Envie apenas fotos PNG ou JPG.'));
        return;
      }
      if (file.size > maxBytes) {
        showTooLarge();
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        if (!result) {
          showAlert(t('Foto inválida'), t('Não foi possível ler o arquivo selecionado.'));
          return;
        }
        applyPhoto(result, result);
      };
      reader.onerror = () => {
        showAlert(t('Foto inválida'), t('Não foi possível ler o arquivo selecionado.'));
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const pickPhoto = () => {
    if (Platform.OS === 'web') {
      pickFromWebFile();
      return;
    }
    if (logo) {
      void pickFromLibrary();
      return;
    }
    Alert.alert(t('Adicionar foto'), t('Escolha a origem da imagem'), [
      { text: t('Câmera'), onPress: () => void pickFromCamera() },
      { text: t('Galeria'), onPress: () => void pickFromLibrary() },
      { text: t('Cancelar'), style: 'cancel' },
    ]);
  };

  const removePhoto = () => {
    setPhotoUri('');
    setPhotoBase64('');
  };

  return { photoUri, photoBase64, pickPhoto, removePhoto };
}

function stripDataUrlPrefix(value: string): string {
  const trimmed = value.trim();
  const comma = trimmed.indexOf(',');
  if (trimmed.startsWith('data:') && comma >= 0) {
    return trimmed.slice(comma + 1);
  }
  return trimmed;
}

function estimateBase64Bytes(base64: string): number {
  if (!base64) return 0;
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}
