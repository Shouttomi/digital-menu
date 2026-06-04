// Menu — customer view

// ===== Language & Analytics Support =====
let currentLanguage = localStorage.getItem('menuLanguage') || 'en';
const LANGUAGES = ['en', 'de', 'fr'];
const LANGUAGE_NAMES = { en: 'English', de: 'Deutsch', fr: 'Français' };
const LANGUAGE_FLAGS = { en: '🇬🇧', de: '🇩🇪', fr: '🇫🇷' };

function getTranslation(item, field) {
  if (!item) return '';
  if (item.i18n && item.i18n[currentLanguage] && item.i18n[currentLanguage][field]) {
    return item.i18n[currentLanguage][field];
  }
  return item[field] || '';
}

function trackOrder(itemId, quantity = 1) {
  const orders = JSON.parse(localStorage.getItem('orderAnalytics') || '[]');
  orders.push({ itemId, quantity, timestamp: new Date().toISOString() });
  if (orders.length > 10000) orders.shift();
  localStorage.setItem('orderAnalytics', JSON.stringify(orders));
}

// All available themes (for demo data reference)
const ALL_THEMES = [
  { id: 'cafe', label: 'Cafe', sw: 'linear-gradient(135deg, #f3ead7, #c08762 60%, #5b3a2a)' },
  { id: 'restaurant', label: 'Restaurant', sw: 'linear-gradient(135deg, #0D0D0D, #1A1A1A 50%, #F5A800)' },
  { id: 'bistro', label: 'Bistro', sw: 'linear-gradient(135deg, #d3e9e0, #5fae9a 60%, #1f6f5c)' },
  { id: 'urban', label: 'Urban', sw: 'linear-gradient(135deg, #fff5f1, #ff7a59 55%, #b73e2a)' },
  { id: 'humm', label: 'Humm', sw: 'linear-gradient(135deg, #f6efe3, #f4d4ca 55%, #7a9275)' },
  { id: 'modern', label: 'Modern', sw: 'linear-gradient(135deg, #ffffff, #fff1e6 50%, #f97316)' },
  { id: 'artisan', label: 'Artisan', sw: 'linear-gradient(135deg, #faf3ec, #f4e0d0 50%, #f59e6f)' },
  { id: 'burma', label: 'Burma', sw: 'linear-gradient(135deg, #f5c640, #e8862c 60%, #6e3a1a)' },
  { id: 'luscious', label: 'Luscious', sw: 'linear-gradient(135deg, #1f1f24, #0e0e10 55%, #e85a4f)' },
  { id: 'fresh',    label: 'Fresh',    sw: 'linear-gradient(135deg, #FFFFFF, #d4eddf 55%, #1E6B45)' },
  { id: 'gallery',  label: 'Gallery',  sw: 'linear-gradient(135deg, #f0ebe3, #c8553d 60%, #5a2218)' },
  { id: 'editorial',label: 'Editorial',sw: 'linear-gradient(135deg, #f4f0e6, #2b2722 55%, #c1431f)' },
  { id: 'maison',   label: 'Maison',   sw: 'linear-gradient(135deg, #f3ede1, #c9a24a 58%, #221d14)' },
];

// Enabled themes in selector (cafe, restaurant, humm, burma, luscious, gallery, editorial, maison)
const THEME_DEFS = [
  { id: 'cafe', label: 'Cafe', sw: 'linear-gradient(135deg, #f3ead7, #c08762 60%, #5b3a2a)' },
  { id: 'restaurant', label: 'Restaurant', sw: 'linear-gradient(135deg, #0D0D0D, #1A1A1A 50%, #F5A800)' },
  { id: 'humm', label: 'Humm', sw: 'linear-gradient(135deg, #f6efe3, #f4d4ca 55%, #7a9275)' },
  { id: 'burma', label: 'Burma', sw: 'linear-gradient(135deg, #f5c640, #e8862c 60%, #6e3a1a)' },
  { id: 'luscious', label: 'Luscious', sw: 'linear-gradient(135deg, #1f1f24, #0e0e10 55%, #e85a4f)' },
  { id: 'gallery',  label: 'Gallery',  sw: 'linear-gradient(135deg, #f0ebe3, #c8553d 60%, #5a2218)' },
  { id: 'editorial',label: 'Editorial',sw: 'linear-gradient(135deg, #f4f0e6, #2b2722 55%, #c1431f)' },
  { id: 'maison',   label: 'Maison',   sw: 'linear-gradient(135deg, #f3ede1, #c9a24a 58%, #221d14)' },
];

const TAG_DEFS = [
  { id: 'veg', label: 'Veg' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gf', label: 'Gluten-free' },
  { id: 'df', label: 'Dairy-free' },
  { id: 'spicy', label: 'Spicy' },
];

const IMG  = (name) => `static/images/${name}.jpg`;
const RIMG = (kw) => {
  let h = 0;
  for (let i = 0; i < kw.length; i++) h = (h * 31 + kw.charCodeAt(i)) >>> 0;
  return `https://loremflickr.com/400/400/${encodeURIComponent(kw)}?lock=${h % 1000}`;
};
const FALLBACK_DATA = {
  name: 'Aurora Coffee House',
  tagline: 'Slow-brewed since 2019',
  address: '42 Linden Street, Brooklyn NY',
  phone: '+1 (555) 010-2024',
  currency: '₹',
  chefWhatsApp: '+91 86199 25883',
  logo: IMG('logo'),
  theme: 'cafe',
  _demo: true,
  categories: [
    { id: '1', name: 'Signature Espresso', items: [
      { id: 'a', name: 'Velvet Latte', desc: 'Double shot, oat milk, vanilla bean', price: '280', pop: true, image: IMG('velvet-latte'), images: [IMG('velvet-latte'), IMG('latte-closeup'), IMG('coffee-art')], tags: ['veg','df'], i18n: { de: { name: 'Samtkaffee Latte', desc: 'Doppelter Shot, Hafermilch, Vanilleschote' }, fr: { name: 'Latte Velours', desc: 'Double shot, lait d\'avoine, gousse de vanille' } } },
      { id: 'b', name: 'Honey Cortado', desc: 'Equal parts espresso & milk, raw honey', price: '240', pop: false, image: IMG('honey-cortado'), tags: ['veg'], i18n: { de: { name: 'Honig Cortado', desc: 'Gleiche Teile Espresso & Milch, roher Honig' }, fr: { name: 'Cortado au Miel', desc: 'Parties égales espresso & lait, miel brut' } } },
      { id: 'c', name: 'Iced Brown Sugar Shaken', desc: 'Cold espresso, brown sugar syrup, cinnamon', price: '260', pop: true, image: IMG('iced-brown-sugar'), tags: ['veg','vegan','df'], i18n: { de: { name: 'Gekühlter Rohrzucker Shaker', desc: 'Kalter Espresso, Rohrzuckersirup, Zimt' }, fr: { name: 'Espresso Sucre Glacé', desc: 'Espresso froid, sirop de sucre brun, cannelle' } } },
      { id: 'd', name: 'Flat White', desc: 'Velvety microfoam over a ristretto double', price: '220', pop: false, image: IMG('flat-white'), tags: ['veg'] },
      { id: 'd2', name: 'Caramel Macchiato', desc: 'Steamed milk, vanilla, caramel drizzle', price: '290', pop: false, image: IMG('caramel-macchiato'), tags: ['veg'] },
      { id: 'd3', name: 'Spanish Latte', desc: 'Condensed milk, espresso, silky finish', price: '270', pop: true, image: IMG('spanish-latte'), tags: ['veg'] },
    ]},
    { id: '2', name: 'Pastries', items: [
      { id: 'e', name: 'Almond Croissant', desc: 'House-laminated, marzipan filling', price: '220', pop: false, image: IMG('almond-croissant'), tags: ['veg'] },
      { id: 'f', name: 'Dark Chocolate Babka', desc: 'Twisted, soft, ridiculously rich', price: '250', pop: true, image: IMG('babka'), tags: ['veg'], i18n: { de: { name: 'Dunkle Schokoladenschnecke', desc: 'Verdreht, weich, unglaublich reichhaltig' }, fr: { name: 'Babka Chocolat Noir', desc: 'Tordu, tendre, incroyablement riche' } } },
      { id: 'g', name: 'Cinnamon Roll', desc: 'Brown butter glaze, flaky layers', price: '230', pop: true, image: IMG('cinnamon-roll'), tags: ['veg'], i18n: { de: { name: 'Zimtrolle', desc: 'Brauner Butterglasur, blättrig' }, fr: { name: 'Rouleau à la Cannelle', desc: 'Glaçage au beurre brun, feuilleté' } } },
      { id: 'g2', name: 'Pain au Chocolat', desc: 'Twin batons of dark chocolate, buttery layers', price: '200', pop: false, image: IMG('pain-au-chocolat'), tags: ['veg'] },
      { id: 'g3', name: 'Lemon Tart', desc: 'Citrus curd, torched meringue, sablé crust', price: '290', pop: false, image: IMG('lemon-tart'), tags: ['veg'] },
      { id: 'g4', name: 'Blueberry Muffin', desc: 'Bursting berries, crunchy sugar top', price: '180', pop: false, image: IMG('blueberry-muffin'), tags: ['veg'] },
    ]},
    { id: '3', name: 'Brunch', items: [
      { id: 'h', name: 'Smashed Avocado Toast', desc: 'Sourdough, chili crisp, soft egg', price: '520', pop: true, image: IMG('avocado-toast'), tags: ['veg','spicy'] },
      { id: 'i', name: 'Berry Pancake Stack', desc: 'Buttermilk pancakes, maple, fresh berries', price: '580', pop: false, image: IMG('pancake-stack'), tags: ['veg'] },
      { id: 'j', name: 'Truffle Mushroom Toast', desc: 'Wild mushrooms, truffle oil, parmesan', price: '620', pop: false, image: IMG('truffle-toast'), tags: ['veg'] },
      { id: 'k', name: 'Egg & Bacon Brioche', desc: 'Maple bacon, runny yolk, brioche bun', price: '490', pop: true, image: IMG('brioche'), tags: [] },
      { id: 'k2', name: 'Salmon Bagel', desc: 'Smoked salmon, dill cream cheese, capers', price: '650', pop: false, image: IMG('salmon-bagel'), tags: [] },
      { id: 'k3', name: 'Shakshuka', desc: 'Eggs poached in spiced tomato pepper sauce', price: '560', pop: true, image: IMG('shakshuka'), tags: ['veg','spicy','gf'] },
    ]},
    { id: '4', name: 'Cold Drinks', items: [
      { id: 'm1', name: 'Cold Brew Tonic', desc: 'Slow-steeped cold brew, tonic, orange', price: '260', pop: true, image: IMG('cold-brew'), tags: ['vegan','df','gf'] },
      { id: 'm2', name: 'Matcha Iced Latte', desc: 'Ceremonial matcha, milk, light sweet', price: '280', pop: true, image: IMG('matcha-latte'), tags: ['veg','gf'] },
      { id: 'm3', name: 'Strawberry Lemonade', desc: 'Fresh strawberries, hand-squeezed lemons', price: '220', pop: false, image: IMG('strawberry-lemonade'), tags: ['vegan','df','gf'] },
      { id: 'm4', name: 'Mango Smoothie', desc: 'Alphonso mango, yogurt, vanilla', price: '250', pop: false, image: IMG('mango-smoothie'), tags: ['veg','gf'] },
    ]},
  ]
};

const THEME_DEMO_DATA = {
  cafe: {
    name: 'Aurora Coffee House', tagline: 'Slow-brewed since 2019',
    address: '42 Linden Street, Bandra, Mumbai', phone: '+91 98765 43210',
    categories: FALLBACK_DATA.categories,
  },
  restaurant: {
    name: 'StreetBoss Burgers', tagline: 'Bold. Fast. Legendary.',
    address: 'MG Road, Indiranagar, Bangalore', phone: '+91 80 4567 8901',
    categories: [
      { id: 'r1', name: 'Burgers', items: [
        { id: 'r1a', name: 'Classic Smash', desc: 'Double smash patty, american cheese, pickles', price: '349', pop: true, image: RIMG('smash burger'), tags: [] },
        { id: 'r1b', name: 'Crispy Chicken', desc: 'Buttermilk fried thigh, sriracha mayo, slaw', price: '329', pop: false, image: RIMG('crispy chicken burger'), tags: ['spicy'] },
        { id: 'r1c', name: 'Double Patty Beast', desc: 'Two beef patties, bacon jam, special sauce', price: '429', pop: true, image: RIMG('double burger patty'), tags: [] },
        { id: 'r1d', name: 'Veggie Stack', desc: 'Black bean patty, avocado, chipotle aioli', price: '299', pop: false, image: RIMG('veggie burger'), tags: ['veg'] },
        { id: 'r1e', name: 'Spicy Habanero', desc: 'Beef patty, habanero salsa, jalapeño', price: '369', pop: true, image: RIMG('spicy burger'), tags: ['spicy'] },
      ]},
      { id: 'r2', name: 'Snacks', items: [
        { id: 'r2a', name: 'Loaded Fries', desc: 'Crispy fries, cheese sauce, jalapeño, sour cream', price: '199', pop: true, image: RIMG('loaded fries cheese'), tags: ['veg'] },
        { id: 'r2b', name: 'Onion Rings', desc: 'Beer-battered, smoky chipotle dip', price: '169', pop: false, image: RIMG('onion rings'), tags: ['veg'] },
        { id: 'r2c', name: 'Chicken Wings', desc: '6 pcs, buffalo glaze, blue cheese dip', price: '299', pop: true, image: RIMG('chicken wings buffalo'), tags: ['spicy'] },
        { id: 'r2d', name: 'Mozzarella Sticks', desc: 'Golden fried, marinara sauce', price: '219', pop: false, image: RIMG('mozzarella sticks fried'), tags: ['veg'] },
      ]},
      { id: 'r3', name: 'Drinks', items: [
        { id: 'r3a', name: 'Thick Chocolate Shake', desc: 'Belgian chocolate, vanilla ice cream', price: '199', pop: true, image: RIMG('chocolate milkshake'), tags: ['veg'] },
        { id: 'r3b', name: 'Strawberry Shake', desc: 'Fresh strawberry, creamy base', price: '189', pop: false, image: RIMG('strawberry milkshake'), tags: ['veg'] },
        { id: 'r3c', name: 'Cold Coffee', desc: 'Double espresso, milk, caramel shot', price: '149', pop: false, image: RIMG('cold coffee glass'), tags: ['veg'] },
        { id: 'r3d', name: 'Masala Lemonade', desc: 'Fresh lime, chaat masala, mint', price: '99', pop: true, image: RIMG('masala lemonade mint'), tags: ['vegan','gf'] },
      ]},
      { id: 'r4', name: 'Desserts', items: [
        { id: 'r4a', name: 'Brownie Sundae', desc: 'Warm brownie, vanilla ice cream, hot fudge', price: '249', pop: true, image: RIMG('brownie ice cream'), tags: ['veg'] },
        { id: 'r4b', name: 'Churros', desc: '5 pcs, cinnamon sugar, chocolate dip', price: '179', pop: false, image: RIMG('churros cinnamon'), tags: ['veg'] },
      ]},
    ],
  },
  bistro: {
    name: 'Le Jardin Bistro', tagline: 'Classique & Convivial',
    address: 'Khan Market, New Delhi', phone: '+91 11 4567 8901',
    categories: [
      { id: 'b1', name: 'Starters', items: [
        { id: 'b1a', name: 'French Onion Soup', desc: 'Slow-cooked, gruyère crouton, bubbling', price: '420', pop: true, image: RIMG('french onion soup'), tags: ['veg'] },
        { id: 'b1b', name: 'Beef Tartare', desc: 'Hand-cut fillet, capers, dijon, egg yolk', price: '680', pop: false, image: RIMG('beef tartare plate'), tags: ['gf'] },
        { id: 'b1c', name: 'Burrata', desc: 'Heirloom tomatoes, basil oil, sea salt', price: '580', pop: true, image: RIMG('burrata tomatoes'), tags: ['veg','gf'] },
        { id: 'b1d', name: 'Duck Rillettes', desc: 'Confit duck spread, cornichons, brioche toast', price: '620', pop: false, image: RIMG('duck pate'), tags: [] },
      ]},
      { id: 'b2', name: 'Mains', items: [
        { id: 'b2a', name: 'Duck Confit', desc: '72-hr confit leg, lentils du Puy, rich jus', price: '1290', pop: true, image: RIMG('duck confit plate'), tags: [] },
        { id: 'b2b', name: 'Sole Meunière', desc: 'Pan-fried sole, beurre noisette, capers', price: '1490', pop: false, image: RIMG('fish meuniere'), tags: ['gf','df'] },
        { id: 'b2c', name: 'Mushroom Risotto', desc: 'Aged parmigiano, truffle oil, fresh herbs', price: '890', pop: true, image: RIMG('mushroom risotto'), tags: ['veg','gf'] },
        { id: 'b2d', name: 'Steak Frites', desc: '200g bavette, café de Paris butter, fries', price: '1650', pop: true, image: RIMG('steak frites'), tags: ['gf'] },
      ]},
      { id: 'b3', name: 'Desserts', items: [
        { id: 'b3a', name: 'Crème Brûlée', desc: 'Vanilla bean custard, caramelised sugar top', price: '380', pop: true, image: RIMG('creme brulee'), tags: ['veg','gf'] },
        { id: 'b3b', name: 'Tarte Tatin', desc: 'Caramelised apple, puff pastry, crème fraîche', price: '420', pop: false, image: RIMG('tarte tatin apple'), tags: ['veg'] },
        { id: 'b3c', name: 'Chocolate Fondant', desc: 'Dark 70%, molten centre, vanilla ice cream', price: '450', pop: true, image: RIMG('chocolate fondant lava'), tags: ['veg'] },
      ]},
    ],
  },
  urban: {
    name: 'HAUS Street Kitchen', tagline: 'Global Street. Local Soul.',
    address: 'Lower Parel, Mumbai', phone: '+91 22 6789 0123',
    categories: [
      { id: 'u1', name: 'Tacos & Bao', items: [
        { id: 'u1a', name: 'Korean BBQ Tacos', desc: 'Gochujang beef, kimchi slaw, sesame', price: '399', pop: true, image: RIMG('korean bbq tacos'), tags: ['spicy'] },
        { id: 'u1b', name: 'Crispy Pork Bao', desc: 'Steamed bao, hoisin glaze, pickled cucumber', price: '369', pop: false, image: RIMG('steamed bao bun'), tags: [] },
        { id: 'u1c', name: 'Lemongrass Bánh Mì', desc: 'Chicken, daikon, jalapeño, sriracha', price: '329', pop: true, image: RIMG('banh mi sandwich'), tags: ['spicy'] },
        { id: 'u1d', name: 'Jackfruit Taco', desc: 'Pulled jackfruit, chipotle, avocado crema', price: '349', pop: false, image: RIMG('jackfruit taco'), tags: ['veg','vegan'] },
      ]},
      { id: 'u2', name: 'Bowls', items: [
        { id: 'u2a', name: 'Buddha Bowl', desc: 'Quinoa, roasted veg, tahini, pomegranate', price: '479', pop: true, image: RIMG('buddha bowl colorful'), tags: ['veg','vegan','gf'] },
        { id: 'u2b', name: 'Spicy Ramen Bowl', desc: 'Rich pork broth, soft-boiled egg, noodles', price: '549', pop: true, image: RIMG('ramen bowl noodles'), tags: ['spicy'] },
        { id: 'u2c', name: 'Acai Bowl', desc: 'Frozen acai, granola, honey, fresh fruit', price: '399', pop: false, image: RIMG('acai smoothie bowl'), tags: ['veg','gf'] },
      ]},
      { id: 'u3', name: 'Bites', items: [
        { id: 'u3a', name: 'Truffle Chips', desc: 'Kettle chips, black truffle oil, parmigiano', price: '249', pop: false, image: RIMG('truffle french fries'), tags: ['veg'] },
        { id: 'u3b', name: 'Edamame', desc: 'Maldon salt, chilli flake, yuzu squeeze', price: '199', pop: true, image: RIMG('edamame beans'), tags: ['veg','vegan','gf','df'] },
        { id: 'u3c', name: 'Gyoza (6 pcs)', desc: 'Pan-fried pork & ginger, ponzu dip', price: '329', pop: true, image: RIMG('gyoza dumplings'), tags: [] },
      ]},
      { id: 'u4', name: 'Drinks', items: [
        { id: 'u4a', name: 'Yuzu Kombucha', desc: 'Live culture, light fizz, citrus notes', price: '229', pop: true, image: RIMG('kombucha drink'), tags: ['vegan','df','gf'] },
        { id: 'u4b', name: 'Matcha Tonic', desc: 'Ceremonial matcha, tonic, squeeze of lime', price: '249', pop: false, image: RIMG('matcha green drink'), tags: ['veg','gf'] },
        { id: 'u4c', name: 'House Lemonade', desc: 'Meyer lemon, shiso, honey', price: '179', pop: false, image: RIMG('fresh lemonade'), tags: ['vegan','gf'] },
      ]},
    ],
  },
  humm: {
    name: 'Hum — Mezze & More', tagline: 'A taste of the Mediterranean',
    address: 'Linking Road, Bandra, Mumbai', phone: '+91 22 2640 5555',
    categories: [
      { id: 'h1', name: 'Mezze', items: [
        { id: 'h1a', name: 'Hummus Platter', desc: 'Classic chickpea hummus, warm pita, olive oil', price: '380', pop: true, image: RIMG('hummus platter pita'), tags: ['veg','vegan','df'] },
        { id: 'h1b', name: 'Falafel (6 pcs)', desc: 'Herb-packed crispy balls, tahini dip, pickles', price: '320', pop: false, image: RIMG('falafel plate'), tags: ['veg','vegan','df'] },
        { id: 'h1c', name: 'Baba Ganoush', desc: 'Smoked aubergine, pomegranate, mint', price: '350', pop: true, image: RIMG('baba ganoush dip'), tags: ['veg','vegan','df','gf'] },
        { id: 'h1d', name: 'Dolma (8 pcs)', desc: 'Stuffed vine leaves, rice & herbs, lemon', price: '360', pop: false, image: RIMG('dolma stuffed vine leaves'), tags: ['veg','vegan','gf'] },
        { id: 'h1e', name: 'Halloumi Fries', desc: "Grilled halloumi, za'atar, honey chilli dip", price: '420', pop: true, image: RIMG('halloumi fries'), tags: ['veg','gf'] },
      ]},
      { id: 'h2', name: 'From the Grill', items: [
        { id: 'h2a', name: 'Chicken Shawarma', desc: 'Marinated thigh, garlic sauce, pickled turnip', price: '520', pop: true, image: RIMG('chicken shawarma wrap'), tags: ['spicy'] },
        { id: 'h2b', name: 'Lamb Kofta', desc: '3 skewers, sumac onions, yogurt mint sauce', price: '680', pop: true, image: RIMG('lamb kofta skewer'), tags: ['gf'] },
        { id: 'h2c', name: 'Grilled Halloumi', desc: 'Whole slab, roasted peppers, herb pesto', price: '490', pop: false, image: RIMG('grilled halloumi cheese'), tags: ['veg','gf'] },
        { id: 'h2d', name: 'Adana Kebab', desc: 'Spiced minced lamb on lavash, sumac salad', price: '650', pop: false, image: RIMG('adana kebab grill'), tags: ['spicy','gf'] },
      ]},
      { id: 'h3', name: 'Drinks & Sweets', items: [
        { id: 'h3a', name: 'Mint Lemonade', desc: 'Fresh mint, preserved lemon, rose water', price: '180', pop: true, image: RIMG('mint lemonade fresh'), tags: ['veg','vegan','gf'] },
        { id: 'h3b', name: 'Ayran', desc: 'Chilled yogurt drink, mint, sea salt', price: '150', pop: false, image: RIMG('ayran yogurt drink'), tags: ['veg','gf'] },
        { id: 'h3c', name: 'Baklava (4 pcs)', desc: 'Pistachio & honey, crisp filo layers', price: '280', pop: true, image: RIMG('baklava pistachio honey'), tags: ['veg'] },
      ]},
    ],
  },
  modern: {
    name: 'The Glass Table', tagline: 'Contemporary cuisine, bold flavours',
    address: 'Koregaon Park, Pune', phone: '+91 20 6789 5678',
    categories: [
      { id: 'mo1', name: 'Small Plates', items: [
        { id: 'mo1a', name: 'Scallop Crudo', desc: 'King scallop, citrus vinaigrette, micro herbs', price: '780', pop: true, image: RIMG('scallop crudo'), tags: ['gf','df'] },
        { id: 'mo1b', name: 'Tuna Tataki', desc: 'Seared yellowfin, ponzu, wasabi mayo', price: '820', pop: false, image: RIMG('tuna tataki seared'), tags: ['gf','df'] },
        { id: 'mo1c', name: 'Burrata & Truffle', desc: 'Fresh burrata, black truffle, hazelnuts', price: '990', pop: true, image: RIMG('burrata truffle'), tags: ['veg'] },
      ]},
      { id: 'mo2', name: 'Mains', items: [
        { id: 'mo2a', name: 'Wagyu Tenderloin', desc: '180g wagyu, truffle jus, potato terrine', price: '2490', pop: true, image: RIMG('wagyu beef steak'), tags: ['gf'] },
        { id: 'mo2b', name: 'Lobster Ravioli', desc: 'Hand-rolled pasta, bisque cream, samphire', price: '1890', pop: false, image: RIMG('lobster pasta ravioli'), tags: [] },
        { id: 'mo2c', name: 'Miso Black Cod', desc: 'Nobu-style glazed cod, bok choy, dashi', price: '1690', pop: true, image: RIMG('black cod fish'), tags: ['gf','df'] },
        { id: 'mo2d', name: 'Wild Mushroom Tart', desc: 'Porcini, truffle cream, toasted hazelnuts', price: '1190', pop: false, image: RIMG('mushroom tart pastry'), tags: ['veg'] },
      ]},
      { id: 'mo3', name: 'Desserts', items: [
        { id: 'mo3a', name: 'Valrhona Soufflé', desc: '70% dark chocolate, melting centre, ice cream', price: '680', pop: true, image: RIMG('chocolate souffle'), tags: ['veg'] },
        { id: 'mo3b', name: 'Yuzu Panna Cotta', desc: 'Light set cream, mango caviar, sesame crumb', price: '620', pop: false, image: RIMG('panna cotta dessert'), tags: ['veg','gf'] },
      ]},
    ],
  },
  artisan: {
    name: 'The Bake Lab', tagline: 'Handcrafted with love',
    address: 'Nungambakkam, Chennai', phone: '+91 44 4567 7890',
    categories: [
      { id: 'ar1', name: 'Sourdough & Breads', items: [
        { id: 'ar1a', name: 'Country Sourdough Loaf', desc: '48-hr ferment, open crumb, crisp crust', price: '380', pop: true, image: RIMG('sourdough bread loaf'), tags: ['veg','vegan','df'] },
        { id: 'ar1b', name: 'Seeded Rye', desc: 'Dark rye, caraway, sunflower seed', price: '320', pop: false, image: RIMG('rye bread seeded'), tags: ['veg','vegan','df'] },
        { id: 'ar1c', name: 'Rosemary Focaccia', desc: 'Rosemary, flaky sea salt, good olive oil', price: '280', pop: true, image: RIMG('focaccia bread rosemary'), tags: ['veg','vegan','df'] },
      ]},
      { id: 'ar2', name: 'Pastries', items: [
        { id: 'ar2a', name: 'Kouign-Amann', desc: 'Caramelised layers, flaky, impossibly buttery', price: '260', pop: true, image: RIMG('kouign amann pastry'), tags: ['veg'] },
        { id: 'ar2b', name: 'Canelé', desc: 'Bordeaux classic, dark rum, vanilla', price: '120', pop: false, image: RIMG('canele bordeaux'), tags: ['veg'] },
        { id: 'ar2c', name: 'Butter Croissant', desc: 'Classic laminated, 72 crisp layers', price: '180', pop: true, image: IMG('almond-croissant'), tags: ['veg'] },
        { id: 'ar2d', name: 'Seasonal Fruit Tart', desc: 'Changes with the market — ask us today', price: '320', pop: false, image: IMG('lemon-tart'), tags: ['veg'] },
      ]},
      { id: 'ar3', name: 'Cakes', items: [
        { id: 'ar3a', name: 'Burnt Basque Cheesecake', desc: 'Creamy centre, caramelised top, per slice', price: '380', pop: true, image: RIMG('basque cheesecake burnt'), tags: ['veg'] },
        { id: 'ar3b', name: 'Opera Cake', desc: 'Coffee soak, ganache, almond joconde', price: '350', pop: false, image: RIMG('opera cake layers'), tags: ['veg'] },
        { id: 'ar3c', name: 'Chiffon Yuzu', desc: 'Light sponge, citrus glaze, candied peel', price: '320', pop: true, image: RIMG('yuzu citrus cake'), tags: ['veg','df'] },
      ]},
      { id: 'ar4', name: 'Hot Drinks', items: [
        { id: 'ar4a', name: 'Filter Coffee', desc: 'Single origin, slow drip-brewed', price: '180', pop: true, image: IMG('flat-white'), tags: ['veg','df','gf'] },
        { id: 'ar4b', name: 'Masala Chai Latte', desc: 'Spiced chai, oat milk foam, cinnamon', price: '200', pop: false, image: IMG('caramel-macchiato'), tags: ['veg'] },
      ]},
    ],
  },
  burma: {
    name: 'Mandalay Table', tagline: 'A taste of Myanmar',
    address: 'Park Street, Kolkata', phone: '+91 33 4567 8901',
    categories: [
      { id: 'bu1', name: 'Signature Dishes', items: [
        { id: 'bu1a', name: 'Mohinga', desc: 'Fish & lemongrass noodle soup, national dish', price: '380', pop: true, image: RIMG('noodle soup bowl'), tags: ['gf','df'] },
        { id: 'bu1b', name: 'Tea Leaf Salad', desc: 'Fermented laphet, tomatoes, seeds, crispy garlic', price: '350', pop: true, image: RIMG('tea leaf salad myanmar'), tags: ['veg','vegan','gf','df'] },
        { id: 'bu1c', name: 'Shan Tofu', desc: 'Chickpea tofu, turmeric glaze, tamarind dip', price: '290', pop: false, image: RIMG('tofu fried golden'), tags: ['veg','vegan','gf','df'] },
      ]},
      { id: 'bu2', name: 'Curries & Mains', items: [
        { id: 'bu2a', name: 'Chicken Curry', desc: 'Slow-simmered, lemongrass, shallots, steamed rice', price: '480', pop: true, image: RIMG('burmese chicken curry'), tags: ['gf','df'] },
        { id: 'bu2b', name: 'Braised Pork Belly', desc: 'Soy, star anise, palm sugar, steamed bun', price: '550', pop: false, image: RIMG('braised pork belly'), tags: [] },
        { id: 'bu2c', name: 'Prawn Fried Rice', desc: 'Wok-tossed, egg, spring onion, oyster sauce', price: '450', pop: true, image: RIMG('prawn fried rice wok'), tags: ['gf','df'] },
        { id: 'bu2d', name: 'Tofu & Mushroom Stir-fry', desc: 'Seasonal veg, oyster mushroom, basil', price: '380', pop: false, image: RIMG('tofu vegetable stir fry'), tags: ['veg','vegan','df'] },
      ]},
      { id: 'bu3', name: 'Drinks & Sweets', items: [
        { id: 'bu3a', name: 'Green Tea', desc: 'Burmese laphet-style, traditionally served cold', price: '150', pop: false, image: IMG('matcha-latte'), tags: ['veg','vegan','df','gf'] },
        { id: 'bu3b', name: 'Tamarind Cooler', desc: 'Tamarind, palm sugar, soda, ginger', price: '160', pop: true, image: IMG('strawberry-lemonade'), tags: ['veg','vegan','df','gf'] },
        { id: 'bu3c', name: 'Semolina Cake', desc: 'Htamane-style semolina, coconut, sesame seeds', price: '220', pop: false, image: RIMG('semolina dessert cake'), tags: ['veg'] },
      ]},
    ],
  },
  luscious: {
    name: 'Velvet & Vine', tagline: 'Where every meal is a moment',
    address: 'Cuffe Parade, South Mumbai', phone: '+91 22 2218 4500',
    categories: [
      { id: 'lu1', name: 'Amuse-Bouche', items: [
        { id: 'lu1a', name: 'Oscietra Caviar Blini', desc: 'Premium caviar, crème fraîche, chive', price: '1890', pop: true, image: RIMG('caviar blini'), tags: ['gf'] },
        { id: 'lu1b', name: 'Lobster Bisque', desc: 'Rich crustacean broth, cognac, cream, chive oil', price: '980', pop: true, image: RIMG('lobster bisque soup'), tags: ['gf'] },
        { id: 'lu1c', name: 'Truffle Arancini', desc: 'Arborio rice, black truffle, aged parmigiano', price: '780', pop: false, image: RIMG('truffle arancini'), tags: ['veg'] },
      ]},
      { id: 'lu2', name: 'The Mains', items: [
        { id: 'lu2a', name: 'A5 Wagyu Ribeye', desc: 'Japanese wagyu A5, 200g, truffle jus, microgreens', price: '5990', pop: true, image: RIMG('wagyu steak premium'), tags: ['gf'] },
        { id: 'lu2b', name: 'Dover Sole', desc: 'Whole grilled, classic meunière, capers, lemon', price: '3490', pop: false, image: RIMG('dover sole fish grilled'), tags: ['gf'] },
        { id: 'lu2c', name: 'Truffle Risotto', desc: 'Carnaroli, black truffle shaved, aged parmigiano', price: '1890', pop: true, image: RIMG('truffle risotto plate'), tags: ['veg','gf'] },
      ]},
      { id: 'lu3', name: 'Desserts', items: [
        { id: 'lu3a', name: 'Grand Cru Soufflé', desc: 'Valrhona 72% dark, warm centre, vanilla parfait', price: '980', pop: true, image: RIMG('chocolate souffle dessert'), tags: ['veg'] },
        { id: 'lu3b', name: 'Mille-Feuille', desc: 'Crisp pastry, vanilla crème pâtissière, gold leaf', price: '780', pop: false, image: RIMG('mille feuille pastry'), tags: ['veg'] },
      ]},
    ],
  },
  fresh: {
    name: 'GreenBowl', tagline: 'Fresh. Fast. Wholesome.',
    address: 'Koramangala, Bangalore', phone: '+91 80 1234 5678',
    categories: [
      { id: 'fr1', name: 'Salads', items: [
        { id: 'fr1a', name: 'Caesar Salad', desc: 'Romaine, parmesan, croutons, caesar dressing', price: '349', pop: true, image: RIMG('caesar salad bowl'), tags: ['veg'] },
        { id: 'fr1b', name: 'Greek Salad', desc: 'Cucumber, tomato, kalamata olives, feta, oregano', price: '329', pop: false, image: RIMG('greek salad feta'), tags: ['veg','gf'] },
        { id: 'fr1c', name: 'Watermelon Feta', desc: 'Seedless watermelon, mint, balsamic glaze', price: '299', pop: false, image: RIMG('watermelon feta mint'), tags: ['veg','gf'] },
      ]},
      { id: 'fr2', name: 'Bowls', items: [
        { id: 'fr2a', name: 'Poke Bowl', desc: 'Tuna poke, sushi rice, avocado, edamame', price: '549', pop: true, image: RIMG('poke bowl tuna'), tags: ['gf','df'] },
        { id: 'fr2b', name: 'Teriyaki Chicken Bowl', desc: 'Grilled chicken, brown rice, sesame broccoli', price: '449', pop: true, image: RIMG('teriyaki chicken bowl'), tags: ['gf','df'] },
        { id: 'fr2c', name: 'Acai Smoothie Bowl', desc: 'Frozen acai, banana, granola, honey', price: '379', pop: false, image: RIMG('acai bowl granola'), tags: ['veg','gf'] },
        { id: 'fr2d', name: 'Quinoa Power Bowl', desc: 'Quinoa, kale, roasted chickpea, tahini', price: '399', pop: false, image: RIMG('quinoa bowl healthy'), tags: ['veg','vegan','gf','df'] },
      ]},
      { id: 'fr3', name: 'Wraps', items: [
        { id: 'fr3a', name: 'Grilled Chicken Wrap', desc: 'Herb chicken, lettuce, tomato, tzatziki', price: '329', pop: true, image: RIMG('chicken wrap grilled'), tags: [] },
        { id: 'fr3b', name: 'Falafel Wrap', desc: 'Crispy falafel, hummus, pickles, harissa', price: '299', pop: false, image: RIMG('falafel wrap pita'), tags: ['veg','vegan'] },
        { id: 'fr3c', name: 'Avocado BLT', desc: 'Bacon, lettuce, avocado, sriracha mayo', price: '379', pop: true, image: RIMG('avocado blt wrap'), tags: ['spicy'] },
      ]},
      { id: 'fr4', name: 'Drinks', items: [
        { id: 'fr4a', name: 'Green Detox Juice', desc: 'Spinach, cucumber, ginger, apple, lemon', price: '219', pop: true, image: RIMG('green juice detox'), tags: ['veg','vegan','gf','df'] },
        { id: 'fr4b', name: 'Mango Lassi', desc: 'Alphonso mango, yogurt, cardamom', price: '199', pop: true, image: IMG('mango-smoothie'), tags: ['veg','gf'] },
        { id: 'fr4c', name: 'Berry Blast Smoothie', desc: 'Mixed berries, banana, almond milk', price: '249', pop: false, image: IMG('strawberry-lemonade'), tags: ['veg','vegan','df','gf'] },
        { id: 'fr4d', name: 'Coconut Water', desc: 'Pure tender coconut, no sugar added', price: '149', pop: false, image: RIMG('fresh coconut water'), tags: ['veg','vegan','gf','df'] },
      ]},
    ],
  },
  gallery: {
    name: 'Ember & Oak', tagline: 'Wood-fired, fire-kissed, unforgettable',
    address: 'Jubilee Hills, Hyderabad', phone: '+91 40 4567 1234',
    categories: [
      { id: 'ga1', name: 'From the Fire', items: [
        { id: 'ga1a', name: 'Flame-Grilled Ribeye', desc: 'Oak-smoked, bone marrow butter, charred shallot', price: '1290', pop: true, image: RIMG('grilled ribeye steak'), tags: ['gf'] },
        { id: 'ga1b', name: 'Charred Octopus', desc: 'Smoked paprika, salsa verde, confit potato', price: '890', pop: true, image: RIMG('grilled octopus char'), tags: ['gf','df'] },
        { id: 'ga1c', name: 'Wood-Fired Cauliflower', desc: 'Whole roasted, tahini, pomegranate, dukkah', price: '540', pop: false, image: RIMG('roasted cauliflower whole'), tags: ['veg','vegan','gf','df'] },
        { id: 'ga1d', name: 'Smoked Lamb Chops', desc: 'Rosemary embers, mint chimichurri', price: '1190', pop: false, image: RIMG('grilled lamb chops'), tags: ['gf','df'] },
      ]},
      { id: 'ga2', name: 'Sides', items: [
        { id: 'ga2a', name: 'Ember Corn', desc: 'Charred cob, chipotle butter, cotija', price: '320', pop: true, image: RIMG('grilled corn cob'), tags: ['veg','gf'] },
        { id: 'ga2b', name: 'Burnt Leeks', desc: 'Romesco, toasted almond, sherry', price: '340', pop: false, image: RIMG('charred leeks plate'), tags: ['veg','vegan','df'] },
        { id: 'ga2c', name: 'Fire Potatoes', desc: 'Triple-cooked, smoked aioli', price: '290', pop: false, image: RIMG('crispy roast potatoes'), tags: ['veg','gf'] },
      ]},
      { id: 'ga3', name: 'Sweet', items: [
        { id: 'ga3a', name: 'Grilled Peach', desc: 'Vanilla mascarpone, honeycomb, basil', price: '380', pop: true, image: RIMG('grilled peach dessert'), tags: ['veg','gf'] },
        { id: 'ga3b', name: 'Smoked Chocolate Tart', desc: 'Ember-smoked ganache, sea salt', price: '420', pop: false, image: RIMG('chocolate tart slice'), tags: ['veg'] },
      ]},
    ],
  },
  editorial: {
    name: 'The Daily Press', tagline: 'Coffee, plates & quiet mornings',
    address: 'Indiranagar, Bengaluru', phone: '+91 80 2345 6789',
    categories: [
      { id: 'ed1', name: 'The Roast', items: [
        { id: 'ed1a', name: 'Single-Origin Pour Over', desc: 'Rotating micro-lot, brewed to order, served black to taste the terroir.', price: '260', pop: true, image: RIMG('pour over coffee'), tags: ['veg','vegan','gf','df'] },
        { id: 'ed1b', name: 'Brown Butter Latte', desc: 'Espresso, browned-butter syrup, steamed whole milk.', price: '290', pop: false, image: RIMG('latte coffee art'), tags: ['veg'] },
        { id: 'ed1c', name: 'Cold Brew Negroni', desc: 'Slow-steeped cold brew, orange bitters, tonic. Zero proof.', price: '280', pop: true, image: RIMG('cold brew coffee glass'), tags: ['vegan','df','gf'] },
      ]},
      { id: 'ed2', name: 'The Plates', items: [
        { id: 'ed2a', name: 'Slow Eggs & Sourdough', desc: 'Cloud-soft scramble, cultured butter, chive, naturally leavened toast.', price: '480', pop: true, image: RIMG('scrambled eggs toast'), tags: ['veg'] },
        { id: 'ed2b', name: 'Heirloom Tomato Toast', desc: 'Whipped ricotta, basil oil, flaked salt on grilled levain.', price: '420', pop: false, image: RIMG('tomato toast ricotta'), tags: ['veg'] },
        { id: 'ed2c', name: 'Mushroom & Miso Bowl', desc: 'Roasted maitake, soft grains, miso butter, soft egg.', price: '520', pop: false, image: RIMG('mushroom grain bowl'), tags: ['veg'] },
      ]},
      { id: 'ed3', name: 'The Bakery', items: [
        { id: 'ed3a', name: 'Morning Bun', desc: 'Laminated, orange sugar, flaky to the last crumb.', price: '220', pop: true, image: RIMG('morning bun pastry'), tags: ['veg'] },
        { id: 'ed3b', name: 'Dark Rye Cookie', desc: 'Brown butter, sea salt, 70% chocolate.', price: '180', pop: false, image: RIMG('chocolate cookie'), tags: ['veg'] },
      ]},
    ],
  },
  maison: {
    name: 'Maison Lumière', tagline: 'A seasonal tasting in five movements',
    address: 'Worli Sea Face, Mumbai', phone: '+91 22 6655 4400',
    categories: [
      { id: 'ma1', name: 'Hors-d\u2019\u0153uvre', items: [
        { id: 'ma1a', name: 'Oyster & Champagne', desc: 'Fine de claire, champagne mignonette, finger lime', price: '1200', pop: true, image: RIMG('oyster champagne plate'), tags: ['gf','df'] },
        { id: 'ma1b', name: 'Foie Gras au Torchon', desc: 'Sauternes gelée, toasted brioche, fig', price: '1650', pop: false, image: RIMG('foie gras plated'), tags: [] },
        { id: 'ma1c', name: 'Heirloom Beet', desc: 'Goat curd, walnut, aged balsamic pearls', price: '980', pop: false, image: RIMG('beetroot fine dining'), tags: ['veg','gf'] },
      ]},
      { id: 'ma2', name: 'Le Plat', items: [
        { id: 'ma2a', name: 'Butter-Poached Lobster', desc: 'Vanilla beurre blanc, leek, caviar', price: '3200', pop: true, image: RIMG('lobster fine dining plate'), tags: ['gf'] },
        { id: 'ma2b', name: 'Duck à l\u2019Orange', desc: 'Aged breast, bitter orange, salsify, jus', price: '2400', pop: false, image: RIMG('duck breast plated'), tags: ['gf','df'] },
        { id: 'ma2c', name: 'Wild Mushroom Tortellini', desc: 'Brown butter, parmesan foam, black truffle', price: '1900', pop: true, image: RIMG('tortellini truffle plate'), tags: ['veg'] },
      ]},
      { id: 'ma3', name: 'Dessert', items: [
        { id: 'ma3a', name: 'Grand Cru Soufflé', desc: 'Valrhona 72%, crème anglaise, gold leaf', price: '880', pop: true, image: RIMG('chocolate souffle fine'), tags: ['veg'] },
        { id: 'ma3b', name: 'Tarte au Citron', desc: 'Amalfi lemon, torched meringue, basil', price: '780', pop: false, image: RIMG('lemon tart fine dining'), tags: ['veg'] },
      ]},
    ],
  },
};

async function readData() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (id) {
    try {
      const res = await fetch(`/api/menu/${encodeURIComponent(id)}`);
      if (res.ok) return await res.json();
    } catch (e) { console.warn('id fetch failed', e); }
  }
  const hash = location.hash;
  const m = hash.match(/d=([^&]+)/);
  if (m) {
    try {
      const json = LZString.decompressFromEncodedURIComponent(m[1]);
      return JSON.parse(json);
    } catch (e) { console.warn('hash decode failed', e); }
  }
  // Bare open (no id, no shared payload) = theme showcase / demo.
  return { ...FALLBACK_DATA };
}

let data = FALLBACK_DATA;
let menuId = new URLSearchParams(location.search).get('id') || 'local';
let favorites = new Set();   // item ids
let cart = new Map();        // item id -> qty
let activeFilters = new Set(); // tag ids
let searchQuery = '';

function favKey() { return `menu.favs.${menuId}`; }
function cartKey() { return `menu.cart.${menuId}`; }
function loadFavCart() {
  try { favorites = new Set(JSON.parse(localStorage.getItem(favKey())) || []); } catch {}
  try { cart = new Map(JSON.parse(localStorage.getItem(cartKey())) || []); } catch {}
  // Note: Cart cleanup happens after data loads in postProcessItems()
}
function saveFavs() { localStorage.setItem(favKey(), JSON.stringify([...favorites])); }
function saveCart() { localStorage.setItem(cartKey(), JSON.stringify([...cart])); }

function initials(name) {
  return (name || '').split(/\s+/).filter(Boolean).slice(0,2).map(s => s[0]).join('').toUpperCase() || 'M';
}
function logoHTML(extraClass = '') {
  if (data.logo) {
    return `<div class="${extraClass}" style="background-image:url(${data.logo})"></div>`;
  }
  return `<div class="${extraClass}">${initials(data.name)}</div>`;
}
function itemImage(it, cls = 'item-image') {
  if (it.image) return `<div class="${cls}" style="background-image:url(${it.image})"></div>`;
  return `<div class="${cls} placeholder">◍</div>`;
}
function escapeHTML(s) { return (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function priceStr(p) {
  const s = String(p || '').trim();
  if (!s) return '';
  if (/^[\d.,]+$/.test(s)) return `${data.currency || '₹'}${s}`;
  return s;
}
function priceNum(p) {
  const s = String(p || '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}
function tagDots(it) {
  const tags = it.tags || [];
  if (!tags.length) return '';
  return `<span class="tag-dots">${tags.map(t => `<span class="tag-dot ${t}" title="${TAG_DEFS.find(d=>d.id===t)?.label||t}"></span>`).join('')}</span>`;
}
function favIcon(itId) {
  const on = favorites.has(itId);
  return `<button class="fav-btn ${on?'on':''}" data-fav="${itId}" aria-label="Favorite">
    <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
  </button>`;
}

// ===== Item filter logic =====
function passesFilter(it) {
  if (activeFilters.size) {
    const tags = new Set(it.tags || []);
    for (const f of activeFilters) if (!tags.has(f)) return false;
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    if (!(it.name||'').toLowerCase().includes(q) && !(it.desc||'').toLowerCase().includes(q)) return false;
  }
  return true;
}

// ===== Per-theme item renderers =====
function renderItemCafe(it, i) {
  const name = getTranslation(it, 'name');
  const desc = getTranslation(it, 'desc');
  return `<div class="item reveal tilt delay-${Math.min(i,3)}" data-iid="${it.id}">
    ${favIcon(it.id)}
    <div class="item-info">
      <h3 class="item-name">${escapeHTML(name)}${tagDots(it)}${it.pop ? '<span class="pop-badge">Popular</span>':''}</h3>
      ${desc ? `<p class="item-desc">${escapeHTML(desc)}</p>` : ''}
      <div class="item-price">${escapeHTML(priceStr(it.price))}</div>
    </div>
    ${itemImage(it)}
  </div>`;
}
function renderItemRestaurant(it, i) {
  const name = getTranslation(it, 'name');
  const desc = getTranslation(it, 'desc');
  return `<div class="item reveal delay-${Math.min(i,3)}" data-iid="${it.id}">
    ${favIcon(it.id)}
    ${itemImage(it)}
    <div class="item-body">
      <h3 class="item-name">${escapeHTML(name)}${it.pop ? '<span class="pop-badge">HOT</span>':''}</h3>
      ${desc ? `<p class="item-desc">${escapeHTML(desc)}</p>` : ''}
      <div class="item-footer-row">
        ${tagDots(it)}
        <div class="item-price">${escapeHTML(priceStr(it.price))}</div>
      </div>
    </div>
  </div>`;
}
function renderItemBistro(it, i) {
  const name = getTranslation(it, 'name');
  const desc = getTranslation(it, 'desc');
  return `<div class="item reveal tilt delay-${Math.min(i,3)}" data-iid="${it.id}">
    ${favIcon(it.id)}
    ${itemImage(it)}
    <h3 class="item-name">${escapeHTML(name)}${tagDots(it)}</h3>
    <p class="item-desc">${escapeHTML(desc || '')}</p>
    <div class="item-price">${escapeHTML(priceStr(it.price))}</div>
    ${it.pop ? '<span class="pop-badge">Hot</span>' : ''}
  </div>`;
}
function renderItemUrban(it, i) {
  const name = getTranslation(it, 'name');
  const desc = getTranslation(it, 'desc');
  return `<div class="item reveal tilt delay-${Math.min(i,3)}" data-iid="${it.id}">
    ${favIcon(it.id)}
    ${itemImage(it)}
    <div class="item-info">
      <h3 class="item-name">${escapeHTML(name)}${tagDots(it)}${it.pop ? '<span class="pop-badge">🔥 Popular</span>':''}</h3>
      ${desc ? `<p class="item-desc">${escapeHTML(desc)}</p>` : ''}
    </div>
    <div class="item-price-row">
      <div class="item-price">${escapeHTML(priceStr(it.price))}</div>
    </div>
  </div>`;
}

function renderItemHumm(it, i) {
  const name = getTranslation(it, 'name');
  const desc = getTranslation(it, 'desc');
  return `<div class="item humm-item reveal delay-${Math.min(i,3)}" data-iid="${it.id}">
    ${favIcon(it.id)}
    <div class="humm-item-body">
      <div class="humm-item-top">
        <h3 class="item-name">${escapeHTML(name)}${it.pop ? '<span class="pop-badge">★</span>':''}</h3>
        <div class="item-price">${escapeHTML(priceStr(it.price))}</div>
      </div>
      ${desc ? `<p class="item-desc">${escapeHTML(desc)}</p>` : ''}
      ${tagDots(it)}
    </div>
  </div>`;
}

function itemRendererFor(theme) {
  return ({
    cafe:renderItemCafe, restaurant:renderItemRestaurant, bistro:renderItemBistro, urban:renderItemUrban,
    humm:renderItemHumm, modern:renderItemUrban, artisan:renderItemCafe, burma:renderItemBistro, luscious:renderItemRestaurant,
    fresh:renderItemFresh,
    gallery:renderItemGallery, editorial:renderItemEditorial, maison:renderItemMaison,
  })[theme] || renderItemCafe;
}

function renderCategories() {
  const render = itemRendererFor(data.theme);
  const sub = { cafe: '— Selected with care —', restaurant: "Today's picks", bistro: 'Fresh today', urban: 'Tap to explore', humm: 'Click and check what we serve', modern: 'Pick your favourite', artisan: 'Crafted daily', burma: 'A taste of tradition', luscious: 'Hand-picked for you', fresh: 'Good for you', gallery: 'Tap any dish to feast', editorial: 'Considered, seasonal, small-batch', maison: 'Served as a course' }[data.theme] || '';
  let anyVisible = false;
  const html = data.categories.map(cat => {
    const items = (cat.items || []).filter(passesFilter);
    if (!items.length) return '';
    anyVisible = true;
    return `<section class="category" id="cat-${cat.id}">
      <h2 class="category-title reveal">${escapeHTML(cat.name)}</h2>
      <p class="category-sub reveal delay-1">${sub}</p>
      <div class="items">${items.map(render).join('')}</div>
    </section>`;
  }).join('');
  if (!anyVisible) {
    return `<div class="empty-state"><h3>No matches</h3><p>Try a different search or clear filters.</p></div>`;
  }
  return html;
}

function renderTabs() {
  return `<nav class="category-tabs" id="tabs">
    ${data.categories.map((cat, i) => `
      <button class="tab${i===0?' active':''}" data-target="cat-${cat.id}">${escapeHTML(cat.name)}</button>
    `).join('')}
  </nav>`;
}

function renderSearchBar() {
  return `
    <div class="search-bar">
      <div class="search-input-wrap">
        <input type="search" id="searchInput" placeholder="Search dishes..." />
      </div>
    </div>
    <div class="filter-row" id="filterRow">
      ${TAG_DEFS.map(t => `<button class="filter-chip" data-tag="${t.id}"><span class="dot tag-dot ${t.id}"></span>${t.label}</button>`).join('')}
    </div>
  `;
}

// ===== Theme renderers (hero + structure) =====
function renderHeroCafe() {
  return `<section class="hero">
    ${logoHTML('logo-circle')}
    <h1 class="place-name">${escapeHTML(data.name)}</h1>
    <p class="place-tagline">${escapeHTML(data.tagline)}</p>
    <div class="divider"></div>
    <div class="place-meta">
      ${data.address ? `<div>${escapeHTML(data.address)}</div>` : ''}
      ${data.phone ? `<div>${escapeHTML(data.phone)}</div>` : ''}
    </div>
  </section>`;
}
function renderHeroRestaurant() {
  return `<section class="hero">
    <div class="hero-grain"></div>
    <div class="hero-orb"></div>
<div class="top-row">
      ${logoHTML('logo-mark')}
      <div class="rest-nav-links">
        <span>Menu</span><span>Snacks</span><span>Drinks</span>
      </div>
      <div class="top-meta">${escapeHTML(data.phone || '')}</div>
    </div>
    <div class="hero-content">
      <h1 class="place-name">${escapeHTML(data.name)}</h1>
      ${data.tagline ? `<p class="place-tagline">${escapeHTML(data.tagline)}</p>` : ''}
      ${data.address ? `<p class="place-meta-text">${escapeHTML(data.address)}</p>` : ''}
      <a class="rest-cta" href="#tabs">ORDER NOW</a>
    </div>
  </section>`;
}
function renderHeroBistro() {
  return `<section class="hero">
    <div class="hero-shapes"></div>
    <div class="top-row">
      ${logoHTML('logo-mark')}
      <div class="top-meta">${escapeHTML(data.phone || '')}</div>
    </div>
    <div class="hero-content">
      <h1 class="place-name">${escapeHTML(data.name)}</h1>
      <p class="place-tagline">${escapeHTML(data.tagline)}</p>
      <div class="place-meta-row">
        ${data.address ? `<div class="meta-pill">📍 ${escapeHTML(data.address)}</div>` : ''}
      </div>
    </div>
  </section>`;
}
function renderHeroUrban() {
  return `<section class="hero">
    <div class="top-row">
      ${logoHTML('logo-mark')}
      <div class="top-meta">
        <b>${escapeHTML(data.name)}</b>
        ${data.phone ? escapeHTML(data.phone) : ''}
      </div>
    </div>
    <div class="hero-content">
      <div class="eyebrow">— Welcome —</div>
      <h1 class="place-name">${escapeHTML(data.name)}</h1>
      <p class="place-tagline">${escapeHTML(data.tagline)}</p>
      <div class="place-meta-row">
        ${data.address ? `<div>📍 ${escapeHTML(data.address)}</div>` : ''}
      </div>
    </div>
  </section>`;
}

// ===== Hero renderers for new themes =====
function renderHeroModern() {
  return `<section class="hero">
    <div class="top-row">
      ${logoHTML('logo-mark')}
      <button class="hero-menu-btn" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="hero-content">
      <h1 class="place-name">${escapeHTML(data.name)}</h1>
      <p class="place-tagline">${escapeHTML(data.tagline)}</p>
      <div class="hero-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <span>Search within the menu...</span>
      </div>
    </div>
  </section>`;
}
function renderHeroLuscious() {
  return `<section class="hero">
    <div class="hero-grain"></div>
    <div class="hero-orb"></div>
    <div class="top-row">
      ${logoHTML('logo-mark')}
      <div class="top-meta">${escapeHTML(data.phone || '')}</div>
    </div>
    <div class="hero-content">
      <div class="eyebrow">— Welcome to —</div>
      <h1 class="place-name">${escapeHTML(data.name)}</h1>
      <p class="place-tagline">${escapeHTML(data.tagline)}</p>
      <div class="hero-social">
        <a class="social-dot" aria-label="Photos"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a>
        <a class="social-dot" aria-label="Location"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></a>
        <a class="social-dot" aria-label="Call"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></a>
      </div>
      ${data.address ? `<div class="hero-address">${escapeHTML(data.address)}</div>` : ''}
    </div>
  </section>`;
}
function renderHeroBurma() {
  const bands = (data.categories || []).slice(0, 5);
  return `<section class="hero">
    <div class="top-row">
      ${logoHTML('logo-mark')}
      <div class="top-meta">${escapeHTML(data.phone || '')}</div>
    </div>
    <div class="hero-content">
      <h1 class="place-name">${escapeHTML(data.name)}</h1>
      <p class="place-tagline">${escapeHTML(data.tagline)}</p>
      <div class="our-menu">— Our Menu —</div>
    </div>
    <div class="burma-bands">
      ${bands.map((c, i) => `<button class="burma-band" data-target="cat-${c.id}" style="--i:${i}">${escapeHTML(c.name).toUpperCase()}</button>`).join('')}
    </div>
  </section>`;
}

function renderHummApp() {
  const cats = data.categories || [];

  const mosaicCards = cats.map((cat, i) => {
    const firstImg = (cat.items || []).find(it => it.image)?.image;
    const isPhoto = !!firstImg;
    const count = (cat.items || []).length;
    if (isPhoto) {
      return `<button class="humm-card humm-card--photo" data-target="cat-${cat.id}" style="background-image:url(${firstImg})" aria-label="${escapeHTML(cat.name)}">
        <span class="humm-card-label">${escapeHTML(cat.name)}</span>
      </button>`;
    }
    return `<button class="humm-card humm-card--text" data-target="cat-${cat.id}" aria-label="${escapeHTML(cat.name)}">
      <span class="humm-card-name">${escapeHTML(cat.name)}</span>
      <span class="humm-card-count">${count} item${count !== 1 ? 's' : ''}</span>
    </button>`;
  }).join('');

  const filterPills = cats.map(cat =>
    `<button class="humm-pill tab" data-target="cat-${cat.id}">${escapeHTML(cat.name)}</button>`
  ).join('');

  const dietaryChips = TAG_DEFS.map(t =>
    `<button class="humm-chip filter-chip" data-tag="${t.id}">${t.label}</button>`
  ).join('');

  return `<div class="content-layer humm-layout">
    <aside class="humm-sidebar">
      <div class="humm-nav-top">
        ${logoHTML('humm-logo-mark')}
        <span class="humm-wordmark">${escapeHTML(data.name)}</span>
      </div>
      <div class="humm-mosaic">${mosaicCards}</div>
      <div class="humm-sidebar-info">
        ${data.tagline ? `<p class="humm-tagline-text">${escapeHTML(data.tagline)}</p>` : ''}
        ${data.address ? `<p class="humm-meta-text">${escapeHTML(data.address)}</p>` : ''}
        ${data.phone ? `<p class="humm-meta-text">${escapeHTML(data.phone)}</p>` : ''}
      </div>
    </aside>
    <main class="humm-main">
      <div class="humm-menu-header">
        <h1 class="humm-menu-title">Menu</h1>
      </div>
      <nav class="humm-filters" id="tabs">
        <button class="humm-pill" id="hummAllBtn">All</button>
        ${filterPills}
      </nav>
      <div class="humm-chips" id="filterRow">${dietaryChips}</div>
      <div class="humm-search-wrap">
        <input type="search" id="searchInput" class="humm-search" placeholder="Search dishes…" />
      </div>
      <div id="categoryHolder">${renderCategories()}</div>
      <footer class="humm-footer">${escapeHTML(data.tagline || 'See you soon')}</footer>
    </main>
  </div>`;
}

function renderHeroFresh() {
  return `<section class="hero">
    <div class="top-row">
      ${logoHTML('fresh-logo')}
      <div class="fresh-menu-icon">⋮⋮</div>
    </div>
    <div class="hero-content">
      <h1 class="place-name">${escapeHTML(data.name)}</h1>
      <p class="place-tagline">${escapeHTML(data.tagline || '')}</p>
    </div>
    <div class="fresh-promo">
      <span class="fresh-promo-badge">New</span>
      Free delivery on orders above ₹499
    </div>
  </section>`;
}
function renderItemFresh(it, i) {
  const name = getTranslation(it, 'name');
  const desc = getTranslation(it, 'desc');
  return `<div class="item reveal delay-${Math.min(i,3)}" data-iid="${it.id}">
    ${favIcon(it.id)}
    <div class="fresh-card-img-wrap">${itemImage(it)}</div>
    <div class="fresh-card-body">
      ${it.pop ? '<span class="pop-badge">★ Popular</span>' : ''}
      <h3 class="item-name">${escapeHTML(name)}</h3>
      ${desc ? `<p class="item-desc">${escapeHTML(desc)}</p>` : ''}
      <div class="fresh-card-footer">
        ${tagDots(it)}
        <span class="item-price">${escapeHTML(priceStr(it.price))}</span>
      </div>
    </div>
  </div>`;
}

// ===== New theme renderers: Gallery / Editorial / Maison =====
function renderItemGallery(it, i) {
  const name = getTranslation(it, 'name');
  const desc = getTranslation(it, 'desc');
  return `<div class="item reveal delay-${Math.min(i,3)}" data-iid="${it.id}">
    ${favIcon(it.id)}
    ${itemImage(it)}
    ${it.pop ? '<span class="pop-badge">Signature</span>' : ''}
    <div class="gallery-cap">
      <div class="gallery-cap-row">
        <h3 class="item-name">${escapeHTML(name)}</h3>
        <div class="item-price">${escapeHTML(priceStr(it.price))}</div>
      </div>
      <div class="gallery-cap-sub">
        ${desc ? `<span class="gallery-desc">${escapeHTML(desc)}</span>` : '<span></span>'}
        ${tagDots(it)}
      </div>
    </div>
  </div>`;
}

function renderItemEditorial(it, i) {
  const num = String(i + 1).padStart(2, '0');
  const name = getTranslation(it, 'name');
  const desc = getTranslation(it, 'desc');
  return `<div class="item reveal delay-${Math.min(i,3)}" data-iid="${it.id}">
    ${favIcon(it.id)}
    ${itemImage(it, 'item-image ed-photo')}
    <div class="ed-text">
      <span class="ed-num">${num}</span>
      <div class="ed-head">
        <h3 class="item-name">${escapeHTML(name)}${it.pop ? '<span class="pop-badge">Editor\u2019s Pick</span>' : ''}</h3>
        <span class="ed-leader"></span>
        <span class="item-price">${escapeHTML(priceStr(it.price))}</span>
      </div>
      ${desc ? `<p class="item-desc">${escapeHTML(desc)}</p>` : ''}
      ${tagDots(it)}
    </div>
  </div>`;
}

function renderItemMaison(it, i) {
  const name = getTranslation(it, 'name');
  const desc = getTranslation(it, 'desc');
  return `<div class="item reveal delay-${Math.min(i,3)}" data-iid="${it.id}">
    ${favIcon(it.id)}
    ${it.image ? `<div class="m-photo" style="background-image:url(${it.image})"></div>` : ''}
    <div class="m-head">
      <h3 class="item-name">${escapeHTML(name)}</h3>
      <span class="m-leader"></span>
      <span class="item-price">${escapeHTML(priceStr(it.price))}</span>
    </div>
    ${desc ? `<p class="item-desc">${escapeHTML(desc)}</p>` : ''}
    ${tagDots(it)}
    ${it.pop ? '<span class="pop-badge">Signature</span>' : ''}
  </div>`;
}

function renderHeroGallery() {
  return `<section class="hero">
    <div class="top-row">
      ${logoHTML('logo-mark')}
      <div class="top-meta">${escapeHTML(data.phone || '')}</div>
    </div>
    <div class="hero-content">
      <div class="eyebrow">— The Menu —</div>
      <h1 class="place-name">${escapeHTML(data.name)}</h1>
      <p class="place-tagline">${escapeHTML(data.tagline)}</p>
      ${data.address ? `<div class="gallery-meta">📍 ${escapeHTML(data.address)}</div>` : ''}
    </div>
  </section>`;
}

function renderHeroEditorial() {
  let dateStr = '';
  try { dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); } catch (e) {}
  return `<section class="hero">
    <div class="ed-masthead-top">
      <span>Established</span>
      <span>${escapeHTML(dateStr)}</span>
      <span>Vol. I</span>
    </div>
    <h1 class="place-name">${escapeHTML(data.name)}</h1>
    <div class="ed-rule"></div>
    <p class="place-tagline">${escapeHTML(data.tagline)}</p>
  </section>`;
}

function renderHeroMaison() {
  const heroImg = (data.categories && data.categories[0] && (data.categories[0].items || []).find(it => it.image) || {}).image;
  return `<section class="hero">
    ${heroImg ? `<div class="m-hero-photo" style="background-image:url(${heroImg})"></div>` : ''}
    <div class="m-hero-inner">
      ${logoHTML('logo-mark')}
      <div class="eyebrow">Menu Dégustation</div>
      <h1 class="place-name">${escapeHTML(data.name)}</h1>
      <p class="place-tagline">${escapeHTML(data.tagline)}</p>
      <div class="m-meta">
        ${data.address ? `<span>${escapeHTML(data.address)}</span>` : ''}
        ${data.phone ? `<span>${escapeHTML(data.phone)}</span>` : ''}
      </div>
    </div>
  </section>`;
}

function heroFor(theme) {  return ({
    cafe:renderHeroCafe, restaurant:renderHeroRestaurant, bistro:renderHeroBistro, urban:renderHeroUrban,
    humm:renderHeroCafe, modern:renderHeroModern, artisan:renderHeroCafe, burma:renderHeroBurma, luscious:renderHeroLuscious,
    fresh:renderHeroFresh,
    gallery:renderHeroGallery, editorial:renderHeroEditorial, maison:renderHeroMaison,
  })[theme] || renderHeroCafe;
}
function footerFor(theme) {
  return ({
    cafe: `<footer class="footer">Thank you · See you again</footer>`,
    restaurant: `<footer class="footer">${escapeHTML(data.address || '')} · ${escapeHTML(data.phone || '')}</footer>`,
    bistro: `<footer class="footer">Made with love</footer>`,
    urban: `<footer class="footer">${escapeHTML(data.tagline || 'Thanks for visiting')}</footer>`,
    humm: `<footer class="footer">${escapeHTML(data.tagline || 'See you soon')}</footer>`,
    modern: `<footer class="footer">${escapeHTML(data.address || '')}</footer>`,
    artisan: `<footer class="footer">Crafted with care</footer>`,
    burma: `<footer class="footer">${escapeHTML(data.address || data.tagline || '')}</footer>`,
    luscious: `<footer class="footer">${escapeHTML(data.tagline || 'Welcome back')}</footer>`,
    fresh: `<footer class="footer">${escapeHTML(data.tagline || 'Eat well, live well')} · ${escapeHTML(data.address || '')}</footer>`,
    gallery: `<footer class="footer">${escapeHTML(data.address || '')} · ${escapeHTML(data.phone || '')}</footer>`,
    editorial: `<footer class="footer">— Fin —</footer>`,
    maison: `<footer class="footer">${escapeHTML(data.tagline || 'Merci')}</footer>`,
  })[theme] || '';
}

function renderBackdrop() {
  const name = (data.name || 'MENU').toUpperCase();
  const longRow = Array.from({length: 8}, () => name).join(' · ');
  return `
    <div class="bg-stage" aria-hidden="true">
      <div class="bg-grad"></div>
      <div class="bg-row row-a"><span>${escapeHTML(longRow)}</span><span>${escapeHTML(longRow)}</span></div>
      <div class="bg-row row-b"><span>${escapeHTML(longRow)}</span><span>${escapeHTML(longRow)}</span></div>
      <div class="bg-row row-c"><span>${escapeHTML(longRow)}</span><span>${escapeHTML(longRow)}</span></div>
      <div class="bg-row row-d"><span>${escapeHTML(longRow)}</span><span>${escapeHTML(longRow)}</span></div>
    </div>
  `;
}

function applyTheme() {
  if (data._demo && THEME_DEMO_DATA[data.theme]) {
    const d = THEME_DEMO_DATA[data.theme];
    const savedWhatsApp = data.chefWhatsApp; // Preserve WhatsApp number
    data.name = d.name; data.tagline = d.tagline;
    data.address = d.address; data.phone = d.phone;
    data.categories = d.categories;
    data.currency = '₹';
    data.chefWhatsApp = savedWhatsApp; // Restore WhatsApp number
  }
  document.body.className = '';
  document.body.classList.add('theme-' + data.theme);
  const app = document.getElementById('app');
  if (data.theme === 'humm') {
    app.innerHTML = renderBackdrop() + renderHummApp();
  } else {
    const hero = heroFor(data.theme)();
    const footer = footerFor(data.theme);
    app.innerHTML = renderBackdrop() + `<div class="content-layer">
      ${hero}
      ${renderTabs()}
      ${renderSearchBar()}
      <div id="categoryHolder">${renderCategories()}</div>
      ${footer}
    </div>`;
  }
  renderThemeFab();
  // renderLanguageFab(); // TODO: debug language switching
  renderCartFab();
  attachInteractions();
  observeReveal();
  attachTilt();
}

// ===== Just re-render categories (for search/filter changes) =====
function rerenderCategories() {
  const holder = document.getElementById('categoryHolder');
  if (!holder) return;
  holder.innerHTML = renderCategories();
  observeReveal();
  attachTilt();
}

// ===== Interactions =====
let _scrollHandler = null;
let _docClickAttached = false;
function attachInteractions() {
  // Burma hero bands scroll to category
  document.querySelectorAll('.burma-band').forEach(b => {
    b.addEventListener('click', () => {
      const t = document.getElementById(b.dataset.target);
      if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    });
  });

  // Restaurant hero nav links (Menu / Snacks / Drinks)
  document.querySelectorAll('.rest-nav-links span').forEach(link => {
    link.addEventListener('click', () => {
      const label = link.textContent.toLowerCase();
      const allSections = [...document.querySelectorAll('.category[id^="cat-"]')];
      const match = allSections.find(s => {
        const title = s.querySelector('.category-title');
        return title && title.textContent.toLowerCase().includes(label);
      });
      const target = match || document.getElementById('categoryHolder');
      if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    });
  });

  // Tab click → scroll
  document.querySelectorAll('#tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const t = document.getElementById(tab.dataset.target);
      if (t) {
        const tabsEl = document.getElementById('tabs');
        const offset = (tabsEl?.offsetHeight || 0) + 8;
        window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
      }
    });
  });

  // Auto-highlight tab while scrolling (idempotent)
  if (_scrollHandler) window.removeEventListener('scroll', _scrollHandler);
  _scrollHandler = function () {
    const tabs = [...document.querySelectorAll('#tabs .tab')];
    const sections = data.categories.map(c => document.getElementById('cat-' + c.id)).filter(Boolean);
    const y = window.scrollY + 160;
    let activeIdx = 0;
    sections.forEach((s, i) => { if (s.offsetTop <= y) activeIdx = i; });
    // At (or near) the bottom, the last short section can't reach the activation
    // line — force-select it so the final tab highlights correctly.
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom && sections.length) activeIdx = sections.length - 1;
    tabs.forEach((t, i) => t.classList.toggle('active', i === activeIdx));
    // Humm: clear "All" highlight once scrolled into content
    const allBtn = document.getElementById('hummAllBtn');
    if (allBtn) allBtn.classList.remove('active');
    const at = tabs[activeIdx];
    if (at) {
      const cont = document.getElementById('tabs');
      if (!cont) return;
      const target = at.offsetLeft - cont.offsetWidth / 2 + at.offsetWidth / 2;
      cont.scrollTo({ left: target, behavior: 'smooth' });
    }
  };
  window.addEventListener('scroll', _scrollHandler, { passive: true });

  // Search
  const search = document.getElementById('searchInput');
  if (search) {
    search.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      rerenderCategories();
    });
  }

  // Filter chips
  document.querySelectorAll('#filterRow .filter-chip').forEach(ch => {
    ch.addEventListener('click', () => {
      const tag = ch.dataset.tag;
      if (activeFilters.has(tag)) { activeFilters.delete(tag); ch.classList.remove('active'); }
      else { activeFilters.add(tag); ch.classList.add('active'); }
      rerenderCategories();
    });
  });

  // Humm: mosaic card clicks scroll to category
  document.querySelectorAll('.humm-card').forEach(card => {
    card.addEventListener('click', () => {
      const t = document.getElementById(card.dataset.target);
      if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    });
  });

  // Humm: "All" button scrolls to top of main panel
  const hummAllBtn = document.getElementById('hummAllBtn');
  if (hummAllBtn) {
    hummAllBtn.addEventListener('click', () => {
      const main = document.querySelector('.humm-main');
      if (main) window.scrollTo({ top: main.getBoundingClientRect().top + window.scrollY - 20, behavior: 'smooth' });
      document.querySelectorAll('#tabs .humm-pill').forEach(p => p.classList.remove('active'));
      hummAllBtn.classList.add('active');
    });
  }

  // Item click → detail (attach once)
  if (!_docClickAttached) {
    document.addEventListener('click', onItemClick, true);
    _docClickAttached = true;
  }
}
function onItemClick(e) {
  const favBtn = e.target.closest('.fav-btn');
  if (favBtn) {
    e.stopPropagation();
    const iid = favBtn.dataset.fav;
    toggleFav(iid);
    favBtn.classList.toggle('on', favorites.has(iid));
    return;
  }
  const item = e.target.closest('.item');
  if (item && item.dataset.iid) {
    openDetail(item.dataset.iid);
  }
}

function toggleFav(iid) {
  if (favorites.has(iid)) favorites.delete(iid);
  else favorites.add(iid);
  saveFavs();
}

// ===== Detail sheet =====
function findItem(iid) {
  for (const c of data.categories) for (const it of (c.items||[])) if (it.id === iid) return it;
  return null;
}

function openDetail(iid) {
  const it = findItem(iid);
  if (!it) return;
  let sheet = document.getElementById('detailSheet');
  let backdrop = document.getElementById('detailBackdrop');
  if (!sheet) {
    backdrop = document.createElement('div');
    backdrop.id = 'detailBackdrop'; backdrop.className = 'detail-backdrop';
    document.body.appendChild(backdrop);
    sheet = document.createElement('div');
    sheet.id = 'detailSheet'; sheet.className = 'detail-sheet';
    document.body.appendChild(sheet);
    backdrop.addEventListener('click', closeDetail);
  }
  const tagsHTML = (it.tags || []).map(t => {
    const def = TAG_DEFS.find(d => d.id === t);
    return def ? `<span class="detail-tag">${def.label}</span>` : '';
  }).join('');
  const inCart = cart.has(it.id);

  // Prepare images: use images array if available, fall back to single image
  const images = (it.images && it.images.length > 0) ? it.images : (it.image ? [it.image] : []);
  const hasMultipleImages = images.length > 1;

  let heroHTML;
  if (images.length > 0) {
    if (hasMultipleImages) {
      // Carousel for multiple images
      heroHTML = `
        <div class="carousel-container" id="carouselContainer">
          <div class="carousel-track" id="carouselTrack">
            ${images.map(img => `<img class="carousel-image" src="${escapeHTML(img)}" alt="Dish image"/>`).join('')}
          </div>
          ${images.length > 1 ? `
            <div class="carousel-nav">
              <button class="carousel-prev" id="carouselPrev">‹</button>
              <div class="carousel-dots">
                ${images.map((_, i) => `<span class="carousel-dot ${i===0?'active':''}" id="dot-${i}"></span>`).join('')}
              </div>
              <button class="carousel-next" id="carouselNext">›</button>
            </div>
          ` : ''}
          <button class="detail-close" id="detailClose">×</button>
        </div>
      `;
    } else {
      // Single image
      heroHTML = `<div class="detail-hero" style="background-image:url(${escapeHTML(images[0])})"><button class="detail-close" id="detailClose">×</button></div>`;
    }
  } else {
    // Placeholder
    heroHTML = `<div class="detail-hero placeholder">◍<button class="detail-close" id="detailClose">×</button></div>`;
  }

  const detailName = getTranslation(it, 'name');
  const detailDesc = getTranslation(it, 'desc');
  sheet.innerHTML = `
    <div class="detail-grabber"></div>
    ${heroHTML}
    <div class="detail-body">
      <div class="detail-name-row">
        <h2 class="detail-name">${escapeHTML(detailName)}</h2>
        <div class="detail-price">${escapeHTML(priceStr(it.price))}</div>
      </div>
      ${tagsHTML ? `<div class="detail-tags">${tagsHTML}</div>` : ''}
      <p class="detail-desc">${escapeHTML(detailDesc || 'No description.')}</p>
      ${(() => {
        const pairs = (it.pairsWith || []);
        if (!pairs.length) return '';
        const pairItems = pairs.map(name => {
          for (const cat of data.categories) {
            const found = (cat.items||[]).find(i => i.name === name);
            if (found) return found;
          }
          return null;
        }).filter(Boolean);
        if (!pairItems.length) return '';
        return `<div class="detail-pairs-section">
          <div class="detail-pairs-label">🔗 Pairs well with</div>
          <div class="pairs-scroll">
            ${pairItems.map(p => `
              <div class="pair-chip" data-pair-id="${p.id}">
                ${p.image ? `<div class="pair-chip-img" style="background-image:url(${escapeHTML(p.image)})"></div>` : `<div class="pair-chip-img"></div>`}
                <div class="pair-chip-name">${escapeHTML(getTranslation(p,'name'))}</div>
                <div class="pair-chip-price">${escapeHTML(priceStr(p.price))}</div>
                <div class="pair-chip-add">+ Add</div>
              </div>`).join('')}
          </div>
        </div>`;
      })()}
      <div class="detail-actions">
        <button class="detail-btn ghost" id="detailFav">${favorites.has(it.id) ? '♥ Saved' : '♡ Save'}</button>
        <button class="detail-btn primary ${inCart?'added':''}" id="detailAdd">${inCart ? '✓ Added' : 'Add to order'}</button>
      </div>
    </div>
  `;
  requestAnimationFrame(() => {
    backdrop.classList.add('open');
    sheet.classList.add('open');
  });
  document.body.style.overflow = 'hidden';

  // Setup carousel if multiple images
  if (hasMultipleImages) {
    setupCarousel(sheet, images);
  }

  sheet.querySelector('#detailClose').addEventListener('click', closeDetail);

  // Pair chips — add to cart
  sheet.querySelectorAll('.pair-chip[data-pair-id]').forEach(chip => {
    chip.addEventListener('click', () => {
      const pid = chip.dataset.pairId;
      addToCart(pid);
      trackOrder(pid);
      chip.classList.add('pair-added');
      chip.querySelector('.pair-chip-add').textContent = '✓ Added';
    });
  });

  sheet.querySelector('#detailFav').addEventListener('click', () => {
    toggleFav(it.id);
    const btn = sheet.querySelector('#detailFav');
    btn.textContent = favorites.has(it.id) ? '♥ Saved' : '♡ Save';
    // Update card heart too
    const card = document.querySelector(`.item[data-iid="${it.id}"] .fav-btn`);
    if (card) card.classList.toggle('on', favorites.has(it.id));
  });
  sheet.querySelector('#detailAdd').addEventListener('click', () => {
    const btn = sheet.querySelector('#detailAdd');
    addToCart(it.id);
    trackOrder(it.id);
    flyToCart(btn);
    btn.classList.add('added');
    btn.textContent = '✓ Added';
    setTimeout(closeDetail, 480);
  });
}

function setupCarousel(sheet, images) {
  const container = sheet.querySelector('#carouselContainer');
  const track = sheet.querySelector('#carouselTrack');
  const prevBtn = sheet.querySelector('#carouselPrev');
  const nextBtn = sheet.querySelector('#carouselNext');
  if (!container || !track) return;

  let currentIndex = 0;
  let touchStartX = 0;
  let touchStartTime = 0;

  function updateCarousel() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    // Update dots
    sheet.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function moveToImage(index) {
    currentIndex = (index + images.length) % images.length;
    updateCarousel();
  }

  // Arrow buttons
  if (prevBtn) prevBtn.addEventListener('click', () => moveToImage(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => moveToImage(currentIndex + 1));

  // Touch swipe (passive for performance)
  container.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartTime = Date.now();
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const distance = touchStartX - touchEndX;
    const time = Date.now() - touchStartTime;
    const minDistance = 30;
    const minTime = 500; // max time for a "swipe"

    // Swipe right (show previous) or swipe left (show next)
    if (Math.abs(distance) > minDistance && time < minTime) {
      if (distance > 0) moveToImage(currentIndex + 1); // swipe left
      else moveToImage(currentIndex - 1); // swipe right
    }
  }, { passive: true });

  // Mouse drag for desktop testing
  let mouseDown = false;
  container.addEventListener('mousedown', (e) => {
    mouseDown = true;
    touchStartX = e.clientX;
    touchStartTime = Date.now();
  });

  container.addEventListener('mousemove', (e) => {
    if (!mouseDown) return;
    const distance = touchStartX - e.clientX;
    if (Math.abs(distance) > 10) {
      track.style.transition = 'none';
      track.style.transform = `translateX(calc(-${currentIndex * 100}% - ${distance}px))`;
    }
  });

  container.addEventListener('mouseup', (e) => {
    if (!mouseDown) return;
    mouseDown = false;
    const touchEndX = e.clientX;
    const distance = touchStartX - touchEndX;
    const minDistance = 30;

    track.style.transition = 'transform 0.3s ease-out';
    if (Math.abs(distance) > minDistance) {
      if (distance > 0) moveToImage(currentIndex + 1);
      else moveToImage(currentIndex - 1);
    } else {
      updateCarousel();
    }
  });

  container.addEventListener('mouseleave', () => {
    if (!mouseDown) return;
    mouseDown = false;
    track.style.transition = 'transform 0.3s ease-out';
    updateCarousel();
  });

  // Dot clicks
  sheet.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.addEventListener('click', () => moveToImage(i));
  });
}

function closeDetail() {
  const sheet = document.getElementById('detailSheet');
  const backdrop = document.getElementById('detailBackdrop');
  if (sheet) sheet.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  document.body.style.overflow = '';
}

// ===== Cart =====
function addToCart(iid) {
  cart.set(iid, (cart.get(iid) || 0) + 1);
  saveCart();
  updateCartFab();
}
function setQty(iid, qty) {
  if (qty <= 0) cart.delete(iid);
  else cart.set(iid, qty);
  saveCart();
  updateCartFab();
}

function renderCartFab() {
  let fab = document.getElementById('cartFab');
  if (fab) return;
  fab = document.createElement('button');
  fab.id = 'cartFab';
  fab.className = 'cart-fab';
  fab.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
    <span>Your order</span>
    <span class="cart-count" id="cartCount">0</span>
  `;
  fab.addEventListener('click', openCart);
  document.body.appendChild(fab);
  updateCartFab();
}

function updateCartFab() {
  const fab = document.getElementById('cartFab');
  if (!fab) return;
  // Only count items that actually exist in the menu (filter out deleted items)
  let totalCount = 0;
  for (const [iid, qty] of cart.entries()) {
    if (findItem(iid)) totalCount += qty; // Only count if item exists
  }
  const counter = document.getElementById('cartCount');
  if (counter) counter.textContent = totalCount;
  fab.classList.toggle('show', totalCount > 0);
}

// Bounce the cart FAB to confirm an add
function bumpCartFab() {
  const fab = document.getElementById('cartFab');
  if (!fab) return;
  fab.classList.remove('bump');
  void fab.offsetWidth;
  fab.classList.add('bump');
}

// Animate a dot flying from an element into the cart FAB
function flyToCart(fromEl) {
  const fab = document.getElementById('cartFab');
  if (!fab || !fromEl || typeof fromEl.getBoundingClientRect !== 'function') { bumpCartFab(); return; }
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { bumpCartFab(); return; }
  const from = fromEl.getBoundingClientRect();
  const to = fab.getBoundingClientRect();
  const dot = document.createElement('div');
  dot.className = 'fly-dot';
  const startX = from.left + from.width / 2;
  const startY = from.top + from.height / 2;
  dot.style.left = startX + 'px';
  dot.style.top = startY + 'px';
  document.body.appendChild(dot);
  const dx = (to.left + to.width / 2) - startX;
  const dy = (to.top + to.height / 2) - startY;
  requestAnimationFrame(() => {
    dot.style.transform = `translate(${dx}px, ${dy}px) scale(0.25)`;
    dot.style.opacity = '0.3';
  });
  setTimeout(() => { dot.remove(); bumpCartFab(); }, 560);
}

function openCart() {
  let sheet = document.getElementById('cartSheet');
  let backdrop = document.getElementById('cartBackdrop');
  if (!sheet) {
    backdrop = document.createElement('div');
    backdrop.id = 'cartBackdrop'; backdrop.className = 'detail-backdrop';
    document.body.appendChild(backdrop);
    sheet = document.createElement('div');
    sheet.id = 'cartSheet'; sheet.className = 'cart-sheet';
    document.body.appendChild(sheet);
    backdrop.addEventListener('click', closeCart);
  }
  renderCartContent(sheet);
  requestAnimationFrame(() => { backdrop.classList.add('open'); sheet.classList.add('open'); });
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const sheet = document.getElementById('cartSheet');
  const backdrop = document.getElementById('cartBackdrop');
  if (sheet) sheet.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  document.body.style.overflow = '';
}

function renderCartContent(sheet) {
  const entries = [...cart.entries()].map(([iid, qty]) => ({ it: findItem(iid), qty })).filter(e => e.it);
  const total = entries.reduce((sum, e) => sum + priceNum(e.it.price) * e.qty, 0);
  const cur = data.currency || '₹';

  if (!entries.length) {
    sheet.innerHTML = `
      <div class="cart-head"><h3>Your order</h3><button id="cartClose">Close</button></div>
      <div class="cart-empty">
        <h3 style="font-size:18px;margin:0 0 6px;color:var(--text)">Nothing here yet</h3>
        <p style="margin:0;font-size:14px">Tap any dish, then "Add to order".</p>
      </div>
    `;
  } else {
    sheet.innerHTML = `
      <div class="cart-head"><h3>Your order</h3><button id="cartClose">Close</button></div>
      <div class="cart-list">
        ${entries.map(({it, qty}) => `
          <div class="cart-row" data-iid="${it.id}">
            <div class="cart-thumb" style="${it.image ? `background-image:url(${it.image})` : ''}"></div>
            <div class="cart-info">
              <h4>${escapeHTML(getTranslation(it, 'name'))}</h4>
              <p>${cur}${(priceNum(it.price) * qty).toFixed(2)}</p>
            </div>
            <div class="cart-qty">
              <button data-act="dec">−</button>
              <span>${qty}</span>
              <button data-act="inc">+</button>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="cart-foot">
        <div class="cart-total"><span>Total</span><b>${cur}${total.toFixed(2)}</b></div>
        ${data.chefWhatsApp ? `<button class="detail-btn primary whatsapp-btn" id="cartWhatsApp">📱 Order Now</button>` : ''}
        <button class="detail-btn ${data.chefWhatsApp ? 'ghost' : 'primary'}" id="cartShow">Show to waiter</button>
        <p class="show-waiter-note">Not a paid order — ${data.chefWhatsApp ? 'order via WhatsApp or s' : 's'}how your phone at the counter to order these items.</p>
      </div>
    `;
  }

  sheet.querySelector('#cartClose').addEventListener('click', closeCart);
  sheet.querySelectorAll('.cart-qty button').forEach(b => {
    b.addEventListener('click', () => {
      const row = b.closest('.cart-row');
      const iid = row.dataset.iid;
      const cur = cart.get(iid) || 0;
      setQty(iid, cur + (b.dataset.act === 'inc' ? 1 : -1));
      renderCartContent(sheet);
    });
  });
  const showBtn = sheet.querySelector('#cartShow');
  if (showBtn) {
    showBtn.addEventListener('click', () => openWaiterView(entries, total, cur));
  }
  const whatsappBtn = sheet.querySelector('#cartWhatsApp');
  if (whatsappBtn && data.chefWhatsApp) {
    whatsappBtn.addEventListener('click', () => sendOrderViaWhatsApp(entries, total, cur, data));
  }
}

// ===== WhatsApp Order Integration =====
function sendOrderViaWhatsApp(entries, total, cur, menuData) {
  if (!menuData.chefWhatsApp) {
    alert('WhatsApp number not configured');
    return;
  }

  // Format: remove spaces, +, hyphens; normalize to country code + number
  let number = menuData.chefWhatsApp.replace(/[\s\-\+]/g, '');
  if (!number.startsWith('91')) {
    // If no country code, assume +91 (India)
    number = '91' + number;
  }

  // Build order message (always in English)
  const lines = [
    `🍽️ *${escapeHTML(menuData.name || 'Order')}*`,
    '',
    '*Items:*'
  ];

  entries.forEach(({it, qty}) => {
    const itemName = it.name; // Always use English name
    const itemPrice = priceNum(it.price) * qty;
    lines.push(`• ${itemName} × ${qty} — ${cur}${itemPrice.toFixed(0)}`);
  });

  lines.push('');
  lines.push(`*Total: ${cur}${total.toFixed(0)}*`);
  lines.push('');
  lines.push('📍 ' + (menuData.address || 'Location'));
  lines.push('🕐 Ordered: ' + new Date().toLocaleTimeString('en-IN'));

  const message = lines.join('\n');

  // Log order locally + send to server
  const orders = JSON.parse(localStorage.getItem('whatsappOrders') || '[]');
  const newOrder = {
    number, message, cafeName: menuData.name,
    timestamp: new Date().toISOString(),
    status: 'new'
  };
  orders.push(newOrder);
  localStorage.setItem('whatsappOrders', JSON.stringify(orders));

  // Also save to server for kitchen display
  const orderId = `ORDER-${orders.length - 1}`;
  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, status: 'new', order: newOrder })
  }).catch(() => {}); // Fail silently if server unavailable

  // Show success and close cart
  closeCart();
  showOrderConfirmation(menuData.name, message);
  cart.clear();
  saveCart();
}

function showOrderConfirmation(cafeName, message) {
  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px)';

  // Create dialog
  const dialog = document.createElement('div');
  dialog.style.cssText = 'background:#fff;border-radius:20px;padding:28px;max-width:380px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3)';

  dialog.innerHTML = `
    <h3 style="margin:0 0 14px;font-size:20px;font-weight:700;color:#25D366">✓ Order Received</h3>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.5">Your order has been sent to ${escapeHTML(cafeName)}</p>
    <p style="margin:0;font-size:12px;color:#888">The chef will confirm your order shortly</p>
    <button onclick="this.closest('div').parentElement.remove()" style="margin-top:16px;padding:12px 20px;background:#25D366;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600">Close</button>
  `;

  backdrop.appendChild(dialog);
  document.body.appendChild(backdrop);
}

// ===== "Show to waiter" full-screen order ticket =====
function openWaiterView(entries, total, cur) {
  let ov = document.getElementById('waiterView');
  if (ov) ov.remove();
  ov = document.createElement('div');
  ov.id = 'waiterView';
  ov.className = 'waiter-view';
  const count = entries.reduce((a, e) => a + e.qty, 0);
  ov.innerHTML = `
    <div class="waiter-card">
      <button class="waiter-close" id="waiterClose" aria-label="Close">×</button>
      <div class="waiter-head">
        <span class="waiter-eyebrow">Show this to your server</span>
        <h2 class="waiter-place">${escapeHTML(data.name || 'Your order')}</h2>
      </div>
      <ul class="waiter-list">
        ${entries.map(({it, qty}) => `
          <li class="waiter-row">
            <span class="waiter-qty">${qty}<span>×</span></span>
            <span class="waiter-name">${escapeHTML(getTranslation(it, 'name'))}</span>
            <span class="waiter-line-price">${cur}${(priceNum(it.price) * qty).toFixed(0)}</span>
          </li>`).join('')}
      </ul>
      <div class="waiter-total">
        <span>${count} item${count !== 1 ? 's' : ''}</span>
        <b>${cur}${total.toFixed(0)}</b>
      </div>
      <p class="waiter-note">Not a paid order — staff will confirm at your table.</p>
    </div>`;
  document.body.appendChild(ov);
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => ov.classList.add('open'));
  const close = () => {
    ov.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => ov.remove(), 300);
  };
  ov.querySelector('#waiterClose').addEventListener('click', close);
  ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
}

// ===== Language switcher FAB =====
function renderLanguageFab() {
  let fab = document.getElementById('langFab');
  if (fab) fab.remove();

  fab = document.createElement('button');
  fab.id = 'langFab';
  fab.className = 'lang-fab';
  fab.innerHTML = LANGUAGE_FLAGS[currentLanguage];
  fab.title = `Language: ${LANGUAGE_NAMES[currentLanguage]}`;
  fab.setAttribute('aria-label', `Switch language`);
  fab.type = 'button'; // Explicit button type

  fab.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Language button clicked! Current:', currentLanguage);
    const idx = LANGUAGES.indexOf(currentLanguage);
    const nextIdx = (idx + 1) % LANGUAGES.length;
    currentLanguage = LANGUAGES[nextIdx];
    console.log('Language switched to:', currentLanguage);
    localStorage.setItem('menuLanguage', currentLanguage);
    // Manually re-render categories with new language
    rerenderCategories();
    // Update FAB icon
    fab.innerHTML = LANGUAGE_FLAGS[currentLanguage];
    fab.title = `Language: ${LANGUAGE_NAMES[currentLanguage]}`;
  });

  document.body.appendChild(fab);
  console.log('Language FAB created:', LANGUAGE_FLAGS[currentLanguage]);
}

// ===== Theme switcher FAB =====
function renderThemeFab() {
  let fab = document.getElementById('themeFab');
  if (fab) return;
  fab = document.createElement('button');
  fab.id = 'themeFab';
  fab.className = 'theme-fab';
  fab.setAttribute('aria-label','Switch theme');
  fab.innerHTML = '✦';
  document.body.appendChild(fab);

  const backdrop = document.createElement('div');
  backdrop.className = 'theme-backdrop';
  backdrop.id = 'themeBackdrop';
  document.body.appendChild(backdrop);

  const sheet = document.createElement('div');
  sheet.className = 'theme-sheet';
  sheet.id = 'themeSheet';
  sheet.innerHTML = `
    <h4>Choose a theme</h4>
    <div class="theme-sheet-grid">
      ${THEME_DEFS.map(t => `
        <button class="theme-sheet-item${t.id===data.theme?' active':''}" data-theme="${t.id}">
          <div class="sw" style="background:${t.sw}"></div>
          <span>${t.label}</span>
        </button>
      `).join('')}
    </div>`;
  document.body.appendChild(sheet);

  function close() { sheet.classList.remove('open'); backdrop.classList.remove('open'); }
  fab.addEventListener('click', () => { sheet.classList.add('open'); backdrop.classList.add('open'); });
  backdrop.addEventListener('click', close);
  sheet.querySelectorAll('.theme-sheet-item').forEach(b => {
    b.addEventListener('click', () => {
      data.theme = b.dataset.theme;
      // Remove existing UI so applyTheme re-attaches correctly
      ['themeFab','themeBackdrop','themeSheet','langFab','cartFab','detailSheet','detailBackdrop','cartSheet','cartBackdrop'].forEach(id => {
        const el = document.getElementById(id); if (el) el.remove();
      });
      applyTheme();
      setTimeout(close, 220);
    });
  });
}

// ===== NEW: Availability badge helper =====
function availBadgeHTML(it) {
  if (!it) return '';
  if (it.avail === 'soldout') return '<span class="item-avail-badge avail-soldout-badge">Sold Out</span>';
  if (it.avail === 'limited') return '<span class="item-avail-badge avail-limited-badge">⚡ Limited</span>';
  return '';
}

// ===== NEW: Post-process items for availability overlays =====
function postProcessItems() {
  const itemMap = {};
  (data.categories || []).forEach(cat => (cat.items || []).forEach(it => { itemMap[it.id] = it; }));

  // Clean up stale cart items (items no longer in menu)
  for (const iid of cart.keys()) {
    if (!itemMap[iid]) cart.delete(iid);
  }
  saveCart();
  updateCartFab();

  document.querySelectorAll('.item[data-iid]').forEach(el => {
    const it = itemMap[el.dataset.iid];
    if (!it) return;
    if (it.avail === 'soldout') {
      el.classList.add('item-soldout-dim');
    } else if (it.avail === 'limited') {
      if (!el.querySelector('.item-avail-badge')) {
        const badge = document.createElement('span');
        badge.className = 'item-avail-badge avail-limited-badge';
        badge.textContent = '⚡ Limited';
        const nameEl = el.querySelector('.item-name');
        if (nameEl) nameEl.appendChild(badge);
      }
    }
  });
}

// ===== NEW: Promo banner =====
function injectPromoBanner() {
  document.getElementById('promoBannerStrip')?.remove();
  const promos = (data.promos || []).filter(p => p.active);
  if (!promos.length) return;
  const strip = document.createElement('div');
  strip.id = 'promoBannerStrip';
  strip.innerHTML = promos.map(p => `<div class="promo-strip-item"><span class="promo-strip-icon">${p.icon}</span><span>${p.msg}</span></div>`).join('') +
    `<button class="promo-strip-close" aria-label="Close">×</button>`;
  strip.querySelector('.promo-strip-close').addEventListener('click', () => strip.remove());
  const app = document.getElementById('app');
  if (app) app.prepend(strip);
}

function observeReveal() {
  const els = document.querySelectorAll('.reveal:not(.in)');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
}

function attachTilt() { /* tilt/parallax disabled — kept noop so existing callers still work */ }

// Boot
window.addEventListener('DOMContentLoaded', async () => {
  data = await readData();
  menuId = new URLSearchParams(location.search).get('id') || (data.name || 'local').toLowerCase().replace(/\s+/g,'-');
  loadFavCart();
  applyTheme();
  injectPromoBanner();
  postProcessItems();
  document.getElementById('app').classList.remove('hidden');
  const loader = document.getElementById('loader');
  loader.style.opacity = '0';
  setTimeout(() => loader.style.display = 'none', 500);
  document.title = data.name ? `${data.name} — Menu` : 'Menu';
});
