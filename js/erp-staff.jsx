// ERP Staff & Shifts Module
function StaffView() {
  const { data, addItem, updateItem, deleteItem, update } = useERP();
  const [tab, setTab] = useState('roster');
  const [modal, setModal] = useState(null);
  const [swapModal, setSwapModal] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const activeCount = data.staff.filter(s => s.status === 'active').length;
  const onLeave = data.staff.filter(s => s.status === 'on-leave').length;
  const pendingSwaps = data.shiftSwaps.filter(s => s.status === 'pending').length;
  const totalPayroll = data.staff.filter(s => s.status === 'active').reduce((s, st) => s + (st.monthlySalary || 0), 0);

  function handleSaveStaff(item) {
    if (item.id) { updateItem('staff', item.id, item); }
    else { addItem('staff', item); }
    setModal(null);
  }

  function handleSwapAction(swapId, action) {
    update('shiftSwaps', prev => prev.map(s => s.id === swapId ? { ...s, status: action } : s));
  }

  function handleNewSwap(swap) {
    addItem('shiftSwaps', swap);
    setSwapModal(false);
  }

  return React.createElement('div', null,
    React.createElement('div', { className: 'kpi-grid' },
      React.createElement(StatCard, { label: 'Active Staff', value: activeCount, accent: 'accent-green' }),
      React.createElement(StatCard, { label: 'On Leave', value: onLeave, accent: 'accent-yellow' }),
      React.createElement(StatCard, { label: 'Swap Requests', value: pendingSwaps, delta: pendingSwaps > 0 ? 'Pending review' : 'None', deltaDir: pendingSwaps > 0 ? 'down' : 'up', accent: pendingSwaps > 0 ? 'accent-orange' : 'accent-green' }),
      React.createElement(StatCard, { label: 'Monthly Payroll', value: formatCurrency(totalPayroll), accent: 'accent-purple' })
    ),

    React.createElement(TabBar, { tabs: [{ id: 'roster', label: 'Staff Roster' }, { id: 'shifts', label: 'Shift Schedule' }, { id: 'swaps', label: 'Shift Swaps' + (pendingSwaps ? ` (${pendingSwaps})` : '') }], active: tab, onChange: setTab }),

    tab === 'roster' && React.createElement(StaffRoster, { staff: data.staff, onEdit: setModal, onDelete: setConfirmDel, onAdd: () => setModal('add') }),
    tab === 'shifts' && React.createElement(ShiftSchedule, { shifts: data.shifts, staff: data.staff }),
    tab === 'swaps' && React.createElement(ShiftSwaps, { swaps: data.shiftSwaps, staff: data.staff, onAction: handleSwapAction, onNewSwap: () => setSwapModal(true) }),

    modal && React.createElement(StaffModal, { item: modal === 'add' ? null : modal, onSave: handleSaveStaff, onClose: () => setModal(null) }),
    swapModal && React.createElement(SwapRequestModal, { staff: data.staff, shifts: data.shifts, onSave: handleNewSwap, onClose: () => setSwapModal(false) }),
    confirmDel && React.createElement(ConfirmDialog, { message: 'Remove this staff member?', onConfirm: () => { deleteItem('staff', confirmDel); setConfirmDel(null); }, onCancel: () => setConfirmDel(null) })
  );
}

function StaffRoster({ staff, onEdit, onDelete, onAdd }) {
  const [search, setSearch] = useState('');
  const filtered = staff.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase()));
  const avatarClass = (i) => `avatar avatar-${(i % 6) + 1}`;
  const initials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2);

  return React.createElement('div', { className: 'table-panel' },
    React.createElement('div', { className: 'table-panel-header' },
      React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'center' } },
        React.createElement('h3', null, 'Team Members'),
        React.createElement(SearchBox, { value: search, onChange: setSearch, placeholder: 'Search staff...' })
      ),
      React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: onAdd }, '+ Add Staff')
    ),
    React.createElement('div', { className: 'table-panel-body' },
      React.createElement('table', { className: 'data-table' },
        React.createElement('thead', null, React.createElement('tr', null,
          ['', 'Name', 'Role', 'Phone', 'Status', 'Actions'].map(h => React.createElement('th', { key: h }, h))
        )),
        React.createElement('tbody', null,
          filtered.map((s, i) => React.createElement('tr', { key: s.id },
            React.createElement('td', null, React.createElement('div', { className: avatarClass(i) }, initials(s.name))),
            React.createElement('td', { className: 'cell-primary' }, s.name, React.createElement('div', { style: { fontSize: 11, color: 'var(--text-dim)' } }, s.email)),
            React.createElement('td', null, React.createElement('span', { className: 'badge badge-blue' }, s.role)),
            React.createElement('td', { style: { fontSize: 12 } }, s.phone),
            React.createElement('td', null, React.createElement('span', { className: `badge ${s.status === 'active' ? 'badge-green' : s.status === 'on-leave' ? 'badge-yellow' : 'badge-red'}` },
              React.createElement('span', { className: `status-dot ${s.status === 'active' ? 'dot-green' : s.status === 'on-leave' ? 'dot-yellow' : 'dot-red'}` }), s.status
            )),
            React.createElement('td', null,
              React.createElement('div', { style: { display: 'flex', gap: 4 } },
                React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => onEdit(s) }, 'Edit'),
                React.createElement('button', { className: 'btn btn-danger btn-sm', onClick: () => onDelete(s.id) }, '×')
              )
            )
          ))
        )
      )
    )
  );
}

function ShiftSchedule({ shifts, staff }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay() + i);
    return { date: d.toISOString().slice(0, 10), label: d.toLocaleDateString('en', { weekday: 'short' }), day: d.getDate() };
  });

  return React.createElement('div', { className: 'section-card', style: { padding: 0, overflow: 'hidden' } },
    React.createElement('div', { style: { padding: '14px 18px', borderBottom: '1px solid rgba(var(--overlay-rgb),0.06)' } },
      React.createElement('h3', { style: { margin: 0 } }, 'Weekly Schedule'),
      React.createElement('p', { style: { fontSize: 11, color: 'var(--text-dim)', margin: '4px 0 0' } }, 'This week\'s shift assignments')
    ),
    React.createElement('div', { style: { overflowX: 'auto' } },
      React.createElement('div', { className: 'shift-grid' },
        React.createElement('div', { className: 'shift-cell-header' }, 'Staff'),
        days.map(d => React.createElement('div', { className: 'shift-cell-header', key: d.date }, d.label, ' ', d.day)),
        shifts.map((sh, si) => React.createElement(React.Fragment, { key: si },
          React.createElement('div', { className: 'shift-cell-name' },
            React.createElement('div', { className: `avatar avatar-${(si % 6) + 1}`, style: { width: 24, height: 24, fontSize: 9, marginRight: 6 } }, sh.staffName.split(' ').map(w => w[0]).join('').slice(0, 2)),
            React.createElement('span', { style: { fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, sh.staffName)
          ),
          (sh.schedule || []).map((day, di) => React.createElement('div', { className: 'shift-cell', key: di },
            React.createElement('div', { className: `shift-chip shift-${day.shift}` },
              day.shift === 'morning' ? '☀ 7-3' : day.shift === 'afternoon' ? '⛅ 12-8' : day.shift === 'evening' ? '🌙 4-12' : '— Off'
            )
          ))
        ))
      )
    )
  );
}

function ShiftSwaps({ swaps, staff, onAction, onNewSwap }) {
  const pending = swaps.filter(s => s.status === 'pending');
  const resolved = swaps.filter(s => s.status !== 'pending');

  return React.createElement('div', null,
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } },
      React.createElement('h3', { style: { margin: 0, fontSize: 15 } }, 'Shift Swap Requests'),
      React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: onNewSwap }, '+ New Swap Request')
    ),

    pending.length > 0 && React.createElement('div', { style: { marginBottom: 20 } },
      React.createElement('div', { className: 'kpi-label', style: { marginBottom: 10 } }, 'Pending Approval'),
      pending.map(sw => React.createElement('div', { className: 'swap-card', key: sw.id, style: { marginBottom: 8 } },
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 } },
          React.createElement('div', { className: `shift-chip shift-${sw.shiftFrom}`, style: { fontSize: 10, width: 60, textAlign: 'center' } }, sw.shiftFrom),
          React.createElement('div', { className: 'swap-arrow' }, '⇅'),
          React.createElement('div', { className: `shift-chip shift-${sw.shiftTo}`, style: { fontSize: 10, width: 60, textAlign: 'center' } }, sw.shiftTo)
        ),
        React.createElement('div', { className: 'swap-info' },
          React.createElement('div', { className: 'swap-names' }, sw.from, '  ↔  ', sw.to),
          React.createElement('div', { className: 'swap-detail' }, formatDate(sw.date), ' · "', sw.reason, '"')
        ),
        React.createElement('div', { className: 'swap-actions' },
          React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: () => onAction(sw.id, 'approved') }, 'Approve'),
          React.createElement('button', { className: 'btn btn-danger btn-sm', onClick: () => onAction(sw.id, 'rejected') }, 'Reject')
        )
      ))
    ),

    resolved.length > 0 && React.createElement('div', null,
      React.createElement('div', { className: 'kpi-label', style: { marginBottom: 10 } }, 'History'),
      resolved.map(sw => React.createElement('div', { className: 'swap-card', key: sw.id, style: { marginBottom: 8, opacity: 0.7 } },
        React.createElement('div', { className: 'swap-info' },
          React.createElement('div', { className: 'swap-names' }, sw.from, '  ↔  ', sw.to),
          React.createElement('div', { className: 'swap-detail' }, formatDate(sw.date), ' · ', sw.shiftFrom, ' ↔ ', sw.shiftTo)
        ),
        React.createElement('span', { className: `badge ${sw.status === 'approved' ? 'badge-green' : 'badge-red'}` }, sw.status)
      ))
    ),

    swaps.length === 0 && React.createElement('div', { className: 'empty-state' }, React.createElement('h3', null, 'No swap requests yet'), React.createElement('p', null, 'Staff can request shift swaps here.'))
  );
}

function StaffModal({ item, onSave, onClose }) {
  const [form, setForm] = useState(item ? { ...item } : { name: '', role: 'Server', phone: '', email: '', monthlySalary: 18000, status: 'active' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const roles = ['Manager', 'Head Chef', 'Sous Chef', 'Barista', 'Server', 'Kitchen Staff', 'Cleaner', 'Cashier'];

  return React.createElement(Modal, { title: item ? 'Edit Staff' : 'Add Staff Member', onClose },
    React.createElement('div', { className: 'modal-body' },
      React.createElement(FormField, { label: 'Full Name' }, React.createElement('input', { value: form.name, onChange: e => set('name', e.target.value), placeholder: 'e.g. Priya Sharma' })),
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Role' }, React.createElement('select', { value: form.role, onChange: e => set('role', e.target.value) }, roles.map(r => React.createElement('option', { key: r, value: r }, r)))),
        React.createElement(FormField, { label: 'Status' }, React.createElement('select', { value: form.status, onChange: e => set('status', e.target.value) }, ['active', 'on-leave', 'inactive'].map(s => React.createElement('option', { key: s, value: s }, s))))
      ),
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Phone' }, React.createElement('input', { value: form.phone, onChange: e => set('phone', e.target.value) })),
        React.createElement(FormField, { label: 'Email' }, React.createElement('input', { value: form.email, onChange: e => set('email', e.target.value) }))
      ),
      React.createElement(FormField, { label: 'Monthly Salary (₹)' }, React.createElement('input', { type: 'number', value: form.monthlySalary, onChange: e => set('monthlySalary', parseFloat(e.target.value) || 0) }))
    ),
    React.createElement('div', { className: 'modal-footer' },
      React.createElement('button', { className: 'btn btn-ghost', onClick: onClose }, 'Cancel'),
      React.createElement('button', { className: 'btn btn-primary', onClick: () => { if (form.name.trim()) onSave(form); } }, item ? 'Save' : 'Add Staff')
    )
  );
}

function SwapRequestModal({ staff, shifts, onSave, onClose }) {
  const activeStaff = staff.filter(s => s.status === 'active');
  const [form, setForm] = useState({ from: activeStaff[0]?.name || '', to: activeStaff[1]?.name || '', date: todayStr(), shiftFrom: 'morning', shiftTo: 'evening', reason: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const shiftOpts = ['morning', 'afternoon', 'evening'];

  return React.createElement(Modal, { title: 'New Shift Swap Request', onClose },
    React.createElement('div', { className: 'modal-body' },
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Requesting Staff' }, React.createElement('select', { value: form.from, onChange: e => set('from', e.target.value) }, activeStaff.map(s => React.createElement('option', { key: s.id, value: s.name }, s.name)))),
        React.createElement(FormField, { label: 'Swap With' }, React.createElement('select', { value: form.to, onChange: e => set('to', e.target.value) }, activeStaff.filter(s => s.name !== form.from).map(s => React.createElement('option', { key: s.id, value: s.name }, s.name))))
      ),
      React.createElement(FormField, { label: 'Date' }, React.createElement('input', { type: 'date', value: form.date, onChange: e => set('date', e.target.value) })),
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Current Shift' }, React.createElement('select', { value: form.shiftFrom, onChange: e => set('shiftFrom', e.target.value) }, shiftOpts.map(s => React.createElement('option', { key: s, value: s }, s)))),
        React.createElement(FormField, { label: 'Desired Shift' }, React.createElement('select', { value: form.shiftTo, onChange: e => set('shiftTo', e.target.value) }, shiftOpts.map(s => React.createElement('option', { key: s, value: s }, s))))
      ),
      React.createElement(FormField, { label: 'Reason' }, React.createElement('textarea', { value: form.reason, onChange: e => set('reason', e.target.value), rows: 2, placeholder: 'e.g. Doctor appointment...' }))
    ),
    React.createElement('div', { className: 'modal-footer' },
      React.createElement('button', { className: 'btn btn-ghost', onClick: onClose }, 'Cancel'),
      React.createElement('button', { className: 'btn btn-primary', onClick: () => { if (form.from && form.to && form.from !== form.to) onSave({ ...form, status: 'pending' }); } }, 'Submit Request')
    )
  );
}

Object.assign(window, { StaffView });
