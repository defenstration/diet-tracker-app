'use client';

import { useEffect, useState } from 'react';
import { useZxing } from 'react-zxing';

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onError?: (error: Error) => void;
}

export default function BarcodeScanner({ onDetected, onError }: BarcodeScannerProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { ref } = useZxing({
    onDecodeResult(result) {
      onDetected(result.getText());
    },
    onError(error) {
      if (onError) {
        onError(error);
      }
    },
  });

  if (!isClient) {
    return null;
  }

  return (
    <div className="relative">
      <video ref={ref} className="w-full max-w-md mx-auto rounded-lg" />
      <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none rounded-lg"></div>
    </div>
  );
} 