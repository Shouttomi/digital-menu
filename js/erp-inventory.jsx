// ERP Inventory Module
function InventoryView() {
  const { data, addItem, updateItem, deleteItem } = useERP();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [modal, setModal] = useState(null); // null | 'add' | item
  const [confirmDel, setConfirmDel] = useState(null);

  const categories = ['All', ...new Set(data.inventory.map(i => i.category))];
  const filtered = data.inventory.filter(it => {
    if (filterCat !== 'All' && it.category !== filterCat) return false;
    if (search && !it.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const lowStock = data.inventory.filter(it => it.stock <= it.reorderLevel);
  const totalValue = data.inventory.reduce((s, it) => s + it.stock * it.costPerUnit, 0);
  const uniqueCats = new Set(data.inventory.map(i => i.category)).size;

  function handleSave(item) {
    if (item.id) {
      updateItem('inventory', item.id, item);
    } else {
      addItem('inventory', item);
    }
    setModal(null);
  }

  return React.createElement('div', null,
    React.createElement('div', { className: 'kpi-grid' },
      React.createElement(StatCard, { label: 'Total Items', value: data.inventory.length, accent: 'accent-purple' }),
      React.createElement(StatCard, { label: 'Inventory Value', value: formatCurrency(totalValue), accent: 'accent-green' }),
      React.createElement(StatCard, { label: 'Low Stock', value: lowStock.length, delta: lowStock.length > 0 ? 'Reorder needed' : 'All stocked', deltaDir: lowStock.length > 0 ? 'down' : 'up', accent: lowStock.length > 0 ? 'accent-red' : 'accent-green' }),
      React.createElement(StatCard, { label: 'Categories', value: uniqueCats, accent: 'accent-cyan' })
    ),
    React.createElement('div', { className: 'table-panel' },
      React.createElement('div', { className: 'table-panel-header' },
        React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'center' } },
          React.createElement('h3', null, 'Inventory Items'),
          React.createElement(SearchBox, { value: search, onChange: setSearch, placeholder: 'Search items...' })
        ),
        React.createElement('div', { style: { display: 'flex', gap: 8 } },
          React.createElement('select', { style: { background: 'rgba(var(--overlay-rgb),0.04)', border: '1px solid rgba(var(--overlay-rgb),0.08)', borderRadius: 8, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12, fontFamily: 'inherit' }, value: filterCat, onChange: e => setFilterCat(e.target.value) },
            categories.map(c => React.createElement('option', { key: c, value: c }, c))
          ),
          React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: () => setModal('add') }, '+ Add Item')
        )
      ),
      React.createElement('div', { className: 'table-panel-body' },
        React.createElement('table', { className: 'data-table' },
          React.createElement('thead', null,
            React.createElement('tr', null,
              ['Item', 'Category', 'Stock', 'Unit', 'Reorder Level', 'Cost/Unit', 'Supplier', 'Status', 'Actions'].map(h =>
                React.createElement('th', { key: h }, h)
              )
            )
          ),
          React.createElement('tbody', null,
            filtered.map(it => {
              const isLow = it.stock <= it.reorderLevel;
              const pct = Math.min((it.stock / (it.reorderLevel * 3)) * 100, 100);
              return React.createElement('tr', { key: it.id },
                React.createElement('td', { className: 'cell-primary' }, it.name),
                React.createElement('td', null, React.createElement('span', { className: 'badge badge-purple' }, it.category)),
                React.createElement('td', null,
                  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                    React.createElement('span', { className: 'cell-mono', style: { fontWeight: 600, color: isLow ? '#ff4757' : '#e9eaf0' } }, it.stock),
                    React.createElement('div', { className: 'progress-bar', style: { width: 50 } },
                      React.createElement('div', { className: `progress-fill ${isLow ? 'progress-red' : 'progress-green'}`, style: { width: pct + '%' } })
                    )
                  )
                ),
                React.createElement('td', null, it.unit),
                React.createElement('td', { className: 'cell-mono' }, it.reorderLevel),
                React.createElement('td', { className: 'cell-mono' }, formatCurrency(it.costPerUnit)),
                React.createElement('td', null, it.supplier || '-'),
                React.createElement('td', null, React.createElement('span', { className: `badge ${isLow ? 'badge-red' : 'badge-green'}` }, isLow ? 'Low' : 'OK')),
                React.createElement('td', null,
                  React.createElement('div', { style: { display: 'flex', gap: 4 } },
                    React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => setModal(it) }, 'Edit'),
                    React.createElement('button', { className: 'btn btn-danger btn-sm', onClick: () => setConfirmDel(it.id) }, '×')
                  )
                )
              );
            })
          )
        ),
        filtered.length === 0 && React.createElement('div', { className: 'empty-state' }, React.createElement('h3', null, 'No items found'), React.createElement('p', null, 'Try a different search or category.'))
      )
    ),
    modal && React.createElement(InventoryModal, { item: modal === 'add' ? null : modal, onSave: handleSave, onClose: () => setModal(null), suppliers: data.suppliers }),
    confirmDel && React.createElement(ConfirmDialog, { message: 'Delete this inventory item?', onConfirm: () => { deleteItem('inventory', confirmDel); setConfirmDel(null); }, onCancel: () => setConfirmDel(null) })
  );
}

function InventoryModal({ item, onSave, onClose, suppliers }) {
  const [form, setForm] = useState(item ? { ...item } : { name: '', category: 'Beverages', stock: '', unit: 'kg', reorderLevel: '', costPerUnit: '', supplier: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const cats = ['Beverages', 'Dairy', 'Produce', 'Meat & Fish', 'Dry Goods', 'Spices', 'Bakery', 'Packaging', 'Other'];

  return React.createElement(Modal, { title: item ? 'Edit Item' : 'Add Inventory Item', onClose },
    React.createElement('div', { className: 'modal-body' },
      React.createElement(FormField, { label: 'Item Name' }, React.createElement('input', { value: form.name, onChange: e => set('name', e.target.value), placeholder: 'e.g. Espresso Beans' })),
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Category' }, React.createElement('select', { value: form.category, onChange: e => set('category', e.target.value) }, cats.map(c => React.createElement('option', { key: c, value: c }, c)))),
        React.createElement(FormField, { label: 'Unit' }, React.createElement('input', { value: form.unit, onChange: e => set('unit', e.target.value), placeholder: 'kg, L, pcs' }))
      ),
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Current Stock' }, React.createElement('input', { type: 'number', value: form.stock, onChange: e => set('stock', parseFloat(e.target.value) || 0) })),
        React.createElement(FormField, { label: 'Reorder Level' }, React.createElement('input', { type: 'number', value: form.reorderLevel, onChange: e => set('reorderLevel', parseFloat(e.target.value) || 0) }))
      ),
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Cost per Unit (₹)' }, React.createElement('input', { type: 'number', value: form.costPerUnit, onChange: e => set('costPerUnit', parseFloat(e.target.value) || 0) })),
        React.createElement(FormField, { label: 'Supplier' }, React.createElement('select', { value: form.supplier, onChange: e => set('supplier', e.target.value) },
          React.createElement('option', { value: '' }, '- Select -'),
          suppliers.map(s => React.createElement('option', { key: s.id, value: s.name }, s.name))
        ))
      )
    ),
    React.createElement('div', { className: 'modal-footer' },
      React.createElement('button', { className: 'btn btn-ghost', onClick: onClose }, 'Cancel'),
      React.createElement('button', { className: 'btn btn-primary', onClick: () => { if (form.name.trim()) onSave(form); } }, item ? 'Save Changes' : 'Add Item')
    )
  );
}

Object.assign(window, { InventoryView });
