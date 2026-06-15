import { useEffect, useState } from 'react';
import useGameStore from '@/store/useGameStore';
import { getRemainingTime, isMissionExpired } from '@/engine/rescueSystem';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';

export default function RescueMissionPanel() {
  const { activeRescueMission, openRescueModal, checkRescueExpiry, rescueTick, forceRescueTick } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!activeRescueMission) {
      setTimeLeft(0);
      return;
    }

    const updateTime = () => {
      if (activeRescueMission) {
        const remaining = getRemainingTime(activeRescueMission);
        setTimeLeft(remaining);

        if (isMissionExpired(activeRescueMission)) {
          checkRescueExpiry();
        }
      }
    };

    updateTime();
    const interval = setInterval(() => {
      updateTime();
      forceRescueTick();
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRescueMission, checkRescueExpiry, forceRescueTick, rescueTick]);

  if (!activeRescueMission) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const isUrgent = timeLeft < 30000;

  const { row, col } = activeRescueMission.mapPosition;
  const cellSize = 100 / 8;

  return (
    <>
      <button
        onClick={openRescueModal}
        className={`absolute z-20 flex items-center justify-center rounded-full transition-all duration-300 transform hover:scale-110 cursor-pointer
          ${isUrgent ? 'animate-pulse bg-red-500' : 'bg-gradient-to-br from-orange-400 to-red-500'}
          shadow-lg hover:shadow-xl`}
        style={{
          left: `calc(${col * cellSize}% + ${cellSize / 2}% - 28px)`,
          top: `calc(${row * cellSize}% + ${cellSize / 2}% - 28px)`,
          width: '56px',
          height: '56px',
        }}
      >
        <div className="relative">
          <AlertTriangle className="w-7 h-7 text-white" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
        </div>
      </button>

      <button
        onClick={openRescueModal}
        className={`absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 z-30
          flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg cursor-pointer transition-all hover:scale-105
          ${isUrgent ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}
      >
        <MapPin className="w-4 h-4 text-white" />
        <div className="text-white">
          <div className="text-xs font-bold">{activeRescueMission.title}</div>
          <div className="flex items-center gap-1 text-xs text-white/90">
            <Clock className="w-3 h-3" />
            <span className={isUrgent ? 'text-yellow-200 font-bold' : ''}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </button>
    </>
  );
}
