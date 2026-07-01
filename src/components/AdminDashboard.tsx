import React, { useState } from 'react';
import { Shield, Package, TrendingUp, DollarSign, AlertTriangle, FileText, CheckCircle, Clock, Truck, RefreshCw, Plus, Minus } from 'lucide-react';
import { Order, Product } from '../types';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onRefreshData: () => void;
}

export default function AdminDashboard({ products, orders, onRefreshData }: AdminDashboardProps) {
  const [restockAmount, setRestockAmount] = useState<Record<string, number>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Sales Analytics calculations
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((acc, order) => {
      // Convert everything back to a standard baseline estimate of USD
      const amt = order.totalAmount;
      if (order.currency === 'EUR') return acc + amt / 0.92;
      if (order.currency === 'GBP') return acc + amt / 0.78;
      if (order.currency === 'INR') return acc + amt / 83.5;
      return acc + amt;
    }, 0);

  const lowStockCount = products.filter((p) => p.inventory < 15).length;
  const pendingOrders = orders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;

  const handleRestock = async (productId: string) => {
    const amount = restockAmount[productId] || 10;
    setUpdatingId(productId);

    try {
      const response = await fetch('/api/products/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, amount }),
      });

      if (response.ok) {
        onRefreshData();
        setRestockAmount({ ...restockAmount, [productId]: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (response.ok) {
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Generate elegant SVG points for revenue trends over the past week
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const trendData = [320, 410, 390, 520, 680, 890, totalRevenue > 0 ? Math.round(totalRevenue) : 1240];
  const maxVal = Math.max(...trendData);
  const chartPoints = trendData
    .map((val, idx) => {
      const x = (idx / (trendData.length - 1)) * 100;
      const y = 100 - (val / maxVal) * 80;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-8 text-left">
      {/* 1. Header with Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-200">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">Store Administration Dashboard</h2>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Real-time Shelves & Deliveries Pipeline
            </p>
          </div>
        </div>

        <button
          onClick={onRefreshData}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Sync Live Database
        </button>
      </div>

      {/* 2. Analytics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rev */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Sales</span>
            <span className="font-display text-xl font-extrabold text-slate-950 font-mono">
              ${totalRevenue.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Orders */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Orders Placed</span>
            <span className="font-display text-xl font-extrabold text-slate-950 font-mono">
              {orders.length} Total
            </span>
          </div>
        </div>

        {/* Pending */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Clock className="h-6 w-6 font-semibold" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Pipeline</span>
            <span className="font-display text-xl font-extrabold text-slate-950 font-mono">
              {pendingOrders} Orders
            </span>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Needs Restocking</span>
            <span className="font-display text-xl font-extrabold text-slate-950 font-mono">
              {lowStockCount} Products
            </span>
          </div>
        </div>
      </div>

      {/* 3. Analytics Chart + Recent Orders Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-800">Sales Trend Chart</h3>
            <p className="text-xs text-slate-400 font-semibold mb-4">Historical sales progression weekly</p>
          </div>

          <div className="relative h-44 w-full bg-slate-50/50 rounded-xl border border-slate-100 p-2 overflow-hidden flex flex-col justify-end">
            {/* SVG line graph */}
            <svg className="h-32 w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Fill area */}
              <polygon
                points={`0,100 ${chartPoints} 100,100`}
                fill="url(#chartGrad)"
              />
              {/* Line */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                points={chartPoints}
                strokeLinecap="round"
              />
            </svg>

            {/* Labels */}
            <div className="flex justify-between mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
              {weekDays.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Deliveries Pipeline */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <h3 className="font-display text-sm font-bold text-slate-800 border-b border-slate-50 pb-3 mb-3">
            Real-Time Deliveries Pipeline ({orders.length})
          </h3>

          {orders.length === 0 ? (
            <p className="text-slate-400 text-xs py-8 text-center">No active pipeline requests recorded.</p>
          ) : (
            <div className="space-y-3 max-h-56 overflow-y-auto">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/30 p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
                >
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800">Order #{order.id}</span>
                      <span className="font-mono font-bold text-slate-500">
                        {order.currencySymbol}
                        {order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">
                      Recipient: {order.deliveryDetails.name} • {order.deliveryDetails.phone}
                    </p>
                    <p className="text-slate-500 font-medium truncate max-w-[300px]">
                      Slot: <span className="text-emerald-700 font-bold">{order.deliveryDetails.date} ({order.deliveryDetails.timeSlot})</span>
                    </p>
                  </div>

                  {/* Status Selection Form */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Real-time Shelf Inventory System */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
        <h3 className="font-display text-sm font-bold text-slate-800 border-b border-slate-50 pb-3 mb-4">
          Shelf Inventory Database Management
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const isLow = product.inventory < 15;
            const currentRestock = restockAmount[product.id] || 10;

            return (
              <div
                key={product.id}
                className="rounded-xl border border-slate-100 p-3.5 bg-slate-50/20 flex gap-3 text-xs justify-between"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-14 w-14 rounded-lg object-cover bg-slate-100"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between text-left">
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <p className="font-bold text-slate-800 truncate leading-tight">{product.name}</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {product.category}
                    </span>
                  </div>

                  {/* Inventory indicator */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-mono text-slate-500">Stock:</span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                        product.inventory === 0
                          ? 'bg-red-100 text-red-800'
                          : isLow
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {product.inventory} items
                    </span>
                  </div>
                </div>

                {/* Restocking control buttons */}
                <div className="flex flex-col justify-between items-end border-l border-slate-100 pl-3">
                  <div className="flex items-center gap-1.5 bg-white p-0.5 rounded-lg border border-slate-200">
                    <button
                      onClick={() =>
                        setRestockAmount({
                          ...restockAmount,
                          [product.id]: Math.max(1, currentRestock - 5),
                        })
                      }
                      className="p-1 rounded-md text-slate-600 hover:bg-slate-100"
                    >
                      -5
                    </button>
                    <span className="font-mono font-bold px-1">{currentRestock}</span>
                    <button
                      onClick={() =>
                        setRestockAmount({
                          ...restockAmount,
                          [product.id]: currentRestock + 5,
                        })
                      }
                      className="p-1 rounded-md text-slate-600 hover:bg-slate-100"
                    >
                      +5
                    </button>
                  </div>

                  <button
                    onClick={() => handleRestock(product.id)}
                    disabled={updatingId === product.id}
                    className="mt-2 w-full flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-2 py-1.5 rounded-lg font-bold text-[10px] transition-all disabled:opacity-50"
                  >
                    <Package className="h-3 w-3" />
                    Restock
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
