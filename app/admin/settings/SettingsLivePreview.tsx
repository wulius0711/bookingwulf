'use client';

import { useEffect } from 'react';

const FIELDS = ['accentColor', 'backgroundColor', 'cardBackground', 'textColor', 'mutedTextColor', 'borderColor', 'cardRadius', 'buttonRadius', 'buttonColor'];
const FONT_FIELDS = ['headlineFont', 'bodyFont', 'headlineFontSize', 'bodyFontSize', 'headlineFontWeight', 'bodyFontWeight'];

function collectSettings() {
  const result: Record<string, string> = {};
  FIELDS.forEach((name) => {
    const el = document.querySelector(`[name="${name}"]`) as HTMLInputElement | null;
    if (el?.value) result[name] = el.value;
  });
  // Font fields: always include (even if empty, to allow reset)
  FONT_FIELDS.forEach((name) => {
    const el = document.querySelector(`[name="${name}"]`) as HTMLInputElement | null;
    if (el) result[name] = el.value;
  });
  return result;
}

function sendToIframe(settings: Record<string, string>) {
  const iframe = document.querySelector('iframe.settings-preview-iframe') as HTMLIFrameElement | null;
  iframe?.contentWindow?.postMessage({ type: 'booking-widget-preview-settings', settings }, '*');
}

export default function SettingsLivePreview() {
  useEffect(() => {
    function onWidgetReady(e: MessageEvent) {
      if (e.data?.type === 'booking-widget-ready') sendToIframe(collectSettings());
    }

    function onInputChange() {
      sendToIframe(collectSettings());
    }

    function onPresetApplied() {
      // Small delay to let React state settle after native setter
      setTimeout(() => sendToIframe(collectSettings()), 50);
    }

    window.addEventListener('message', onWidgetReady);

    // Attach to all relevant form inputs
    const listeners: [HTMLElement, string, () => void][] = [];
    [...FIELDS, ...FONT_FIELDS].forEach((name) => {
      document.querySelectorAll<HTMLInputElement>(`[name="${name}"]`).forEach((el) => {
        el.addEventListener('input', onInputChange);
        el.addEventListener('change', onInputChange);
        listeners.push([el, 'input', onInputChange]);
        listeners.push([el, 'change', onInputChange]);
      });
    });

    function onColorChanged(e: Event) {
      const { name, value } = (e as CustomEvent).detail;
      sendToIframe({ ...collectSettings(), [name]: value });
    }

    document.addEventListener('settings-color-changed', onColorChanged);
    document.addEventListener('settings-preset-applied', onPresetApplied);

    return () => {
      window.removeEventListener('message', onWidgetReady);
      listeners.forEach(([el, event, fn]) => el.removeEventListener(event, fn));
      document.removeEventListener('settings-color-changed', onColorChanged);
      document.removeEventListener('settings-preset-applied', onPresetApplied);
    };
  }, []);

  return null;
}
