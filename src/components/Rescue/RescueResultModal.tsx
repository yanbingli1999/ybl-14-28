import useGameStore from '@/store/useGameStore';
import { CANDY_CONFIG } from '@/data/config';
import { CheckCircle, XCircle, Medal, Coins, Heart, Package, X } from 'lucide-react';

export default function RescueResultModal() {
  const { rescueResult, closeRescueResult } = useGameStore();

  if (!rescueResult) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl shadow-2xl border-4 border-orange-200 overflow-hidden">
        <div className={`p-6 ${rescueResult.success ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {rescueResult.success ? (
                <CheckCircle className="w-10 h-10 text-white" />
              ) : (
                <XCircle className="w-10 h-10 text-white" />
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {rescueResult.success ? '救援成功！' : '救援失败'}
                </h2>
                <p className="text-white/90 text-sm">
                  {rescueResult.success ? '感谢你的英勇救援！' : '物资不足，未能完成救援'}
                </p>
              </div>
            </div>
            <button
              onClick={closeRescueResult}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {rescueResult.success ? (
            <>
              <div className="text-center mb-4">
                <p className="text-gray-600">你成功完成了救援任务，获得以下奖励：</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center p-3 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl">
                  <Medal className="w-8 h-8 text-yellow-600 mb-1" />
                  <div className="text-2xl font-bold text-yellow-700">+{rescueResult.reward.badge}</div>
                  <div className="text-xs text-gray-500">救援徽章</div>
                </div>
                <div className="flex flex-col items-center p-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl">
                  <Coins className="w-8 h-8 text-orange-600 mb-1" />
                  <div className="text-2xl font-bold text-orange-700">+{rescueResult.reward.emergencyCoins}</div>
                  <div className="text-xs text-gray-500">紧急金币</div>
                </div>
                <div className="flex flex-col items-center p-3 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl">
                  <Heart className="w-8 h-8 text-pink-600 mb-1" />
                  <div className="text-2xl font-bold text-pink-700">+{rescueResult.reward.stationFavor}</div>
                  <div className="text-xs text-gray-500">车站好感</div>
                </div>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-700">已发送物资</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {rescueResult.itemsSent.map((item) => {
                    const config = CANDY_CONFIG[item.candyType];
                    return (
                      <div
                        key={item.candyType}
                        className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-green-200"
                      >
                        <span>{config.emoji}</span>
                        <span className="text-sm font-medium text-gray-700">x{item.quantity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm">
                  救援物资不足，以下物资还缺少：
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {rescueResult.itemsMissing.map((item) => {
                    const config = CANDY_CONFIG[item.candyType];
                    return (
                      <div
                        key={item.candyType}
                        className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-red-200"
                      >
                        <span>{config.emoji}</span>
                        <span className="text-sm font-medium text-red-600">还缺 x{item.quantity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {rescueResult.itemsSent.length > 0 && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-700">已发送的物资仍被接收</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rescueResult.itemsSent.map((item) => {
                      const config = CANDY_CONFIG[item.candyType];
                      return (
                        <div
                          key={item.candyType}
                          className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-gray-200"
                        >
                          <span>{config.emoji}</span>
                          <span className="text-sm font-medium text-gray-600">x{item.quantity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={closeRescueResult}
            className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all
              ${rescueResult.success
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
              }
              shadow-lg hover:shadow-xl transform hover:scale-105`}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
