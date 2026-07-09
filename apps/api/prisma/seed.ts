import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed database...');

  // Create an Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nexora.ai' },
    update: {},
    create: {
      email: 'admin@nexora.ai',
      firstName: 'Nexora',
      lastName: 'Admin',
      role: 'ADMIN',
      aiPreferences: {
        budget: "premium",
      }
    },
  });

  console.log('Created admin user:', admin.email);

  // Create a Vendor
  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@premium.co' },
    update: {},
    create: {
      email: 'vendor@premium.co',
      firstName: 'Premium',
      lastName: 'Seller',
      role: 'VENDOR'
    }
  });

  const vendor = await prisma.vendor.upsert({
    where: { storeName: 'Premium Tech & Living' },
    update: {},
    create: {
      userId: vendorUser.id,
      storeName: 'Premium Tech & Living',
      description: 'Handcrafted premium technology and lifestyle products.',
      rating: 4.9,
    }
  });

  console.log('Created vendor:', vendor.storeName);

  // Create Categories
  const catElectronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: { name: 'Electronics', slug: 'electronics' }
  });

  const catFurniture = await prisma.category.upsert({
    where: { slug: 'furniture' },
    update: {},
    create: { name: 'Furniture', slug: 'furniture' }
  });

  const catClothing = await prisma.category.upsert({
    where: { slug: 'clothing' },
    update: {},
    create: { name: 'Clothing', slug: 'clothing' }
  });

  console.log('Created categories.');

  // Create Products
  const products = [
    {
      name: "Ergonomic Office Chair X1",
      slug: "ergonomic-office-chair-x1",
      description: "Experience the next generation of ergonomic workspaces, engineered perfectly for your comfort.",
      basePrice: 299.99,
      stock: 50,
      vendorId: vendor.id,
      categoryId: catFurniture.id,
      tags: ["chair", "ergonomic", "office", "back support"],
      aiSummary: "Premium ergonomic office chair, great for back pain and long hours of work.",
      imageUrl: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Noise Cancelling Headphones Pro",
      slug: "noise-cancelling-headphones-pro",
      description: "Immersive sound with industry-leading active noise cancellation.",
      basePrice: 349.00,
      stock: 120,
      vendorId: vendor.id,
      categoryId: catElectronics.id,
      tags: ["headphones", "audio", "noise cancelling", "wireless"],
      aiSummary: "High-fidelity wireless headphones with advanced noise cancellation, ideal for travel and focus.",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Minimalist Mechanical Keyboard",
      slug: "minimalist-mechanical-keyboard",
      description: "Tactile feedback with a sleek, minimalist design perfect for any desk setup.",
      basePrice: 129.50,
      stock: 75,
      vendorId: vendor.id,
      categoryId: catElectronics.id,
      tags: ["keyboard", "mechanical", "minimalist", "tech"],
      aiSummary: "Compact mechanical keyboard with premium switches, excellent for coding and typing.",
      imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Adjustable Standing Desk",
      slug: "adjustable-standing-desk",
      description: "Motorized standing desk to keep you moving throughout the workday.",
      basePrice: 499.00,
      stock: 20,
      vendorId: vendor.id,
      categoryId: catFurniture.id,
      tags: ["desk", "standing", "office", "motorized"],
      aiSummary: "Electric sit-stand desk with memory presets, highly recommended for health-conscious professionals.",
      imageUrl: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=800&q=80"
    }
  ];

  for (const prod of products) {
    const { imageUrl, ...prodData } = prod;
    const dbProduct = await prisma.product.upsert({
      where: { slug: prodData.slug },
      update: {},
      create: prodData
    });

    // Add default image if none exist
    const existingImage = await prisma.productImage.findFirst({
      where: { productId: dbProduct.id }
    });

    if (!existingImage) {
      await prisma.productImage.create({
        data: {
          productId: dbProduct.id,
          url: imageUrl,
          isDefault: true,
          altText: dbProduct.name
        }
      });
    }
  }

  console.log('Seeded products.');
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
