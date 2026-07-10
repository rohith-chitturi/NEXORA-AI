import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 4000; // Hardcode to 4000 to prevent Turborepo PORT collision

app.use(cors());
app.use(express.json());

import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

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

// Helper to get or create a demo vendor
async function getDemoVendor() {
  let vendor = await prisma.vendor.findFirst();
  if (!vendor) {
    // Create a dummy user first
    const user = await prisma.user.create({
      data: {
        email: `vendor_${Date.now()}@nexora.ai`,
        role: 'VENDOR',
        firstName: 'Demo',
        lastName: 'Vendor',
      }
    });
    vendor = await prisma.vendor.create({
      data: {
        userId: user.id,
        storeName: 'NEXORA Premium Store',
        description: 'The official demo store.',
        rating: 4.8
      }
    });
  }
  return vendor;
}

app.get('/api/vendor/stats', async (req, res) => {
  try {
    const vendor = await getDemoVendor();
    
    // Aggregations
    const activeProducts = await prisma.product.count({
      where: { vendorId: vendor.id }
    });
    
    // Mock pending orders and revenue since order logic isn't fully built
    const stats = {
      totalRevenue: 45231.89,
      activeProducts,
      pendingOrders: 32,
      storeRating: vendor.rating
    };
    
    res.json(stats);
  } catch (error) {
    console.error("Error fetching vendor stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/api/vendor/products', async (req, res) => {
  try {
    const vendor = await getDemoVendor();
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
    const vendor = await getDemoVendor();
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

app.listen(port, () => {
  console.log(`NEXORA API running on port ${port}`);
});
