// ERP Recipe / Prep Costing
function RecipesView() {
  const { data, addItem, updateItem, deleteItem } = useERP();
  const [modal, setModal] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [tab, setTab] = useState('recipes');

  const recipes = data.recipes || [];

  // Margin analysis
  const margins = recipes.map(r => {
    const cost = r.ingredients.reduce((s, ig) => s + ig.cost, 0) / (r.servings || 1);
    const margin = r.sellingPrice - cost;
    const pct = r.sellingPrice > 0 ? Math.round((margin / r.sellingPrice) * 100) : 0;
    return { ...r, costPerServing: cost, margin, marginPct: pct };
  });

  const avgMargin = margins.length ? Math.round(margins.reduce((s, m) => s + m.marginPct, 0) / margins.length) : 0;
  const bestMargin = margins.length ? margins.reduce((best, m) => m.marginPct > best.marginPct ? m : best) : null;
  const worstMargin = margins.length ? margins.reduce((worst, m) => m.marginPct < worst.marginPct ? m : worst) : null;

  function handleSave(recipe) {
    if (recipe.id) { updateItem('recipes', recipe.id, recipe); }
    else { addItem('recipes', recipe); }
    setModal(null);
  }

  const catColors = { Beverages: '#6ab4ff', Food: '#ff6b3d', Desserts: '#6b5cff' };

  return React.createElement('div', null,
    React.createElement(TabBar, { tabs: [
      { id: 'recipes', label: 'Recipes' },
      { id: 'margins', label: 'Margin Analysis' },
    ], active: tab, onChange: setTab }),

    tab === 'recipes' && React.createElement('div', null,
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 } },
        React.createElement('h3', { style: { margin: 0, fontSize: 15 } }, recipes.length, ' Recipes'),
        React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: () => setModal('add') }, '+ Add Recipe')
      ),

      React.createElement('div', { className: 'kpi-grid' },
        React.createElement(StatCard, { label: 'Total Recipes', value: recipes.length, accent: 'accent-cyan' }),
        React.createElement(StatCard, { label: 'Avg Margin', value: avgMargin + '%', deltaDir: avgMargin >= 60 ? 'up' : 'down', delta: avgMargin >= 60 ? 'Healthy' : 'Needs review', accent: avgMargin >= 60 ? 'accent-green' : 'accent-yellow' }),
        React.createElement(StatCard, { label: 'Best Margin', value: bestMargin ? bestMargin.name : '—', delta: bestMargin ? bestMargin.marginPct + '%' : '', deltaDir: 'up', accent: 'accent-green' }),
        React.createElement(StatCard, { label: 'Lowest Margin', value: worstMargin ? worstMargin.name : '—', delta: worstMargin ? worstMargin.marginPct + '%' : '', deltaDir: 'down', accent: 'accent-red' })
      ),

      // Recipe cards grid
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 } },
        margins.map(r => React.createElement('div', { key: r.id, className: 'section-card', style: { cursor: 'pointer', marginBottom: 0 }, onClick: () => setModal(r) },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 } },
            React.createElement('div', null,
              React.createElement('h3', { style: { margin: '0 0 4px', fontSize: 15 } }, r.name),
              React.createElement('span', { className: 'badge', style: { background: (catColors[r.category] || '#8b8e9b') + '22', color: catColors[r.category] || '#8b8e9b' } }, r.category)
            ),
            React.createElement('div', { style: { textAlign: 'right' } },
              React.createElement('div', { style: { fontSize: 20, fontWeight: 800, fontFamily: "'Space Grotesk', monospace", color: 'var(--text-primary)' } }, formatCurrency(r.sellingPrice)),
              React.createElement('div', { style: { fontSize: 10, color: 'var(--text-dim)' } }, r.servings > 1 ? r.servings + ' servings' : 'per serving')
            )
          ),
          // Ingredients list
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 } },
            r.ingredients.map((ig, i) => React.createElement('div', { key: i, style: { display: 'flex', justifyContent: 'space-between', fontSize: 12 } },
              React.createElement('span', { style: { color: 'var(--text-secondary)' } }, ig.item, ' — ', ig.qty, ig.unit),
              React.createElement('span', { style: { color: 'var(--text-muted)', fontFamily: "'Space Grotesk', monospace" } }, formatCurrency(ig.cost))
            ))
          ),
          // Cost + margin bar
          React.createElement('div', { style: { borderTop: '1px solid rgba(var(--overlay-rgb),0.06)', paddingTop: 10 } },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 } },
              React.createElement('span', { style: { color: 'var(--text-muted)' } }, 'Cost: ', formatCurrency(Math.round(r.costPerServing)), '/serving'),
              React.createElement('span', { style: { fontWeight: 700, color: r.marginPct >= 60 ? 'var(--success)' : r.marginPct >= 40 ? 'var(--warning)' : 'var(--danger)' } }, r.marginPct, '% margin')
            ),
            React.createElement('div', { className: 'progress-bar' },
              React.createElement('div', { className: 'progress-fill', style: { width: Math.min(r.marginPct, 100) + '%', background: r.marginPct >= 60 ? 'var(--success)' : r.marginPct >= 40 ? 'var(--warning)' : 'var(--danger)' } })
            )
          )
        ))
      )
    ),

    tab === 'margins' && React.createElement('div', null,
      React.createElement('div', { className: 'section-card', style: { marginBottom: 16 } },
        React.createElement('h3', null, 'Margin Comparison'),
        React.createElement(SimpleBarChart, { data: margins.map(m => ({
          label: m.name.length > 10 ? m.name.slice(0, 9) + '…' : m.name,
          value: m.marginPct,
          shortValue: m.marginPct + '%',
          color: m.marginPct >= 60 ? '#18b08a' : m.marginPct >= 40 ? '#ffc200' : '#ff4757',
        })), height: 170 })
      ),
      React.createElement('div', { className: 'table-panel' },
        React.createElement('div', { className: 'table-panel-header' },
          React.createElement('h3', { style: { margin: 0 } }, 'Detailed Breakdown')
        ),
        React.createElement('div', { className: 'table-panel-body' },
          React.createElement('table', { className: 'data-table' },
            React.createElement('thead', null, React.createElement('tr', null,
              ['Recipe', 'Category', 'Selling Price', 'Food Cost', 'Margin', 'Margin %'].map(h => React.createElement('th', { key: h }, h))
            )),
            React.createElement('tbody', null,
              margins.sort((a, b) => b.marginPct - a.marginPct).map(m => React.createElement('tr', { key: m.id },
                React.createElement('td', { className: 'cell-primary' }, m.name),
                React.createElement('td', null, React.createElement('span', { className: 'badge', style: { background: (catColors[m.category] || '#8b8e9b') + '22', color: catColors[m.category] || '#8b8e9b' } }, m.category)),
                React.createElement('td', { className: 'cell-mono' }, formatCurrency(m.sellingPrice)),
                React.createElement('td', { className: 'cell-mono', style: { color: 'var(--danger)' } }, formatCurrency(Math.round(m.costPerServing))),
                React.createElement('td', { className: 'cell-mono', style: { color: 'var(--success)', fontWeight: 700 } }, formatCurrency(Math.round(m.margin))),
                React.createElement('td', null,
                  React.createElement('span', { className: `badge ${m.marginPct >= 60 ? 'badge-green' : m.marginPct >= 40 ? 'badge-yellow' : 'badge-red'}` }, m.marginPct, '%')
                )
              ))
            )
          )
        )
      )
    ),

    modal && modal !== 'add' && React.createElement(RecipeModal, { item: modal, inventory: data.inventory, onSave: handleSave, onDelete: () => { setConfirmDel(modal.id); setModal(null); }, onClose: () => setModal(null) }),
    modal === 'add' && React.createElement(RecipeModal, { item: null, inventory: data.inventory, onSave: handleSave, onClose: () => setModal(null) }),
    confirmDel && React.createElement(ConfirmDialog, { message: 'Delete this recipe?', onConfirm: () => { deleteItem('recipes', confirmDel); setConfirmDel(null); }, onCancel: () => setConfirmDel(null) })
  );
}

function RecipeModal({ item, inventory, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(item ? { ...item, ingredients: [...item.ingredients] } : {
    name: '', category: 'Food', servings: 1, sellingPrice: 0, ingredients: [{ item: inventory[0]?.name || '', qty: 0, unit: 'g', cost: 0 }]
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function updateIngredient(i, field, val) {
    const ings = [...form.ingredients];
    ings[i] = { ...ings[i], [field]: val };
    if (field === 'item') {
      const inv = inventory.find(x => x.name === val);
      if (inv) ings[i].unit = inv.unit === 'kg' ? 'g' : inv.unit === 'L' ? 'ml' : inv.unit;
    }
    setForm(f => ({ ...f, ingredients: ings }));
  }
  function removeIngredient(i) { setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) })); }
  function addIngredient() { setForm(f => ({ ...f, ingredients: [...f.ingredients, { item: '', qty: 0, unit: 'g', cost: 0 }] })); }

  const totalCost = form.ingredients.reduce((s, ig) => s + (ig.cost || 0), 0);
  const costPerServing = form.servings > 0 ? totalCost / form.servings : totalCost;
  const margin = form.sellingPrice - costPerServing;
  const marginPct = form.sellingPrice > 0 ? Math.round((margin / form.sellingPrice) * 100) : 0;

  return React.createElement(Modal, { title: item ? 'Edit Recipe' : 'New Recipe', onClose, wide: true },
    React.createElement('div', { className: 'modal-body' },
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Recipe Name' }, React.createElement('input', { value: form.name, onChange: e => set('name', e.target.value), placeholder: 'e.g. Masala Chai' })),
        React.createElement(FormField, { label: 'Category' }, React.createElement('select', { value: form.category, onChange: e => set('category', e.target.value) },
          ['Beverages', 'Food', 'Desserts', 'Snacks'].map(c => React.createElement('option', { key: c, value: c }, c))
        ))
      ),
      React.createElement('div', { className: 'field-row' },
        React.createElement(FormField, { label: 'Servings per batch' }, React.createElement('input', { type: 'number', value: form.servings, min: 1, onChange: e => set('servings', parseInt(e.target.value) || 1) })),
        React.createElement(FormField, { label: 'Selling Price (₹/serving)' }, React.createElement('input', { type: 'number', value: form.sellingPrice, onChange: e => set('sellingPrice', parseFloat(e.target.value) || 0) }))
      ),

      // Ingredients
      React.createElement('div', { style: { marginTop: 8 } },
        React.createElement('label', { style: { fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)' } }, 'Ingredients'),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 } },
          form.ingredients.map((ig, i) => React.createElement('div', { key: i, style: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'end' } },
            React.createElement('input', { value: ig.item, onChange: e => updateIngredient(i, 'item', e.target.value), placeholder: 'Item name',
              style: { padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(var(--overlay-rgb),0.08)', background: 'rgba(var(--overlay-rgb),0.04)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: 12 }
            }),
            React.createElement('input', { type: 'number', value: ig.qty, onChange: e => updateIngredient(i, 'qty', parseFloat(e.target.value) || 0), placeholder: 'Qty',
              style: { padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(var(--overlay-rgb),0.08)', background: 'rgba(var(--overlay-rgb),0.04)', color: 'var(--text-primary)', fontFamily: "'Space Grotesk', monospace", fontSize: 12 }
            }),
            React.createElement('input', { value: ig.unit, onChange: e => updateIngredient(i, 'unit', e.target.value), placeholder: 'Unit',
              style: { padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(var(--overlay-rgb),0.08)', background: 'rgba(var(--overlay-rgb),0.04)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: 12 }
            }),
            React.createElement('input', { type: 'number', value: ig.cost, onChange: e => updateIngredient(i, 'cost', parseFloat(e.target.value) || 0), placeholder: '₹',
              style: { padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(var(--overlay-rgb),0.08)', background: 'rgba(var(--overlay-rgb),0.04)', color: 'var(--text-primary)', fontFamily: "'Space Grotesk', monospace", fontSize: 12 }
            }),
            React.createElement('button', { className: 'btn btn-danger btn-sm', onClick: () => removeIngredient(i), style: { padding: '8px 10px' } }, '×')
          ))
        ),
        React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: addIngredient, style: { marginTop: 8 } }, '+ Add Ingredient')
      ),

      // Live cost summary
      React.createElement('div', { style: { marginTop: 16, padding: '14px 16px', borderRadius: 12, background: 'rgba(var(--overlay-rgb),0.03)', border: '1px solid rgba(var(--overlay-rgb),0.06)' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 } },
          React.createElement('span', { style: { color: 'var(--text-muted)' } }, 'Total ingredient cost'),
          React.createElement('span', { style: { fontFamily: "'Space Grotesk', monospace", fontWeight: 600 } }, formatCurrency(Math.round(totalCost)))
        ),
        form.servings > 1 && React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 } },
          React.createElement('span', { style: { color: 'var(--text-muted)' } }, 'Cost per serving (÷', form.servings, ')'),
          React.createElement('span', { style: { fontFamily: "'Space Grotesk', monospace", fontWeight: 600 } }, formatCurrency(Math.round(costPerServing)))
        ),
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, paddingTop: 8, borderTop: '1px solid rgba(var(--overlay-rgb),0.06)' } },
          React.createElement('span', { style: { color: margin >= 0 ? 'var(--success)' : 'var(--danger)' } }, 'Margin'),
          React.createElement('span', { style: { fontFamily: "'Space Grotesk', monospace", color: margin >= 0 ? 'var(--success)' : 'var(--danger)' } }, formatCurrency(Math.round(margin)), ' (', marginPct, '%)')
        )
      )
    ),
    React.createElement('div', { className: 'modal-footer' },
      item && onDelete && React.createElement('button', { className: 'btn btn-danger btn-sm', onClick: onDelete, style: { marginRight: 'auto' } }, 'Delete'),
      React.createElement('button', { className: 'btn btn-ghost', onClick: onClose }, 'Cancel'),
      React.createElement('button', { className: 'btn btn-primary', onClick: () => { if (form.name.trim()) onSave(form); } }, item ? 'Save' : 'Add Recipe')
    )
  );
}

Object.assign(window, { RecipesView });
