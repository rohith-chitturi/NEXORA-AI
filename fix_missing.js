const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'apps/api/prisma/seed.ts');
let content = fs.readFileSync(file, 'utf8');

const replacements = {
  'adjustable-dumbbells-set': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80',
  'smart-fitness-watch': 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500&q=80',
  'percussion-massage-gun': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80',
  'resistance-band-kit': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80',
  'hand-poured-soy-candle': 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&q=80'
};

for (const [slug, url] of Object.entries(replacements)) {
  const regex = new RegExp(`slug: "${slug}",[\\s\\S]*?imageUrl: "(.*?)"`, 'g');
  content = content.replace(regex, (match, p1) => match.replace(p1, url));
}

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed seed.ts missing images');
