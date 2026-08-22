import { useState, useRef } from 'react';
import { QrReader } from 'react-qr-reader';
import { X, Camera } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);

  const handleScan = (result: string | null) => {
    if (result) {
      onScan(result);
    }
  };

  const handleError = (err: any) => {
    console.error('QR Scanner error:', err);
    setError('Camera access denied or not available');
  };

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
          <QrReader
            onResult={(result, error) => {
              if (result) {
                handleScan(result?.text || null);
              }
              if (error) {
                handleError(error);
              }
            }}
            constraints={{
              facingMode: 'environment',
            }}
            videoStyle={{ width: '100%', height: '100%' }}
            videoContainerStyle={{ width: '100%', height: '300px' }}
          />
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
