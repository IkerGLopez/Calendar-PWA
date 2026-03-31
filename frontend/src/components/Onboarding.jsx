import React, { useState, useEffect } from 'react';
import { X, Share, PlusSquare } from 'lucide-react';

export default function Onboarding() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Detectar si es dispositivo iOS (iPhone, iPad, iPod)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    
    // Detectar si está en modo Standalone (PWA Instalada)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    setIsIOS(isIOSDevice);
    setIsStandalone(isPWA);
  }, []);

  if (!isIOS || isStandalone || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-xl z-50 animate-in slide-in-from-bottom">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-900">Instala esta App</h3>
        <button onClick={() => setDismissed(true)} className="p-1 rounded-full bg-gray-100 text-gray-500">
          <X size={16} />
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Para recibir notificaciones Push y usar el calendario offline, instálala en tu pantalla de inicio.
      </p>
      <div className="flex text-sm text-gray-700 items-center justify-center space-x-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
        <span>Toca en</span>
        <Share className="text-blue-500" size={18} />
        <span>y luego en <strong>"Añadir a pantalla de inicio"</strong></span>
        <PlusSquare className="text-blue-500" size={18} />
      </div>
    </div>
  );
}
