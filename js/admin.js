// Menu Studio — Admin
const STORE_KEY = 'menuStudio.v1';

const IMG = (name) => `static/images/${name}.jpg`;

// Ensure new fields exist on all items — backward-compat with saved menus
function ensureItemFields(s) {
  if (!s) return s;
  (s.categories || []).forEach(c =>
    (c.items || []).forEach(it => {
      if (!it.avail) it.avail = 'available';
      if (!it.pairsWith) it.pairsWith = [];
    })
  );
  if (!s.promos) s.promos = [];
  return s;
}

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

let state = ensureItemFields(load() || defaultData());

function load() {
  try { return ensureItemFields(JSON.parse(localStorage.getItem(STORE_KEY))); } catch { return null; }
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

  // === Availability toggle ===
  const availWrap = document.createElement('div');
  availWrap.className = 'item-avail-wrap';
  function refreshAvail() {
    availWrap.innerHTML = `<div class="avail-toggle">
      <button class="avail-opt${it.avail==='available'?' active-available':''}" data-a="available">Available</button>
      <button class="avail-opt${it.avail==='limited'?' active-limited':''}" data-a="limited">Limited</button>
      <button class="avail-opt${it.avail==='soldout'?' active-soldout':''}" data-a="soldout">Sold Out</button>
    </div>`;
    availWrap.querySelectorAll('.avail-opt').forEach(btn => {
      btn.addEventListener('click', () => { it.avail = btn.dataset.a; refreshAvail(); persist(); });
    });
  }
  refreshAvail();
  row.querySelector('.item-fields').appendChild(availWrap);

  // === Pairs with ===
  const pairsWrap = document.createElement('div');
  pairsWrap.className = 'pairs-with-wrap';
  function refreshPairsBtn() {
    const n = (it.pairsWith || []).length;
    pairsWrap.innerHTML = `<button class="icon-btn pairs-chip${n ? ' pairs-chip-on' : ''}">🔗${n ? ' Pairs ('+n+')' : ' Pairs with'}</button>`;
    pairsWrap.querySelector('button').addEventListener('click', () => openPairsDropdown(pairsWrap, it, refreshPairsBtn));
  }
  refreshPairsBtn();
  row.querySelector('.item-meta').appendChild(pairsWrap);

  return row;
}

function openPairsDropdown(wrap, it, onUpdate) {
  document.querySelectorAll('.pairs-dd').forEach(d => d.remove());
  const allItems = state.categories.flatMap(c => c.items).filter(i => i.id !== it.id && i.name);
  const dd = document.createElement('div');
  dd.className = 'pairs-dd';
  dd.innerHTML = `<div class="pairs-dd-title">Pairs well with</div>
    ${allItems.length === 0
      ? '<p style="font-size:11px;color:#8b8e9b;margin:4px 0">Add more items first</p>'
      : allItems.map(oi => `<label class="pairs-opt"><input type="checkbox" value="${oi.name.replace(/"/g,'&quot;')}"${(it.pairsWith||[]).includes(oi.name)?' checked':''}/> ${oi.name}</label>`).join('')}
    <button class="ghost-btn" style="width:100%;margin-top:8px;font-size:11px;padding:6px" id="pairsDone">Done ✓</button>`;
  wrap.style.position = 'relative';
  wrap.appendChild(dd);
  dd.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', () => {
      const name = cb.value;
      it.pairsWith = it.pairsWith || [];
      if (cb.checked) { if (!it.pairsWith.includes(name)) it.pairsWith.push(name); }
      else { it.pairsWith = it.pairsWith.filter(n => n !== name); }
      persist(); onUpdate();
    });
  });
  dd.querySelector('#pairsDone').addEventListener('click', e => { e.stopPropagation(); dd.remove(); });
  setTimeout(() => {
    const close = e => { if (!dd.contains(e.target) && !wrap.contains(e.target)) { dd.remove(); document.removeEventListener('click', close); } };
    document.addEventListener('click', close);
  }, 50);
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

// ===== Analytics Dashboard (full) =====
function getOrderAnalytics() {
  const orders = JSON.parse(localStorage.getItem('orderAnalytics') || '[]');
  const counts = {}, revenue = {};
  const itemMap = {};
  for (const cat of state.categories) for (const item of (cat.items||[])) itemMap[item.id] = item;
  orders.forEach(o => {
    counts[o.itemId] = (counts[o.itemId]||0) + o.quantity;
    const price = parseFloat(String(itemMap[o.itemId]?.price||'0').replace(',','.')) || 0;
    revenue[o.itemId] = (revenue[o.itemId]||0) + price * o.quantity;
  });
  const sorted = Object.entries(counts)
    .map(([id, qty]) => ({ id, qty, name: itemMap[id]?.name||'Unknown', rev: revenue[id]||0 }))
    .sort((a,b) => b.qty - a.qty);
  const totalOrders = orders.length;
  const totalRevenue = Object.values(revenue).reduce((a,b) => a+b, 0);
  const avgOrder = totalOrders ? totalRevenue / totalOrders : 0;
  const allItems = state.categories.flatMap(c => c.items||[]);
  const topQty = sorted[0]?.qty || 1;
  const lowPerformers = allItems.filter(it => it.name)
    .map(it => ({ name: it.name, qty: counts[it.id]||0 }))
    .filter(it => it.qty < Math.max(topQty * 0.2, 1))
    .sort((a,b) => a.qty - b.qty).slice(0,3);
  return { orders, sorted, totalOrders, totalRevenue, avgOrder, lowPerformers, itemMap };
}

function renderAnalyticsModal() {
  const { sorted, totalOrders, totalRevenue, avgOrder, lowPerformers } = getOrderAnalytics();
  const cur = state.currency || '₹';
  const fmt = n => n >= 100000 ? cur+(n/100000).toFixed(1)+'L' : n >= 1000 ? cur+(n/1000).toFixed(1)+'K' : cur+Math.round(n);
  const hasData = totalOrders > 0;
  const topItems = hasData ? sorted.slice(0,5) : [{name:'Velvet Latte',qty:142,rev:39760},{name:'Cinnamon Roll',qty:97,rev:22310},{name:'Avocado Toast',qty:83,rev:43160},{name:'Cold Brew Tonic',qty:78,rev:20280},{name:'Shakshuka',qty:71,rev:39760}];
  const maxQty = topItems[0]?.qty || 1;
  const orders = JSON.parse(localStorage.getItem('orderAnalytics')||'[]');
  const hourCounts = {};
  orders.forEach(o => { if (o.timestamp) { const h = new Date(o.timestamp).getHours(); hourCounts[h] = (hourCounts[h]||0)+1; } });
  const demoHours = [12,28,24,18,22,37,30,42,51,39,23,14];
  const peakHours = Array.from({length:12},(_,i) => ({ h:i+8, v: hasData ? (hourCounts[i+8]||0) : demoHours[i] }));
  const maxH = Math.max(...peakHours.map(h=>h.v), 1);
  const catColors = ['#ff6b3d','#ff3da0','#6b5cff','#18b08a','#ffc200','#6ab4ff'];
  const catRevs = state.categories.map((cat,i) => {
    const rev = hasData ? (cat.items||[]).reduce((s,it) => s+(sorted.find(x=>x.id===it.id)?.rev||0),0) : [37,28,19,16][i]||10;
    return { name: cat.name, rev, color: catColors[i%catColors.length] };
  });
  const totalCatRev = catRevs.reduce((s,c)=>s+c.rev,0)||1;
  const lowList = hasData ? lowPerformers : [{name:'Blueberry Muffin',qty:8},{name:'Mango Smoothie',qty:11},{name:'Pain au Chocolat',qty:14}];

  document.getElementById('analyticsModal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'analyticsModal'; modal.className = 'studio-modal';
  modal.innerHTML = `
  <div class="studio-modal-backdrop" id="analyticsBackdrop"></div>
  <div class="studio-modal-panel">
    <div class="studio-modal-header">
      <div><h2 class="studio-modal-title">Revenue Command</h2>
        <p class="studio-modal-sub">${hasData ? `${totalOrders} tracked orders` : 'Demo data — real data appears as customers order'}</p></div>
      <button class="icon-btn" id="analyticsClose" style="font-size:20px;width:36px;height:36px">×</button>
    </div>
    <div class="studio-modal-body">
      ${!hasData ? `<div class="analytics-demo-note">📊 <b>Demo figures shown.</b> Real revenue data will appear as customers interact with your menu. <button id="loadDemoBtn" class="insight-cta-link">Load sample data →</button></div>` : ''}
      <div class="kpi-row">
        <div class="kpi-card kpi-revenue"><div class="kpi-lbl">Revenue</div><div class="kpi-val">${hasData ? fmt(totalRevenue) : fmt(184200)}</div><div class="kpi-delta delta-up">↑ 14% vs last week</div></div>
        <div class="kpi-card kpi-orders"><div class="kpi-lbl">Orders</div><div class="kpi-val">${hasData ? totalOrders : 378}</div><div class="kpi-delta delta-up">↑ 12% vs last week</div></div>
        <div class="kpi-card kpi-avg"><div class="kpi-lbl">Avg Order</div><div class="kpi-val">${hasData && avgOrder ? fmt(avgOrder) : cur+'487'}</div><div class="kpi-delta delta-up">↑ 8% vs last week</div></div>
        <div class="kpi-card kpi-returning"><div class="kpi-lbl">Returning</div><div class="kpi-val">34%</div><div class="kpi-delta delta-up">↑ 4pts this week</div></div>
      </div>
      <div class="analytics-section-title">Top Sellers</div>
      <div class="top-items-list">
        ${topItems.map((it,i) => `<div class="top-item-row">
          <span class="top-rank">#${i+1}</span>
          <div class="top-info"><div class="top-name">${it.name}</div>
            <div class="top-bar-wrap"><div class="top-bar" style="width:${Math.round((it.qty/maxQty)*100)}%"></div></div></div>
          <div class="top-stat"><div class="top-orders">${it.qty}</div><div class="top-rev">${fmt(it.rev)}</div></div>
        </div>`).join('')}
      </div>
      <div class="analytics-two-col">
        <div>
          <div class="analytics-section-title">Peak Hours</div>
          <div class="peak-chart">
            ${peakHours.map(h => { const pct = Math.round((h.v/maxH)*100); const hot = pct>=70; const lbl = h.h===12?'12p':h.h>12?(h.h-12)+'p':h.h+'a'; return `<div class="peak-col"><div class="peak-bar${hot?' peak-hot':''}" style="height:${Math.max(pct*0.42,3)}px"></div><div class="peak-label">${lbl}</div></div>`; }).join('')}
          </div>
          <div class="peak-legend"><span class="legend-dot hot"></span>Peak&nbsp;&nbsp;<span class="legend-dot cool"></span>Off-peak</div>
        </div>
        <div>
          <div class="analytics-section-title">Category Split</div>
          <div class="cat-split-list">
            ${catRevs.map(c => { const pct = Math.round((c.rev/totalCatRev)*100); return `<div class="cat-split-row"><div class="cat-dot" style="background:${c.color}"></div><div class="cat-split-name">${c.name}</div><div class="cat-bar-wrap"><div class="cat-bar-fill" style="width:${pct}%;background:${c.color}"></div></div><div class="cat-split-pct">${pct}%</div></div>`; }).join('')}
          </div>
        </div>
      </div>
      <div class="analytics-section-title">Low Performers</div>
      <div class="low-perf-list">
        ${lowList.map(it => `<div class="low-perf-row"><div><div class="low-name">${it.name}</div><div class="low-stat">${it.qty} orders tracked</div></div><button class="ghost-btn" style="font-size:11px;padding:5px 12px">Mark Seasonal</button></div>`).join('')}
      </div>
      <div class="analytics-section-title">Insights &amp; Nudges</div>
      <div class="insights-list">
        <div class="insight-row"><span class="insight-icon">🔥</span><div class="insight-text"><b>Velvet Latte + Cinnamon Roll</b> are co-ordered frequently. Enable a "Pairs well with" chip in the item detail sheet?</div></div>
        <div class="insight-row"><span class="insight-icon">⏰</span><div class="insight-text"><b>4pm–5pm is your peak hour.</b> A Happy Hour promo at 3:30pm could push orders 20–30% higher. <button class="insight-cta-link" id="goToPromos">Create Promo →</button></div></div>
        <div class="insight-row"><span class="insight-icon">🔁</span><div class="insight-text"><b>34% of guests returned</b> this week. Adding a loyalty hint to your menu footer can accelerate this.</div></div>
      </div>
      <div style="display:flex;gap:10px;margin-top:20px">
        <button class="ghost-btn" id="clearAnalyticsBtn">Clear data</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('open'));
  modal.querySelector('#analyticsBackdrop').addEventListener('click', closeAnalyticsModal);
  modal.querySelector('#analyticsClose').addEventListener('click', closeAnalyticsModal);
  modal.querySelector('#clearAnalyticsBtn')?.addEventListener('click', () => {
    if (confirm('Clear all order analytics?')) { localStorage.removeItem('orderAnalytics'); closeAnalyticsModal(); }
  });
  modal.querySelector('#loadDemoBtn')?.addEventListener('click', () => {
    const demo = []; const allItems = state.categories.flatMap(c=>c.items||[]);
    const weights = [142,97,83,78,71,55,44,38,30,22,15,11,8];
    allItems.slice(0,13).forEach((it,i) => { for (let j=0;j<(weights[i]||5);j++) { const d=new Date(); d.setHours(8+Math.floor(Math.random()*12)); demo.push({itemId:it.id,quantity:1,timestamp:d.toISOString()}); } });
    localStorage.setItem('orderAnalytics', JSON.stringify(demo));
    closeAnalyticsModal(); renderAnalyticsModal();
  });
  modal.querySelector('#goToPromos')?.addEventListener('click', () => { closeAnalyticsModal(); openPromosModal(); });
}
function closeAnalyticsModal() {
  const m = document.getElementById('analyticsModal');
  if (m) { m.classList.remove('open'); setTimeout(() => m.remove(), 300); }
}
$('analyticsBtn')?.addEventListener('click', renderAnalyticsModal);

// ===== Promotions =====
const PROMO_TYPES_DEF = [
  { id:'happy-hour', icon:'⏰', label:'Happy Hour'  },
  { id:'pct-off',    icon:'%',  label:'% Off'       },
  { id:'free-item',  icon:'🎁', label:'Free Item'   },
  { id:'combo',      icon:'✨', label:'Combo Deal'  },
];
function getPromos() { return state.promos || []; }
function savePromos(p) { state.promos = p; persist(); }

function openPromosModal() {
  document.getElementById('promosModal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'promosModal'; modal.className = 'studio-modal';
  document.body.appendChild(modal);
  renderPromosModal(modal);
  requestAnimationFrame(() => modal.classList.add('open'));
}
function renderPromosModal(modal) {
  const promos = getPromos();
  const active = promos.filter(p=>p.active);
  let selType = 'happy-hour';
  modal.innerHTML = `
  <div class="studio-modal-backdrop" id="promosBackdrop"></div>
  <div class="studio-modal-panel">
    <div class="studio-modal-header">
      <div><h2 class="studio-modal-title">Promotions</h2><p class="studio-modal-sub">Banners shown at the top of your customer menu</p></div>
      <button class="icon-btn" id="promosClose" style="font-size:20px;width:36px;height:36px">×</button>
    </div>
    <div class="studio-modal-body">
      ${active.length ? `<div class="promo-live-preview"><div class="promo-live-lbl">Live on your menu now</div>${active.map(p=>`<div class="promo-banner-mock">${p.icon} ${p.msg}</div>`).join('')}</div>` : ''}
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div class="analytics-section-title" style="margin:0">Your Promotions</div>
        <button class="primary-btn small" id="showAddPromo">+ New Promo</button>
      </div>
      <div id="promoList">
        ${promos.length===0 ? '<p class="muted" style="text-align:center;padding:16px 0">No promotions yet.</p>' :
          promos.map((p,i)=>`<div class="promo-row"><span class="promo-row-icon">${p.icon}</span>
            <div class="promo-row-info"><div class="promo-row-name">${p.name}</div><div class="promo-row-detail">${p.detail||p.msg.slice(0,48)}</div></div>
            <button class="ghost-btn danger" style="font-size:11px;padding:4px 10px" data-del="${i}">Remove</button>
            <button class="promo-toggle-btn${p.active?' promo-toggle-on':''}" data-tog="${i}">${p.active?'ON':'OFF'}</button>
          </div>`).join('')}
      </div>
      <div class="add-promo-form" id="addPromoForm" style="display:none">
        <div class="analytics-section-title" style="margin-bottom:10px">Create a Promotion</div>
        <div class="promo-type-row">${PROMO_TYPES_DEF.map(t=>`<button class="promo-type-btn${t.id==='happy-hour'?' selected':''}" data-type="${t.id}"><span style="font-size:18px">${t.icon}</span><small>${t.label}</small></button>`).join('')}</div>
        <div class="field-group" style="margin-top:12px"><label class="field-label">Banner Message</label><input type="text" class="field-input" id="promoMsg" placeholder="☕ Happy Hour — 20% off all espresso 3–5pm!"/></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="field-group"><label class="field-label">Time Range</label><input type="text" class="field-input" id="promoTime" placeholder="3pm – 5pm"/></div>
          <div class="field-group"><label class="field-label">Condition</label><input type="text" class="field-input" id="promoCond" placeholder="On orders above ₹500"/></div>
        </div>
        <div id="promoBannerPreview" class="promo-banner-mock" style="display:none;margin-top:8px"></div>
        <div style="display:flex;gap:10px;margin-top:14px">
          <button class="primary-btn" id="savePromoBtn">✓ Add Promotion</button>
          <button class="ghost-btn" id="cancelPromoBtn">Cancel</button>
        </div>
      </div>
      <div class="analytics-section-title" style="margin-top:20px;margin-bottom:10px">Ideas for You</div>
      ${[{icon:'⏰',idea:'Happy Hour 4–6pm — 15% off all cold drinks',why:'Your slowest hour is 7pm; pulling orders earlier helps.'},
         {icon:'🎂',idea:'Birthday Month — free muffin with any brunch',why:'Drives loyalty and repeat visits.'},
         {icon:'💼',idea:'Work-from-cafe bundle — coffee + snack = ₹399',why:'Weekday afternoons are underutilised.'}].map(p=>`
        <div class="promo-idea-row"><span style="font-size:18px;flex-shrink:0">${p.icon}</span>
          <div style="flex:1"><div class="promo-row-name">${p.idea}</div><div class="promo-row-detail">${p.why}</div></div>
          <button class="ghost-btn" style="font-size:11px;padding:5px 12px" data-idea="${p.idea}">Use →</button>
        </div>`).join('')}
    </div>
  </div>`;

  modal.querySelector('#promosBackdrop').addEventListener('click', closePromosModal);
  modal.querySelector('#promosClose').addEventListener('click', closePromosModal);
  modal.querySelector('#showAddPromo').addEventListener('click', () => { modal.querySelector('#addPromoForm').style.display='block'; });
  modal.querySelector('#cancelPromoBtn').addEventListener('click', () => { modal.querySelector('#addPromoForm').style.display='none'; });

  modal.querySelectorAll('.promo-type-btn').forEach(b => {
    b.addEventListener('click', () => { modal.querySelectorAll('.promo-type-btn').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); selType=b.dataset.type; });
  });
  const msgEl = modal.querySelector('#promoMsg');
  const preview = modal.querySelector('#promoBannerPreview');
  msgEl.addEventListener('input', () => { preview.style.display = msgEl.value.trim() ? 'flex':'none'; preview.textContent = msgEl.value; });

  modal.querySelector('#savePromoBtn').addEventListener('click', () => {
    const msg = msgEl.value.trim(); if (!msg) { alert('Enter a banner message.'); return; }
    const time = modal.querySelector('#promoTime').value.trim();
    const cond = modal.querySelector('#promoCond').value.trim();
    const def = PROMO_TYPES_DEF.find(t=>t.id===selType);
    const ps = getPromos();
    ps.push({ id:'p'+Date.now(), type:selType, icon:def.icon, name:def.label, detail:[time,cond].filter(Boolean).join(' · '), msg, active:true });
    savePromos(ps); renderPromosModal(modal);
  });
  modal.querySelectorAll('[data-del]').forEach(b => {
    b.addEventListener('click', () => { const ps=getPromos(); ps.splice(+b.dataset.del,1); savePromos(ps); renderPromosModal(modal); });
  });
  modal.querySelectorAll('[data-tog]').forEach(b => {
    b.addEventListener('click', () => { const ps=getPromos(); ps[+b.dataset.tog].active=!ps[+b.dataset.tog].active; savePromos(ps); renderPromosModal(modal); });
  });
  modal.querySelectorAll('[data-idea]').forEach(b => {
    b.addEventListener('click', () => { modal.querySelector('#addPromoForm').style.display='block'; msgEl.value=b.dataset.idea; msgEl.dispatchEvent(new Event('input')); });
  });
}
function closePromosModal() {
  const m=document.getElementById('promosModal');
  if (m) { m.classList.remove('open'); setTimeout(()=>m.remove(),300); }
}
$('promosBtn')?.addEventListener('click', openPromosModal);

hydrate();
// Kick off initial save so QR uses a short link from the start
saveToServer().then(() => { buildLink(); renderQR(); });
