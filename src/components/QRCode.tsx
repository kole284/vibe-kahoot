import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  gameId: string;
  size?: number;
}

export function GameQRCode({ gameId, size = 256 }: QRCodeProps) {
  const [joinUrl, setJoinUrl] = useState<string>('');

  useEffect(() => {
    // Get the current URL and replace the path with /join/{gameId}
    const baseUrl = window.location.origin;
    setJoinUrl(`${baseUrl}/join/${gameId}`);
  }, [gameId]);

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg shadow-md">
      <QRCodeSVG value={joinUrl} size={size} />
      <p className="text-sm text-gray-600">Scan to join the game</p>
      <p className="text-xs text-gray-500">{joinUrl}</p>
    </div>
  );
} 