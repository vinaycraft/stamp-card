import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserByUniqueCode, getUserStampCards, saveStampCard, addStamp, getUsers } from '../lib/storage';
import { useAuth } from '../contexts/AuthContext';
import type { User, StampCard as StampCardType } from '../types';
import { Shield, Search, Coffee, Plus, QrCode, Users, LogOut } from 'lucide-react';
import QRScanner from './QRScanner';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchCode, setSearchCode] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userCards, setUserCards] = useState<StampCardType[]>([]);
  const [error, setError] = useState('');
  const [showAllCustomers, setShowAllCustomers] = useState(false);
  const [allCustomers, setAllCustomers] = useState<User[]>([]);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const handleSearch = async () => {
    setError('');
    if (!searchCode.trim()) {
      setError('Please enter a customer code');
      return;
    }

    const user = await getUserByUniqueCode(searchCode.trim());
    
    if (user) {
      setSelectedUser(user);
      const cards = await getUserStampCards(user.id);
      setUserCards(cards);
    } else {
      setError('Customer not found. Make sure the customer has registered and has a valid unique code.');
      setSelectedUser(null);
      setUserCards([]);
    }
  };

  const handleQRScan = async (result: string) => {
    console.log('QR scanned:', result);
    setShowQRScanner(false);
    setSearchCode(result);
    setError('');
    
    try {
      const user = await getUserByUniqueCode(result.trim());
      console.log('Found user:', user);
      
      if (user) {
        setSelectedUser(user);
        const cards = await getUserStampCards(user.id);
        setUserCards(cards);
      } else {
        setError('Customer not found. Make sure the customer has registered and has a valid unique code.');
        setSelectedUser(null);
        setUserCards([]);
      }
    } catch (err) {
      console.error('Error processing QR scan:', err);
      setError('Error processing QR code. Please try again.');
    }
  };

  const handleAddStamp = async (cardId: string) => {
    const card = userCards.find(c => c.id === cardId);
    if (card && card.currentStamps < card.stampsRequired) {
      await addStamp(cardId);
      const cards = await getUserStampCards(selectedUser!.id);
      setUserCards(cards);
    }
  };

  const handleRedeem = async (cardId: string) => {
    const card = userCards.find(c => c.id === cardId);
    if (card) {
      const updatedCard: StampCardType = {
        ...card,
        status: 'redeemed' as const,
      };
      await saveStampCard(updatedCard);
      const cards = await getUserStampCards(selectedUser!.id);
      setUserCards(cards);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const handleViewAllCustomers = async () => {
    const allUsers = await getUsers();
    const customers = allUsers.filter(u => u.role === 'customer');
    setAllCustomers(customers);
    setShowAllCustomers(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-amber-900" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-amber-50">Admin Panel</h1>
                <p className="text-xs sm:text-sm text-amber-200">Manage Customer Stamp Cards</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-amber-50 bg-amber-800/50 hover:bg-amber-800 rounded-lg transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Search Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-100 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-amber-900 mb-4 sm:mb-6 flex items-center gap-2">
            <Search className="w-5 h-5" />
            Find Customer
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter customer's unique code"
              className="flex-1 px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/50 text-amber-900 placeholder-amber-400 text-sm sm:text-base"
            />
            <button
              onClick={handleSearch}
              className="px-4 sm:px-6 py-3 bg-gradient-to-r from-amber-800 to-amber-900 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Search</span>
            </button>
            <button
              onClick={() => setShowQRScanner(true)}
              className="px-4 sm:px-6 py-3 bg-gradient-to-r from-amber-700 to-amber-800 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Scan QR</span>
            </button>
            <button
              onClick={handleViewAllCustomers}
              className="px-4 sm:px-6 py-3 bg-amber-100 text-amber-900 rounded-xl hover:bg-amber-200 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">View All</span>
            </button>
          </div>
          {error && (
            <div className="mt-4 text-red-600 text-xs sm:text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* All Customers Modal */}
        {showAllCustomers && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-amber-900">All Customers</h2>
                <button
                  onClick={() => setShowAllCustomers(false)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
              {allCustomers.length === 0 ? (
                <p className="text-amber-600 text-center py-8 text-sm sm:text-base">No customers registered yet.</p>
              ) : (
                <div className="space-y-3">
                  {allCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-3 sm:p-4 border border-amber-100 rounded-xl hover:bg-amber-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSearchCode(customer.uniqueCode);
                        setShowAllCustomers(false);
                        handleSearch();
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-amber-900 text-sm sm:text-base">{customer.name}</h3>
                          <p className="text-xs sm:text-sm text-amber-600">{customer.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-mono text-amber-800 bg-amber-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                            {customer.uniqueCode}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Customer Info */}
        {selectedUser && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-100 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-amber-900">{selectedUser.name}</h2>
                <p className="text-amber-600 text-sm sm:text-base">{selectedUser.email}</p>
              </div>
              <div className="bg-amber-100 rounded-xl p-3">
                <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-amber-800" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-amber-600 text-center sm:text-left">
              Unique Code: <span className="font-mono font-bold text-amber-900">{selectedUser.uniqueCode}</span>
            </p>
          </div>
        )}

        {/* Stamp Cards */}
        {selectedUser && userCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {userCards.map((card) => (
              <div key={card.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-amber-100 hover:shadow-xl transition-shadow">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-amber-800 to-amber-900 p-4 sm:p-6 text-white">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <Coffee className="w-5 h-5 sm:w-6 sm:h-6" />
                    <h3 className="text-base sm:text-lg font-semibold">{card.cafeName}</h3>
                  </div>
                  <p className="text-amber-100 text-xs sm:text-sm">{card.rewardDescription}</p>
                </div>

                {/* Progress Section */}
                <div className="p-4 sm:p-6 bg-gradient-to-br from-white to-amber-50/30">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-xs sm:text-sm font-medium text-amber-800">
                      {card.currentStamps} / {card.stampsRequired} stamps
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-amber-900">
                      {Math.round((card.currentStamps / card.stampsRequired) * 100)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-amber-100 rounded-full h-1.5 sm:h-2 mb-4 sm:mb-6">
                    <div
                      className="bg-gradient-to-r from-amber-600 to-amber-800 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(card.currentStamps / card.stampsRequired) * 100}%` }}
                    />
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
                    {card.currentStamps < card.stampsRequired ? (
                      <button
                        onClick={() => handleAddStamp(card.id)}
                        className="flex-1 bg-gradient-to-r from-amber-700 to-amber-900 text-white py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium hover:from-amber-600 hover:to-amber-800 transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Add Stamp</span>
                        <span className="sm:hidden">Add</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRedeem(card.id)}
                        className="flex-1 bg-gradient-to-r from-amber-700 to-amber-900 text-white py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium hover:from-amber-600 hover:to-amber-800 transition-all shadow-md"
                      >
                        Redeem Reward
                      </button>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="mt-3 sm:mt-4 text-center">
                    <span className="text-xs text-amber-600 font-medium">
                      {card.currentStamps >= card.stampsRequired ? 'Ready to redeem' : card.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : selectedUser ? (
          <div className="text-center py-12 sm:py-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-100">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Coffee className="w-8 h-8 sm:w-10 sm:h-10 text-amber-800" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-amber-900 mb-2 sm:mb-3">No Stamp Cards</h2>
            <p className="text-amber-700 text-sm sm:text-base">This customer hasn't created any stamp cards yet.</p>
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-100">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Search className="w-8 h-8 sm:w-10 sm:h-10 text-amber-800" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-amber-900 mb-2 sm:mb-3">Search for Customer</h2>
            <p className="text-amber-700 text-sm sm:text-base">Enter a customer's QR code to view and manage their stamp cards.</p>
          </div>
        )}
      </main>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </div>
  );
}
