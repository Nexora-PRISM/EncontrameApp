import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';

import { showAlert } from '@/lib/dialog';
import { useT } from '@/lib/i18n';
import { MAX_PHOTO_BYTES, isAllowedPhotoFile, photoSizeError, stripDataUrlPrefix } from '@/lib/photo';

const DEFAULT_MAX_BYTES = MAX_PHOTO_BYTES;

/**
 * Escolha de foto (câmera/galeria no celular, arquivo no web), com limite de tamanho.
 * Mesmas regras do cadastro de pessoa: PNG/JPG, até 2 MB, enviada em base64.
 */
export function usePhotoPicker(maxBytes = DEFAULT_MAX_BYTES) {
  const t = useT();
  const [photoUri, setPhotoUri] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');
  const maxMb = Math.round(maxBytes / (1024 * 1024));

  const applyPhoto = (uri: string, base64OrDataUrl: string) => {
    const normalized = stripDataUrlPrefix(base64OrDataUrl);
    const problem = photoSizeError(normalized, maxBytes);
    if (problem === 'photo_too_large') {
      showAlert(t('Foto muito grande'), t('A foto deve ter no máximo {maxMb} MB.', { maxMb }));
      return;
    }
    if (problem === 'photo_empty') {
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
      allowsEditing: true,
      quality: 0.7,
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
    input.accept = 'image/png,image/jpeg,.png,.jpg,.jpeg';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      if (!isAllowedPhotoFile(file.type, file.name)) {
        showAlert(t('Formato inválido'), t('Envie apenas fotos PNG ou JPG.'));
        return;
      }
      if (file.size > maxBytes) {
        showAlert(t('Foto muito grande'), t('A foto deve ter no máximo {maxMb} MB.', { maxMb }));
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
