import * as Linking from 'expo-linking';
import { type Href, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, Vibration } from 'react-native';

import {
  ALERT_CALL_NUMBER,
  ALERT_COUNTDOWN_SECONDS,
  type AlertSendStatus,
  buildAlertPayload,
  secondsLeft,
} from '@/features/alerta-emergencia/alert-flow';
import { useLocationShare } from '@/features/compartilhar-localizacao/use-location-share';
import { env } from '@/lib/env';
import { tr, useT } from '@/lib/i18n';
import { useSessionUser } from '@/lib/use-session-user';
import { useSendEmergencyAlertMutation } from '@/services/emergency/emergency.service';
import type { EmergencyAlertReceipt } from '@/services/emergency/emergency.types';

export type AlertPhase = 'counting' | 'cancelled' | 'triggered';
/** `pending` = a contagem terminou com o app em segundo plano; falta tocar em "Ligar 190". */
export type AlertCallStatus = 'idle' | 'opened' | 'failed' | 'pending';

function vibrate(ms: number) {
  try {
    Vibration.vibrate(ms);
  } catch {
    // Sem vibração no aparelho/navegador.
  }
}

/**
 * Alerta de emergência: contagem de 10 s com cancelamento. Ao fim, (1) envia o alerta ao servidor
 * — só com o recurso ligado e conta conectada — e (2) abre o telefone com o 190.
 * A tela só diz "recebido" com o comprovante devolvido pela API; o app nunca liga sozinho
 * (a pessoa toca em ligar) e não avisa ninguém sem confirmação.
 */
export function useAlertaEmergenciaController() {
  const t = useT();
  const router = useRouter();
  const user = useSessionUser();
  const share = useLocationShare({ mode: 'emergency' });
  const sendMutation = useSendEmergencyAlertMutation();

  const [phase, setPhase] = useState<AlertPhase>('counting');
  const [remaining, setRemaining] = useState(ALERT_COUNTDOWN_SECONDS);
  const [callStatus, setCallStatus] = useState<AlertCallStatus>('idle');
  const [sendStatus, setSendStatus] = useState<AlertSendStatus>('idle');
  const [receipt, setReceipt] = useState<EmergencyAlertReceipt | null>(null);
  const deadlineRef = useRef<number | null>(null);
  /** Início da pausa enquanto a janela de permissão de localização está aberta. */
  const pausedAtRef = useRef<number | null>(null);
  const firedRef = useRef(false);
  const triggeredAtRef = useRef<Date | null>(null);
  const fireRef = useRef<() => void>(() => {});

  const willSendAlert = env.emergencyAlertEnabled && user != null;

  const openDialer = () => {
    Linking.openURL(`tel:${ALERT_CALL_NUMBER}`)
      .then(() => setCallStatus('opened'))
      .catch(() => setCallStatus('failed'));
  };

  const send = async (triggeredAt: Date) => {
    setSendStatus('sending');
    try {
      const result = await sendMutation.mutateAsync(
        buildAlertPayload(triggeredAt, share.currentLocation()),
      );
      setReceipt(result);
      setSendStatus('confirmed');
      AccessibilityInfo.announceForAccessibility(t('Alerta recebido pelo servidor do Encontra-me.'));
    } catch {
      setReceipt(null);
      setSendStatus('failed');
    }
  };

  const fire = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    const triggeredAt = new Date();
    triggeredAtRef.current = triggeredAt;
    setPhase('triggered');
    setRemaining(0);
    vibrate(400);

    // 1) Alerta ao servidor: primeiro, para a requisição sair antes de o telefone abrir.
    if (!env.emergencyAlertEnabled) setSendStatus('disabled');
    else if (user == null) setSendStatus('needs-login');
    else void send(triggeredAt);

    // 2) Telefone com o 190. Em segundo plano o Android não deixa abrir outra tela:
    //    nesse caso a tela mostra "Ligar 190" esperando a pessoa voltar.
    if (AppState.currentState === 'active') openDialer();
    else setCallStatus('pending');
  };

  // Sempre a versão mais recente de `fire` (usa a sessão e a localização atuais).
  useEffect(() => {
    fireRef.current = fire;
  });

  useEffect(() => {
    // Aviso único ao abrir a tela: `tr` (idioma atual) para não depender de `t`.
    AccessibilityInfo.announceForAccessibility(
      tr('Alerta de emergência em {ALERT_COUNTDOWN_SECONDS} segundos. Toque em cancelar para parar.', {
        ALERT_COUNTDOWN_SECONDS,
      }),
    );
  }, []);

  // Contagem pelo relógio (não por "ticks"), para não atrasar se o aparelho ficar lento.
  useEffect(() => {
    if (phase !== 'counting') return;
    if (deadlineRef.current == null) {
      deadlineRef.current = Date.now() + ALERT_COUNTDOWN_SECONDS * 1000;
    }
    let last = ALERT_COUNTDOWN_SECONDS;
    const timer = setInterval(() => {
      if (pausedAtRef.current != null) return;
      const left = secondsLeft(deadlineRef.current ?? 0, Date.now());
      if (left !== last) {
        last = left;
        setRemaining(left);
        if (left > 0) vibrate(25);
      }
      if (left <= 0) {
        clearInterval(timer);
        fireRef.current();
      }
    }, 200);
    return () => clearInterval(timer);
  }, [phase]);

  // Pausa a contagem enquanto o sistema pergunta sobre a localização: a janela cobre a tela
  // (e o "Cancelar"). Ao responder, a contagem continua de onde parou.
  useEffect(() => {
    if (phase !== 'counting') return;
    if (share.asking) {
      if (pausedAtRef.current == null) pausedAtRef.current = Date.now();
      return;
    }
    if (pausedAtRef.current != null) {
      if (deadlineRef.current != null) deadlineRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
  }, [share.asking, phase]);

  const restart = () => {
    firedRef.current = false;
    triggeredAtRef.current = null;
    deadlineRef.current = null;
    pausedAtRef.current = null;
    setReceipt(null);
    setCallStatus('idle');
    setSendStatus('idle');
    setRemaining(ALERT_COUNTDOWN_SECONDS);
    setPhase('counting');
  };

  return {
    phase,
    remaining,
    /** Contagem parada enquanto a janela de permissão de localização está aberta. */
    paused: phase === 'counting' && share.asking,
    total: ALERT_COUNTDOWN_SECONDS,
    callNumber: ALERT_CALL_NUMBER,
    /** Antes da contagem acabar: o alerta irá ao servidor? (recurso ligado + conta conectada) */
    willSendAlert,
    alertFeatureEnabled: env.emergencyAlertEnabled,
    callStatus,
    sendStatus,
    receipt,
    share,
    cancel: () => {
      if (phase !== 'counting') return;
      setPhase('cancelled');
      AccessibilityInfo.announceForAccessibility(t('Alerta cancelado. Nada foi enviado.'));
    },
    /** Pula a contagem. */
    actNow: () => {
      if (phase !== 'counting') return;
      deadlineRef.current = Date.now();
      fire();
    },
    restart,
    openDialer,
    retrySend: () => {
      if (triggeredAtRef.current && sendStatus === 'failed') void send(triggeredAtRef.current);
    },
    callLine: (number: string) => {
      void Linking.openURL(`tel:${number}`).catch(() => undefined);
    },
    goHome: () => router.dismissTo('/inicio'),
    goToLogin: () => router.push('/login' as Href),
  };
}

export type AlertaEmergenciaController = ReturnType<typeof useAlertaEmergenciaController>;
