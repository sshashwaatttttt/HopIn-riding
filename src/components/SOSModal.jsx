import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { blockUser, unblockUser, getBlockedUserIds } from '../utils/store';
import { ShieldAlert, AlertTriangle, UserX, CheckCircle, X, UserCheck, RotateCcw } from 'lucide-react';

export const SOSModal = ({ isOpen, onClose, rideMembers, currentUserId }) => {
  const { t } = useLanguage();
  const [selectedReason, setSelectedReason] = useState('harassment');
  const [selectedUserToBlock, setSelectedUserToBlock] = useState('');
  const [details, setDetails] = useState('');
  const [reported, setReported] = useState(false);
  const [blockedIds, setBlockedIds] = useState([]);
  const [lastBlockedUser, setLastBlockedUser] = useState(null);
  const [actionNotice, setActionNotice] = useState('');

  useEffect(() => {
    if (isOpen) {
      setBlockedIds(getBlockedUserIds());
      setSelectedUserToBlock('');
      setReported(false);
      setLastBlockedUser(null);
      setActionNotice('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const otherMembers = (rideMembers || []).filter(m => m.id !== currentUserId);

  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (selectedUserToBlock) {
      const targetMember = otherMembers.find(m => m.id === selectedUserToBlock);
      const memberObj = targetMember || { id: selectedUserToBlock, name: 'Co-rider', avatar: '' };
      blockUser(memberObj, {
        name: memberObj.name,
        avatar: memberObj.avatar,
        reason: selectedReason === 'harassment' 
          ? 'Inappropriate Conduct' 
          : selectedReason === 'safety_threat' 
            ? 'Direct Safety Threat' 
            : 'SOS Report'
      });
      setLastBlockedUser(memberObj);
      setBlockedIds(getBlockedUserIds());
    }
    setReported(true);
  };

  const handleInlineUnblock = (memberId, memberName) => {
    unblockUser(memberId);
    setBlockedIds(getBlockedUserIds());
    setActionNotice(`${memberName || 'User'} has been unblocked.`);
    setTimeout(() => setActionNotice(''), 3000);
  };

  const handleUndoBlock = () => {
    if (!lastBlockedUser) return;
    unblockUser(lastBlockedUser.id);
    setBlockedIds(getBlockedUserIds());
    setActionNotice(`${lastBlockedUser.name} has been unblocked.`);
    setLastBlockedUser(null);
  };

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

        {actionNotice && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {reported ? (
          <div className="text-center py-4 space-y-4">
            <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Emergency Alert Logged</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Our safety team has received your report and relevant details have been recorded.
              </p>
            </div>

            {lastBlockedUser ? (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-left flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={lastBlockedUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${lastBlockedUser.id}`}
                    alt={lastBlockedUser.name}
                    className="w-9 h-9 rounded-xl object-cover border border-red-500/30 shrink-0"
                  />
                  <div className="truncate">
                    <span className="text-xs font-black text-gray-900 dark:text-white block truncate">
                      {lastBlockedUser.name}
                    </span>
                    <span className="text-[10px] font-extrabold text-red-500 block uppercase">
                      Blocked from your rides & chats 🚫
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUndoBlock}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-black border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1.5 shrink-0 shadow-sm transition-all active:scale-95"
                  title="Undo block"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                  <span>Unblock</span>
                </button>
              </div>
            ) : actionNotice ? null : (
              <div className="text-xs font-bold text-gray-500">
                No user was blocked for this report.
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-950 font-extrabold text-xs uppercase tracking-wider"
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
                  Co-riders in this Ride
                </label>
                <div className="space-y-2">
                  {otherMembers.map(m => {
                    const isBlocked = blockedIds.includes(m.id);

                    if (isBlocked) {
                      return (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-red-500/30 bg-red-500/5"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover grayscale opacity-75 shrink-0" />
                            <div className="truncate">
                              <span className="text-xs font-extrabold text-gray-900 dark:text-white block truncate">
                                {m.name}
                              </span>
                              <span className="text-[10px] font-bold text-red-500 block">
                                Currently Blocked 🚫
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleInlineUnblock(m.id, m.name)}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-[11px] font-extrabold border border-gray-200 dark:border-gray-700 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 flex items-center gap-1 transition-all shadow-sm shrink-0 active:scale-95"
                          >
                            <UserCheck className="w-3 h-3 text-emerald-500" />
                            <span>Unblock</span>
                          </button>
                        </div>
                      );
                    }

                    return (
                      <label
                        key={m.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                          selectedUserToBlock === m.id
                            ? 'border-red-500 bg-red-500/10'
                            : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="userToBlock"
                            value={m.id}
                            checked={selectedUserToBlock === m.id}
                            onChange={() => setSelectedUserToBlock(m.id)}
                            className="text-red-500 focus:ring-red-500"
                          />
                          <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                          <span className="text-xs font-extrabold text-gray-900 dark:text-white">{m.name}</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">
                          {selectedUserToBlock === m.id ? 'Will be blocked' : 'Select to block'}
                        </span>
                      </label>
                    );
                  })}
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
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <UserX className="w-4 h-4" />
              <span>{selectedUserToBlock ? 'Submit SOS Alert & Block 🚨' : 'Submit SOS Safety Alert 🚨'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
