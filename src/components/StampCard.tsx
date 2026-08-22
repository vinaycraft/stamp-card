import type { StampCard as StampCardType } from '../types';
import { Coffee } from 'lucide-react';

interface StampCardProps {
  card: StampCardType;
  onAddStamp?: () => void;
  onRedeem?: () => void;
  customerView?: boolean;
}

export default function StampCard({ card, onAddStamp, onRedeem, customerView = false }: StampCardProps) {
  const progress = (card.currentStamps / card.stampsRequired) * 100;
  const isCompleted = card.currentStamps >= card.stampsRequired;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-100 overflow-hidden hover:shadow-xl transition-shadow">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-amber-800 to-amber-900 p-4 sm:p-6 text-white">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <Coffee className="w-5 h-5 sm:w-6 sm:h-6" />
          <h3 className="text-base sm:text-lg font-semibold">{card.cafeName}</h3>
        </div>
        <p className="text-amber-100 text-xs sm:text-sm">{card.rewardDescription}</p>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-6 bg-gradient-to-br from-white to-amber-50/30">
        {/* Progress */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-amber-800">
              {card.currentStamps} / {card.stampsRequired} stamps
            </span>
            <span className="text-xs sm:text-sm font-semibold text-amber-900">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-amber-100 rounded-full h-1.5 sm:h-2">
            <div
              className="bg-gradient-to-r from-amber-600 to-amber-800 h-1.5 sm:h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stamp Grid */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {Array.from({ length: card.stampsRequired }).map((_, index) => (
            <div
              key={index}
              className={`aspect-square rounded-lg sm:rounded-xl flex items-center justify-center border-2 transition-all ${
                index < card.currentStamps
                  ? 'bg-gradient-to-br from-amber-700 to-amber-900 border-amber-800 shadow-md'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              {index < card.currentStamps ? (
                <Coffee className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              ) : null}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3">
          {customerView ? (
            isCompleted ? (
              <button
                onClick={onRedeem}
                className="flex-1 bg-gradient-to-r from-amber-700 to-amber-900 text-white py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium hover:from-amber-600 hover:to-amber-800 transition-all shadow-md"
              >
                Redeem Reward
              </button>
            ) : (
              <button
                disabled
                className="flex-1 bg-amber-100 text-amber-400 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium cursor-not-allowed"
              >
                Complete to Redeem
              </button>
            )
          ) : (
            !isCompleted ? (
              <button
                onClick={onAddStamp}
                className="flex-1 bg-gradient-to-r from-amber-700 to-amber-900 text-white py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium hover:from-amber-600 hover:to-amber-800 transition-all shadow-md"
              >
                Add Stamp
              </button>
            ) : (
              <button
                onClick={onRedeem}
                className="flex-1 bg-gradient-to-r from-amber-700 to-amber-900 text-white py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium hover:from-amber-600 hover:to-amber-800 transition-all shadow-md"
              >
                Redeem Reward
              </button>
            )
          )}
        </div>

        {/* Status */}
        <div className="mt-3 sm:mt-4 text-center">
          <span className="text-xs text-amber-600 font-medium">
            {isCompleted ? 'Ready to redeem' : card.status}
          </span>
        </div>
      </div>
    </div>
  );
}
