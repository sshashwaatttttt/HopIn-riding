import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Star, CheckCircle2, Award, X } from 'lucide-react';

export const RatingModal = ({ isOpen, onClose, members, currentUserId, onComplete }) => {
  const { t } = useLanguage();
  const [ratings, setRatings] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const coRiders = (members || []).filter(m => m.id !== currentUserId);

  const handleStarClick = (memberId, starValue) => {
    setRatings(prev => ({ ...prev, [memberId]: starValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-amber-500/30 p-6 md:p-8 overflow-hidden">
        
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2 text-amber-500 font-black text-lg">
            <Award className="w-6 h-6" />
            <span>{t('rateTitle')}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-16 h-16 text-amber-500 mx-auto mb-3 animate-bounce" />
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Ratings Submitted!</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Thanks for keeping the BBD HopIn community safe and friendly!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {t('rateDesc')}
            </p>

            <div className="space-y-4">
              {coRiders.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No other co-riders in squad.</p>
              ) : (
                coRiders.map((member) => {
                  const currentRating = ratings[member.id] || 5;
                  return (
                    <div key={member.id} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={member.avatar} alt={member.name} className="w-9 h-9 rounded-xl object-cover" />
                        <div>
                          <span className="text-xs font-extrabold text-gray-900 dark:text-white block">{member.name}</span>
                          <span className="text-[10px] text-gray-400">Co-rider</span>
                        </div>
                      </div>

                      {/* 1 to 5 Star picker */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => handleStarClick(member.id, star)}
                            className="p-1 hover:scale-125 transition-transform"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= currentRating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-gray-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all"
            >
              Submit Squad Ratings ⭐
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
