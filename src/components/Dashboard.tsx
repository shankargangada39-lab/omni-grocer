import React, { useState } from 'react';
import { User, Phone, MapPin, Mail, ShoppingBag, ClipboardList, CheckCircle, Clock, Calendar, ChevronRight, FileText, Trash2, Play, Plus, RefreshCw } from 'lucide-react';
import { Order, ShoppingList, Product, UserProfile } from '../types';

interface DashboardProps {
  userProfile: UserProfile;
  orders: Order[];
  shoppingLists: ShoppingList[];
  products: Product[];
  onUpdateProfile: (profile: UserProfile) => void;
  onUpdateShoppingLists: (lists: ShoppingList[]) => void;
  onLoadListToCart: (items: { productId: string; quantity: number }[]) => void;
}

export default function Dashboard({
  userProfile,
  orders,
  shoppingLists,
  products,
  onUpdateProfile,
  onUpdateShoppingLists,
  onLoadListToCart,
}: DashboardProps) {
  // Profile Form States
  const [name, setName] = useState(userProfile.name);
  const [phone, setPhone] = useState(userProfile.phone);
  const [address, setAddress] = useState(userProfile.address);
  const [email, setEmail] = useState(userProfile.email);
  const [profileMsg, setProfileMsg] = useState('');

  // Shopping List Creator States
  const [listName, setListName] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ productId: string; name: string; quantity: number }[]>([]);
  const [isRecurring, setIsRecurring] = useState(true);
  const [recurrenceInterval, setRecurrenceInterval] = useState<'Weekly' | 'Biweekly' | 'Monthly'>('Weekly');
  const [listError, setListError] = useState('');

  // Selected receipt view modal
  const [viewingReceipt, setViewingReceipt] = useState<Order | null>(null);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name, phone, address, email });
    setProfileMsg('Profile saved successfully!');
    setTimeout(() => setProfileMsg(''), 3000);
  };

  const handleAddItemToList = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existing = selectedItems.find((i) => i.productId === productId);
    if (existing) {
      setSelectedItems(selectedItems.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      setSelectedItems([...selectedItems, { productId, name: product.name, quantity: 1 }]);
    }
  };

  const handleRemoveItemFromList = (productId: string) => {
    setSelectedItems(selectedItems.filter((i) => i.productId !== productId));
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) {
      return setListError('Please enter a name for the shopping list.');
    }
    if (selectedItems.length === 0) {
      return setListError('Please add at least one item to the list.');
    }

    setListError('');

    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: listName,
          items: selectedItems,
          isRecurring,
          recurrenceInterval,
        }),
      });

      const updatedLists = await response.json();
      onUpdateShoppingLists(updatedLists);

      // Reset
      setListName('');
      setSelectedItems([]);
      setProfileMsg('Recurring shopping list saved successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setListError('Failed to save the list on the server.');
    }
  };

  const handleDeleteList = async (listId: string) => {
    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      onUpdateShoppingLists(data.lists);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* 1. Account Settings Sidebar Panel */}
      <div className="lg:col-span-1 space-y-6 text-left">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 shadow-sm">
              <User className="h-5.5 w-5.5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">User Profile Settings</h3>
              <p className="text-xs text-slate-400 font-medium">Manage your personal delivery details</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden"
                  placeholder="Your Name"
                />
                <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full rounded-lg border border-slate-100 bg-slate-50 pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-400 cursor-not-allowed focus:outline-hidden"
                  placeholder="Email"
                />
                <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-300" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden"
                  placeholder="Phone number"
                />
                <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Default Delivery Address</label>
              <div className="relative">
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden resize-none"
                  placeholder="Street address, unit"
                />
                <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            {profileMsg && (
              <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-2 rounded-lg">
                {profileMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 py-2.5 text-xs font-bold text-white transition-all hover:scale-[1.01]"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      </div>

      {/* 2. Order History & Shopping Lists (Large 2-column Panel) */}
      <div className="lg:col-span-2 space-y-8 text-left">
        {/* Order History */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 shadow-sm">
                <ShoppingBag className="h-5.5 w-5.5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">Order History</h3>
                <p className="text-xs text-slate-400 font-medium">Track your previous local delivery requests</p>
              </div>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-400 text-sm font-semibold">No deliveries recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-800">Order #{order.id}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400 text-[11px] font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="font-mono text-slate-600">
                        {order.currencySymbol}
                        {order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate max-w-[300px]">
                      📍 {order.deliveryDetails.address}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setViewingReceipt(order)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg hover:bg-white bg-slate-50 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      Invoice Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recurring Shopping Lists Section */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 shadow-sm">
                <ClipboardList className="h-5.5 w-5.5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">Recurring Shopping Lists</h3>
                <p className="text-xs text-slate-400 font-medium">Auto-fill your cart for quick re-orders</p>
              </div>
            </div>
          </div>

          {/* Quick List Creator Form */}
          <form onSubmit={handleCreateList} className="mb-6 bg-slate-50/50 rounded-xl border border-slate-100 p-4 space-y-4">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Create New Recurring List</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block">List Name</label>
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                  placeholder="e.g. My Weekly Essentials"
                />
              </div>

              {/* Toggle Recurring Frequency */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block">Recurrence Frequency</label>
                <div className="flex gap-2">
                  <select
                    value={recurrenceInterval}
                    onChange={(e: any) => setRecurrenceInterval(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="Weekly">Weekly Delivery</option>
                    <option value="Biweekly">Biweekly Delivery</option>
                    <option value="Monthly">Monthly Delivery</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Selector of products to list */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 block">Add Grocery Items to List</label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto bg-white p-2 border border-slate-200 rounded-lg">
                {products.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleAddItemToList(prod.id)}
                    className="flex items-center gap-1 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 border border-slate-100 px-2 py-1 rounded-md text-[11px] font-bold transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    {prod.name}
                  </button>
                ))}
              </div>
            </div>

            {/* List Preview */}
            {selectedItems.length > 0 && (
              <div className="bg-white rounded-lg p-2.5 border border-slate-200 text-xs">
                <p className="font-bold text-slate-600 mb-1.5">Selected Items Preview:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedItems.map((item) => (
                    <span
                      key={item.productId}
                      className="flex items-center gap-1.5 bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full font-semibold"
                    >
                      {item.name} (x{item.quantity})
                      <button
                        type="button"
                        onClick={() => handleRemoveItemFromList(item.productId)}
                        className="text-slate-400 hover:text-red-600 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {listError && (
              <p className="text-xs font-bold text-red-600 bg-red-50 p-2 border border-red-100 rounded-lg">
                {listError}
              </p>
            )}

            <button
              type="submit"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 transition-all"
            >
              Save List Setup
            </button>
          </form>

          {/* Current Saved Lists Grid */}
          {shoppingLists.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-6">No custom grocery lists saved yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shoppingLists.map((list) => (
                <div
                  key={list.id}
                  className="rounded-xl border border-slate-100 bg-white p-4 text-left shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start border-b border-slate-50 pb-2 mb-2">
                      <div>
                        <p className="font-bold text-sm text-slate-800 leading-tight">{list.name}</p>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider block mt-1 w-max">
                          🔄 {list.recurrenceInterval}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteList(list.id)}
                        className="p-1 text-slate-400 hover:text-red-600"
                        title="Delete List"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <ul className="space-y-1 text-xs text-slate-500 font-semibold max-h-32 overflow-y-auto">
                      {list.items.map((it) => (
                        <li key={it.productId} className="flex justify-between">
                          <span>• {it.name}</span>
                          <span>x{it.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => onLoadListToCart(list.items)}
                    className="mt-4 w-full flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all"
                  >
                    <Play className="h-3 w-3" />
                    Load List to Shopping Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Receipt Invoice Viewer Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setViewingReceipt(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 text-left max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewingReceipt(null)}
              className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-dashed border-slate-200 pb-5 mb-5 text-center">
              <h4 className="font-display text-lg font-extrabold text-slate-900">Omini Grocer Receipt</h4>
              <p className="text-xs text-slate-400">Order Invoice Confirmation</p>
              <div className="mt-4 bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-xs text-slate-600 flex justify-between font-mono">
                <span>Receipt Ref</span>
                <span className="font-bold text-slate-800">{viewingReceipt.receiptNumber}</span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-600">
              {/* Delivery info */}
              <div className="space-y-1.5">
                <p className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-2">Delivery Particulars</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block">Recipient Name</span>
                    <span className="text-slate-800 font-bold">{viewingReceipt.deliveryDetails.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Recipient Contact</span>
                    <span className="text-slate-800 font-bold">{viewingReceipt.deliveryDetails.phone}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block">Delivery Address</span>
                  <span className="text-slate-800 font-bold">{viewingReceipt.deliveryDetails.address}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block">Delivery Date</span>
                    <span className="text-slate-800 font-extrabold text-emerald-700">{viewingReceipt.deliveryDetails.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Delivery Window</span>
                    <span className="text-slate-800 font-extrabold text-emerald-700">{viewingReceipt.deliveryDetails.timeSlot}</span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-slate-100 pt-4">
                <p className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-2">Purchased Shelves</p>
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-100 bg-slate-50/50">
                  {viewingReceipt.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between p-2.5 bg-white">
                      <div>
                        <span className="font-bold text-slate-800">{item.name}</span>
                        <span className="text-slate-400 font-semibold block text-[10px]">{item.unit}</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-slate-500">
                          {item.quantity} x {viewingReceipt.currencySymbol}
                          {item.price.toFixed(2)}
                        </span>
                        <span className="text-slate-800 font-bold block">
                          {viewingReceipt.currencySymbol}
                          {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-dashed border-slate-200 pt-4 flex flex-col space-y-1.5 text-right">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Total Invoice Amount</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {viewingReceipt.currencySymbol}
                    {viewingReceipt.totalAmount.toFixed(2)} {viewingReceipt.currency}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Payment Gateway Status</span>
                  <span className="text-emerald-600 font-bold uppercase tracking-wider text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    💳 Paid In Full
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setViewingReceipt(null)}
              className="mt-6 w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition-colors text-center"
            >
              Close Invoice Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Helper
function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  );
}
