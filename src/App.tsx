import { useState, useEffect } from 'react';
import { Search, ShoppingBag, X, Check, Heart, HelpCircle, Store, Shield } from 'lucide-react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CartSidebar from './components/CartSidebar';
import CheckoutModal from './components/CheckoutModal';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import ChatSystem from './components/ChatSystem';
import NotificationsPanel from './components/NotificationsPanel';
import { Product, CartItem, Order, UserProfile, ShoppingList, EmailNotification, CurrencyCode } from './types';

export default function App() {
  // Navigation Tabs & Open-State Sidebar Toggles
  const [activeTab, setActiveTab] = useState<'shop' | 'dashboard' | 'admin'>('shop');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEmailsOpen, setIsEmailsOpen] = useState(false);

  // Loaded database state
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [emails, setEmails] = useState<EmailNotification[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    email: 'shankargangada39@gmail.com',
    name: 'Shankar Gangada',
    phone: '+1 (555) 123-4567',
    address: '123 Green Valley Road, Suite A',
  });

  // Client shopping basket state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('fresh_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Checkout Schedule Delivery Carrier Info
  const [checkoutDetails, setCheckoutDetails] = useState<any | null>(null);

  // Load backend synchronized data on boot
  const syncDatabase = async () => {
    try {
      const [resProducts, resOrders, resLists, resEmails, resProfile] = await Promise.all([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json()),
        fetch('/api/lists').then((r) => r.json()),
        fetch('/api/emails').then((r) => r.json()),
        fetch('/api/profile').then((r) => r.json()),
      ]);

      setProducts(resProducts);
      setOrders(resOrders);
      setShoppingLists(resLists);
      setEmails(resEmails);
      setUserProfile(resProfile);
    } catch (err) {
      console.error('Failed to communicate with full-stack Express server:', err);
    }
  };

  useEffect(() => {
    syncDatabase();
  }, []);

  // Sync cart edits with local storage
  useEffect(() => {
    localStorage.setItem('fresh_cart', JSON.stringify(cart));
  }, [cart]);

  // Product Inventory Add to Cart validations
  const handleAddToCart = (product: Product) => {
    const existing = cart.find((item) => item.product.id === product.id);
    const availableStock = product.inventory;

    if (existing) {
      if (existing.quantity >= availableStock) {
        alert(`Cannot add more of ${product.name}. Out of stock on our shelves.`);
        return;
      }
      setCart(
        cart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      if (availableStock <= 0) {
        alert(`Sorry, ${product.name} is out of stock.`);
        return;
      }
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.product.id !== productId));
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (product && quantity > product.inventory) {
      alert(`Cannot exceed active stock level. Only ${product.inventory} available.`);
      return;
    }

    setCart(
      cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const handleProceedToCheckout = (details: any) => {
    setCheckoutDetails(details);
    setIsCartOpen(false);
  };

  const handlePaymentSuccess = () => {
    setCart([]); // Reset Cart
    syncDatabase(); // Re-sync shelves stock & receipts invoice outbox
    setActiveTab('dashboard'); // Redirect to order tracing
  };

  const handleUpdateProfile = async (newProfile: UserProfile) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile),
      });
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onLoadListToCart = (items: { productId: string; quantity: number }[]) => {
    const newCart = [...cart];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (product && product.inventory > 0) {
        const existingIdx = newCart.findIndex((c) => c.product.id === product.id);
        const maxAdd = Math.min(item.quantity, product.inventory);

        if (existingIdx !== -1) {
          newCart[existingIdx].quantity = Math.min(newCart[existingIdx].quantity + maxAdd, product.inventory);
        } else {
          newCart.push({ product, quantity: maxAdd });
        }
      }
    }

    setCart(newCart);
    setIsCartOpen(true);
  };

  // Filter Categories
  const categories = ['All', 'Fruits & Vegetables', 'Dairy & Eggs', 'Bakery & Bread', 'Meat & Seafood', 'Pantry & Snacks', 'Beverages'];

  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || prod.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotalUSD = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* Navbar component */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        toggleCart={() => setIsCartOpen(!isCartOpen)}
        toggleChat={() => setIsChatOpen(!isChatOpen)}
        unreadCount={emails.length}
        toggleEmails={() => setIsEmailsOpen(!isEmailsOpen)}
        userEmail={userProfile.email}
        userName={userProfile.name}
      />

      {/* Main Container */}
      <main className="flex-grow">
        {activeTab === 'shop' && (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
            {/* Store Promo Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-emerald-950 p-8 sm:p-12 text-white text-left shadow-xl">
              <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-emerald-800/40 blur-2xl"></div>
              <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-emerald-800/30 blur-2xl"></div>

              <div className="relative max-w-xl space-y-4">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-800/50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
                  🌱 100% Organic & Fresh
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Your Farm-to-Table Grocery Delivered Today
                </h2>
                <p className="text-sm sm:text-base text-emerald-100/90 font-medium">
                  Select premium local groceries, view transparent stock levels, and enjoy contact-free delivery to your doorstep. Schedule windows that fit your life!
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-200">
                  <span>🚀 Same-day Delivery</span>
                  <span>•</span>
                  <span>🔒 Secure Checkout</span>
                  <span>•</span>
                  <span>💬 Real-time AI Support Assistant</span>
                </div>
              </div>
            </div>

            {/* Shop Filters and Product Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              {/* Category selector */}
              <div className="flex flex-wrap gap-1.5 order-2 md:order-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-50'
                        : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full max-w-xs order-1 md:order-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search groceries..."
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden shadow-xs"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Dynamic Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center bg-white">
                <p className="text-slate-400 text-sm font-semibold">No groceries match your active filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('All');
                  }}
                  className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-all hover:scale-[1.01]"
                >
                  Clear Active Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    currency={currency}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dashboard component */}
        {activeTab === 'dashboard' && (
          <Dashboard
            userProfile={userProfile}
            orders={orders}
            shoppingLists={shoppingLists}
            products={products}
            onUpdateProfile={handleUpdateProfile}
            onUpdateShoppingLists={setShoppingLists}
            onLoadListToCart={onLoadListToCart}
          />
        )}

        {/* AdminDashboard component */}
        {activeTab === 'admin' && (
          <AdminDashboard
            products={products}
            orders={orders}
            onRefreshData={syncDatabase}
          />
        )}
      </main>

      {/* Cart Drawer Overlay */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        currency={currency}
        onProceedToCheckout={handleProceedToCheckout}
        userProfile={userProfile}
      />

      {/* Payment Gateway Modal */}
      <CheckoutModal
        isOpen={checkoutDetails !== null}
        onClose={() => setCheckoutDetails(null)}
        deliveryDetails={checkoutDetails}
        totalUSD={cartTotalUSD}
        currency={currency}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* AI Customer Support Chat system widget */}
      <ChatSystem isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Email Inbox receipts tray */}
      <NotificationsPanel
        isOpen={isEmailsOpen}
        onClose={() => setIsEmailsOpen(false)}
        emails={emails}
        onMarkAllRead={() => setEmails(emails.map((e) => ({ ...e })))}
      />

      {/* Floating Chat Trigger Widget if chat is closed */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all"
          title="Chat with Freshy"
        >
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          <Store className="h-6 w-6 text-emerald-400" />
        </button>
      )}

      {/* Footer bar */}
      <footer className="border-t border-slate-100 bg-white py-6 text-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>© 2026 Omini Grocer Delivery & Shelf Management</span>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-emerald-600 transition-colors">Privacy Policy</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-emerald-600 transition-colors">Terms of Service</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-emerald-600 transition-colors">Customer Hotline</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
