import { useEffect, useState } from 'react';
import useGameStore from '@/store/useGameStore';
import { CANDY_CONFIG } from '@/data/config';
import { getAvailableForRescue, canCompleteRescue, getTotalAllocated, getRemainingTime } from '@/engine/rescueSystem';
import { X, Plus, Minus, Package, Medal, Coins, Heart, Clock, AlertTriangle, Send, XCircle } from 'lucide-react';
import { CandyType } from '@/types';

export default function RescueModal() {
  const {
    showRescueModal,
    closeRescueModal,
    activeRescueMission,
    train,
    rescueItems,
    allocateToRescue,
    deallocateFromRescue,
    executeRescue,
    declineRescue,
    rescueTick,
    forceRescueTick,
  } = useGameStore();

  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!activeRescueMission || !showRescueModal) return;

    const updateTime = () => {
      if (activeRescueMission) {
        setTimeLeft(getRemainingTime(activeRescueMission));
      }
    };

    updateTime();
    const interval = setInterval(() => {
      updateTime();
      forceRescueTick();
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRescueMission, showRescueModal, forceRescueTick, rescueTick]);

  if (!showRescueModal || !activeRescueMission) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const isUrgent = timeLeft < 30000;
  const canRescue = canCompleteRescue(train, activeRescueMission, rescueItems);
  const totalAllocated = getTotalAllocated(rescueItems);
  const totalRequired = activeRescueMission.requirements.reduce((sum, r) => sum + r.quantity, 0);

  const handleAllocate = (candyType: CandyType, amount: number) => {
    if (amount > 0) {
      allocateToRescue(candyType, amount);
    } else {
      deallocateFromRescue(candyType, Math.abs(amount));
    }
  };

  const handleQuickAllocate = (candyType: CandyType, required: number) => {
    const allocated = rescueItems.find(r => r.candyType === candyType)?.quantity || 0;
    const need = required - allocated;
    if (need > 0) {
      allocateToRescue(candyType, need);
    }
  };

  const getProgressPercent = (required: number, allocated: number) => {
    return Math.min(100, (allocated / required) * 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl shadow-2xl border-4 border-orange-200">
        <div className="sticky top-0 z-10 p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isUrgent ? 'bg-red-600 animate-pulse' : 'bg-orange-400'}`}>
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{activeRescueMission.title}</h2>
                <p className="text-sm text-white/90">{activeRescueMission.stationName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${isUrgent ? 'bg-red-600 animate-pulse' : 'bg-white/20'}`}>
                <Clock className="w-4 h-4 text-white" />
                <span className="font-bold text-white">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
              </div>
              <button
                onClick={closeRescueModal}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="p-4 bg-white/60 rounded-xl">
            <p className="text-gray-700">{activeRescueMission.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl">
              <Medal className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-xs text-gray-500">救援徽章</div>
                <div className="font-bold text-yellow-700">+{activeRescueMission.reward.badge}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl">
              <Coins className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-xs text-gray-500">紧急金币</div>
                <div className="font-bold text-orange-700">+{activeRescueMission.reward.emergencyCoins}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl">
              <Heart className="w-5 h-5 text-pink-600" />
              <div>
                <div className="text-xs text-gray-500">车站好感</div>
                <div className="font-bold text-pink-700">+{activeRescueMission.reward.stationFavor}</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/60 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-600" />
                <span className="font-bold text-gray-700">物资需求</span>
              </div>
              <div className="text-sm text-gray-500">
                已分配: <span className="font-bold text-gray-700">{totalAllocated}/{totalRequired}</span>
              </div>
            </div>

            <div className="space-y-3">
              {activeRescueMission.requirements.map((req) => {
                const config = CANDY_CONFIG[req.candyType];
                const allocated = rescueItems.find(r => r.candyType === req.candyType)?.quantity || 0;
                const available = getAvailableForRescue(train, req.candyType, rescueItems);
                const isComplete = allocated >= req.quantity;
                const progress = getProgressPercent(req.quantity, allocated);

                return (
                  <div
                    key={req.candyType}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      isComplete
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{config.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-700">{config.name}</span>
                          <span className={`text-sm font-bold ${isComplete ? 'text-green-600' : 'text-gray-600'}`}>
                            {allocated}/{req.quantity}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${progress}%`,
                              backgroundColor: isComplete ? '#22c55e' : config.color,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            可用: {train.carriages.find(c => c.candyType === req.candyType)?.currentLoad || 0}
                            {allocated > 0 && <span className="text-orange-500"> (已改派: {allocated})</span>}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAllocate(req.candyType, -1)}
                              disabled={allocated <= 0}
                              className="p-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleAllocate(req.candyType, 1)}
                              disabled={available <= 0}
                              className="p-1 rounded-lg bg-orange-200 hover:bg-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Plus className="w-4 h-4 text-orange-600" />
                            </button>
                            {!isComplete && available >= (req.quantity - allocated) && (
                              <button
                                onClick={() => handleQuickAllocate(req.candyType, req.quantity)}
                                className="px-2 py-1 text-xs font-medium rounded-lg bg-green-200 hover:bg-green-300 text-green-700 transition-colors"
                              >
                                补齐
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>注意：</strong>救援物资将从当前列车装载中扣除，会影响主订单的完成率。请谨慎决策！
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={declineRescue}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold transition-all"
            >
              <XCircle className="w-5 h-5" />
              拒绝救援
            </button>
            <button
              onClick={executeRescue}
              disabled={!canRescue}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all
                ${canRescue
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              <Send className="w-5 h-5" />
              执行救援
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
