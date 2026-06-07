// ERP Operations — Suppliers & Purchase Orders
function SuppliersView() {
  const { data, addItem, updateItem, deleteItem } = useERP();
  const [tab, setTab] = useState('suppliers');
  const [modal, setModal] = useState(null);
  const [poModal, setPoModal] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const pending = data.purchaseOrders.filter(p => p.status === 'pending').length;
  const inTransit = data.purchaseOrders.filter(p => p.status === 'in-transit').length;
  const totalPO = data.purchaseOrders.reduce((s, p) => s + p.total, 0);

  function handleSaveSupplier(item) {
    if (item.id) updateItem('suppliers', item.id, item);
    else addItem('suppliers', item);
    setModal(null);
  }

  function handleSavePO(po) { addItem('purchaseOrders', po); setPoModal(false); }

  function cyclePOStatus(po) {
    const next = { pending: 'in-transit', 'in-transit': 'delivered', delivered: 'pending' };
    updateItem('purchaseOrders', po.id, { status: next[po.status] });
  }

  return React.createElement('div', null,
    React.createElement('div', { className: 'kpi-grid' },
      React.createElement(StatCard, { label: 'Suppliers', value: data.suppliers.length, accent: 'accent-purple' }),
      React.createElement(StatCard, { label: 'Pending POs', value: pending, accent: pending > 0 ? 'accent-orange' : 'accent-green' }),
      React.createElement(StatCard, { label: 'In Transit', value: inTransit, accent: 'accent-cyan' }),
      React.createElement(StatCard, { label: 'Total PO Value', value: formatCurrency(totalPO), accent: 'accent-gold' })
    ),
    React.createElement(TabBar, { tabs: [{ id: 'suppliers', label: 'Suppliers' }, { id: 'orders', label: 'Purchase Orders' }], active: tab, onChange: setTab }),

    tab === 'suppliers' && React.createElement('div', { className: 'table-panel' },
      React.createElement('div', { className: 'table-panel-header' },
        React.createElement('h3', null, 'Supplier Directory'),
        React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: () => setModal('add') }, '+ Add Supplier')
      ),
      React.createElement('div', { className: 'table-panel-body' },
        React.createElement('table', { className: 'data-table' },
          React.createElement('thead', null, React.createElement('tr', null,
            ['Name', 'Contact', 'Phone', 'Category', 'Payment Terms', 'Rating', 'Actions'].map(h => React.createElement('th', { key: h }, h))
          )),
          React.createElement('tbody', null, data.suppliers.map(s =>
            React.createElement('tr', { key: s.id },
              React.createElement('td', { className: 'cell-primary' }, s.name, React.createElement('div', { style: { fontSize: 11, color: 'var(--text-dim)' } }, s.email)),
              React.createElement('td', null, s.contact),
              React.createElement('td', { style: { fontSize: 12 } }, s.phone),
              React.createElement('td', null, React.createElement('span', { className: 'badge badge-blue' }, s.category)),
              React.createElement('td', null, React.createElement('span', { className: 'badge badge-gray' }, s.paymentTerms)),
              React.createElement('td', null, React.createElement(StarRating, { value: s.rating })),
              React.createElement('td', null, React.createElement('div', { style: { display: 'flex', gap: 4 } },
                React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => setModal(s) }, 'Edit'),
                React.createElement('button', { className: 'btn btn-danger btn-sm', onClick: () => setConfirmDel(s.id) }, '×')
              ))
            )
          ))
        )
      )
    ),

    tab === 'orders' && React.createElement('div', { className: 'table-panel' },
      React.createElement('div', { className: 'table-panel-header' },
        React.createElement('h3', null, 'Purchase Orders'),
        React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: () => setPoModal(true) }, '+ New PO')
      ),
      React.createElement('div', { className: 'table-panel-body' },
        React.createElement('table', { className: 'data-table' },
          React.createElement('thead', null, React.createElement('tr', null,
            ['Date', 'Supplier', 'Items', 'Total', 'Status', 'Actions'].map(h => React.createElement('th', { key: h }, h))
          )),
          React.createElement('tbody', null, data.purchaseOrders.sort((a, b) => b.date.localeCompare(a.date)).map(po => {
            const stBadge = { pending: 'badge-yellow', 'in-transit': 'badge-blue', delivered: 'badge-green' };
            return React.createElement('tr', { key: po.id },
              React.createElement('td', null, formatDate(po.date)),
              React.createElement('td', { className: 'cell-primary' }, po.supplier),
              React.createElement('td', { style: { maxWidth: 220, fontSize: 12, color: 'var(--text-secondary)' } }, po.items),
              React.createElement('td', { className: 'cell-mono', style: { fontWeight: 600 } }, formatCurrency(po.total)),
              React.createElement('td', null, React.createElement('span', { className: `badge ${stBadge[po.status] || 'badge-gray'}`, style: { cursor: 'pointer' }, onClick: () => cyclePOStatus(po), title: 'Click to cycle status' }, po.status)),
              React.createElement('td', null, React.createElement('button', { className: 'btn btn-danger btn-sm', onClick: () => deleteItem('purchaseOrders', po.id) }, '×'))
            );
          }))
        )
      )
    ),

    modal && React.createElement(SupplierModal, { item: modal === 'add' ? null : modal, onSave: handleSaveSupplier, onClose: () => setModal(null) }),
    poModal && React.createElement(POModal, { suppliers: data.suppliers, onSave: handleSavePO, onClose: () => setPoModal(false) }),
    confirmDel && React.createElement(ConfirmDialog, { message: 'Remove this supplier?', onConfirm: () => { deleteItem('suppliers', confirmDel); setConfirmDel(null); }, onCancel: () => setConfirmDel(null) })
  );
}

function SupplierModal({ item, onSave, onClose }) {
  const [form, setForm] = useState(item ? { ...item } : { name: '', contact: '', phone: '', email: '', category: 'Produce', paymentTerms: 'Net 15', rating: 4 });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return React.createElement(Modal, { title: item ? 'Edit Supplier' : 'Add Supplier', onClose },
    React.createElement('div', { className: 'modal-body' },
      React.createElement(FormField, { label: 'Company Name' }, React.createElement('input', { value: form.name, onChange: e => set('name', e.target.value) })),
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Contact Person' }, React.createElement('input', { value: form.contact, onChange: e => set('contact', e.target.value) })),
        React.createElement(FormField, { label: 'Phone' }, React.createElement('input', { value: form.phone, onChange: e => set('phone', e.target.value) }))
      ),
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Email' }, React.createElement('input', { value: form.email, onChange: e => set('email', e.target.value) })),
        React.createElement(FormField, { label: 'Category' }, React.createElement('input', { value: form.category, onChange: e => set('category', e.target.value) }))
      ),
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Payment Terms' }, React.createElement('select', { value: form.paymentTerms, onChange: e => set('paymentTerms', e.target.value) }, ['COD', 'Net 7', 'Net 15', 'Net 30'].map(t => React.createElement('option', { key: t, value: t }, t)))),
        React.createElement(FormField, { label: 'Rating (1-5)' }, React.createElement('input', { type: 'number', min: 1, max: 5, step: 0.5, value: form.rating, onChange: e => set('rating', parseFloat(e.target.value) || 4) }))
      )
    ),
    React.createElement('div', { className: 'modal-footer' },
      React.createElement('button', { className: 'btn btn-ghost', onClick: onClose }, 'Cancel'),
      React.createElement('button', { className: 'btn btn-primary', onClick: () => { if (form.name.trim()) onSave(form); } }, item ? 'Save' : 'Add Supplier')
    )
  );
}

function POModal({ suppliers, onSave, onClose }) {
  const [form, setForm] = useState({ supplier: suppliers[0]?.name || '', items: '', total: '', date: todayStr(), status: 'pending' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return React.createElement(Modal, { title: 'New Purchase Order', onClose },
    React.createElement('div', { className: 'modal-body' },
      React.createElement(FormField, { label: 'Supplier' }, React.createElement('select', { value: form.supplier, onChange: e => set('supplier', e.target.value) }, suppliers.map(s => React.createElement('option', { key: s.id, value: s.name }, s.name)))),
      React.createElement(FormField, { label: 'Items Ordered' }, React.createElement('textarea', { value: form.items, onChange: e => set('items', e.target.value), rows: 2, placeholder: 'e.g. Espresso Beans ×5kg, Milk ×20L' })),
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Total Amount (₹)' }, React.createElement('input', { type: 'number', value: form.total, onChange: e => set('total', parseFloat(e.target.value) || 0) })),
        React.createElement(FormField, { label: 'Date' }, React.createElement('input', { type: 'date', value: form.date, onChange: e => set('date', e.target.value) }))
      )
    ),
    React.createElement('div', { className: 'modal-footer' },
      React.createElement('button', { className: 'btn btn-ghost', onClick: onClose }, 'Cancel'),
      React.createElement('button', { className: 'btn btn-primary', onClick: () => { if (form.supplier && form.items.trim()) onSave(form); } }, 'Create PO')
    )
  );
}

Object.assign(window, { SuppliersView });
