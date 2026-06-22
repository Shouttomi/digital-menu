// ERP Reports Module
function ReportsView() {
  const { data } = useERP();
  const [range, setRange] = useState('30');
  const days = parseInt(range);

  const rev = data.revenue.slice(-days);
  const totalRev = rev.reduce((s, r) => s + r.amount, 0);
  const totalOrders = rev.reduce((s, r) => s + r.orders, 0);
  const avgOrder = totalOrders ? Math.round(totalRev / totalOrders) : 0;
  const bestDay = rev.reduce((best, r) => r.amount > best.amount ? r : best, { amount: 0, date: '' });
  const worstDay = rev.reduce((worst, r) => r.amount < worst.amount ? r : worst, { amount: Infinity, date: '' });

  // Expenses in range
  const cutoffDate = daysAgo(days);
  const expInRange = data.expenses.filter(e => e.date >= cutoffDate);
  const totalExp = expInRange.reduce((s, e) => s + e.amount, 0);
  const profit = totalRev - totalExp;

  // Category breakdown
  const expByCat = {};
  expInRange.forEach(e => { expByCat[e.category] = (expByCat[e.category] || 0) + e.amount; });

  // Staff summary
  const activeStaff = data.staff.filter(s => s.status === 'active');
  const totalPayroll = activeStaff.reduce((s, st) => s + (st.monthlySalary || 0), 0);

  // Top customers
  const topCustomers = [...data.customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

  // Inventory value
  const invValue = data.inventory.reduce((s, it) => s + it.stock * it.costPerUnit, 0);
  const lowStockCount = data.inventory.filter(it => it.stock <= it.reorderLevel).length;

  // Revenue chart
  const chartData = rev.map(r => {
    const d = new Date(r.date);
    return { label: d.getDate() + '', value: r.amount };
  });
  // Show max 14 bars
  const condensed = chartData.length > 14
    ? chartData.filter((_, i) => i % Math.ceil(chartData.length / 14) === 0)
    : chartData;

  return React.createElement('div', null,
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 } },
      React.createElement('div', null,
        React.createElement('h3', { style: { margin: 0, fontSize: 16 } }, 'Business Report'),
        React.createElement('p', { style: { margin: '2px 0 0', fontSize: 12, color: 'var(--text-dim)' } }, 'Summary for the last ', days, ' days')
      ),
      React.createElement('div', { style: { display: 'flex', gap: 8 } },
        ['7', '14', '30'].map(d => React.createElement('button', {
          key: d, className: `erp-tab ${range === d ? 'active' : ''}`,
          onClick: () => setRange(d)
        }, d, ' Days'))
      )
    ),

    // KPI summary
    React.createElement('div', { className: 'kpi-grid' },
      React.createElement(StatCard, { label: 'Total Revenue', value: formatCurrency(totalRev), accent: 'accent-green' }),
      React.createElement(StatCard, { label: 'Total Expenses', value: formatCurrency(totalExp), accent: 'accent-red' }),
      React.createElement(StatCard, { label: 'Net Profit', value: formatCurrency(profit), delta: (totalRev ? Math.round((profit / totalRev) * 100) : 0) + '% margin', deltaDir: profit >= 0 ? 'up' : 'down', accent: profit >= 0 ? 'accent-green' : 'accent-red' }),
      React.createElement(StatCard, { label: 'Total Orders', value: totalOrders, accent: 'accent-purple' }),
      React.createElement(StatCard, { label: 'Avg Order Value', value: formatCurrency(avgOrder), accent: 'accent-cyan' }),
      React.createElement(StatCard, { label: 'Inventory Value', value: formatCurrency(invValue), delta: lowStockCount + ' low stock', deltaDir: lowStockCount > 0 ? 'down' : 'up', accent: 'accent-gold' })
    ),

    // Revenue chart
    React.createElement('div', { className: 'section-card', style: { marginBottom: 16 } },
      React.createElement('h3', null, 'Revenue Trend'),
      React.createElement(SimpleBarChart, { data: condensed, height: 150 }),
      React.createElement('div', { style: { display: 'flex', gap: 20, marginTop: 12, fontSize: 12, color: 'var(--text-muted)' } },
        React.createElement('span', null, 'Best day: ', React.createElement('b', { style: { color: 'var(--success)' } }, formatDate(bestDay.date), ' - ', formatCurrency(bestDay.amount))),
        worstDay.amount < Infinity && React.createElement('span', null, 'Slowest: ', React.createElement('b', { style: { color: 'var(--danger)' } }, formatDate(worstDay.date), ' - ', formatCurrency(worstDay.amount)))
      )
    ),

    React.createElement('div', { className: 'two-col' },
      // Expense breakdown
      React.createElement('div', { className: 'section-card' },
        React.createElement('h3', null, 'Expense Breakdown'),
        Object.entries(expByCat).sort((a, b) => b[1] - a[1]).length === 0
          ? React.createElement('p', { style: { color: 'var(--text-dim)', fontSize: 13 } }, 'No expenses in this period')
          : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
            Object.entries(expByCat).sort((a, b) => b[1] - a[1]).map(([cat, val]) => {
              const pct = Math.round((val / totalExp) * 100);
              const catColors = { Ingredients: '#ff6b3d', Salaries: '#6b5cff', Rent: '#ff3da0', Utilities: '#ffc200', Maintenance: '#18b08a', Marketing: '#6ab4ff', Insurance: '#ff4757', Miscellaneous: '#8b8e9b' };
              return React.createElement('div', { key: cat },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 } },
                  React.createElement('span', { style: { color: 'var(--text-secondary)' } }, cat),
                  React.createElement('span', { style: { color: 'var(--text-primary)', fontWeight: 600, fontFamily: "'Space Grotesk', monospace" } }, formatCurrency(val), ' (', pct, '%)')
                ),
                React.createElement('div', { className: 'progress-bar' },
                  React.createElement('div', { className: 'progress-fill', style: { width: pct + '%', background: catColors[cat] || '#6b6e7c' } })
                )
              );
            })
          )
      ),

      // Staff & Customer summary
      React.createElement('div', null,
        React.createElement('div', { className: 'section-card', style: { marginBottom: 16 } },
          React.createElement('h3', null, 'Staff Summary'),
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid rgba(var(--overlay-rgb),0.04)' } },
              React.createElement('span', { style: { color: 'var(--text-secondary)' } }, 'Active staff'),
              React.createElement('span', { style: { color: 'var(--text-primary)', fontWeight: 600 } }, activeStaff.length)
            ),
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid rgba(var(--overlay-rgb),0.04)' } },
              React.createElement('span', { style: { color: 'var(--text-secondary)' } }, 'On leave'),
              React.createElement('span', { style: { color: 'var(--warning)', fontWeight: 600 } }, data.staff.filter(s => s.status === 'on-leave').length)
            ),
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid rgba(var(--overlay-rgb),0.04)' } },
              React.createElement('span', { style: { color: 'var(--text-secondary)' } }, 'Est. payroll (period)'),
              React.createElement('span', { style: { color: 'var(--text-primary)', fontWeight: 600, fontFamily: "'Space Grotesk', monospace" } }, formatCurrency(totalPayroll))
            ),
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0' } },
              React.createElement('span', { style: { color: 'var(--text-secondary)' } }, 'Pending swaps'),
              React.createElement('span', { style: { color: data.shiftSwaps.filter(s => s.status === 'pending').length > 0 ? '#ff6b3d' : '#18b08a', fontWeight: 600 } }, data.shiftSwaps.filter(s => s.status === 'pending').length)
            )
          )
        ),
        React.createElement('div', { className: 'section-card' },
          React.createElement('h3', null, 'Top Customers'),
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
            topCustomers.map((c, i) => React.createElement('div', { key: c.id, style: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 } },
              React.createElement('span', { style: { fontWeight: 800, color: 'var(--purple)', width: 18 } }, '#', i + 1),
              React.createElement('div', { className: `avatar avatar-${(i % 6) + 1}`, style: { width: 26, height: 26, fontSize: 9 } }, c.name.split(' ').map(w => w[0]).join('').slice(0, 2)),
              React.createElement('span', { style: { flex: 1, fontWeight: 600, color: 'var(--text-primary)' } }, c.name),
              React.createElement('span', { style: { color: 'var(--success)', fontWeight: 600, fontFamily: "'Space Grotesk', monospace" } }, formatCurrency(c.totalSpent)),
              React.createElement('span', { style: { color: 'var(--text-dim)' } }, c.visits, ' visits')
            ))
          )
        )
      )
    )
  );
}

Object.assign(window, { ReportsView });
