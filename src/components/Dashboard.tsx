import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserStampCards, saveStampCard, generateId, getCafeSettings } from '../lib/storage';
import type { StampCard as StampCardType } from '../types';
import StampCard from './StampCard';
import { Coffee, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [cards, setCards] = useState<StampCardType[]>([]);
  const [showQRDropdown, setShowQRDropdown] = useState(false);
  const cafeSettings = getCafeSettings();

  // Check if user has an active card (not completed or redeemed)
  const hasActiveCard = cards.some(card => card.status === 'active' || card.status === 'completed');

  useEffect(() => {
    if (user) {
      loadCards();
    }
  }, [user]);

  const loadCards = async () => {
    if (user) {
      const userCards = await getUserStampCards(user.id);
      setCards(userCards);
    }
  };

  const handleRedeem = async (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (card && card.currentStamps >= card.stampsRequired) {
      const updatedCard = {
        ...card,
        status: 'redeemed' as const,
      };
      await saveStampCard(updatedCard);
      await loadCards();
    }
  };

  const handleCreateCard = async () => {
    if (user) {
      const newCard: StampCardType = {
        id: generateId(),
        userId: user.id,
        cafeName: cafeSettings.cafeName,
        rewardDescription: cafeSettings.rewardDescription,
        stampsRequired: cafeSettings.stampsRequired,
        currentStamps: 0,
        createdAt: new Date().toISOString(),
        status: 'active',
      };
      await saveStampCard(newCard);
      await loadCards();
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-amber-900" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-amber-50">{cafeSettings.cafeName}</h1>
                <p className="text-xs sm:text-sm text-amber-200">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowQRDropdown(true)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-amber-50 bg-amber-800/50 hover:bg-amber-800 rounded-lg transition-colors flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">Show QR</span>
              </button>
              <button
                onClick={handleCreateCard}
                disabled={hasActiveCard}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-amber-50 bg-amber-700 hover:bg-amber-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                New Card
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-amber-50 bg-amber-800/50 hover:bg-amber-800 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {cards.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-amber-100 p-8 sm:p-12 lg:p-16 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Coffee className="w-8 h-8 sm:w-10 sm:h-10 text-amber-800" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-amber-900 mb-2 sm:mb-3">No Stamp Cards Yet</h2>
            <p className="text-amber-700 mb-6 sm:mb-8 text-sm sm:text-base">Start your journey by creating your first stamp card</p>
            <button
              onClick={handleCreateCard}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-amber-800 to-amber-900 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all font-semibold shadow-lg text-sm sm:text-base"
            >
              Create Your First Card
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {cards.map((card) => (
              <StampCard
                key={card.id}
                card={card}
                onRedeem={() => handleRedeem(card.id)}
                showQR={false}
                customerView={true}
              />
            ))}
          </div>
        )}
      </main>

      {/* QR Modal */}
      {showQRDropdown && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setShowQRDropdown(false)}>
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-amber-900">Your QR Code</h2>
              <button
                onClick={() => setShowQRDropdown(false)}
                className="text-amber-600 hover:text-amber-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 mb-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-amber-100">
                <QRCodeSVG
                  value={user?.uniqueCode || ''}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>
            <p className="text-sm text-center text-amber-700 mb-2">Your unique code</p>
            <p className="text-xs text-center text-amber-800 font-mono bg-amber-100 rounded-lg px-4 py-2">
              {user?.uniqueCode}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
