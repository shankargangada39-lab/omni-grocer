import React, { useState } from 'react';
import { X, Mail, Check, Inbox, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { EmailNotification } from '../types';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  emails: EmailNotification[];
  onMarkAllRead: () => void;
}

export default function NotificationsPanel({
  isOpen,
  onClose,
  emails,
  onMarkAllRead,
}: NotificationsPanelProps) {
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedEmailId(expandedEmailId === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      {/* Main Container */}
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Mail className="h-4 w-4" />
            </div>
            <h2 className="font-display text-lg font-bold text-slate-900">Simulated Email Inbox</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex justify-between items-center bg-slate-50 px-4 py-2 border-b border-slate-100 text-xs font-semibold">
          <span className="text-slate-400 uppercase tracking-wider text-[10px]">Automated Transactions Outbox</span>
          <button
            onClick={onMarkAllRead}
            className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
          >
            <Check className="h-3 w-3" />
            Mark All Viewed
          </button>
        </div>

        {emails.length === 0 ? (
          /* Empty inbox state */
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <Inbox className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-slate-400 font-bold text-sm">Your Mailbox is empty</p>
            <p className="text-slate-500 text-xs mt-1 leading-normal max-w-xs">
              When you place orders or update delivery status, our system transmits automated invoices and updates here.
            </p>
          </div>
        ) : (
          /* Email Lists */
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-2 bg-slate-50/30">
            {emails.map((email) => {
              const isExpanded = expandedEmailId === email.id;

              return (
                <div
                  key={email.id}
                  className={`rounded-xl border border-slate-100 bg-white p-3 text-left transition-all ${
                    isExpanded ? 'shadow-md ring-1 ring-emerald-500/20' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start cursor-pointer" onClick={() => toggleExpand(email.id)}>
                    <div className="flex gap-2.5 min-w-0">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          email.type === 'Receipt'
                            ? 'bg-emerald-50 text-emerald-700'
                            : email.type === 'StatusUpdate'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 text-left">
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                            email.type === 'Receipt'
                              ? 'bg-emerald-100 text-emerald-800'
                              : email.type === 'StatusUpdate'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {email.type}
                        </span>
                        <p className="text-xs font-bold text-slate-800 truncate leading-tight mt-1">{email.subject}</p>
                        <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(email.sentAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <button className="text-slate-400 hover:text-slate-600">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 border-t border-slate-50 pt-3 text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                      {email.body}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
