import React from 'react';
import { ShoppingBag, Bell, MessageSquare, Shield, User, RefreshCw } from 'lucide-react';
import { CurrencyCode, CURRENCY_MAP } from '../types';

interface NavbarProps {
  activeTab: 'shop' | 'dashboard' | 'admin';
  setActiveTab: (tab: 'shop' | 'dashboard' | 'admin') => void;
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  cartCount: number;
  toggleCart: () => void;
  toggleChat: () => void;
  unreadCount: number;
  toggleEmails: () => void;
  userEmail: string;
  userName: string;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  cartCount,
  toggleCart,
  toggleChat,
  unreadCount,
  toggleEmails,
  userEmail,
  userName,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/90 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('shop')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-200">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-slate-900">
              FreshMarket<span className="text-emerald-600">.Co</span>
            </h1>
            <p className="font-sans text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Local & Fresh</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'shop'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Browse Products
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            My Account
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'admin'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="h-4 w-4" />
            Admin Panel
          </button>
        </nav>

        {/* Utility Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Currency Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            {(Object.keys(CURRENCY_MAP) as CurrencyCode[]).map((code) => (
              <button
                key={code}
                onClick={() => setCurrency(code)}
                className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                  currency === code
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title={`Convert store prices to ${code}`}
              >
                {CURRENCY_MAP[code].symbol}
              </button>
            ))}
          </div>

          {/* Simulated Email/Receipts Tray */}
          <button
            onClick={toggleEmails}
            className="relative p-2 text-slate-500 hover:text-emerald-600 transition-colors rounded-lg hover:bg-slate-50"
            title="Simulated Mailbox Receipts"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* AI Support Chat Button */}
          <button
            onClick={toggleChat}
            className="p-2 text-slate-500 hover:text-emerald-600 transition-colors rounded-lg hover:bg-slate-50 relative"
            title="FreshMarket Support Assistant"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </button>

          {/* Shopping Cart Button */}
          <button
            onClick={toggleCart}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-medium text-sm transition-all shadow-md shadow-emerald-100 hover:scale-[1.02]"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500/80 px-1 text-xs font-semibold text-white">
              {cartCount}
            </span>
          </button>

          {/* User Profile Summary */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
            title="View Profile Details"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-emerald-700 font-bold text-sm">
              {userName.charAt(0)}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">{userName}</span>
              <span className="text-[10px] text-slate-400 font-medium leading-none">{userEmail}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation panel */}
      <div className="flex md:hidden border-t border-slate-100 bg-slate-50/50 justify-around py-2 px-4">
        <button
          onClick={() => setActiveTab('shop')}
          className={`text-xs font-medium py-1 px-3 rounded-lg ${
            activeTab === 'shop' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'text-slate-500'
          }`}
        >
          Shop
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`text-xs font-medium py-1 px-3 rounded-lg ${
            activeTab === 'dashboard' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'text-slate-500'
          }`}
        >
          My Profile
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex items-center gap-1 text-xs font-medium py-1 px-3 rounded-lg ${
            activeTab === 'admin' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-500'
          }`}
        >
          <Shield className="h-3 w-3" />
          Admin
        </button>
      </div>
    </header>
  );
}
