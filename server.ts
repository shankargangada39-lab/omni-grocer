import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { INITIAL_PRODUCTS } from "./src/initial_products";
import { Product, Order, UserProfile, ShoppingList, EmailNotification } from "./src/types";

// Path to file-based persistent database
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Define DB Interface
interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  profile: UserProfile;
  lists: ShoppingList[];
  emails: EmailNotification[];
}

// Ensure database directory exists and load or initialize data
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const rawData = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(rawData);
    }
  } catch (error) {
    console.error("Failed to read database file, initializing fresh:", error);
  }

  const defaultDB: DatabaseSchema = {
    products: INITIAL_PRODUCTS,
    orders: [
      {
        id: "order-1001",
        userEmail: "shankargangada39@gmail.com",
        userName: "Shankar Gangada",
        items: [
          {
            productId: "prod-1",
            name: "Organic Honeycrisp Apples",
            price: 3.99,
            unit: "1 lb bag",
            quantity: 2,
          },
          {
            productId: "prod-5",
            name: "Organic Whole Milk 3.25%",
            price: 4.49,
            unit: "0.5 gallon",
            quantity: 1,
          },
        ],
        totalAmount: 12.47,
        currency: "USD",
        currencySymbol: "$",
        deliveryDetails: {
          name: "Shankar Gangada",
          phone: "+1 (555) 123-4567",
          address: "123 Green Valley Road, Suite A",
          date: "2026-06-30",
          timeSlot: "10:00 AM - 12:00 PM",
          notes: "Leave by the front door, ring doorbell.",
        },
        status: "Delivered",
        createdAt: "2026-06-28T14:30:00.000Z",
        receiptNumber: "REC-9382-1001",
      },
    ],
    profile: {
      email: "shankargangada39@gmail.com",
      name: "Shankar Gangada",
      phone: "+1 (555) 123-4567",
      address: "123 Green Valley Road, Suite A",
    },
    lists: [
      {
        id: "list-1",
        name: "Weekly Basics",
        items: [
          { productId: "prod-2", name: "Organic Bananas Bunch", quantity: 1 },
          { productId: "prod-5", name: "Organic Whole Milk 3.25%", quantity: 1 },
          { productId: "prod-6", name: "Grade A Free-Range Brown Eggs", quantity: 1 },
        ],
        isRecurring: true,
        recurrenceInterval: "Weekly",
      },
    ],
    emails: [
      {
        id: "email-welcome",
        toEmail: "shankargangada39@gmail.com",
        subject: "Welcome to FreshMarket Co.!",
        body: "Hi Shankar,\n\nWelcome to FreshMarket Co.! Your local grocery delivery and shopping platform is fully operational. Browse hundreds of organic and farm-fresh products, schedule delivery slots that fit your routine, and organize recurring grocery lists.\n\nHappy Shopping,\nThe FreshMarket Team",
        sentAt: "2026-06-28T10:00:00.000Z",
        type: "Welcome",
      },
      {
        id: "email-receipt-1",
        toEmail: "shankargangada39@gmail.com",
        subject: "Your FreshMarket Co. Receipt - REC-9382-1001",
        body: "FreshMarket Co. Receipt\n==================================\nReceipt Number: REC-9382-1001\nOrder Date: 2026-06-28\n\nItems Ordered:\n- 2x Organic Honeycrisp Apples: $7.98\n- 1x Organic Whole Milk 3.25%: $4.49\n\n----------------------------------\nTotal Paid: $12.47 USD\n==================================\nScheduled Delivery:\nDate: 2026-06-30\nTime: 10:00 AM - 12:00 PM\nAddress: 123 Green Valley Road, Suite A\n\nThank you for choosing FreshMarket Co.!",
        sentAt: "2026-06-28T14:31:00.000Z",
        type: "Receipt",
      },
    ],
  };

  saveDatabase(defaultDB);
  return defaultDB;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save database file:", error);
  }
}

// Initialize active database in memory with load
let dbMemory = loadDatabase();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. GET Products
  app.get("/api/products", (req, res) => {
    res.json(dbMemory.products);
  });

  // 2. POST Product Restock (Admin function)
  app.post("/api/products/restock", (req, res) => {
    const { productId, amount } = req.body;
    const product = dbMemory.products.find((p) => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    product.inventory = Math.max(0, product.inventory + parseInt(amount || 0, 10));
    saveDatabase(dbMemory);
    res.json({ message: "Product restocked successfully", product });
  });

  // 3. GET Orders
  app.get("/api/orders", (req, res) => {
    res.json(dbMemory.orders);
  });

  // 4. POST Place Order (Checkout)
  app.post("/api/orders", (req, res) => {
    const { items, deliveryDetails, totalAmount, currency, currencySymbol } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items in order" });
    }

    // Verify and update real-time inventory
    const updatedProducts = [...dbMemory.products];
    const itemsWithDetails = [];

    for (const item of items) {
      const productIndex = updatedProducts.findIndex((p) => p.id === item.productId);
      if (productIndex === -1) {
        return res.status(400).json({ error: `Product with ID ${item.productId} not found` });
      }

      const product = updatedProducts[productIndex];
      if (product.inventory < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Only ${product.inventory} left.`,
        });
      }

      // Deduct inventory
      product.inventory -= item.quantity;
      itemsWithDetails.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        quantity: item.quantity,
      });
    }

    // Commit inventory updates
    dbMemory.products = updatedProducts;

    // Create Order Object
    const receiptId = `REC-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `order-${Math.floor(10000 + Math.random() * 90000)}`,
      userEmail: dbMemory.profile.email || "customer@example.com",
      userName: dbMemory.profile.name || "Customer",
      items: itemsWithDetails,
      totalAmount,
      currency,
      currencySymbol,
      deliveryDetails,
      status: "Pending",
      createdAt: new Date().toISOString(),
      receiptNumber: receiptId,
    };

    // Add to orders list
    dbMemory.orders.unshift(newOrder);

    // Generate automated email receipt notification
    const itemLines = itemsWithDetails
      .map((item) => `- ${item.quantity}x ${item.name} (${item.unit}): ${currencySymbol}${(item.price * item.quantity).toFixed(2)}`)
      .join("\n");

    const emailBody = `FreshMarket Co. Official Purchase Receipt\n==================================\nReceipt Number: ${receiptId}\nOrder Date: ${new Date().toLocaleDateString()}\n\nItems Ordered:\n${itemLines}\n\n----------------------------------\nTotal Paid: ${currencySymbol}${totalAmount.toFixed(2)} ${currency}\n==================================\nScheduled Delivery Details:\nDate: ${deliveryDetails.date}\nTime Slot: ${deliveryDetails.timeSlot}\nRecipient: ${deliveryDetails.name}\nContact Phone: ${deliveryDetails.phone}\nDelivery Address: ${deliveryDetails.address}\nNotes: ${deliveryDetails.notes || "None"}\n\nThank you for shopping at FreshMarket Co. Your delivery is scheduled and our staff are assembling your items fresh from the shelves.`;

    const newEmail: EmailNotification = {
      id: `email-${Math.floor(10000 + Math.random() * 90000)}`,
      toEmail: dbMemory.profile.email,
      subject: `Order Receipt - ${receiptId} - FreshMarket Co.`,
      body: emailBody,
      sentAt: new Date().toISOString(),
      type: "Receipt",
    };

    dbMemory.emails.unshift(newEmail);

    saveDatabase(dbMemory);

    res.json({
      message: "Order placed successfully",
      order: newOrder,
      email: newEmail,
    });
  });

  // 5. GET Profile
  app.get("/api/profile", (req, res) => {
    res.json(dbMemory.profile);
  });

  // 6. POST Update Profile
  app.post("/api/profile", (req, res) => {
    const { name, phone, address, email } = req.body;
    dbMemory.profile = {
      email: email || dbMemory.profile.email,
      name: name || dbMemory.profile.name,
      phone: phone || dbMemory.profile.phone,
      address: address || dbMemory.profile.address,
    };
    saveDatabase(dbMemory);
    res.json(dbMemory.profile);
  });

  // 7. GET Recurring Lists
  app.get("/api/lists", (req, res) => {
    res.json(dbMemory.lists);
  });

  // 8. POST Add/Update Recurring List
  app.post("/api/lists", (req, res) => {
    const { id, name, items, isRecurring, recurrenceInterval } = req.body;

    if (id) {
      // Update
      const listIndex = dbMemory.lists.findIndex((l) => l.id === id);
      if (listIndex !== -1) {
        dbMemory.lists[listIndex] = {
          id,
          name: name || dbMemory.lists[listIndex].name,
          items: items || dbMemory.lists[listIndex].items,
          isRecurring: isRecurring !== undefined ? isRecurring : dbMemory.lists[listIndex].isRecurring,
          recurrenceInterval: recurrenceInterval || dbMemory.lists[listIndex].recurrenceInterval,
        };
      }
    } else {
      // Create
      const newList: ShoppingList = {
        id: `list-${Math.floor(10000 + Math.random() * 90000)}`,
        name: name || "My New List",
        items: items || [],
        isRecurring: isRecurring || false,
        recurrenceInterval: recurrenceInterval || "Weekly",
      };
      dbMemory.lists.push(newList);
    }

    saveDatabase(dbMemory);
    res.json(dbMemory.lists);
  });

  // 9. DELETE Recurring List
  app.delete("/api/lists/:id", (req, res) => {
    const { id } = req.params;
    dbMemory.lists = dbMemory.lists.filter((l) => l.id !== id);
    saveDatabase(dbMemory);
    res.json({ message: "List deleted", lists: dbMemory.lists });
  });

  // 10. GET Emails (Simulated inbox)
  app.get("/api/emails", (req, res) => {
    res.json(dbMemory.emails);
  });

  // 11. Customer Support Chat (AI Powered)
  app.post("/api/chat", async (req, res) => {
    const { messages } = req.body; // Full history of ChatMessage[]

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "No messages provided" });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      // Graceful fallback if no Gemini key
      return res.json({
        reply: "Hello! Our store assistant is currently in mock mode because no Gemini API Key is configured. FreshMarket Co. features standard products: Fruits & Vegetables, Bakery, Dairy, Meat, Pantry, and Beverages. All deliveries can be scheduled in 2-hour slots! How can I help you today?",
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Construct a tailored prompt that teaches the model about the grocery store status
      const productsContext = dbMemory.products
        .map(
          (p) =>
            `- ${p.name} (Category: ${p.category}): Price $${p.price} per ${p.unit}. Current stock available: ${p.inventory} items.`
        )
        .join("\n");

      const systemInstruction = `You are "Freshy", the super-friendly and extremely helpful AI support chatbot for FreshMarket Co. grocery store.
Our website allows customers to browse organic and farm-fresh grocery items, view real-time prices, add them to a shopping cart, and schedule convenient local deliveries in two-hour windows.
Customers can also check real-time stock levels of active items.
Here is our current store inventory database in real-time:
${productsContext}

Delivery Guidelines:
- Same-day delivery is available for orders placed before 4:00 PM.
- Free delivery on orders over $50! Standard delivery fee is $4.99 otherwise.
- Currencies supported: USD ($), EUR (e), GBP (l), INR (r). Our website converts these dynamically!

Your tone should be joyful, warm, clear, and highly focused on the items in stock.
If a customer asks about a product, consult the list above. If we are low in stock (less than 15 items), mention that stock is limited! If we are out of stock (0 items), apologize warmly and offer to recommend another item.
Do not make up products we don't carry. Suggest recipes using our in-stock items!
Be concise. Keep responses to under 4 paragraphs. Do not write raw JSON.`;

      // Convert standard chat message history into Gemini content format
      const contents = messages.map((m: any) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = aiResponse.text || "I am here to assist you with FreshMarket Co. groceries!";
      res.json({ reply: replyText });
    } catch (error: any) {
      console.error("Gemini support chat error:", error);
      res.status(500).json({ error: "Gemini assistant error: " + error.message });
    }
  });

  // Admin order state transitions (for Admin dashboard)
  app.post("/api/orders/status", (req, res) => {
    const { orderId, status } = req.body;
    const order = dbMemory.orders.find((o) => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;

    // Send status update email notification
    const statusEmail: EmailNotification = {
      id: `email-${Math.floor(10000 + Math.random() * 90000)}`,
      toEmail: order.userEmail,
      subject: `FreshMarket Co. - Order Update - ${order.id}`,
      body: `Hi ${order.userName},\n\nWe wanted to let you know that your order (${order.id}) status has been updated to: ${status}.\n\nScheduled Delivery Details:\nDate: ${order.deliveryDetails.date}\nTime Slot: ${order.deliveryDetails.timeSlot}\nAddress: ${order.deliveryDetails.address}\n\nYou can track and view your full order history anytime in your profile dashboard.\n\nThank you for choosing FreshMarket Co.!`,
      sentAt: new Date().toISOString(),
      type: "StatusUpdate",
    };

    dbMemory.emails.unshift(statusEmail);
    saveDatabase(dbMemory);

    res.json({ message: "Order status updated successfully", order });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
