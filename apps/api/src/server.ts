import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { clerkMiddleware } from '@clerk/express';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware({ debug: true }));

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51MockStripeKeyForNexora12345', {
  apiVersion: '2023-10-16' as any,
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'nexora-api' });
});

app.get('/api/products', async (req, res) => {
  try {
    const { category, page = '1', limit = '8' } = req.query;
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    
    let whereClause = {};
    if (category && category !== 'All') {
      whereClause = {
        category: {
          name: {
            equals: category as string,
            mode: 'insensitive'
          }
        }
      };
    }

    const totalProducts = await prisma.product.count({ where: whereClause });
    const totalPages = Math.ceil(totalProducts / limitNum);

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        images: true,
        category: true,
      },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    });
    
    // Map data to match frontend format expectations
    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      price: parseFloat(p.basePrice.toString()),
      category: p.category.name,
      rating: 4.5, // Mocked rating since review logic isn't fully set up
      image: p.images.find(img => img.isDefault)?.url || p.images[0]?.url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
    }));
    
    res.json({
      products: formattedProducts,
      currentPage: pageNum,
      totalPages,
      totalProducts
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const p = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        images: true,
        category: true,
      }
    });
    
    if (!p) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    const formattedProduct = {
      id: p.id,
      name: p.name,
      description: p.description,
      price: parseFloat(p.basePrice.toString()),
      category: p.category.name,
      rating: 4.5,
      image: p.images.find(img => img.isDefault)?.url || p.images[0]?.url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      images: p.images.map(img => img.url),
      features: p.features
    };
    
    res.json(formattedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- VENDOR API ENDPOINTS (Phase 9) ---

// Helper to authenticate user from Clerk
async function authenticateUser(req: any) {
  console.log("=== AUTH DEBUG ===");
  console.log("Headers:", req.headers.authorization ? "Bearer [HIDDEN]" : "None");
  console.log("req.auth:", req.auth);
  console.log("==================");
  
  const clerkUserId = req.auth?.userId;
  
  if (!clerkUserId) {
    console.warn("No Clerk token provided, falling back to Demo Customer");
    let customer = await prisma.user.findFirst({ where: { email: 'customer@nexora.ai' } });
    if (!customer) {
      customer = await prisma.user.create({
        data: {
          email: 'customer@nexora.ai',
          role: 'CUSTOMER',
          firstName: 'Demo',
          lastName: 'Customer'
        }
      });
    }
    return customer;
  }
  
  // Find user by authProvider
  let user = await prisma.user.findFirst({ where: { authProvider: clerkUserId } });
  
  if (!user) {
    // Fetch user details from Clerk API
    try {
      const response = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
        }
      });
      const clerkData = await response.json();
      
      const email = clerkData.email_addresses?.[0]?.email_address || `${clerkUserId}@clerk.local`;
      const firstName = clerkData.first_name || 'Clerk';
      const lastName = clerkData.last_name || 'User';
      
      user = await prisma.user.create({
        data: {
          email,
          authProvider: clerkUserId,
          firstName,
          lastName,
          role: 'CUSTOMER'
        }
      });
    } catch (e) {
      console.error("Failed to fetch clerk user:", e);
      user = await prisma.user.create({
        data: {
          email: `${clerkUserId}@clerk.local`,
          authProvider: clerkUserId,
          firstName: 'Clerk',
          lastName: 'User',
          role: 'CUSTOMER'
        }
      });
    }
  }
  
  return user;
}

// Helper to get or create a vendor profile for the authenticated user
async function authenticateVendor(req: any) {
  const clerkUserId = req.auth?.userId;
  
  if (!clerkUserId) {
    console.warn("No Clerk token provided, falling back to first Demo Vendor");
    const vendor = await prisma.vendor.findFirst();
    return vendor;
  }

  const user = await authenticateUser(req);
  
  let vendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
  if (!vendor) {
    vendor = await prisma.vendor.create({
      data: {
        userId: user.id,
        storeName: `${user.firstName}'s Store`,
        description: 'A verified vendor store.',
        rating: 5.0
      }
    });
    // Ensure they have VENDOR role
    await prisma.user.update({ where: { id: user.id }, data: { role: 'VENDOR' } });
  }
  return vendor;
}

// Helper to get or create a customer profile and address
async function authenticateCustomer(req: any) {
  const user = await authenticateUser(req);
  
  let address = await prisma.address.findFirst({ where: { userId: user.id } });
  if (!address) {
    address = await prisma.address.create({
      data: {
        userId: user.id,
        fullName: `${user.firstName} ${user.lastName}`,
        phone: '+1 555-0000',
        street: '123 Verified St',
        city: 'Tech City',
        state: 'CA',
        country: 'US',
        zipCode: '90001',
        isDefault: true
      }
    });
  }
  
  return { customer: user, address };
}

app.get('/api/vendor/stats', async (req, res) => {
  try {
    const vendor = await authenticateVendor(req);
    
    // Aggregations
    const activeProducts = await prisma.product.count({
      where: { vendorId: vendor.id }
    });
    
    // Get real order stats
    // Find all products by this vendor
    const vendorProductIds = (await prisma.product.findMany({
      where: { vendorId: vendor.id },
      select: { id: true }
    })).map((p: { id: string }) => p.id);
    
    // Find all order items that contain this vendor's products
    const orderItems = await prisma.orderItem.findMany({
      where: { productId: { in: vendorProductIds } }
    });
    
    const totalRevenue = orderItems.reduce((acc: number, item: any) => acc + (parseFloat(item.unitPrice.toString()) * item.quantity), 0);
    
    // Find orders that are pending
    const orderIds = [...new Set(orderItems.map((item: any) => item.orderId))];
    const pendingOrdersCount = await prisma.order.count({
      where: {
        id: { in: orderIds },
        status: 'PENDING'
      }
    });
    
    // Fetch 5 most recent orders
    const recentOrdersDb = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      include: {
        user: true,
        items: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const recentOrders = recentOrdersDb.map(order => ({
      id: order.id,
      customerName: `${order.user.firstName} ${order.user.lastName}`,
      customerEmail: order.user.email,
      status: order.status,
      date: order.createdAt,
      totalAmount: parseFloat(order.totalAmount.toString()),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0)
    }));

    // Calculate Top Products by quantity sold
    const productSales: Record<string, number> = {};
    for (const item of orderItems) {
      if (!productSales[item.productId]) {
        productSales[item.productId] = 0;
      }
      productSales[item.productId] += item.quantity;
    }

    const sortedProductIds = Object.keys(productSales).sort((a, b) => productSales[b] - productSales[a]).slice(0, 4);

    const topProductsDb = await prisma.product.findMany({
      where: { id: { in: sortedProductIds } },
      include: { images: true }
    });

    const topProducts = sortedProductIds.map(id => {
      const p = topProductsDb.find(prod => prod.id === id);
      return p ? {
        id: p.id,
        name: p.name,
        sales: productSales[id],
        image: p.images[0]?.url || '/placeholder.jpg'
      } : null;
    }).filter(Boolean);

    // Calculate revenueData for charts (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0,0,0,0);
    
    const recentOrdersAll = await prisma.order.findMany({
      where: { 
        id: { in: orderIds },
        createdAt: { gte: sevenDaysAgo }
      },
      select: { createdAt: true, items: true }
    });

    const revenueDataMap: Record<string, number> = {};
    for(let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      revenueDataMap[dateStr] = 0;
    }

    recentOrdersAll.forEach(order => {
      const dateStr = order.createdAt.toLocaleDateString('en-US', { weekday: 'short' });
      const orderRevenue = order.items
        .filter(item => vendorProductIds.includes(item.productId))
        .reduce((sum, item) => sum + (parseFloat(item.unitPrice.toString()) * item.quantity), 0);
        
      if (revenueDataMap[dateStr] !== undefined) {
        revenueDataMap[dateStr] += orderRevenue;
      }
    });

    const revenueData = Object.keys(revenueDataMap).map(name => ({
      name,
      total: revenueDataMap[name]
    }));

    const stats = {
      totalRevenue: totalRevenue || 0,
      activeProducts,
      pendingOrders: pendingOrdersCount,
      storeRating: vendor.rating,
      recentOrders,
      topProducts,
      revenueData
    };
    
    res.json(stats);
  } catch (error) {
    console.error("Error fetching vendor stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// New endpoint to fetch vendor orders
app.get('/api/vendor/orders', async (req, res) => {
  try {
    const vendor = await authenticateVendor(req);
    
    // Find vendor's products
    const vendorProducts = await prisma.product.findMany({
      where: { vendorId: vendor.id },
      select: { id: true, name: true }
    });
    const vendorProductIds = vendorProducts.map((p: any) => p.id);
    
    // Find orders containing these products
    const orderItems = await prisma.orderItem.findMany({
      where: { productId: { in: vendorProductIds } },
      include: {
        order: {
          include: {
            user: true,
            shippingAddress: true
          }
        },
        product: true
      }
    });
    
    // Group by order
    const ordersMap: Record<string, any> = {};
    
    for (const item of orderItems) {
      if (!ordersMap[item.orderId]) {
        ordersMap[item.orderId] = {
          id: item.order.id,
          customerName: `${item.order.user.firstName} ${item.order.user.lastName}`,
          customerEmail: item.order.user.email,
          status: item.order.status,
          date: item.order.createdAt,
          items: [],
          totalAmount: 0
        };
      }
      
      const itemTotal = parseFloat(item.unitPrice.toString()) * item.quantity;
      ordersMap[item.orderId].items.push({
        name: item.product.name,
        quantity: item.quantity,
        price: itemTotal
      });
      ordersMap[item.orderId].totalAmount += itemTotal;
    }
    
    // Convert to array and sort by date descending
    const ordersArray = Object.values(ordersMap).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    res.json(ordersArray);
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/api/vendor/products', async (req, res) => {
  try {
    const vendor = await authenticateVendor(req);
    const products = await prisma.product.findMany({
      where: { vendorId: vendor.id },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });
    
    const formatted = products.map(p => ({
      id: p.id,
      name: p.name,
      price: parseFloat(p.basePrice.toString()),
      stock: p.stock,
      category: p.category.name,
      status: p.stock > 10 ? 'Active' : (p.stock > 0 ? 'Low Stock' : 'Out of Stock')
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error("Error fetching vendor products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/vendor/products', async (req, res) => {
  try {
    const vendor = await authenticateVendor(req);
    const { name, description, price, stock, categorySlug, tags } = req.body;
    
    // Find or create category
    let category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
          slug: categorySlug
        }
      });
    }
    
    const product = await prisma.product.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
        description,
        basePrice: parseFloat(price),
        stock: parseInt(stock, 10),
        vendorId: vendor.id,
        categoryId: category.id,
        tags: tags ? tags.split(',').map((t: string) => t.trim()) : [],
      }
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating vendor product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put('/api/vendor/orders/:id/status', async (req, res) => {
  try {
    const vendor = await authenticateVendor(req);
    const orderId = req.params.id;
    const { status } = req.body;
    
    // Verify the order has items belonging to this vendor
    const orderItems = await prisma.orderItem.findMany({
      where: {
        orderId: orderId,
        product: { vendorId: vendor.id }
      }
    });
    
    if (orderItems.length === 0) {
      return res.status(403).json({ error: "Order does not belong to this vendor" });
    }
    
    // Validate status against enum
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
    
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- STRIPE API ENDPOINTS (Phase 10) ---

app.post('/api/checkout/session', async (req, res) => {
  try {
    const { items, successUrl, cancelUrl } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }
    
    const line_items = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    }));

    // If using a mock Stripe key for demo, skip real API call and simulate success
    const apiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51MockStripeKeyForNexora12345';
    if (apiKey === 'sk_test_51MockStripeKeyForNexora12345') {
      // Create mock order in the database
      try {
        const { customer, address } = await authenticateCustomer(req);
        const totalAmount = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
        
        await prisma.order.create({
          data: {
            userId: customer.id,
            status: 'PENDING',
            totalAmount,
            finalAmount: totalAmount,
            shippingAddressId: address.id,
            items: {
              create: items.map((item: any) => ({
                productId: item.id,
                quantity: item.quantity,
                unitPrice: item.price
              }))
            }
          }
        });
      } catch (dbError) {
        console.error("Error creating mock order:", dbError);
      }
      
      return res.json({ url: successUrl || 'http://localhost:3000/checkout/success' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: successUrl || 'http://localhost:3000/checkout/success',
      cancel_url: cancelUrl || 'http://localhost:3000/checkout',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB'],
      },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating stripe session:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/webhook/stripe', (req, res) => {
  // Mock webhook handler for when Stripe redirects back or sends an event
  console.log("Stripe webhook received! Event type:", req.body.type);
  res.json({ received: true });
});

// --- CART API ENDPOINTS (Phase 14) ---

app.get('/api/cart', async (req, res) => {
  try {
    const user = await authenticateCustomer(req);
    
    let cart = await prisma.cart.findUnique({
      where: { userId: user.customer.id },
      include: {
        items: {
          include: {
            product: {
              include: { images: true }
            }
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.customer.id },
        include: { items: { include: { product: { include: { images: true } } } } }
      });
    }

    const formattedItems = cart.items.map(item => ({
      id: item.productId,
      name: item.product.name,
      price: parseFloat(item.product.basePrice.toString()),
      quantity: item.quantity,
      image: item.product.images[0]?.url || '/placeholder.jpg'
    }));

    res.json(formattedItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/cart/sync', async (req, res) => {
  try {
    const user = await authenticateCustomer(req);
    const { items } = req.body; // Array of { id, quantity }
    
    // Find or create cart
    let cart = await prisma.cart.findUnique({ where: { userId: user.customer.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: user.customer.id } });
    }

    // Clear existing cart items
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    // Insert new cart items
    if (items && items.length > 0) {
      await prisma.cartItem.createMany({
        data: items.map((item: any) => ({
          cartId: cart!.id,
          productId: item.id,
          quantity: item.quantity
        }))
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error syncing cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- CUSTOMER ORDERS API (Phase 16) ---

app.get('/api/orders', async (req, res) => {
  try {
    const { customer } = await authenticateCustomer(req);
    
    const orders = await prisma.order.findMany({
      where: { userId: customer.id },
      include: {
        items: {
          include: {
            product: {
              include: { images: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedOrders = orders.map(order => ({
      id: order.id,
      status: order.status,
      date: order.createdAt,
      totalAmount: parseFloat(order.totalAmount.toString()),
      items: order.items.map(item => ({
        id: item.productId,
        name: item.product.name,
        price: parseFloat(item.unitPrice.toString()),
        quantity: item.quantity,
        image: item.product.images[0]?.url || '/placeholder.jpg'
      }))
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- AI CHATBOT ENGINE (Phase 18) ---

app.post('/api/chat', async (req, res) => {
  try {
    const { query, mode } = req.body;
    const lowerQuery = query.toLowerCase();

    // Authenticate user for autonomous mode
    let user;
    if (mode === 'autonomous') {
      try {
        user = await authenticateCustomer(req);
      } catch (err) {
        return res.status(401).json({ error: "You must be signed in to use Autonomous Booking." });
      }
    }

    // Simple NLP heuristic
    let intent = "search";
    let reasoning = "I searched our catalog for items matching your keywords.";
    
    // Extract potential keywords (very basic mock NLP)
    const stopWords = ['i', 'want', 'a', 'the', 'find', 'me', 'some', 'cheap', 'expensive', 'good', 'best', 'looking', 'for'];
    const words = lowerQuery.replace(/[^\w\s]/gi, '').split(' ').filter((w: string) => !stopWords.includes(w) && w.length > 2);
    
    // Search the database
    let products = [];
    
    if (words.length > 0) {
      // Build a basic OR query for the words
      products = await prisma.product.findMany({
        where: {
          OR: words.map((word: string) => ({
            OR: [
              { name: { contains: word, mode: 'insensitive' } },
              { description: { contains: word, mode: 'insensitive' } },
              { tags: { has: word } }
            ]
          }))
        },
        include: { images: true },
        take: 3
      });
      intent = `search for "${words.join(' ')}"`;
    } else {
      // Fallback: Return top products
      products = await prisma.product.findMany({
        include: { images: true },
        take: 3,
        orderBy: { basePrice: 'desc' }
      });
      reasoning = "I couldn't quite catch specific keywords, so here are some of our premium products!";
    }

    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      price: parseFloat(p.basePrice.toString()),
      image: p.images[0]?.url || '/placeholder.jpg'
    }));

    if (formattedProducts.length === 0) {
      reasoning = "I couldn't find any products matching your exact request in our current catalog.";
    } else if (mode === 'autonomous' && user) {
      // AUTONOMOUS BOOKING LOGIC
      const bestProduct = products[0]; // Pick the best match
      
      try {
        // Create the order immediately
        const order = await prisma.order.create({
          data: {
            userId: user.customer.id,
            status: 'PENDING',
            totalAmount: bestProduct.basePrice,
            finalAmount: bestProduct.basePrice,
            shippingAddressId: user.address.id, // using mock/existing address
            items: {
              create: [{
                productId: bestProduct.id,
                quantity: 1,
                unitPrice: bestProduct.basePrice
              }]
            }
          }
        });
        
        intent = "booking_complete";
        reasoning = `I have successfully purchased the ${bestProduct.name} for you!`;
        return res.json({
          intent,
          reasoning,
          orderId: order.id,
          product: formattedProducts[0]
        });
      } catch (bookingError) {
        console.error("Autonomous booking failed:", bookingError);
        return res.status(500).json({ error: "Autonomous booking failed." });
      }
    }

    res.json({
      intent,
      reasoning,
      products: formattedProducts
    });
  } catch (error) {
    console.error("Error in AI Chat Engine:", error);
    res.status(500).json({ error: "Internal AI server error" });
  }
});

// --- USER PROFILE API (Phase 20) ---

app.get('/api/user/profile', async (req, res) => {
  try {
    const { customer, address } = await authenticateCustomer(req);
    res.json({ user: customer, address });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put('/api/user/profile', async (req, res) => {
  try {
    const { customer, address } = await authenticateCustomer(req);
    const { firstName, lastName, phone, street, city, state, country, zipCode } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: customer.id },
      data: { firstName, lastName, phone }
    });

    const updatedAddress = await prisma.address.update({
      where: { id: address.id },
      data: {
        fullName: `${firstName} ${lastName}`,
        phone,
        street,
        city,
        state,
        country,
        zipCode
      }
    });

    res.json({ user: updatedUser, address: updatedAddress });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`NEXORA API running on port ${port}`);
});
