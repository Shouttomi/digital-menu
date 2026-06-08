// ERP Wastage / Spoilage Tracker
function WastageView() {
  const { data, addItem, deleteItem } = useERP();
  const [modal, setModal] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [range, setRange] = useState('7');
  const days = parseInt(range);
  const cutoff = daysAgo(days);

  const filtered = data.wastage.filter(w => w.date >= cutoff);
  const totalCost = filtered.reduce((s, w) => s + w.quantity * w.costPerUnit, 0);
  const totalItems = filtered.length;

  // By reason
  const byReason = {};
  filtered.forEach(w => { byReason[w.reason] = (byReason[w.reason] || 0) + w.quantity * w.costPerUnit; });

  // By category
  const byCat = {};
  filtered.forEach(w => { byCat[w.category] = (byCat[w.category] || 0) + w.quantity * w.costPerUnit; });

  // Daily trend
  const dailyCost = {};
  for (let i = days - 1; i >= 0; i--) { dailyCost[daysAgo(i)] = 0; }
  filtered.forEach(w => { dailyCost[w.date] = (dailyCost[w.date] || 0) + w.quantity * w.costPerUnit; });
  const chartData = Object.entries(dailyCost).map(([d, v]) => ({
    label: new Date(d).getDate() + '',
    value: v,
    shortValue: v > 0 ? '₹' + Math.round(v) : '',
  }));

  // Top wasted items
  const byItem = {};
  filtered.forEach(w => { byItem[w.item] = (byItem[w.item] || 0) + w.quantity * w.costPerUnit; });
  const topItems = Object.entries(byItem).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topMax = topItems.length ? topItems[0][1] : 1;

  function handleSave(item) {
    addItem('wastage', item);
    setModal(null);
  }

  const reasonLabels = { expired: 'Expired', spoiled: 'Spoiled', 'prep-error': 'Prep Error', 'over-ripe': 'Over-ripe', 'over-production': 'Over-produced', damaged: 'Damaged', other: 'Other' };
  const reasonColors = { expired: '#ff4757', spoiled: '#ff6b3d', 'prep-error': '#ffc200', 'over-ripe': '#18b08a', 'over-production': '#6b5cff', damaged: '#6ab4ff', other: '#8b8e9b' };

  return React.createElement('div', null,
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 } },
      React.createElement('div', { style: { display: 'flex', gap: 8 } },
        ['7', '14', '30'].map(d => React.createElement('button', {
          key: d, className: `erp-tab ${range === d ? 'active' : ''}`,
          onClick: () => setRange(d)
        }, d, ' Days'))
      ),
      React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: () => setModal('add') }, '+ Log Wastage')
    ),

    React.createElement('div', { className: 'kpi-grid' },
      React.createElement(StatCard, { label: 'Total Waste Cost', value: formatCurrency(totalCost), accent: 'accent-red' }),
      React.createElement(StatCard, { label: 'Items Wasted', value: totalItems, accent: 'accent-orange' }),
      React.createElement(StatCard, { label: 'Avg / Day', value: formatCurrency(Math.round(totalCost / days)), accent: 'accent-yellow' }),
      React.createElement(StatCard, { label: 'Top Reason', value: Object.entries(byReason).sort((a, b) => b[1] - a[1])[0]?.[0] ? reasonLabels[Object.entries(byReason).sort((a, b) => b[1] - a[1])[0][0]] : '—', accent: 'accent-purple' })
    ),

    // Daily trend chart
    React.createElement('div', { className: 'section-card', style: { marginBottom: 16 } },
      React.createElement('h3', null, 'Daily Waste Cost'),
      React.createElement(SimpleBarChart, { data: chartData, height: 140 })
    ),

    React.createElement('div', { className: 'two-col', style: { marginBottom: 16 } },
      // By reason
      React.createElement('div', { className: 'section-card' },
        React.createElement('h3', null, 'By Reason'),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          Object.entries(byReason).sort((a, b) => b[1] - a[1]).map(([reason, val]) => {
            const pct = totalCost ? Math.round((val / totalCost) * 100) : 0;
            return React.createElement('div', { key: reason },
              React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 } },
                React.createElement('span', { style: { color: 'var(--text-secondary)' } }, reasonLabels[reason] || reason),
                React.createElement('span', { style: { fontWeight: 600, fontFamily: "'Space Grotesk', monospace" } }, formatCurrency(val))
              ),
              React.createElement('div', { className: 'progress-bar' },
                React.createElement('div', { className: 'progress-fill', style: { width: pct + '%', background: reasonColors[reason] || '#6b6e7c' } })
              )
            );
          })
        )
      ),
      // Top wasted items
      React.createElement('div', { className: 'section-card' },
        React.createElement('h3', null, 'Top Wasted Items'),
        topItems.length === 0
          ? React.createElement('p', { style: { color: 'var(--text-dim)', fontSize: 13 } }, 'No wastage logged')
          : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
            topItems.map(([item, val], i) => React.createElement('div', { key: item },
              React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 } },
                React.createElement('span', { style: { fontWeight: 600, color: 'var(--text-primary)' } }, item),
                React.createElement('span', { style: { fontWeight: 600, color: 'var(--danger)', fontFamily: "'Space Grotesk', monospace" } }, formatCurrency(val))
              ),
              React.createElement('div', { className: 'progress-bar' },
                React.createElement('div', { className: 'progress-fill', style: { width: Math.round((val / topMax) * 100) + '%', background: 'var(--danger)' } })
              )
            ))
          )
      )
    ),

    // Log table
    React.createElement('div', { className: 'table-panel' },
      React.createElement('div', { className: 'table-panel-header' },
        React.createElement('h3', { style: { margin: 0 } }, 'Wastage Log'),
        null
      ),
      React.createElement('div', { className: 'table-panel-body' },
        React.createElement('table', { className: 'data-table' },
          React.createElement('thead', null, React.createElement('tr', null,
            ['Date', 'Item', 'Category', 'Qty', 'Cost', 'Reason', 'Logged By', ''].map(h => React.createElement('th', { key: h }, h))
          )),
          React.createElement('tbody', null,
            filtered.sort((a, b) => b.date.localeCompare(a.date)).map(w => React.createElement('tr', { key: w.id },
              React.createElement('td', { style: { fontSize: 12 } }, formatDate(w.date)),
              React.createElement('td', { className: 'cell-primary' }, w.item),
              React.createElement('td', null, React.createElement('span', { className: 'badge badge-blue' }, w.category)),
              React.createElement('td', { className: 'cell-mono' }, w.quantity, ' ', w.unit),
              React.createElement('td', { className: 'cell-mono', style: { color: 'var(--danger)' } }, formatCurrency(w.quantity * w.costPerUnit)),
              React.createElement('td', null, React.createElement('span', { className: 'badge', style: { background: (reasonColors[w.reason] || '#6b6e7c') + '22', color: reasonColors[w.reason] || '#6b6e7c' } }, reasonLabels[w.reason] || w.reason)),
              React.createElement('td', { style: { fontSize: 12, color: 'var(--text-muted)' } }, w.loggedBy),
              React.createElement('td', null, React.createElement('button', { className: 'btn btn-danger btn-sm', onClick: () => setConfirmDel(w.id) }, '×'))
            ))
          )
        )
      )
    ),

    modal && React.createElement(WastageModal, { inventory: data.inventory, staff: data.staff, onSave: handleSave, onClose: () => setModal(null) }),
    confirmDel && React.createElement(ConfirmDialog, { message: 'Delete this wastage entry?', onConfirm: () => { deleteItem('wastage', confirmDel); setConfirmDel(null); }, onCancel: () => setConfirmDel(null) })
  );
}

function WastageModal({ inventory, staff, onSave, onClose }) {
  const reasons = ['expired', 'spoiled', 'prep-error', 'over-ripe', 'over-production', 'damaged', 'other'];
  const activeStaff = staff.filter(s => s.status !== 'inactive');
  const [form, setForm] = useState({
    date: todayStr(), item: inventory[0]?.name || '', category: inventory[0]?.category || '',
    quantity: 1, unit: inventory[0]?.unit || 'pcs', costPerUnit: inventory[0]?.costPerUnit || 0,
    reason: 'expired', loggedBy: activeStaff[0]?.name || ''
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function handleItemChange(name) {
    const inv = inventory.find(i => i.name === name);
    if (inv) setForm(f => ({ ...f, item: name, category: inv.category, unit: inv.unit, costPerUnit: inv.costPerUnit }));
    else set('item', name);
  }

  return React.createElement(Modal, { title: 'Log Wastage', onClose },
    React.createElement('div', { className: 'modal-body' },
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Item' },
          React.createElement('select', { value: form.item, onChange: e => handleItemChange(e.target.value) },
            inventory.map(i => React.createElement('option', { key: i.id, value: i.name }, i.name))
          )
        ),
        React.createElement(FormField, { label: 'Date' }, React.createElement('input', { type: 'date', value: form.date, onChange: e => set('date', e.target.value) }))
      ),
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Quantity (' + form.unit + ')' }, React.createElement('input', { type: 'number', value: form.quantity, min: 0, step: 0.1, onChange: e => set('quantity', parseFloat(e.target.value) || 0) })),
        React.createElement(FormField, { label: 'Cost/Unit (₹)' }, React.createElement('input', { type: 'number', value: form.costPerUnit, onChange: e => set('costPerUnit', parseFloat(e.target.value) || 0) }))
      ),
      React.createElement('div', { style: { fontSize: 13, color: 'var(--danger)', fontWeight: 600, marginBottom: 12, fontFamily: "'Space Grotesk', monospace" } },
        'Total loss: ', formatCurrency(form.quantity * form.costPerUnit)
      ),
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Reason' },
          React.createElement('select', { value: form.reason, onChange: e => set('reason', e.target.value) },
            reasons.map(r => React.createElement('option', { key: r, value: r }, r.charAt(0).toUpperCase() + r.slice(1).replace('-', ' ')))
          )
        ),
        React.createElement(FormField, { label: 'Logged By' },
          React.createElement('select', { value: form.loggedBy, onChange: e => set('loggedBy', e.target.value) },
            activeStaff.map(s => React.createElement('option', { key: s.id, value: s.name }, s.name))
          )
        )
      )
    ),
    React.createElement('div', { className: 'modal-footer' },
      React.createElement('button', { className: 'btn btn-ghost', onClick: onClose }, 'Cancel'),
      React.createElement('button', { className: 'btn btn-primary', onClick: () => { if (form.item && form.quantity > 0) onSave(form); } }, 'Log Wastage')
    )
  );
}

Object.assign(window, { WastageView });
