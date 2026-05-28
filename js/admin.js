// Menu Studio — Admin
const STORE_KEY = 'menuStudio.v1';

const IMG = (name) => `static/images/${name}.jpg`;

const defaultData = () => ({
  name: 'Aurora Coffee House',
  tagline: 'Slow-brewed since 2019',
  address: '42 Linden Street, Bandra, Mumbai',
  phone: '+91 98765 43210',
  currency: '₹',
  logo: IMG('logo'),
  theme: 'cafe',
  categories: demoCategories()
});

function demoCategories() {
  return [
    {
      id: cid(),
      name: 'Signature Espresso',
      items: [
        { id: cid(), name: 'Velvet Latte', desc: 'Double shot, oat milk, vanilla bean', price: '280', pop: true, image: IMG('velvet-latte'), tags: ['veg','df'] },
        { id: cid(), name: 'Honey Cortado', desc: 'Equal parts espresso & steamed milk, raw honey', price: '240', pop: false, image: IMG('honey-cortado'), tags: ['veg'] },
        { id: cid(), name: 'Iced Brown Sugar Shaken', desc: 'Cold espresso, brown sugar syrup, cinnamon', price: '260', pop: true, image: IMG('iced-brown-sugar'), tags: ['veg','vegan','df'] },
        { id: cid(), name: 'Flat White', desc: 'Velvety microfoam over a ristretto double', price: '220', pop: false, image: IMG('flat-white'), tags: ['veg'] },
        { id: cid(), name: 'Caramel Macchiato', desc: 'Steamed milk, vanilla, caramel drizzle', price: '290', pop: false, image: IMG('caramel-macchiato'), tags: ['veg'] },
        { id: cid(), name: 'Spanish Latte', desc: 'Condensed milk, espresso, silky finish', price: '270', pop: true, image: IMG('spanish-latte'), tags: ['veg'] },
      ]
    },
    {
      id: cid(),
      name: 'Pastries',
      items: [
        { id: cid(), name: 'Almond Croissant', desc: 'House-laminated, marzipan filling', price: '220', pop: false, image: IMG('almond-croissant'), tags: ['veg'] },
        { id: cid(), name: 'Dark Chocolate Babka', desc: 'Twisted, soft, ridiculously rich', price: '250', pop: true, image: IMG('babka'), tags: ['veg'] },
        { id: cid(), name: 'Cinnamon Roll', desc: 'Brown butter glaze, flaky layers', price: '230', pop: true, image: IMG('cinnamon-roll'), tags: ['veg'] },
        { id: cid(), name: 'Pain au Chocolat', desc: 'Twin batons of dark chocolate, buttery layers', price: '200', pop: false, image: IMG('pain-au-chocolat'), tags: ['veg'] },
        { id: cid(), name: 'Lemon Tart', desc: 'Citrus curd, torched meringue, sablé crust', price: '290', pop: false, image: IMG('lemon-tart'), tags: ['veg'] },
        { id: cid(), name: 'Blueberry Muffin', desc: 'Bursting berries, crunchy sugar top', price: '180', pop: false, image: IMG('blueberry-muffin'), tags: ['veg'] },
      ]
    },
    {
      id: cid(),
      name: 'Brunch',
      items: [
        { id: cid(), name: 'Smashed Avocado Toast', desc: 'Sourdough, chili crisp, soft egg', price: '520', pop: true, image: IMG('avocado-toast'), tags: ['veg','spicy'] },
        { id: cid(), name: 'Berry Pancake Stack', desc: 'Buttermilk pancakes, maple, fresh berries', price: '580', pop: false, image: IMG('pancake-stack'), tags: ['veg'] },
        { id: cid(), name: 'Truffle Mushroom Toast', desc: 'Wild mushrooms, truffle oil, parmesan', price: '620', pop: false, image: IMG('truffle-toast'), tags: ['veg'] },
        { id: cid(), name: 'Egg & Bacon Brioche', desc: 'Maple bacon, runny yolk, brioche bun', price: '490', pop: true, image: IMG('brioche'), tags: [] },
        { id: cid(), name: 'Salmon Bagel', desc: 'Smoked salmon, dill cream cheese, capers', price: '650', pop: false, image: IMG('salmon-bagel'), tags: [] },
        { id: cid(), name: 'Shakshuka', desc: 'Eggs poached in spiced tomato pepper sauce', price: '560', pop: true, image: IMG('shakshuka'), tags: ['veg','spicy','gf'] },
      ]
    },
    {
      id: cid(),
      name: 'Cold Drinks',
      items: [
        { id: cid(), name: 'Cold Brew Tonic', desc: 'Slow-steeped cold brew, tonic, orange', price: '260', pop: true, image: IMG('cold-brew'), tags: ['vegan','df','gf'] },
        { id: cid(), name: 'Matcha Iced Latte', desc: 'Ceremonial matcha, milk, light sweet', price: '280', pop: true, image: IMG('matcha-latte'), tags: ['veg','gf'] },
        { id: cid(), name: 'Strawberry Lemonade', desc: 'Fresh strawberries, hand-squeezed lemons', price: '220', pop: false, image: IMG('strawberry-lemonade'), tags: ['vegan','df','gf'] },
        { id: cid(), name: 'Mango Smoothie', desc: 'Alphonso mango, yogurt, vanilla', price: '250', pop: false, image: IMG('mango-smoothie'), tags: ['veg','gf'] },
      ]
    },
  ];
}

function cid() { return Math.random().toString(36).slice(2, 9); }

let state = load() || defaultData();

function load() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; }
}
let persistTimer = null;
function persist() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(async () => {
    await saveToServer();
    buildLink();
    renderQR();
    refreshPreview();
  }, 350);
}

// ===== Hydrate fields =====
const $ = (id) => document.getElementById(id);

function hydrate() {
  $('placeName').value = state.name || '';
  $('placeTagline').value = state.tagline || '';
  $('placeAddress').value = state.address || '';
  $('placePhone').value = state.phone || '';
  $('placeCurrency').value = state.currency || '₹';
  setLogoPreview(state.logo);
  setActiveTheme(state.theme);
  renderCategories();
  buildLink();
  renderQR();
  refreshPreview();
}

['placeName','placeTagline','placeAddress','placePhone','placeCurrency'].forEach(id => {
  const el = $(id);
  el.addEventListener('input', () => {
    state[ {placeName:'name',placeTagline:'tagline',placeAddress:'address',placePhone:'phone',placeCurrency:'currency'}[id] ] = el.value;
    persist();
  });
});

// ===== Logo =====
function setLogoPreview(dataUrl) {
  const el = $('logoPreview');
  if (dataUrl) { el.style.backgroundImage = `url(${dataUrl})`; el.innerHTML = ''; }
  else { el.style.backgroundImage = ''; el.innerHTML = '<span>No logo</span>'; }
}
$('logoPick').addEventListener('click', () => $('logoInput').click());
$('logoDrop').addEventListener('click', (e) => { if (e.target.id === 'logoPreview' || e.target.closest('#logoPreview')) $('logoInput').click(); });
$('logoInput').addEventListener('change', (e) => {
  const f = e.target.files[0]; if (!f) return;
  fileToCompressedDataURL(f, 256).then(url => { state.logo = url; setLogoPreview(url); persist(); });
});
$('logoClear').addEventListener('click', () => { state.logo = ''; setLogoPreview(''); persist(); });

function fileToCompressedDataURL(file, maxDim = 800, quality = 0.78) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const cvs = document.createElement('canvas');
        cvs.width = w; cvs.height = h;
        cvs.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(cvs.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// ===== Theme =====
document.querySelectorAll('.theme-card').forEach(card => {
  card.addEventListener('click', () => {
    state.theme = card.dataset.theme;
    setActiveTheme(state.theme);
    persist();
  });
});
function setActiveTheme(t) {
  document.querySelectorAll('.theme-card').forEach(c => c.classList.toggle('active', c.dataset.theme === t));
}

// ===== Categories =====
function renderCategories() {
  const list = $('categoriesList');
  list.innerHTML = '';
  state.categories.forEach(cat => list.appendChild(renderCategory(cat)));
}

function renderCategory(cat) {
  const tpl = $('categoryTemplate').content.cloneNode(true);
  const block = tpl.querySelector('.category-block');
  block.dataset.id = cat.id;
  const nameEl = block.querySelector('.category-name');
  nameEl.value = cat.name;
  nameEl.addEventListener('input', () => { cat.name = nameEl.value; persist(); });

  const itemsList = block.querySelector('.items-list');
  cat.items.forEach(it => itemsList.appendChild(renderItem(it, cat)));

  block.querySelector('.add-item').addEventListener('click', () => {
    const it = { id: cid(), name: '', desc: '', price: '', pop: false, image: '' };
    cat.items.push(it);
    itemsList.appendChild(renderItem(it, cat));
    persist();
  });
  block.querySelector('.remove-category').addEventListener('click', () => {
    if (!confirm(`Remove "${cat.name || 'category'}"?`)) return;
    state.categories = state.categories.filter(c => c.id !== cat.id);
    renderCategories(); persist();
  });

  return block;
}

function renderItem(it, cat) {
  const tpl = $('itemTemplate').content.cloneNode(true);
  const row = tpl.querySelector('.item-row');
  row.dataset.id = it.id;
  const nameEl = row.querySelector('.item-name');
  const descEl = row.querySelector('.item-desc');
  const priceEl = row.querySelector('.item-price');
  const popEl = row.querySelector('.item-pop');
  const thumb = row.querySelector('.thumb-preview');
  const imgInput = row.querySelector('.item-image-input');

  nameEl.value = it.name; descEl.value = it.desc; priceEl.value = it.price; popEl.checked = !!it.pop;
  if (it.image) thumb.style.backgroundImage = `url(${it.image})`, thumb.innerHTML = '';

  // Tag pills
  it.tags = it.tags || [];
  row.querySelectorAll('.tag-pill input').forEach(cb => {
    cb.checked = it.tags.includes(cb.dataset.tag);
    cb.addEventListener('change', () => {
      const t = cb.dataset.tag;
      if (cb.checked) { if (!it.tags.includes(t)) it.tags.push(t); }
      else { it.tags = it.tags.filter(x => x !== t); }
      persist();
    });
  });

  nameEl.addEventListener('input', () => { it.name = nameEl.value; persist(); });
  descEl.addEventListener('input', () => { it.desc = descEl.value; persist(); });
  priceEl.addEventListener('input', () => { it.price = priceEl.value; persist(); });
  popEl.addEventListener('change', () => { it.pop = popEl.checked; persist(); });

  row.querySelector('.item-thumb').addEventListener('click', () => imgInput.click());
  imgInput.addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    fileToCompressedDataURL(f, 600, 0.72).then(url => {
      it.image = url; thumb.style.backgroundImage = `url(${url})`; thumb.innerHTML = '';
      persist();
    });
  });

  row.querySelector('.remove-item').addEventListener('click', () => {
    cat.items = cat.items.filter(i => i.id !== it.id);
    row.remove(); persist();
  });

  return row;
}

$('addCategory').addEventListener('click', () => {
  state.categories.push({ id: cid(), name: 'New Category', items: [] });
  renderCategories(); persist();
});

// ===== Link / QR =====
let serverId = localStorage.getItem('menuStudio.serverId') || null;

async function saveToServer() {
  try {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...state, _id: serverId })
    });
    if (!res.ok) throw new Error('save failed');
    const j = await res.json();
    if (j.id && j.id !== serverId) {
      serverId = j.id;
      localStorage.setItem('menuStudio.serverId', serverId);
    }
    return serverId;
  } catch (e) {
    console.warn('Server save failed, falling back to hash link', e);
    return null;
  }
}

function buildShareData() {
  return LZString.compressToEncodedURIComponent(JSON.stringify(state));
}

function buildLink() {
  const base = location.href.replace(/index\.html.*$/, '').replace(/#.*$/, '');
  // Prefer short server link if we have an id; fallback to hash link
  const url = serverId
    ? `${base}menu.html?id=${serverId}`
    : `${base}menu.html#d=${buildShareData()}`;
  $('linkBox').textContent = url;
  $('qrName').textContent = state.name || 'Your Menu';
  return url;
}

function renderQR() {
  const url = buildLink();
  const img = $('qrImg');
  // api.qrserver.com supports very long URLs and needs no library.
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(url)}`;
  img.onerror = () => {
    img.alt = 'QR generator offline — use Copy Link instead';
  };
}

$('downloadQR').addEventListener('click', async () => {
  const img = $('qrImg');
  try {
    const res = await fetch(img.src);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.download = `${(state.name||'menu').replace(/\s+/g,'-').toLowerCase()}-qr.png`;
    a.href = URL.createObjectURL(blob);
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  } catch {
    window.open(img.src, '_blank');
  }
});
$('copyLink').addEventListener('click', async () => {
  await navigator.clipboard.writeText($('linkBox').textContent);
  const btn = $('copyLink'); const old = btn.textContent;
  btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = old, 1400);
});

// ===== Preview =====
function refreshPreview() {
  const frame = $('phoneFrame');
  const url = serverId ? `menu.html?id=${serverId}&t=${Date.now()}` : `menu.html#d=${buildShareData()}`;
  frame.src = url;
}
$('previewBtn').addEventListener('click', () => window.open(buildLink(), '_blank'));

// ===== Reset =====
$('resetBtn').addEventListener('click', () => {
  if (!confirm('Reset everything to the demo menu?')) return;
  state = defaultData(); hydrate(); saveToServer().then(() => { buildLink(); renderQR(); });
});

hydrate();
// Kick off initial save so QR uses a short link from the start
saveToServer().then(() => { buildLink(); renderQR(); });
