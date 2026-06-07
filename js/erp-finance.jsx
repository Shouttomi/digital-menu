// ERP Finance & Expenses Module
function FinanceView() {
  const { data, addItem, deleteItem } = useERP();
  const [tab, setTab] = useState('overview');
  const [expModal, setExpModal] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const rev = data.revenue || [];
  const monthRev = rev.reduce((s, r) => s + r.amount, 0);
  const monthOrders = rev.reduce((s, r) => s + r.orders, 0);
  const totalExp = data.expenses.reduce((s, e) => s + e.amount, 0);
  const profit = monthRev - totalExp;
  const profitMargin = monthRev ? Math.round((profit / monthRev) * 100) : 0;
  const avgDaily = Math.round(monthRev / (rev.length || 1));

  function handleSaveExpense(item) {
    addItem('expenses', item);
    setExpModal(null);
  }

  return React.createElement('div', null,
    React.createElement('div', { className: 'kpi-grid' },
      React.createElement(StatCard, { label: 'Monthly Revenue', value: formatCurrency(monthRev), delta: '14% vs last month', deltaDir: 'up', accent: 'accent-green' }),
      React.createElement(StatCard, { label: 'Total Expenses', value: formatCurrency(totalExp), accent: 'accent-red' }),
      React.createElement(StatCard, { label: 'Net Profit', value: formatCurrency(profit), delta: profitMargin + '% margin', deltaDir: profit >= 0 ? 'up' : 'down', accent: profit >= 0 ? 'accent-green' : 'accent-red' }),
      React.createElement(StatCard, { label: 'Avg Daily Revenue', value: formatCurrency(avgDaily), accent: 'accent-purple' })
    ),

    React.createElement(TabBar, { tabs: [{ id: 'overview', label: 'Revenue Overview' }, { id: 'expenses', label: 'Expense Log' }, { id: 'pnl', label: 'Profit & Loss' }], active: tab, onChange: setTab }),

    tab === 'overview' && React.createElement(RevenueOverview, { revenue: rev }),
    tab === 'expenses' && React.createElement(ExpenseLog, { expenses: data.expenses, onAdd: () => setExpModal('add'), onDelete: setConfirmDel }),
    tab === 'pnl' && React.createElement(ProfitLoss, { revenue: rev, expenses: data.expenses }),

    expModal && React.createElement(ExpenseModal, { onSave: handleSaveExpense, onClose: () => setExpModal(null) }),
    confirmDel && React.createElement(ConfirmDialog, { message: 'Delete this expense entry?', onConfirm: () => { deleteItem('expenses', confirmDel); setConfirmDel(null); }, onCancel: () => setConfirmDel(null) })
  );
}

function RevenueOverview({ revenue }) {
  const weekly = [];
  for (let i = 0; i < revenue.length; i += 7) {
    const chunk = revenue.slice(i, i + 7);
    const total = chunk.reduce((s, r) => s + r.amount, 0);
    weekly.push({ label: `W${Math.floor(i / 7) + 1}`, value: total, shortValue: (total / 1000).toFixed(0) + 'K' });
  }

  const dailyChart = revenue.slice(-14).map(r => {
    const d = new Date(r.date);
    return { label: d.getDate() + '', value: r.amount, shortValue: '' };
  });

  return React.createElement('div', { className: 'two-col' },
    React.createElement('div', { className: 'section-card' },
      React.createElement('h3', null, 'Daily Revenue (Last 14 Days)'),
      React.createElement(SimpleBarChart, { data: dailyChart, height: 160 })
    ),
    React.createElement('div', { className: 'section-card' },
      React.createElement('h3', null, 'Weekly Totals'),
      React.createElement(SimpleBarChart, { data: weekly, height: 160 }),
      React.createElement('div', { style: { marginTop: 12 } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' } },
          React.createElement('span', null, 'Total Orders: ', React.createElement('b', { style: { color: 'var(--text-primary)' } }, revenue.reduce((s, r) => s + r.orders, 0))),
          React.createElement('span', null, 'Avg/Order: ', React.createElement('b', { style: { color: 'var(--text-primary)' } }, formatCurrency(Math.round(revenue.reduce((s, r) => s + r.amount, 0) / (revenue.reduce((s, r) => s + r.orders, 0) || 1)))))
        )
      )
    )
  );
}

function ExpenseLog({ expenses, onAdd, onDelete }) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const cats = ['All', ...new Set(expenses.map(e => e.category))];
  const filtered = expenses
    .filter(e => filterCat === 'All' || e.category === filterCat)
    .filter(e => !search || e.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));

  const catColors = { Ingredients: '#ff6b3d', Salaries: '#6b5cff', Rent: '#ff3da0', Utilities: '#ffc200', Maintenance: '#18b08a', Marketing: '#6ab4ff', Insurance: '#ff4757', Miscellaneous: '#8b8e9b' };

  return React.createElement('div', { className: 'table-panel' },
    React.createElement('div', { className: 'table-panel-header' },
      React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'center' } },
        React.createElement('h3', null, 'Expenses'),
        React.createElement(SearchBox, { value: search, onChange: setSearch, placeholder: 'Search expenses...' })
      ),
      React.createElement('div', { style: { display: 'flex', gap: 8 } },
        React.createElement('select', { style: { background: 'rgba(var(--overlay-rgb),0.04)', border: '1px solid rgba(var(--overlay-rgb),0.08)', borderRadius: 8, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12, fontFamily: 'inherit' }, value: filterCat, onChange: e => setFilterCat(e.target.value) },
          cats.map(c => React.createElement('option', { key: c, value: c }, c))
        ),
        React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: onAdd }, '+ Add Expense')
      )
    ),
    React.createElement('div', { className: 'table-panel-body' },
      React.createElement('table', { className: 'data-table' },
        React.createElement('thead', null, React.createElement('tr', null,
          ['Date', 'Category', 'Description', 'Amount', 'Payment', 'Actions'].map(h => React.createElement('th', { key: h }, h))
        )),
        React.createElement('tbody', null,
          filtered.map(e => React.createElement('tr', { key: e.id },
            React.createElement('td', null, formatDate(e.date)),
            React.createElement('td', null, React.createElement('span', { className: 'badge badge-gray' }, e.category)),
            React.createElement('td', { className: 'cell-primary' }, e.description),
            React.createElement('td', { className: 'cell-mono', style: { color: 'var(--danger)', fontWeight: 600 } }, '- ', formatCurrency(e.amount)),
            React.createElement('td', null, React.createElement('span', { className: 'badge badge-gray' }, e.method)),
            React.createElement('td', null, React.createElement('button', { className: 'btn btn-danger btn-sm', onClick: () => onDelete(e.id) }, '×'))
          ))
        )
      ),
      filtered.length === 0 && React.createElement('div', { className: 'empty-state' }, React.createElement('h3', null, 'No expenses found'))
    )
  );
}

function ProfitLoss({ revenue, expenses }) {
  const totalRev = revenue.reduce((s, r) => s + r.amount, 0);
  const expByCat = {};
  expenses.forEach(e => { expByCat[e.category] = (expByCat[e.category] || 0) + e.amount; });
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const net = totalRev - totalExp;
  const catColors = { Ingredients: '#ff6b3d', Salaries: '#6b5cff', Rent: '#ff3da0', Utilities: '#ffc200', Maintenance: '#18b08a', Marketing: '#6ab4ff', Insurance: '#ff4757', Miscellaneous: '#8b8e9b' };

  return React.createElement('div', { className: 'two-col' },
    React.createElement('div', { className: 'section-card' },
      React.createElement('h3', null, 'Profit & Loss Statement'),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(var(--overlay-rgb),0.06)' } },
          React.createElement('span', { style: { fontSize: 14, fontWeight: 600, color: 'var(--success)' } }, 'Total Revenue'),
          React.createElement('span', { className: 'cell-mono', style: { fontSize: 16, fontWeight: 700, color: 'var(--success)' } }, formatCurrency(totalRev))
        ),
        Object.entries(expByCat).sort((a, b) => b[1] - a[1]).map(([cat, val]) =>
          React.createElement('div', { key: cat, style: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 } },
            React.createElement('span', { style: { color: 'var(--text-secondary)' } }, cat),
            React.createElement('span', { className: 'cell-mono', style: { color: 'var(--danger)' } }, '- ', formatCurrency(val))
          )
        ),
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid rgba(var(--overlay-rgb),0.1)', marginTop: 6 } },
          React.createElement('span', { style: { fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' } }, 'Total Expenses'),
          React.createElement('span', { className: 'cell-mono', style: { fontSize: 16, fontWeight: 700, color: 'var(--danger)' } }, formatCurrency(totalExp))
        ),
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, background: net >= 0 ? 'rgba(24,176,138,0.08)' : 'rgba(255,71,87,0.08)', border: `1px solid ${net >= 0 ? 'rgba(24,176,138,0.2)' : 'rgba(255,71,87,0.2)'}` } },
          React.createElement('span', { style: { fontSize: 16, fontWeight: 700, color: net >= 0 ? '#18b08a' : '#ff4757' } }, 'Net Profit'),
          React.createElement('span', { style: { fontSize: 20, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: net >= 0 ? '#18b08a' : '#ff4757' } }, formatCurrency(net))
        )
      )
    ),
    React.createElement('div', { className: 'section-card' },
      React.createElement('h3', null, 'Expense Distribution'),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 } },
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 } },
          React.createElement(PieChart, { segments: Object.entries(expByCat).map(([cat, val]) => ({ value: val, color: catColors[cat] || '#6b6e7c' })) }),
          React.createElement('div', { style: { fontSize: 11, color: 'var(--text-dim)' } }, Math.round((totalExp / (totalRev || 1)) * 100) + '% ', React.createElement('span', null, 'of Revenue'))
        ),
        React.createElement('div', { className: 'chart-legend', style: { width: '100%' } },
          Object.entries(expByCat).sort((a, b) => b[1] - a[1]).map(([cat, val]) =>
            React.createElement('div', { className: 'legend-row', key: cat },
              React.createElement('div', { className: 'legend-dot', style: { background: catColors[cat] || '#6b6e7c' } }),
              cat,
              React.createElement('span', { className: 'legend-value' }, Math.round((val / totalExp) * 100) + '%')
            )
          )
        )
      )
    )
  );
}

function ExpenseModal({ onSave, onClose }) {
  const [form, setForm] = useState({ date: todayStr(), category: 'Ingredients', description: '', amount: '', method: 'UPI' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const cats = ['Ingredients', 'Salaries', 'Rent', 'Utilities', 'Maintenance', 'Marketing', 'Insurance', 'Miscellaneous'];
  const methods = ['Cash', 'UPI', 'Bank Transfer', 'Online', 'Card'];

  return React.createElement(Modal, { title: 'Add Expense', onClose },
    React.createElement('div', { className: 'modal-body' },
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Date' }, React.createElement('input', { type: 'date', value: form.date, onChange: e => set('date', e.target.value) })),
        React.createElement(FormField, { label: 'Category' }, React.createElement('select', { value: form.category, onChange: e => set('category', e.target.value) }, cats.map(c => React.createElement('option', { key: c, value: c }, c))))
      ),
      React.createElement(FormField, { label: 'Description' }, React.createElement('input', { value: form.description, onChange: e => set('description', e.target.value), placeholder: 'e.g. Weekly produce order' })),
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Amount (₹)' }, React.createElement('input', { type: 'number', value: form.amount, onChange: e => set('amount', parseFloat(e.target.value) || 0) })),
        React.createElement(FormField, { label: 'Payment Method' }, React.createElement('select', { value: form.method, onChange: e => set('method', e.target.value) }, methods.map(m => React.createElement('option', { key: m, value: m }, m))))
      )
    ),
    React.createElement('div', { className: 'modal-footer' },
      React.createElement('button', { className: 'btn btn-ghost', onClick: onClose }, 'Cancel'),
      React.createElement('button', { className: 'btn btn-primary', onClick: () => { if (form.description.trim() && form.amount > 0) onSave(form); } }, 'Add Expense')
    )
  );
}

Object.assign(window, { FinanceView });
