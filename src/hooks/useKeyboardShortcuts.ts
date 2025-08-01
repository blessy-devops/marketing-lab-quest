import { useEffect } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(({ key, ctrl, shift, alt, callback }) => {
        const matchesKey = event.key.toLowerCase() === key.toLowerCase();
        const matchesCtrl = ctrl ? event.ctrlKey : !event.ctrlKey;
        const matchesShift = shift ? event.shiftKey : !event.shiftKey;
        const matchesAlt = alt ? event.altKey : !event.altKey;

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
          event.preventDefault();
          callback();
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

export function useGlobalShortcuts() {
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      callback: () => {
        // Trigger global search
        const searchInput = document.querySelector('[data-search-trigger]') as HTMLElement;
        searchInput?.click();
      },
      description: 'Abrir busca global'
    },
    {
      key: 'n',
      ctrl: true,
      callback: () => {
        // Navigate to new experiment
        window.location.href = '/experimentos/novo';
      },
      description: 'Novo experimento'
    },
    {
      key: 'd',
      ctrl: true,
      callback: () => {
        // Navigate to dashboard
        window.location.href = '/';
      },
      description: 'Ir para dashboard'
    },
    {
      key: 'e',
      ctrl: true,
      callback: () => {
        // Navigate to experiments
        window.location.href = '/experimentos';
      },
      description: 'Ver experimentos'
    }
  ]);
}