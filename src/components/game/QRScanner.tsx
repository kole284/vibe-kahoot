import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HomePopup } from '../HomePopup';

interface QRScannerProps {
  onScan: (data: string) => void;
}

export function QRScanner({ onScan }: QRScannerProps) {
  const [error, setError] = useState<string>('');
  const [showPopup, setShowPopup] = useState<boolean>(true);
  const navigate = useNavigate();

  // Fallback for newer React versions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          onScan(result);
        } catch (err) {
          setError('Invalid QR code');
        }
      };
      reader.readAsText(file);
    }
  };

  if (showPopup) {
    return <HomePopup />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-4"
    >
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Scan QR Code</h2>
        
        <div className="mb-4">
          <input
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="w-full p-2 border rounded"
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-center"
          >
            {error}
          </motion.p>
        )}

        <button
          onClick={() => setShowPopup(true)}
          className="w-full p-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Back to Home
        </button>
      </div>
    </motion.div>
  );
} 