import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { blockUser } from '../utils/store';
import { ShieldAlert, AlertTriangle, UserX, CheckCircle, X } from 'lucide-react';

export const SOSModal = ({ isOpen, onClose, rideMembers, currentUserId }) => {
  const { t } = useLanguage();
  const [selectedReason, setSelectedReason] = useState('harassment');
  const [selectedUserToBlock, setSelectedUserToBlock] = useState('');
  const [details, setDetails] = useState('');
  const [reported, setReported] = useState(false);

  if (!isOpen) return null;

  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (selectedUserToBlock) {
      blockUser(selectedUserToBlock);
    }
    setReported(true);
  };

  const otherMembers = (rideMembers || []).filter(m => m.id !== currentUserId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-red-500/40 p-6 md:p-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-black text-lg">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <span>{t('sosTitle')}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {reported ? (
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-3 animate-bounce" />
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Emergency Alert Logged</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-6">
              Our safety team has received your report. The reported student has been blocked from your feed and squad interactions.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-950 font-extrabold text-xs"
            >
              Close Safety Dialog
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-600 dark:text-red-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Use this feature only for genuine safety concerns, harassment, or inappropriate conduct during your ride.
              </span>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 mb-1.5">
                Primary Issue Category
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
              >
                <option value="harassment">Uncomfortable / Inappropriate Behavior</option>
                <option value="reckless">Reckless Auto/Cab Driver</option>
                <option value="no_show">No Show / Misleading Info</option>
                <option value="safety_threat">Direct Safety Threat</option>
              </select>
            </div>

            {otherMembers.length > 0 && (
              <div>
                <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 mb-1.5">
                  Block Co-rider (Optional)
                </label>
                <div className="space-y-1.5">
                  {otherMembers.map(m => (
                    <label key={m.id} className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <input
                        type="radio"
                        name="userToBlock"
                        value={m.id}
                        checked={selectedUserToBlock === m.id}
                        onChange={() => setSelectedUserToBlock(m.id)}
                        className="text-red-500 focus:ring-red-500"
                      />
                      <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full object-cover" />
                      <span className="text-xs font-extrabold text-gray-900 dark:text-white">{m.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 mb-1">
                Additional Incident Details
              </label>
              <textarea
                rows={3}
                placeholder="Describe what happened so domain incharge can take immediate action..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
            >
              <UserX className="w-4 h-4" />
              <span>Submit SOS Alert & Block 🚨</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
