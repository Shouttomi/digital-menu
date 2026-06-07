// ERP Shared UI Components
const { useState, useRef, useEffect } = React;

// ===== Modal =====
function Modal({ title, onClose, children, wide }) {
  return React.createElement('div', { className: 'modal-overlay', onClick: e => { if (e.target === e.currentTarget) onClose(); } },
    React.createElement('div', { className: 'modal-panel', style: wide ? { width: 680 } : null },
      React.createElement('div', { className: 'modal-header' },
        React.createElement('h2', null, title),
        React.createElement('button', { className: 'modal-close', onClick: onClose }, '×')
      ),
      children
    )
  );
}

// ===== Search Box =====
function SearchBox({ value, onChange, placeholder }) {
  return React.createElement('div', { className: 'search-box' },
    React.createElement('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
      React.createElement('circle', { cx: 11, cy: 11, r: 8 }),
      React.createElement('line', { x1: 21, y1: 21, x2: 16.65, y2: 16.65 })
    ),
    React.createElement('input', { type: 'text', value, onChange: e => onChange(e.target.value), placeholder: placeholder || 'Search...' })
  );
}

// ===== Stat Card =====
function StatCard({ label, value, delta, deltaDir, accent, icon }) {
  return React.createElement('div', { className: `kpi-card ${accent || 'accent-orange'}` },
    React.createElement('div', { className: 'kpi-label' }, label),
    React.createElement('div', { className: 'kpi-value' }, value),
    delta && React.createElement('div', { className: `kpi-delta ${deltaDir || 'up'}` }, deltaDir === 'down' ? '↓' : '↑', ' ', delta)
  );
}

// ===== Confirm Dialog =====
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return React.createElement(Modal, { title: 'Confirm', onClose: onCancel },
    React.createElement('div', { className: 'modal-body' },
      React.createElement('p', { style: { fontSize: 14, color: 'var(--text-secondary)', margin: 0 } }, message)
    ),
    React.createElement('div', { className: 'modal-footer' },
      React.createElement('button', { className: 'btn btn-ghost', onClick: onCancel }, 'Cancel'),
      React.createElement('button', { className: 'btn btn-danger', onClick: onConfirm }, 'Delete')
    )
  );
}

// ===== FormField =====
function FormField({ label, hint, children }) {
  return React.createElement('div', { className: 'field' },
    label && React.createElement('label', null, label),
    children,
    hint && React.createElement('div', { className: 'field-hint' }, hint)
  );
}

// ===== Simple Bar Chart =====
function SimpleBarChart({ data, height }) {
  const chartH = height || 140;
  const barAreaH = chartH - 32;
  const max = Math.max(...data.map(d => d.value), 1);
  return React.createElement('div', { className: 'bar-chart', style: { height: chartH } },
    data.map((d, i) => {
      const barH = Math.max(Math.round((d.value / max) * barAreaH), 3);
      return React.createElement('div', { className: 'bar-col', key: i },
        d.shortValue ? React.createElement('div', { className: 'bar-value' }, d.shortValue) : null,
        React.createElement('div', { className: 'bar-fill', style: { height: barH + 'px', background: d.color || undefined } }),
        React.createElement('div', { className: 'bar-label' }, d.label)
      );
    })
  );
}

// ===== Donut Chart (SVG) =====
function DonutChart({ segments, size, centerValue, centerLabel }) {
  const sz = size || 120;
  const r = 42; const c = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;
  return React.createElement('div', { className: 'donut-wrap', style: { width: sz, height: sz } },
    React.createElement('svg', { viewBox: '0 0 120 120', style: { transform: 'rotate(-90deg)' } },
      segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * c;
        const el = React.createElement('circle', {
          key: i, cx: 60, cy: 60, r, fill: 'none', stroke: seg.color, strokeWidth: 14,
          strokeDasharray: `${dash} ${c - dash}`, strokeDashoffset: -offset, strokeLinecap: 'round',
          style: { transition: 'stroke-dasharray .4s ease, stroke-dashoffset .4s ease' }
        });
        offset += dash;
        return el;
      })
    ),
    React.createElement('div', { className: 'donut-center' },
      React.createElement('div', { className: 'donut-center-val' }, centerValue),
      centerLabel && React.createElement('div', { className: 'donut-center-label' }, centerLabel)
    )
  );
}

// ===== Pie Chart (SVG) =====
function PieChart({ segments, size }) {
  const sz = size || 130;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const cx = 60, cy = 60, r = 54;
  let startAngle = -Math.PI / 2;
  const slices = [];
  segments.forEach((seg, i) => {
    const pct = seg.value / total;
    if (pct <= 0) return;
    const angle = pct * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const largeArc = angle > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    let d;
    if (pct >= 0.9999) {
      d = 'M ' + cx + ',' + (cy - r) + ' A ' + r + ',' + r + ' 0 1,1 ' + (cx - 0.001) + ',' + (cy - r) + ' Z';
    } else {
      d = 'M ' + cx + ',' + cy + ' L ' + x1 + ',' + y1 + ' A ' + r + ',' + r + ' 0 ' + largeArc + ',1 ' + x2 + ',' + y2 + ' Z';
    }
    slices.push(React.createElement('path', {
      key: i, d: d, fill: seg.color,
      stroke: 'rgba(7,8,12,0.7)', strokeWidth: 1.5,
      strokeLinejoin: 'round'
    }));
    startAngle = endAngle;
  });
  return React.createElement('div', { style: { width: sz, height: sz } },
    React.createElement('svg', { viewBox: '0 0 120 120' }, slices)
  );
}

// ===== Star Rating =====
function StarRating({ value }) {
  return React.createElement('span', { style: { color: 'var(--warning)', fontSize: 12, letterSpacing: 1 } },
    Array.from({ length: 5 }, (_, i) => i < Math.floor(value) ? '★' : (i < value ? '☆' : '☆')).join('')
  );
}

// ===== Tabs Component =====
function TabBar({ tabs, active, onChange }) {
  return React.createElement('div', { className: 'erp-tabs' },
    tabs.map(t => React.createElement('button', {
      key: t.id, className: `erp-tab ${active === t.id ? 'active' : ''}`,
      onClick: () => onChange(t.id)
    }, t.label))
  );
}

// ===== Nav Icons (SVG paths) =====
const NAV_ICONS = {
  dashboard: React.createElement('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('rect', { x: 3, y: 3, width: 7, height: 7, rx: 1 }),
    React.createElement('rect', { x: 14, y: 3, width: 7, height: 7, rx: 1 }),
    React.createElement('rect', { x: 3, y: 14, width: 7, height: 7, rx: 1 }),
    React.createElement('rect', { x: 14, y: 14, width: 7, height: 7, rx: 1 })
  ),
  inventory: React.createElement('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('path', { d: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z' }),
    React.createElement('path', { d: 'M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12' })
  ),
  staff: React.createElement('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('path', { d: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2' }),
    React.createElement('circle', { cx: 9, cy: 7, r: 4 }),
    React.createElement('path', { d: 'M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' })
  ),
  finance: React.createElement('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('line', { x1: 12, y1: 1, x2: 12, y2: 23 }),
    React.createElement('path', { d: 'M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' })
  ),
  suppliers: React.createElement('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('rect', { x: 1, y: 3, width: 15, height: 13, rx: 2 }),
    React.createElement('path', { d: 'M16 8h4l3 3v5a1 1 0 01-1 1h-1M2 17h1' }),
    React.createElement('circle', { cx: 7, cy: 17, r: 2 }),
    React.createElement('circle', { cx: 19, cy: 17, r: 2 })
  ),
  tables: React.createElement('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('path', { d: 'M3 9h18M3 15h18M12 3v18' }),
    React.createElement('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2 })
  ),
  customers: React.createElement('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('path', { d: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2' }),
    React.createElement('circle', { cx: 12, cy: 7, r: 4 })
  ),
  expenses: React.createElement('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('rect', { x: 2, y: 5, width: 20, height: 14, rx: 2 }),
    React.createElement('line', { x1: 2, y1: 10, x2: 22, y2: 10 })
  ),
  reports: React.createElement('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('path', { d: 'M18 20V10M12 20V4M6 20v-6' })
  ),
};

Object.assign(window, { Modal, SearchBox, StatCard, ConfirmDialog, FormField, SimpleBarChart, DonutChart, PieChart, StarRating, TabBar, NAV_ICONS });
