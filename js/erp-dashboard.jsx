// ERP Dashboard View
function DashboardView() {
  const { data } = useERP();
  const rev = data.revenue || [];
  const today = rev[rev.length - 1] || { amount: 0, orders: 0 };
  const yesterday = rev[rev.length - 2] || { amount: 0, orders: 0 };
  const weekRev = rev.slice(-7).reduce((s, r) => s + r.amount, 0);
  const prevWeekRev = rev.slice(-14, -7).reduce((s, r) => s + r.amount, 0);
  const weekDelta = prevWeekRev ? Math.round(((weekRev - prevWeekRev) / prevWeekRev) * 100) : 0;
  const lowStock = data.inventory.filter(it => it.stock <= it.reorderLevel);
  const activeStaff = data.staff.filter(s => s.status === 'active').length;
  const todayRes = data.reservations.filter(r => r.date === todayStr()).length;
  const pendingSwaps = data.shiftSwaps.filter(s => s.status === 'pending').length;
  const pendingPO = data.purchaseOrders.filter(p => p.status === 'pending').length;

  // Recent 7 days chart
  const chartData = rev.slice(-7).map(r => {
    const d = new Date(r.date);
    return { label: d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2), value: r.amount, shortValue: formatCurrency(r.amount).replace('₹', '') };
  });

  // Expense breakdown
  const expCats = {};
  data.expenses.forEach(e => { expCats[e.category] = (expCats[e.category] || 0) + e.amount; });
  const expColors = { Ingredients: '#c08762', Salaries: '#8a8db0', Rent: '#a98a9c', Utilities: '#b3a16e', Maintenance: '#7d9b8e', Marketing: '#8fa3b5', Insurance: '#b08585', Miscellaneous: '#8b8e9b' };
  const expSegments = Object.entries(expCats).sort((a, b) => b[1] - a[1]).map(([cat, val]) => ({ label: cat, value: val, color: expColors[cat] || '#6b6e7c' }));
  const totalExp = expSegments.reduce((s, e) => s + e.value, 0);

  // Activity feed
  const activities = [
    { color: 'var(--success)', text: React.createElement(React.Fragment, null, React.createElement('b', null, 'Aarav Iyer'), ' checked in 31st visit'), time: '2 min ago' },
    { color: 'var(--purple)', text: React.createElement(React.Fragment, null, 'Shift swap ', React.createElement('b', null, 'approved'), 'Meera ↔ Anita (Thu)'), time: '15 min ago' },
    { color: 'var(--accent)', text: React.createElement(React.Fragment, null, 'PO #', React.createElement('b', null, 'Metro Coffee'), ' is in transit 5kg beans'), time: '1 hr ago' },
    { color: 'var(--warning)', text: React.createElement(React.Fragment, null, React.createElement('b', null, lowStock.length, ' items'), ' below reorder level'), time: '2 hrs ago' },
    { color: 'var(--purple)', text: React.createElement(React.Fragment, null, 'Reservation: ', React.createElement('b', null, 'Corporate Group'), ' (8 pax) confirmed for tomorrow'), time: '3 hrs ago' },
    { color: 'var(--success)', text: React.createElement(React.Fragment, null, 'Revenue milestone: crossed ', React.createElement('b', null, formatCurrency(weekRev)), ' this week'), time: '5 hrs ago' },
  ];

  return React.createElement('div', null,
    // KPI Row
    React.createElement('div', { className: 'kpi-grid' },
      React.createElement(StatCard, { label: "Today's Revenue", value: formatCurrency(today.amount), delta: `${Math.abs(Math.round(((today.amount - yesterday.amount) / (yesterday.amount || 1)) * 100))}% vs yesterday`, deltaDir: today.amount >= yesterday.amount ? 'up' : 'down', accent: 'accent-green' }),
      React.createElement(StatCard, { label: 'Orders Today', value: today.orders, delta: `${Math.abs(today.orders - yesterday.orders)} ${today.orders >= yesterday.orders ? 'more' : 'fewer'}`, deltaDir: today.orders >= yesterday.orders ? 'up' : 'down', accent: 'accent-purple' }),
      React.createElement(StatCard, { label: 'Active Staff', value: activeStaff + '/' + data.staff.length, accent: 'accent-cyan' }),
      React.createElement(StatCard, { label: 'Low Stock Alerts', value: lowStock.length, delta: lowStock.length > 0 ? 'Needs attention' : 'All good', deltaDir: lowStock.length > 0 ? 'down' : 'up', accent: lowStock.length > 0 ? 'accent-red' : 'accent-green' })
    ),

    // Quick Actions
    React.createElement('div', { className: 'quick-actions' },
      [
        { label: 'Add Expense', icon: '+ ' },
        { label: 'New Reservation', icon: '+ ' },
        { label: 'Restock Alert', icon: pendingPO + ' pending POs' },
        { label: todayRes + ' reservations today', icon: '' },
        pendingSwaps > 0 && { label: pendingSwaps + ' swap requests', icon: '' },
      ].filter(Boolean).map((a, i) => React.createElement('div', { className: 'quick-action', key: i }, a.icon, a.label))
    ),

    // Two column: chart + expense donut
    React.createElement('div', { className: 'two-col', style: { marginBottom: 20 } },
      React.createElement('div', { className: 'section-card' },
        React.createElement('h3', null, 'Revenue Last 7 Days'),
        React.createElement(SimpleBarChart, { data: chartData, height: 150 }),
        React.createElement('div', { style: { marginTop: 10, fontSize: 12, color: 'var(--text-muted)' } },
          'Week total: ', React.createElement('b', { style: { color: 'var(--text-primary)' } }, formatCurrency(weekRev)),
          ' ', React.createElement('span', { className: `kpi-delta ${weekDelta >= 0 ? 'up' : 'down'}` }, weekDelta >= 0 ? '↑' : '↓', ' ', Math.abs(weekDelta), '%')
        )
      ),
      React.createElement('div', { className: 'section-card' },
        React.createElement('h3', null, 'Expense Breakdown'),
        React.createElement('div', { style: { display: 'flex', gap: 20, alignItems: 'center' } },
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 } },
            React.createElement(PieChart, { segments: expSegments }),
            React.createElement('div', { style: { fontSize: 11, color: 'var(--text-dim)' } }, 'Total ', React.createElement('b', { style: { color: 'var(--text-primary)', fontFamily: "'Space Grotesk', monospace" } }, formatCurrency(totalExp)))
          ),
          React.createElement('div', { className: 'chart-legend' },
            expSegments.slice(0, 6).map((seg, i) => React.createElement('div', { className: 'legend-row', key: i },
              React.createElement('div', { className: 'legend-dot', style: { background: seg.color } }),
              seg.label,
              React.createElement('span', { className: 'legend-value' }, formatCurrency(seg.value))
            ))
          )
        )
      )
    ),

    // Two column: Activity + Inventory alerts
    React.createElement('div', { className: 'two-col' },
      React.createElement('div', { className: 'section-card' },
        React.createElement('h3', null, 'Recent Activity'),
        React.createElement('div', { className: 'activity-list' },
          activities.map((a, i) => React.createElement('div', { className: 'activity-item', key: i },
            React.createElement('div', null,
              React.createElement('div', { className: 'activity-text' }, a.text),
              React.createElement('div', { className: 'activity-time' }, a.time)
            )
          ))
        )
      ),
      React.createElement('div', { className: 'section-card' },
        React.createElement('h3', null, 'Stock Alerts'),
        lowStock.length === 0
          ? React.createElement('p', { style: { color: 'var(--success)', fontSize: 13 } }, 'All items above reorder levels')
          : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
            lowStock.map(it => {
              const pct = Math.min((it.stock / it.reorderLevel) * 100, 100);
              return React.createElement('div', { key: it.id, style: { padding: '8px 10px', background: 'rgba(255,71,87,0.06)', borderRadius: 8, border: '1px solid rgba(255,71,87,0.12)' } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 } },
                  React.createElement('span', { style: { fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' } }, it.name),
                  React.createElement('span', { style: { fontSize: 11, color: 'var(--danger)', fontWeight: 700 } }, it.stock, ' ', it.unit)
                ),
                React.createElement('div', { className: 'progress-bar' },
                  React.createElement('div', { className: 'progress-fill progress-red', style: { width: pct + '%' } })
                ),
                React.createElement('div', { style: { fontSize: 10, color: 'var(--text-dim)', marginTop: 3 } }, 'Reorder at ', it.reorderLevel, ' ', it.unit)
              );
            })
          ),
        React.createElement('div', { style: { marginTop: 14 } },
          React.createElement('h3', { style: { fontSize: 14, margin: '0 0 10px' } }, 'Today\'s Reservations'),
          data.reservations.filter(r => r.date === todayStr()).length === 0
            ? React.createElement('p', { style: { color: 'var(--text-dim)', fontSize: 12 } }, 'No reservations today')
            : data.reservations.filter(r => r.date === todayStr()).map(r =>
              React.createElement('div', { key: r.id, style: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(var(--overlay-rgb),0.04)', fontSize: 12 } },
                React.createElement('span', { className: `status-dot ${r.status === 'confirmed' ? 'dot-green' : 'dot-yellow'}` }),
                React.createElement('span', { style: { fontWeight: 600, color: 'var(--text-primary)' } }, r.guestName),
                React.createElement('span', { style: { color: 'var(--text-dim)' } }, formatTime(r.time), ' · ', r.partySize, ' pax')
              )
            )
        )
      )
    )
  );
}

Object.assign(window, { DashboardView });
