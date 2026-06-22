// ERP Daily Cash Register / Petty Cash
function CashRegisterView() {
  const { data, update, addItem } = useERP();
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [entryModal, setEntryModal] = useState(null);
  const [tab, setTab] = useState('today');

  const todayReg = data.cashRegister.find(r => r.date === selectedDate);
  const entries = todayReg ? todayReg.entries : [];

  // Calculations
  const cashIn = entries.filter(e => e.type === 'in').reduce((s, e) => s + e.amount, 0);
  const cashOut = entries.filter(e => e.type === 'out').reduce((s, e) => s + e.amount, 0);
  const openBal = todayReg ? todayReg.openingBalance : 0;
  const netBalance = openBal + cashIn - cashOut;

  // Method splits
  const byCash = entries.filter(e => e.method === 'cash').reduce((s, e) => s + (e.type === 'in' ? e.amount : -e.amount), 0);
  const byUpi = entries.filter(e => e.method === 'upi' && e.type === 'in').reduce((s, e) => s + e.amount, 0);
  const byCard = entries.filter(e => e.method === 'card' && e.type === 'in').reduce((s, e) => s + e.amount, 0);

  // History (last 7 registers)
  const history = [...data.cashRegister].sort((a, b) => b.date.localeCompare(a.date));

  function ensureRegister() {
    if (!todayReg) {
      const lastReg = data.cashRegister.sort((a, b) => b.date.localeCompare(a.date))[0];
      const opening = lastReg ? (lastReg.closingBalance || lastReg.openingBalance) : 5000;
      update('cashRegister', prev => [...prev, { id: generateId(), date: selectedDate, openingBalance: opening, closingBalance: null, reconciled: false, entries: [] }]);
    }
  }

  function addEntry(entry) {
    ensureRegister();
    update('cashRegister', prev => prev.map(r =>
      r.date === selectedDate ? { ...r, entries: [...r.entries, { id: generateId(), ...entry }] } : r
    ));
    setEntryModal(null);
  }

  function deleteEntry(entryId) {
    update('cashRegister', prev => prev.map(r =>
      r.date === selectedDate ? { ...r, entries: r.entries.filter(e => e.id !== entryId) } : r
    ));
  }

  function reconcile() {
    update('cashRegister', prev => prev.map(r =>
      r.date === selectedDate ? { ...r, closingBalance: netBalance, reconciled: true } : r
    ));
  }

  function updateOpening(val) {
    update('cashRegister', prev => prev.map(r =>
      r.date === selectedDate ? { ...r, openingBalance: val } : r
    ));
  }

  const methodColors = { cash: '#7d9b8e', upi: '#8a8db0', card: '#8fa3b5' };
  const totalMethodIn = byUpi + byCard + Math.max(byCash, 0);

  return React.createElement('div', null,
    React.createElement(TabBar, { tabs: [
      { id: 'today', label: 'Register' },
      { id: 'history', label: 'History' },
    ], active: tab, onChange: setTab }),

    tab === 'today' && React.createElement('div', null,
      // Date picker + actions
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 } },
        React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'center' } },
          React.createElement('input', { type: 'date', value: selectedDate, onChange: e => setSelectedDate(e.target.value),
            style: { padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(var(--overlay-rgb),0.08)', background: 'rgba(var(--overlay-rgb),0.04)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: 13 }
          }),
          todayReg && todayReg.reconciled && React.createElement('span', { className: 'badge badge-green' }, '✓ Reconciled')
        ),
        React.createElement('div', { style: { display: 'flex', gap: 8 } },
          React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: () => { ensureRegister(); setEntryModal('in'); } }, '+ Cash In'),
          React.createElement('button', { className: 'btn btn-danger btn-sm', onClick: () => { ensureRegister(); setEntryModal('out'); } }, '- Cash Out')
        )
      ),

      // KPI row
      React.createElement('div', { className: 'kpi-grid' },
        React.createElement(StatCard, { label: 'Opening Balance', value: formatCurrency(openBal), accent: 'accent-cyan' }),
        React.createElement(StatCard, { label: 'Cash In', value: formatCurrency(cashIn), delta: entries.filter(e => e.type === 'in').length + ' entries', deltaDir: 'up', accent: 'accent-green' }),
        React.createElement(StatCard, { label: 'Cash Out', value: formatCurrency(cashOut), delta: entries.filter(e => e.type === 'out').length + ' entries', deltaDir: 'down', accent: 'accent-red' }),
        React.createElement(StatCard, { label: 'Net Balance', value: formatCurrency(netBalance), accent: 'accent-purple' })
      ),

      React.createElement('div', { className: 'two-col', style: { marginBottom: 16 } },
        // Payment method split
        React.createElement('div', { className: 'section-card' },
          React.createElement('h3', null, 'Payment Split'),
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
            [['cash', 'Cash', Math.max(byCash, 0)], ['upi', 'UPI', byUpi], ['card', 'Card', byCard]].map(([key, label, val]) => {
              const pct = totalMethodIn > 0 ? Math.round((val / totalMethodIn) * 100) : 0;
              return React.createElement('div', { key: key },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 } },
                  React.createElement('span', { style: { color: 'var(--text-secondary)' } }, label),
                  React.createElement('span', { style: { fontWeight: 600, fontFamily: "'Space Grotesk', monospace" } }, formatCurrency(val), ' (', pct, '%)')
                ),
                React.createElement('div', { className: 'progress-bar' },
                  React.createElement('div', { className: 'progress-fill', style: { width: pct + '%', background: methodColors[key] } })
                )
              );
            })
          ),
          !todayReg?.reconciled && todayReg && React.createElement('button', {
            className: 'btn btn-primary', onClick: reconcile,
            style: { marginTop: 16, width: '100%', justifyContent: 'center' }
          }, 'Close & Reconcile Day')
        ),

        // Opening balance editor
        React.createElement('div', { className: 'section-card' },
          React.createElement('h3', null, 'Day Settings'),
          React.createElement(FormField, { label: 'Opening Balance (₹)', hint: 'Cash in drawer at start of day' },
            React.createElement('input', { type: 'number', value: openBal, onChange: e => { ensureRegister(); updateOpening(parseFloat(e.target.value) || 0); },
              style: { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(var(--overlay-rgb),0.08)', background: 'rgba(var(--overlay-rgb),0.04)', color: 'var(--text-primary)', fontFamily: "'Space Grotesk', monospace", fontSize: 16, fontWeight: 700 }
            })
          ),
          React.createElement('div', { style: { marginTop: 16, padding: '12px 14px', borderRadius: 10, background: 'rgba(var(--overlay-rgb),0.03)', fontSize: 12 } },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: 'var(--text-muted)' } }, React.createElement('span', null, 'Opening'), React.createElement('span', { style: { fontFamily: "'Space Grotesk', monospace" } }, formatCurrency(openBal))),
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: 'var(--success)' } }, React.createElement('span', null, '+ Cash In'), React.createElement('span', { style: { fontFamily: "'Space Grotesk', monospace" } }, formatCurrency(cashIn))),
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: 'var(--danger)' } }, React.createElement('span', null, '− Cash Out'), React.createElement('span', { style: { fontFamily: "'Space Grotesk', monospace" } }, formatCurrency(cashOut))),
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid rgba(var(--overlay-rgb),0.06)', fontWeight: 700, color: 'var(--text-primary)' } }, React.createElement('span', null, 'Expected in Drawer'), React.createElement('span', { style: { fontFamily: "'Space Grotesk', monospace" } }, formatCurrency(openBal + byCash)))
          )
        )
      ),

      // Entries table
      React.createElement('div', { className: 'table-panel' },
        React.createElement('div', { className: 'table-panel-header' },
          React.createElement('h3', { style: { margin: 0 } }, 'Transactions'),
          React.createElement('span', { style: { fontSize: 12, color: 'var(--text-dim)' } }, entries.length, ' entries')
        ),
        React.createElement('div', { className: 'table-panel-body' },
          entries.length === 0
            ? React.createElement('div', { className: 'empty-state' }, React.createElement('h3', null, 'No entries yet'), React.createElement('p', null, 'Add a cash-in or cash-out entry to start tracking.'))
            : React.createElement('table', { className: 'data-table' },
              React.createElement('thead', null, React.createElement('tr', null,
                ['Time', 'Type', 'Amount', 'Method', 'Description', ''].map(h => React.createElement('th', { key: h }, h))
              )),
              React.createElement('tbody', null,
                [...entries].sort((a, b) => a.time.localeCompare(b.time)).map(e => React.createElement('tr', { key: e.id },
                  React.createElement('td', { style: { fontSize: 12, fontFamily: "'Space Grotesk', monospace" } }, formatTime(e.time)),
                  React.createElement('td', null, React.createElement('span', { className: e.type === 'in' ? 'badge badge-green' : 'badge badge-red' }, e.type === 'in' ? '↓ IN' : '↑ OUT')),
                  React.createElement('td', { className: 'cell-mono', style: { color: e.type === 'in' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 } }, (e.type === 'in' ? '+' : '−') + formatCurrency(e.amount)),
                  React.createElement('td', null, React.createElement('span', { className: 'badge', style: { background: (methodColors[e.method] || '#8b8e9b') + '22', color: methodColors[e.method] || '#8b8e9b' } }, methodIcons[e.method] || '', ' ', e.method.toUpperCase())),
                  React.createElement('td', { style: { fontSize: 12, color: 'var(--text-secondary)' } }, e.description),
                  React.createElement('td', null, !todayReg?.reconciled && React.createElement('button', { className: 'btn btn-danger btn-sm', onClick: () => deleteEntry(e.id) }, '×'))
                ))
              )
            )
        )
      )
    ),

    tab === 'history' && React.createElement('div', null,
      React.createElement('div', { className: 'table-panel' },
        React.createElement('div', { className: 'table-panel-header' },
          React.createElement('h3', { style: { margin: 0 } }, 'Register History')
        ),
        React.createElement('div', { className: 'table-panel-body' },
          React.createElement('table', { className: 'data-table' },
            React.createElement('thead', null, React.createElement('tr', null,
              ['Date', 'Opening', 'Cash In', 'Cash Out', 'Closing', 'Status', 'Entries'].map(h => React.createElement('th', { key: h }, h))
            )),
            React.createElement('tbody', null,
              history.map(r => {
                const rIn = r.entries.filter(e => e.type === 'in').reduce((s, e) => s + e.amount, 0);
                const rOut = r.entries.filter(e => e.type === 'out').reduce((s, e) => s + e.amount, 0);
                return React.createElement('tr', { key: r.id, style: { cursor: 'pointer' }, onClick: () => { setSelectedDate(r.date); setTab('today'); } },
                  React.createElement('td', { className: 'cell-primary' }, formatDate(r.date)),
                  React.createElement('td', { className: 'cell-mono' }, formatCurrency(r.openingBalance)),
                  React.createElement('td', { className: 'cell-mono', style: { color: 'var(--success)' } }, '+', formatCurrency(rIn)),
                  React.createElement('td', { className: 'cell-mono', style: { color: 'var(--danger)' } }, '−', formatCurrency(rOut)),
                  React.createElement('td', { className: 'cell-mono', style: { fontWeight: 700 } }, r.closingBalance != null ? formatCurrency(r.closingBalance) : '-'),
                  React.createElement('td', null, React.createElement('span', { className: r.reconciled ? 'badge badge-green' : 'badge badge-yellow' }, r.reconciled ? '✓ Closed' : 'Open')),
                  React.createElement('td', { style: { fontSize: 12, color: 'var(--text-muted)' } }, r.entries.length)
                );
              })
            )
          )
        )
      )
    ),

    entryModal && React.createElement(CashEntryModal, { type: entryModal, onSave: addEntry, onClose: () => setEntryModal(null) })
  );
}

function CashEntryModal({ type, onSave, onClose }) {
  const now = new Date();
  const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  const [form, setForm] = useState({ time: timeStr, type, amount: '', method: 'cash', description: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return React.createElement(Modal, { title: type === 'in' ? 'Cash In' : 'Cash Out', onClose },
    React.createElement('div', { className: 'modal-body' },
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Amount (₹)' }, React.createElement('input', { type: 'number', value: form.amount, onChange: e => set('amount', e.target.value), placeholder: '0', autoFocus: true,
          style: { fontSize: 22, fontWeight: 700, fontFamily: "'Space Grotesk', monospace" }
        })),
        React.createElement(FormField, { label: 'Time' }, React.createElement('input', { type: 'time', value: form.time, onChange: e => set('time', e.target.value) }))
      ),
      React.createElement(FormField, { label: 'Payment Method' },
        React.createElement('div', { style: { display: 'flex', gap: 8 } },
          ['cash', 'upi', 'card'].map(m => React.createElement('button', {
            key: m, className: `btn ${form.method === m ? 'btn-primary' : 'btn-ghost'} btn-sm`,
            onClick: () => set('method', m),
            style: { flex: 1, justifyContent: 'center' }
          }, m === 'cash' ? 'Cash' : m === 'upi' ? 'UPI' : 'Card'))
        )
      ),
      React.createElement(FormField, { label: 'Description' }, React.createElement('input', { type: 'text', value: form.description, onChange: e => set('description', e.target.value), placeholder: 'e.g. Table 5 - lunch for 4' }))
    ),
    React.createElement('div', { className: 'modal-footer' },
      React.createElement('button', { className: 'btn btn-ghost', onClick: onClose }, 'Cancel'),
      React.createElement('button', { className: type === 'in' ? 'btn btn-primary' : 'btn btn-danger', onClick: () => { const amt = parseFloat(form.amount); if (amt > 0) onSave({ ...form, amount: amt }); } }, type === 'in' ? '+ Add Cash In' : '− Add Cash Out')
    )
  );
}

Object.assign(window, { CashRegisterView });
