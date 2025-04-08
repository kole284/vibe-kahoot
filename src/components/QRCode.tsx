import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  gameId: string;
  size?: number;
}

export function GameQRCode({ gameId, size = 256 }: QRCodeProps) {
  const [joinUrl, setJoinUrl] = useState<string>('');

  useEffect(() => {
    // Use your Vercel deployed URL
    const baseUrl = "https://vibe-kahoot.vercel.app"; // Correct Vercel URL
    setJoinUrl(`${baseUrl}/join/${gameId}`);
    
    // Log the URL for debugging
    console.log(`Generated QR code URL: ${baseUrl}/join/${gameId}`);
  }, [gameId]);

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg shadow-md">
      <QRCodeSVG value={joinUrl} size={size} />
      <p className="text-sm text-gray-600">Scan to join the game</p>
      <p className="text-xs text-gray-500">{joinUrl}</p>
      <div className="mt-2 p-2 bg-gray-100 rounded-md">
        <p className="text-xs font-medium">Game ID: {gameId}</p>
      </div>
    </div>
  );
} 