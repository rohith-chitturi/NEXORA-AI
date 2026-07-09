import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

app.listen(port, () => {
  console.log(`NEXORA API running on port ${port}`);
});
