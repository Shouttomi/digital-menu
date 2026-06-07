// ERP Tables, Reservations & Customers
function TablesView() {
  const { data, addItem, updateItem, deleteItem } = useERP();
  const [tab, setTab] = useState('map');
  const [resModal, setResModal] = useState(null);
  const [tableModal, setTableModal] = useState(null);

  const available = data.tables.filter(t => t.status === 'available').length;
  const occupied = data.tables.filter(t => t.status === 'occupied').length;
  const reserved = data.tables.filter(t => t.status === 'reserved').length;
  const todayRes = data.reservations.filter(r => r.date === todayStr());
  const totalSeats = data.tables.reduce((s, t) => s + t.seats, 0);

  function cycleTableStatus(t) {
    const next = { available: 'occupied', occupied: 'reserved', reserved: 'available' };
    updateItem('tables', t.id, { status: next[t.status] });
  }

  function handleSaveRes(item) {
    if (item.id) updateItem('reservations', item.id, item);
    else addItem('reservations', item);
    setResModal(null);
  }

  function handleSaveTable(item) {
    if (item.id) updateItem('tables', item.id, item);
    else addItem('tables', item);
    setTableModal(null);
  }

  return React.createElement('div', null,
    React.createElement('div', { className: 'kpi-grid' },
      React.createElement(StatCard, { label: 'Available', value: available + '/' + data.tables.length, accent: 'accent-green' }),
      React.createElement(StatCard, { label: 'Occupied', value: occupied, accent: 'accent-red' }),
      React.createElement(StatCard, { label: 'Reserved', value: reserved, accent: 'accent-gold' }),
      React.createElement(StatCard, { label: 'Today\'s Reservations', value: todayRes.length, accent: 'accent-purple' })
    ),
    React.createElement(TabBar, { tabs: [{ id: 'map', label: 'Table Map' }, { id: 'reservations', label: 'Reservations' }], active: tab, onChange: setTab }),

    tab === 'map' && React.createElement('div', null,
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 } },
        React.createElement('div', { style: { display: 'flex', gap: 14, fontSize: 11, color: 'var(--text-dim)' } },
          React.createElement('span', null, React.createElement('span', { className: 'status-dot dot-green' }), ' Available'),
          React.createElement('span', null, React.createElement('span', { className: 'status-dot dot-red' }), ' Occupied'),
          React.createElement('span', null, React.createElement('span', { className: 'status-dot dot-yellow' }), ' Reserved'),
          React.createElement('span', { style: { color: 'var(--text-muted)' } }, totalSeats, ' total seats')
        ),
        React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: () => setTableModal('add') }, '+ Add Table')
      ),
      // Group by floor
      [...new Set(data.tables.map(t => t.floor))].map(floor =>
        React.createElement('div', { key: floor, style: { marginBottom: 20 } },
          React.createElement('div', { className: 'kpi-label', style: { marginBottom: 10 } }, floor),
          React.createElement('div', { className: 'table-map' },
            data.tables.filter(t => t.floor === floor).map(t => {
              const stClass = { available: 'table-available', occupied: 'table-occupied', reserved: 'table-reserved' };
              const stColor = { available: '#18b08a', occupied: '#ff4757', reserved: '#ffc200' };
              return React.createElement('div', { key: t.id, className: `table-spot ${stClass[t.status]}`, onClick: () => cycleTableStatus(t), title: 'Click to change status' },
                React.createElement('div', { className: 'table-number', style: { color: stColor[t.status] } }, t.number),
                React.createElement('div', { className: 'table-seats' }, t.seats, ' seats'),
                React.createElement('div', { className: 'table-status-label', style: { color: stColor[t.status] } }, t.status)
              );
            })
          )
        )
      )
    ),

    tab === 'reservations' && React.createElement('div', { className: 'table-panel' },
      React.createElement('div', { className: 'table-panel-header' },
        React.createElement('h3', null, 'Reservations'),
        React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: () => setResModal('add') }, '+ New Reservation')
      ),
      React.createElement('div', { className: 'table-panel-body' },
        React.createElement('table', { className: 'data-table' },
          React.createElement('thead', null, React.createElement('tr', null,
            ['Date', 'Time', 'Guest', 'Phone', 'Party Size', 'Status', 'Notes', 'Actions'].map(h => React.createElement('th', { key: h }, h))
          )),
          React.createElement('tbody', null, data.reservations.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).map(r => {
            const stBadge = { confirmed: 'badge-green', pending: 'badge-yellow', cancelled: 'badge-red' };
            return React.createElement('tr', { key: r.id },
              React.createElement('td', null, formatDate(r.date)),
              React.createElement('td', { className: 'cell-mono' }, formatTime(r.time)),
              React.createElement('td', { className: 'cell-primary' }, r.guestName),
              React.createElement('td', { style: { fontSize: 12 } }, r.phone),
              React.createElement('td', null, r.partySize, ' pax'),
              React.createElement('td', null, React.createElement('span', { className: `badge ${stBadge[r.status] || 'badge-gray'}`, style: { cursor: 'pointer' }, onClick: () => {
                const next = { confirmed: 'cancelled', pending: 'confirmed', cancelled: 'pending' };
                updateItem('reservations', r.id, { status: next[r.status] });
              } }, r.status)),
              React.createElement('td', { style: { fontSize: 11, color: 'var(--text-dim)', maxWidth: 150 } }, r.notes || '—'),
              React.createElement('td', null, React.createElement('div', { style: { display: 'flex', gap: 4 } },
                React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => setResModal(r) }, 'Edit'),
                React.createElement('button', { className: 'btn btn-danger btn-sm', onClick: () => deleteItem('reservations', r.id) }, '×')
              ))
            );
          }))
        )
      )
    ),

    resModal && React.createElement(ReservationModal, { item: resModal === 'add' ? null : resModal, onSave: handleSaveRes, onClose: () => setResModal(null) }),
    tableModal && React.createElement(TableModal, { onSave: handleSaveTable, onClose: () => setTableModal(null) })
  );
}

function ReservationModal({ item, onSave, onClose }) {
  const [form, setForm] = useState(item ? { ...item } : { guestName: '', phone: '', date: todayStr(), time: '19:00', partySize: 2, status: 'pending', notes: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return React.createElement(Modal, { title: item ? 'Edit Reservation' : 'New Reservation', onClose },
    React.createElement('div', { className: 'modal-body' },
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Guest Name' }, React.createElement('input', { value: form.guestName, onChange: e => set('guestName', e.target.value) })),
        React.createElement(FormField, { label: 'Phone' }, React.createElement('input', { value: form.phone, onChange: e => set('phone', e.target.value) }))
      ),
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Date' }, React.createElement('input', { type: 'date', value: form.date, onChange: e => set('date', e.target.value) })),
        React.createElement(FormField, { label: 'Time' }, React.createElement('input', { type: 'time', value: form.time, onChange: e => set('time', e.target.value) }))
      ),
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Party Size' }, React.createElement('input', { type: 'number', min: 1, value: form.partySize, onChange: e => set('partySize', parseInt(e.target.value) || 1) })),
        React.createElement(FormField, { label: 'Status' }, React.createElement('select', { value: form.status, onChange: e => set('status', e.target.value) }, ['pending', 'confirmed', 'cancelled'].map(s => React.createElement('option', { key: s, value: s }, s))))
      ),
      React.createElement(FormField, { label: 'Notes' }, React.createElement('textarea', { value: form.notes, onChange: e => set('notes', e.target.value), rows: 2 }))
    ),
    React.createElement('div', { className: 'modal-footer' },
      React.createElement('button', { className: 'btn btn-ghost', onClick: onClose }, 'Cancel'),
      React.createElement('button', { className: 'btn btn-primary', onClick: () => { if (form.guestName.trim()) onSave(form); } }, item ? 'Save' : 'Add Reservation')
    )
  );
}

function TableModal({ onSave, onClose }) {
  const [form, setForm] = useState({ number: '', seats: 2, status: 'available', floor: 'Main' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return React.createElement(Modal, { title: 'Add Table', onClose },
    React.createElement('div', { className: 'modal-body' },
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Table Number' }, React.createElement('input', { type: 'number', value: form.number, onChange: e => set('number', parseInt(e.target.value) || 0) })),
        React.createElement(FormField, { label: 'Seats' }, React.createElement('input', { type: 'number', min: 1, value: form.seats, onChange: e => set('seats', parseInt(e.target.value) || 1) }))
      ),
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Floor' }, React.createElement('select', { value: form.floor, onChange: e => set('floor', e.target.value) }, ['Main', 'Patio', 'Upstairs', 'Private'].map(f => React.createElement('option', { key: f, value: f }, f)))),
        React.createElement(FormField, { label: 'Status' }, React.createElement('select', { value: form.status, onChange: e => set('status', e.target.value) }, ['available', 'occupied', 'reserved'].map(s => React.createElement('option', { key: s, value: s }, s))))
      )
    ),
    React.createElement('div', { className: 'modal-footer' },
      React.createElement('button', { className: 'btn btn-ghost', onClick: onClose }, 'Cancel'),
      React.createElement('button', { className: 'btn btn-primary', onClick: () => { if (form.number) onSave(form); } }, 'Add Table')
    )
  );
}

// ===== Customer CRM =====
function CustomersView() {
  const { data, addItem, updateItem, deleteItem } = useERP();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const filtered = data.customers.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone || '').includes(search));
  const totalCustomers = data.customers.length;
  const totalSpent = data.customers.reduce((s, c) => s + c.totalSpent, 0);
  const avgVisits = Math.round(data.customers.reduce((s, c) => s + c.visits, 0) / (totalCustomers || 1));
  const loyaltyColors = { Platinum: '#6b5cff', Gold: '#ffc200', Silver: '#8b8e9b', Bronze: '#cd7f32' };

  function handleSave(item) {
    if (item.id) updateItem('customers', item.id, item);
    else addItem('customers', item);
    setModal(null);
  }

  return React.createElement('div', null,
    React.createElement('div', { className: 'kpi-grid' },
      React.createElement(StatCard, { label: 'Total Customers', value: totalCustomers, accent: 'accent-purple' }),
      React.createElement(StatCard, { label: 'Lifetime Revenue', value: formatCurrency(totalSpent), accent: 'accent-green' }),
      React.createElement(StatCard, { label: 'Avg Visits', value: avgVisits, accent: 'accent-cyan' }),
      React.createElement(StatCard, { label: 'Platinum Members', value: data.customers.filter(c => c.loyalty === 'Platinum').length, accent: 'accent-gold' })
    ),
    React.createElement('div', { className: 'table-panel' },
      React.createElement('div', { className: 'table-panel-header' },
        React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'center' } },
          React.createElement('h3', null, 'Customer Directory'),
          React.createElement(SearchBox, { value: search, onChange: setSearch, placeholder: 'Search by name or phone...' })
        ),
        React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: () => setModal('add') }, '+ Add Customer')
      ),
      React.createElement('div', { className: 'table-panel-body' },
        React.createElement('table', { className: 'data-table' },
          React.createElement('thead', null, React.createElement('tr', null,
            ['Customer', 'Phone', 'Visits', 'Total Spent', 'Last Visit', 'Loyalty', 'Notes', 'Actions'].map(h => React.createElement('th', { key: h }, h))
          )),
          React.createElement('tbody', null, filtered.sort((a, b) => b.totalSpent - a.totalSpent).map((c, i) =>
            React.createElement('tr', { key: c.id },
              React.createElement('td', null,
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                  React.createElement('div', { className: `avatar avatar-${(i % 6) + 1}` }, c.name.split(' ').map(w => w[0]).join('').slice(0, 2)),
                  React.createElement('div', null,
                    React.createElement('div', { className: 'cell-primary' }, c.name),
                    c.email && React.createElement('div', { style: { fontSize: 11, color: 'var(--text-dim)' } }, c.email)
                  )
                )
              ),
              React.createElement('td', { style: { fontSize: 12 } }, c.phone),
              React.createElement('td', { className: 'cell-mono', style: { fontWeight: 600 } }, c.visits),
              React.createElement('td', { className: 'cell-mono', style: { fontWeight: 600, color: 'var(--success)' } }, formatCurrency(c.totalSpent)),
              React.createElement('td', null, formatDate(c.lastVisit)),
              React.createElement('td', null, React.createElement('span', { className: 'badge', style: { background: `${loyaltyColors[c.loyalty]}22`, color: loyaltyColors[c.loyalty] } }, c.loyalty)),
              React.createElement('td', { style: { fontSize: 11, color: 'var(--text-dim)', maxWidth: 150 } }, c.notes || '—'),
              React.createElement('td', null, React.createElement('div', { style: { display: 'flex', gap: 4 } },
                React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => setModal(c) }, 'Edit'),
                React.createElement('button', { className: 'btn btn-danger btn-sm', onClick: () => setConfirmDel(c.id) }, '×')
              ))
            )
          ))
        )
      )
    ),
    modal && React.createElement(CustomerModal, { item: modal === 'add' ? null : modal, onSave: handleSave, onClose: () => setModal(null) }),
    confirmDel && React.createElement(ConfirmDialog, { message: 'Remove this customer?', onConfirm: () => { deleteItem('customers', confirmDel); setConfirmDel(null); }, onCancel: () => setConfirmDel(null) })
  );
}

function CustomerModal({ item, onSave, onClose }) {
  const [form, setForm] = useState(item ? { ...item } : { name: '', phone: '', email: '', visits: 0, totalSpent: 0, lastVisit: todayStr(), loyalty: 'Bronze', notes: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return React.createElement(Modal, { title: item ? 'Edit Customer' : 'Add Customer', onClose },
    React.createElement('div', { className: 'modal-body' },
      React.createElement(FormField, { label: 'Name' }, React.createElement('input', { value: form.name, onChange: e => set('name', e.target.value) })),
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Phone' }, React.createElement('input', { value: form.phone, onChange: e => set('phone', e.target.value) })),
        React.createElement(FormField, { label: 'Email' }, React.createElement('input', { value: form.email, onChange: e => set('email', e.target.value) }))
      ),
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Visits' }, React.createElement('input', { type: 'number', value: form.visits, onChange: e => set('visits', parseInt(e.target.value) || 0) })),
        React.createElement(FormField, { label: 'Total Spent (₹)' }, React.createElement('input', { type: 'number', value: form.totalSpent, onChange: e => set('totalSpent', parseFloat(e.target.value) || 0) }))
      ),
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Loyalty Tier' }, React.createElement('select', { value: form.loyalty, onChange: e => set('loyalty', e.target.value) }, ['Bronze', 'Silver', 'Gold', 'Platinum'].map(l => React.createElement('option', { key: l, value: l }, l)))),
        React.createElement(FormField, { label: 'Last Visit' }, React.createElement('input', { type: 'date', value: form.lastVisit, onChange: e => set('lastVisit', e.target.value) }))
      ),
      React.createElement(FormField, { label: 'Notes' }, React.createElement('textarea', { value: form.notes, onChange: e => set('notes', e.target.value), rows: 2 }))
    ),
    React.createElement('div', { className: 'modal-footer' },
      React.createElement('button', { className: 'btn btn-ghost', onClick: onClose }, 'Cancel'),
      React.createElement('button', { className: 'btn btn-primary', onClick: () => { if (form.name.trim()) onSave(form); } }, item ? 'Save' : 'Add Customer')
    )
  );
}

Object.assign(window, { TablesView, CustomersView });
