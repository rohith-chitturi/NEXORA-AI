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

  const catFitness = await prisma.category.upsert({
    where: { slug: 'fitness' },
    update: {},
    create: { name: 'Fitness', slug: 'fitness' }
  });

  const catHome = await prisma.category.upsert({
    where: { slug: 'home' },
    update: {},
    create: { name: 'Home', slug: 'home' }
  });

  console.log('Created categories.');

  // Create Products
  const products = [
    // --- Furniture ---
    {
      name: "Ergonomic Office Chair X1", slug: "ergonomic-office-chair-x1",
      description: "Experience the next generation of ergonomic workspaces, engineered perfectly for your comfort.",
      basePrice: 299.99, stock: 50, vendorId: vendor.id, categoryId: catFurniture.id,
      tags: ["chair", "ergonomic", "office", "back support"],
      aiSummary: "Premium ergonomic office chair, great for back pain and long hours of work.",
      imageUrl: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Adjustable Standing Desk", slug: "adjustable-standing-desk",
      description: "Motorized standing desk to keep you moving throughout the workday.",
      basePrice: 499.00, stock: 20, vendorId: vendor.id, categoryId: catFurniture.id,
      tags: ["desk", "standing", "office", "motorized"],
      aiSummary: "Electric sit-stand desk with memory presets, highly recommended for health-conscious professionals.",
      imageUrl: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Modern Leather Sofa", slug: "modern-leather-sofa",
      description: "Luxurious genuine leather sofa that anchors your living room with modern elegance.",
      basePrice: 1299.00, stock: 15, vendorId: vendor.id, categoryId: catFurniture.id,
      tags: ["sofa", "leather", "living room", "modern"],
      aiSummary: "A comfortable, high-end leather sofa suitable for contemporary homes.",
      imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Minimalist Bookshelf", slug: "minimalist-bookshelf",
      description: "Sleek, five-tier bookshelf with a matte black steel frame and walnut wood shelves.",
      basePrice: 189.00, stock: 40, vendorId: vendor.id, categoryId: catFurniture.id,
      tags: ["bookshelf", "storage", "wood", "metal"],
      aiSummary: "Sturdy and stylish bookshelf for displaying books and decor.",
      imageUrl: "https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Velvet Accent Chair", slug: "velvet-accent-chair",
      description: "A plush, mid-century modern accent chair featuring soft velvet upholstery.",
      basePrice: 249.99, stock: 35, vendorId: vendor.id, categoryId: catFurniture.id,
      tags: ["chair", "accent", "velvet", "living room"],
      aiSummary: "Stylish mid-century velvet chair to add a pop of color to any room.",
      imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Solid Oak Dining Table", slug: "solid-oak-dining-table",
      description: "Handcrafted from solid oak, this dining table seats 6 comfortably.",
      basePrice: 799.00, stock: 10, vendorId: vendor.id, categoryId: catFurniture.id,
      tags: ["table", "dining", "oak", "wood"],
      aiSummary: "Durable solid oak dining table perfect for family gatherings.",
      imageUrl: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80"
    },
    
    // --- Electronics ---
    {
      name: "Noise Cancelling Headphones Pro", slug: "noise-cancelling-headphones-pro",
      description: "Immersive sound with industry-leading active noise cancellation.",
      basePrice: 349.00, stock: 120, vendorId: vendor.id, categoryId: catElectronics.id,
      tags: ["headphones", "audio", "noise cancelling", "wireless"],
      aiSummary: "High-fidelity wireless headphones with advanced noise cancellation, ideal for travel and focus.",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Minimalist Mechanical Keyboard", slug: "minimalist-mechanical-keyboard",
      description: "Tactile feedback with a sleek, minimalist design perfect for any desk setup.",
      basePrice: 129.50, stock: 75, vendorId: vendor.id, categoryId: catElectronics.id,
      tags: ["keyboard", "mechanical", "minimalist", "tech"],
      aiSummary: "Compact mechanical keyboard with premium switches, excellent for coding and typing.",
      imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Ultra-Wide Monitor 34\"", slug: "ultra-wide-monitor-34",
      description: "Immersive 34-inch curved ultra-wide monitor for max productivity and gaming.",
      basePrice: 799.00, stock: 45, vendorId: vendor.id, categoryId: catElectronics.id,
      tags: ["monitor", "display", "ultrawide", "tech"],
      aiSummary: "High-resolution curved monitor offering massive screen real estate.",
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "4K Mirrorless Camera", slug: "4k-mirrorless-camera",
      description: "Professional-grade mirrorless camera capable of stunning 4K video.",
      basePrice: 1499.00, stock: 25, vendorId: vendor.id, categoryId: catElectronics.id,
      tags: ["camera", "photography", "video", "4k"],
      aiSummary: "Top-tier mirrorless camera for creators demanding high video and photo quality.",
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Wireless Charging Pad", slug: "wireless-charging-pad",
      description: "Sleek aluminum wireless charger supporting 15W fast charge for phones and earbuds.",
      basePrice: 45.00, stock: 200, vendorId: vendor.id, categoryId: catElectronics.id,
      tags: ["charger", "wireless", "phone", "accessory"],
      aiSummary: "Fast and stylish wireless charging pad for your desk or nightstand.",
      imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Smart Home Hub", slug: "smart-home-hub",
      description: "Control all your IoT devices from a single, elegant glass interface.",
      basePrice: 129.99, stock: 80, vendorId: vendor.id, categoryId: catElectronics.id,
      tags: ["smart home", "iot", "hub", "control"],
      aiSummary: "Centralized hub to manage smart lights, locks, and thermostats easily.",
      imageUrl: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=800&q=80"
    },

    // --- Clothing ---
    {
      name: "Premium Cotton T-Shirt", slug: "premium-cotton-t-shirt",
      description: "Heavyweight, perfectly draped 100% organic cotton t-shirt.",
      basePrice: 29.00, stock: 300, vendorId: vendor.id, categoryId: catClothing.id,
      tags: ["t-shirt", "cotton", "apparel", "casual"],
      aiSummary: "Comfortable everyday tee made from sustainable premium cotton.",
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Waterproof Winter Parka", slug: "waterproof-winter-parka",
      description: "Extreme weather parka with advanced insulation and waterproof shell.",
      basePrice: 289.00, stock: 60, vendorId: vendor.id, categoryId: catClothing.id,
      tags: ["jacket", "winter", "waterproof", "coat"],
      aiSummary: "Heavy-duty winter coat designed for sub-zero temperatures and harsh elements.",
      imageUrl: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Tailored Linen Trousers", slug: "tailored-linen-trousers",
      description: "Breathable linen trousers with a sharp, tailored fit for summer evenings.",
      basePrice: 85.00, stock: 120, vendorId: vendor.id, categoryId: catClothing.id,
      tags: ["pants", "linen", "summer", "formal"],
      aiSummary: "Lightweight and stylish linen pants for warm weather.",
      imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Merino Wool Sweater", slug: "merino-wool-sweater",
      description: "Ultra-soft merino wool crewneck sweater that regulates body temperature.",
      basePrice: 115.00, stock: 90, vendorId: vendor.id, categoryId: catClothing.id,
      tags: ["sweater", "wool", "winter", "apparel"],
      aiSummary: "Versatile and incredibly soft wool sweater for layering.",
      imageUrl: "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Minimalist Leather Sneakers", slug: "minimalist-leather-sneakers",
      description: "Handcrafted white leather sneakers that pair with literally anything.",
      basePrice: 155.00, stock: 150, vendorId: vendor.id, categoryId: catClothing.id,
      tags: ["shoes", "sneakers", "leather", "footwear"],
      aiSummary: "Clean, classic white leather sneakers offering both comfort and style.",
      imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Athletic Performance Shorts", slug: "athletic-performance-shorts",
      description: "Moisture-wicking, four-way stretch shorts designed for high-intensity workouts.",
      basePrice: 45.00, stock: 200, vendorId: vendor.id, categoryId: catClothing.id,
      tags: ["shorts", "athletic", "gym", "workout"],
      aiSummary: "Lightweight gym shorts with excellent mobility and breathability.",
      imageUrl: "https://images.unsplash.com/photo-1563630381-4221cecd3da9?auto=format&fit=crop&w=800&q=80"
    },

    // --- Fitness ---
    {
      name: "Smart Fitness Watch", slug: "smart-fitness-watch",
      description: "Advanced biometrics, GPS, and multi-day battery life in a titanium case.",
      basePrice: 199.99, stock: 110, vendorId: vendor.id, categoryId: catFitness.id,
      tags: ["watch", "fitness", "tracker", "wearable"],
      aiSummary: "Comprehensive fitness tracker with heart rate and sleep monitoring.",
      imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Adjustable Dumbbells Set", slug: "adjustable-dumbbells-set",
      description: "Space-saving dumbbells that adjust from 5 to 52.5 lbs with a quick turn.",
      basePrice: 399.00, stock: 45, vendorId: vendor.id, categoryId: catFitness.id,
      tags: ["weights", "dumbbells", "home gym", "strength"],
      aiSummary: "Highly convenient adjustable weights for a complete home workout.",
      imageUrl: "https://images.unsplash.com/photo-1586401700818-2453e059f138?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Premium Yoga Mat", slug: "premium-yoga-mat",
      description: "Extra-thick, eco-friendly cork yoga mat with superior grip.",
      basePrice: 65.00, stock: 180, vendorId: vendor.id, categoryId: catFitness.id,
      tags: ["yoga", "mat", "exercise", "stretch"],
      aiSummary: "Non-slip, sustainable cork yoga mat for comfort and stability.",
      imageUrl: "https://images.unsplash.com/photo-1592432678016-e910b06b3848?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Resistance Band Kit", slug: "resistance-band-kit",
      description: "Set of 5 heavy-duty resistance bands with handles, ankle straps, and door anchor.",
      basePrice: 35.00, stock: 250, vendorId: vendor.id, categoryId: catFitness.id,
      tags: ["bands", "resistance", "workout", "home gym"],
      aiSummary: "Portable and versatile resistance band set for full-body strength training.",
      imageUrl: "https://images.unsplash.com/photo-1598266663412-702cd1f3cb59?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Percussion Massage Gun", slug: "percussion-massage-gun",
      description: "Deep tissue muscle recovery tool with ultra-quiet motor technology.",
      basePrice: 129.00, stock: 85, vendorId: vendor.id, categoryId: catFitness.id,
      tags: ["massage", "recovery", "health", "gun"],
      aiSummary: "Powerful massage gun to relieve muscle soreness and accelerate recovery.",
      imageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80"
    },

    // --- Home ---
    {
      name: "Aromatherapy Diffuser", slug: "aromatherapy-diffuser",
      description: "Ultrasonic essential oil diffuser with ambient LED lighting and quiet operation.",
      basePrice: 45.00, stock: 150, vendorId: vendor.id, categoryId: catHome.id,
      tags: ["diffuser", "home", "aroma", "wellness"],
      aiSummary: "Elegant oil diffuser that improves room ambiance and air quality.",
      imageUrl: "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Hand-poured Soy Candle", slug: "hand-poured-soy-candle",
      description: "Sandalwood and vanilla scented candle, 50-hour burn time.",
      basePrice: 28.00, stock: 300, vendorId: vendor.id, categoryId: catHome.id,
      tags: ["candle", "scent", "decor", "relax"],
      aiSummary: "Long-lasting, non-toxic scented candle with a soothing aroma.",
      imageUrl: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Ceramic Coffee Pour-over", slug: "ceramic-coffee-pour-over",
      description: "Artisan-crafted ceramic pour-over cone for the perfect morning brew.",
      basePrice: 38.00, stock: 120, vendorId: vendor.id, categoryId: catHome.id,
      tags: ["coffee", "kitchen", "ceramic", "brew"],
      aiSummary: "Beautiful and functional ceramic dripper for coffee enthusiasts.",
      imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Egyptian Cotton Sheets", slug: "egyptian-cotton-sheets",
      description: "Silky smooth 800-thread count sheet set for a luxurious night's sleep.",
      basePrice: 150.00, stock: 80, vendorId: vendor.id, categoryId: catHome.id,
      tags: ["sheets", "bedding", "cotton", "sleep"],
      aiSummary: "Premium hotel-quality bed sheets offering supreme comfort.",
      imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Smart Indoor Planter", slug: "smart-indoor-planter",
      description: "Automated LED grow light and watering system for fresh herbs in your kitchen.",
      basePrice: 89.99, stock: 65, vendorId: vendor.id, categoryId: catHome.id,
      tags: ["plants", "garden", "smart", "kitchen"],
      aiSummary: "Effortless indoor gardening system for growing herbs year-round.",
      imageUrl: "https://images.unsplash.com/photo-1416879572979-913a40460c87?auto=format&fit=crop&w=800&q=80"
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
