'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaContextType {
  isInstallable: boolean;
  isStandalone: boolean;
  promptInstall: () => Promise<void>;
  isIOS: boolean;
}

const PwaContext = createContext<PwaContextType>({
  isInstallable: false,
  isStandalone: false,
  promptInstall: async () => {},
  isIOS: false,
});

export const usePwa = () => useContext(PwaContext);

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showPromptBanner, setShowPromptBanner] = useState<boolean>(false);

  useEffect(() => {
    // Check if in standalone mode (installed)
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(checkStandalone);

    // Check iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Register Service Worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    }

    // Intercept install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPromptBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setShowPromptBanner(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <PwaContext.Provider
      value={{
        isInstallable: !!deferredPrompt,
        isStandalone,
        promptInstall,
        isIOS,
      }}
    >
      {children}

      {/* Floating Install Prompt Banner for Mobile/Desktop */}
      {showPromptBanner && !isStandalone && (
        <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 z-50 animate-bounce-subtle">
          <div className="bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 rounded-2xl p-4 shadow-2xl shadow-emerald-500/20 flex items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Download className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-100">Install Iron Forge App</p>
                <p className="text-xs text-slate-400">Add to home screen for offline access</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={promptInstall}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md active:scale-95"
              >
                Install
              </button>
              <button
                onClick={() => setShowPromptBanner(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari manual install reminder banner */}
      {isIOS && !isStandalone && (
        <div className="hidden ios-prompt-hint fixed bottom-24 left-4 right-4 z-40 bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-slate-300 items-center justify-between">
          <span className="flex items-center gap-2">
            Tap <Share className="w-4 h-4 text-emerald-400 inline" /> and then &quot;Add to Home Screen&quot; to install.
          </span>
        </div>
      )}
    </PwaContext.Provider>
  );
}
