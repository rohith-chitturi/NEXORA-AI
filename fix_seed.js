const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/api/prisma/seed.ts');
let content = fs.readFileSync(file, 'utf8');

const replacements = {
  'ergonomic-office-chair-x1': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80',
  'adjustable-standing-desk': 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80',
  'modern-leather-sofa': 'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=500&q=80',
  'minimalist-bookshelf': 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=500&q=80',
  'velvet-accent-chair': 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&q=80',
  'solid-oak-dining-table': 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=500&q=80',
  
  'noise-cancelling-headphones-pro': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
  'minimalist-mechanical-keyboard': 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80',
  'ultra-wide-monitor-34': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80',
  '4k-mirrorless-camera': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80',
  'wireless-charging-pad': 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=500&q=80',
  'smart-home-hub': 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500&q=80',
  
  'premium-cotton-t-shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80',
  'waterproof-winter-parka': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80',
  'tailored-linen-trousers': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&q=80',
  'merino-wool-sweater': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&q=80',
  'minimalist-leather-sneakers': 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500&q=80',
  'athletic-performance-shorts': 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=500&q=80',
  
  'smart-fitness-watch': 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b0?w=500&q=80',
  'adjustable-dumbbells-set': 'https://images.unsplash.com/photo-1586401700818-192e946a3666?w=500&q=80',
  'premium-yoga-mat': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&q=80',
  'resistance-band-kit': 'https://images.unsplash.com/photo-1598266663412-7e923e206001?w=500&q=80',
  'percussion-massage-gun': 'https://images.unsplash.com/photo-1585807469502-d965eefdeab2?w=500&q=80',
  
  'aromatherapy-diffuser': 'https://images.unsplash.com/photo-1608528577891-eb055944f2e7?w=500&q=80',
  'hand-poured-soy-candle': 'https://images.unsplash.com/photo-1602874801007-bd458cb6c4d0?w=500&q=80',
  'ceramic-coffee-pour-over': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80',
  'egyptian-cotton-sheets': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&q=80',
  'smart-indoor-planter': 'https://images.unsplash.com/photo-1593696140826-c58b021acf8b?w=500&q=80'
};

for (const [slug, url] of Object.entries(replacements)) {
  const regex = new RegExp(`slug: "${slug}",[\\s\\S]*?imageUrl: "(.*?)"`, 'g');
  content = content.replace(regex, (match, p1) => {
    return match.replace(p1, url);
  });
}

if (content.includes('dummyjson')) {
  console.log('WARNING: Some dummyjson URLs still exist!');
} else {
  console.log('All dummyjson URLs replaced successfully.');
}

fs.writeFileSync(file, content, 'utf8');
