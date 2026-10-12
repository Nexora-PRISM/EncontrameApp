package expo.modules.emergencyshortcut

import android.content.Context
import android.content.Intent
import android.content.pm.ShortcutInfo
import android.content.pm.ShortcutManager
import android.graphics.drawable.Icon
import android.net.Uri
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private const val SHORTCUT_ID = "encontrame_pedir_ajuda"

/**
 * Atalho "Pedir ajuda" do Encontra-me fora do app (Android).
 *
 * - Android 7.1+ (API 25): atalho no menu ao tocar e segurar o ícone do app.
 * - Android 8+ (API 26): pedido ao sistema para fixar o atalho na tela inicial
 *   (o Android mostra a confirmação ao usuário).
 *
 * O atalho só abre a tela "Pedir ajuda" do app pelo deep link recebido em `uri`.
 * Ele nunca liga nem envia nada sozinho. Usa apenas APIs da plataforma
 * (ShortcutManager), sem dependências extras. Toda chamada é protegida:
 * qualquer falha devolve `false` em vez de derrubar o app.
 */
class EmergencyShortcutModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("EmergencyShortcut")

    Function("isSupported") {
      shortcutManager() != null
    }

    Function("isPinSupported") {
      pinSupported()
    }

    Function("enable") { shortLabel: String, longLabel: String, uri: String ->
      enableShortcut(shortLabel, longLabel, uri)
    }

    Function("requestPin") { shortLabel: String, longLabel: String, uri: String ->
      requestPinShortcut(shortLabel, longLabel, uri)
    }

    Function("disable") { disabledMessage: String ->
      disableShortcut(disabledMessage)
    }
  }

  private fun shortcutManager(): ShortcutManager? {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N_MR1) {
      return null
    }
    val context = appContext.reactContext ?: return null
    return context.getSystemService(ShortcutManager::class.java)
  }

  private fun pinSupported(): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return false
    }
    val manager = shortcutManager() ?: return false
    return runCatching { manager.isRequestPinShortcutSupported }.getOrDefault(false)
  }

  private fun buildShortcut(
    context: Context,
    shortLabel: String,
    longLabel: String,
    uri: String
  ): ShortcutInfo {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(uri)).apply {
      setPackage(context.packageName)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    }
    return ShortcutInfo.Builder(context, SHORTCUT_ID)
      .setShortLabel(shortLabel)
      .setLongLabel(longLabel)
      .setIcon(Icon.createWithResource(context, R.drawable.encontrame_emergency_shortcut))
      .setIntent(intent)
      .build()
  }

  private fun enableShortcut(shortLabel: String, longLabel: String, uri: String): Boolean {
    val manager = shortcutManager() ?: return false
    val context = appContext.reactContext ?: return false
    return runCatching {
      // Reativa o atalho fixado, caso tenha sido desativado antes (sem efeito se não existir).
      runCatching { manager.enableShortcuts(listOf(SHORTCUT_ID)) }
      val shortcut = buildShortcut(context, shortLabel, longLabel, uri)
      runCatching { manager.updateShortcuts(listOf(shortcut)) }
      manager.removeDynamicShortcuts(listOf(SHORTCUT_ID))
      manager.addDynamicShortcuts(listOf(shortcut))
    }.getOrDefault(false)
  }

  private fun requestPinShortcut(shortLabel: String, longLabel: String, uri: String): Boolean {
    if (!pinSupported()) {
      return false
    }
    val manager = shortcutManager() ?: return false
    val context = appContext.reactContext ?: return false
    return runCatching {
      manager.requestPinShortcut(buildShortcut(context, shortLabel, longLabel, uri), null)
    }.getOrDefault(false)
  }

  private fun disableShortcut(disabledMessage: String): Boolean {
    val manager = shortcutManager() ?: return false
    return runCatching {
      manager.removeDynamicShortcuts(listOf(SHORTCUT_ID))
      // Um atalho já fixado na tela inicial não pode ser removido pelo app:
      // ele fica desativado e mostra esta mensagem se for tocado.
      manager.disableShortcuts(listOf(SHORTCUT_ID), disabledMessage)
      true
    }.getOrDefault(false)
  }
}
