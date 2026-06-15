import { Carriage } from '@/types';
import { CANDY_CONFIG } from '@/data/config';
import { getLoadPercentage } from '@/engine/loadingSystem';
import useGameStore from '@/store/useGameStore';

interface CarriageCardProps {
  carriage: Carriage;
}

export default function CarriageCard({ carriage }: CarriageCardProps) {
  const { rescueItems, activeRescueMission, openRescueModal } = useGameStore();
  const config = CANDY_CONFIG[carriage.candyType];
  const loadPercent = getLoadPercentage(carriage);
  const isFull = loadPercent >= 100;

  const allocated = rescueItems.find(r => r.candyType === carriage.candyType)?.quantity || 0;
  const effectiveLoad = carriage.currentLoad - allocated;
  const effectiveLoadPercent = carriage.capacity > 0 ? (effectiveLoad / carriage.capacity) * 100 : 0;

  const handleClick = () => {
    if (activeRescueMission) {
      openRescueModal();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative flex flex-col items-center p-2 rounded-xl bg-gradient-to-b from-gray-100 to-gray-200 shadow-md border-2 border-gray-300 min-w-[70px] sm:min-w-[80px] transition-all
        ${activeRescueMission ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''}`}
      style={{
        borderColor: allocated > 0 ? '#f97316' : config.color + '40',
      }}
    >
      <div
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gray-400"
        style={{ backgroundColor: config.color }}
      />
      <div
        className="absolute -top-1 left-1/4 -translate-x-1/2 w-3 h-3 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      <div
        className="absolute -top-1 right-1/4 translate-x-1/2 w-3 h-3 rounded-full"
        style={{ backgroundColor: config.color }}
      />

      <div className="text-2xl sm:text-3xl mb-1">{config.emoji}</div>

      <div className="text-xs font-bold text-gray-700 mb-1">
        {carriage.currentLoad}/{carriage.capacity}
      </div>

      <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
        {allocated > 0 ? (
          <>
            <div className="relative w-full h-full">
              <div
                className="absolute h-full bg-orange-400 rounded-l-full transition-all duration-300"
                style={{
                  width: `${effectiveLoadPercent}%`,
                }}
              />
              <div
                className="absolute h-full bg-orange-200 transition-all duration-300"
                style={{
                  left: `${effectiveLoadPercent}%`,
                  width: `${(allocated / carriage.capacity) * 100}%`,
                }}
              />
            </div>
          </>
        ) : (
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.min(loadPercent, 100)}%`,
              backgroundColor: config.color,
              boxShadow: isFull ? `0 0 8px ${config.color}` : 'none',
            }}
          />
        )}
      </div>

      {allocated > 0 && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full whitespace-nowrap">
          改派 {allocated}
        </div>
      )}

      {isFull && allocated === 0 && (
        <div className="absolute -top-2 -right-2 text-lg animate-bounce">✨</div>
      )}

      {activeRescueMission && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-white text-[10px] font-bold">!</span>
        </div>
      )}
    </div>
  );
}
