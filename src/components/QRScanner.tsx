import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef(false);
  const scannerElementId = 'qr-scanner-element';

  useEffect(() => {
    const scanner = new Html5Qrcode(scannerElementId);
    scannerRef.current = scanner;
    isScanningRef.current = true;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    scanner.start(
      { facingMode: 'environment' },
      config,
      (decodedText) => {
        console.log('QR Code detected:', decodedText);
        isScanningRef.current = false;
        onScan(decodedText);
        // Don't stop here, let the parent handle cleanup
      },
      () => {
        // Ignore scan errors, they're normal during scanning
      }
    ).catch((err) => {
      console.error('Scanner error:', err);
      setError('Camera access denied or not available');
      isScanningRef.current = false;
    });

    return () => {
      if (scannerRef.current && isScanningRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
      isScanningRef.current = false;
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scan QR Code
          </h2>
          <button
            onClick={onClose}
            className="text-amber-600 hover:text-amber-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-amber-50 rounded-xl overflow-hidden mb-4">
          <div id={scannerElementId} className="w-full h-[300px]" />
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center mb-4">
            {error}
          </div>
        )}

        <p className="text-sm text-amber-700 text-center">
          Point camera at customer's QR code to identify them
        </p>
      </div>
    </div>
  );
}
