// ERP App Shell — Sidebar + Routing
function ERPApp() {
  const [view, setView] = useState(() => {
    return localStorage.getItem('erp.activeView') || 'dashboard';
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('erp.theme') || '');
  const { resetData } = useERP();

  useEffect(() => {
    if (theme) document.documentElement.setAttribute('data-theme', theme);
    else document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('erp.theme', theme);
  }, [theme]);

  React.useEffect(() => {
    localStorage.setItem('erp.activeView', view);
  }, [view]);

  const nav = [
    { section: 'Overview', items: [
      { id: 'dashboard', label: 'Dashboard', icon: NAV_ICONS.dashboard },
    ]},
    { section: 'Operations', items: [
      { id: 'inventory', label: 'Inventory', icon: NAV_ICONS.inventory },
      { id: 'tables', label: 'Tables & Reservations', icon: NAV_ICONS.tables },
      { id: 'suppliers', label: 'Suppliers & POs', icon: NAV_ICONS.suppliers },
      { id: 'recipes', label: 'Recipe Costing', icon: NAV_ICONS.recipes },
      { id: 'wastage', label: 'Wastage Tracker', icon: NAV_ICONS.wastage },
    ]},
    { section: 'People', items: [
      { id: 'staff', label: 'Staff & Shifts', icon: NAV_ICONS.staff },
      { id: 'attendance', label: 'Attendance & Leave', icon: NAV_ICONS.attendance },
      { id: 'customers', label: 'Customers', icon: NAV_ICONS.customers },
    ]},
    { section: 'Finance', items: [
      { id: 'finance', label: 'Finance & Expenses', icon: NAV_ICONS.finance },
      { id: 'cashregister', label: 'Cash Register', icon: NAV_ICONS.cashregister },
      { id: 'reports', label: 'Reports', icon: NAV_ICONS.reports },
    ]},
  ];

  const viewMeta = {
    dashboard: { title: 'Dashboard', sub: 'Business overview at a glance' },
    inventory: { title: 'Inventory', sub: 'Track stock levels and reorder points' },
    staff: { title: 'Staff & Shifts', sub: 'Manage team, schedules, and shift swaps' },
    attendance: { title: 'Attendance & Leave', sub: 'Check-in/out, leave balances, and monthly overview' },
    finance: { title: 'Finance & Expenses', sub: 'Revenue, expenses, and profit/loss' },
    cashregister: { title: 'Cash Register', sub: 'Daily cash tracking, UPI/card splits, and reconciliation' },
    suppliers: { title: 'Suppliers & Purchase Orders', sub: 'Vendor management and order tracking' },
    tables: { title: 'Tables & Reservations', sub: 'Floor plan and guest bookings' },
    customers: { title: 'Customers', sub: 'CRM, loyalty tiers, and visit history' },
    reports: { title: 'Reports', sub: 'Comprehensive business analytics' },
    wastage: { title: 'Wastage Tracker', sub: 'Log spoilage, track patterns, and reduce losses' },
    recipes: { title: 'Recipe Costing', sub: 'Ingredient costs, margins, and prep planning' },
  };

  const meta = viewMeta[view] || viewMeta.dashboard;
  const { data } = useERP();
  const lowStock = data.inventory.filter(it => it.stock <= it.reorderLevel).length;
  const pendingSwaps = data.shiftSwaps.filter(s => s.status === 'pending').length;
  const todayAbsent = (data.attendance || []).filter(a => a.date === todayStr() && a.status === 'absent').length;
  const openRegister = (data.cashRegister || []).find(r => r.date === todayStr() && !r.reconciled);

  function getBadge(id) {
    if (id === 'inventory' && lowStock > 0) return lowStock;
    if (id === 'staff' && pendingSwaps > 0) return pendingSwaps;
    if (id === 'attendance' && todayAbsent > 0) return todayAbsent;
    if (id === 'cashregister' && openRegister) return '!';
    return null;
  }

  const viewComponent = {
    dashboard: React.createElement(DashboardView),
    inventory: React.createElement(InventoryView),
    staff: React.createElement(StaffView),
    attendance: React.createElement(AttendanceView),
    finance: React.createElement(FinanceView),
    cashregister: React.createElement(CashRegisterView),
    suppliers: React.createElement(SuppliersView),
    tables: React.createElement(TablesView),
    customers: React.createElement(CustomersView),
    reports: React.createElement(ReportsView),
    wastage: React.createElement(WastageView),
    recipes: React.createElement(RecipesView),
  };

  return React.createElement('div', { className: 'erp-shell' },
    // Sidebar
    React.createElement('aside', { className: 'erp-sidebar' },
      React.createElement('div', { className: 'erp-sidebar-brand' },
        React.createElement('div', null,
          React.createElement('span', null, 'Menu', React.createElement('b', null, 'Studio')),
          React.createElement('small', null, 'ERP')
        )
      ),
      React.createElement('nav', { className: 'erp-nav' },
        nav.map(sec => React.createElement('div', { className: 'erp-nav-section', key: sec.section },
          React.createElement('div', { className: 'erp-nav-label' }, sec.section),
          sec.items.map(item => {
            const badge = getBadge(item.id);
            return React.createElement('button', {
              key: item.id,
              className: `erp-nav-item ${view === item.id ? 'active' : ''}`,
              onClick: () => setView(item.id)
            },
              item.icon,
              React.createElement('span', null, item.label),
              badge && React.createElement('span', { className: 'nav-badge' }, badge)
            );
          })
        ))
      ),
      React.createElement('div', { className: 'erp-sidebar-footer' },
        React.createElement('a', { href: 'index.html' }, 'RasoiDesk'),
        React.createElement('a', { href: 'kitchen.html', target: '_blank' }, 'Kitchen')
      )
    ),

    // Main
    React.createElement('div', { className: 'erp-main' },
      React.createElement('header', { className: 'erp-header' },
        React.createElement('div', { className: 'erp-header-left' },
          React.createElement('h1', null, meta.title),
          React.createElement('p', null, meta.sub)
        ),
        React.createElement('div', { className: 'erp-header-actions' },
          React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => setTheme(t => t === 'light' ? '' : 'light') }, theme === 'light' ? 'Dark Mode' : 'Light Mode'),
          React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => { if (confirm('Reset all ERP data to demo defaults?')) resetData(); } }, 'Reset Demo Data'),
          React.createElement('a', { href: 'index.html', className: 'btn btn-ghost btn-sm', style: { textDecoration: 'none' } }, '← Back to RasoiDesk')
        )
      ),
      React.createElement('div', { className: 'erp-content' },
        viewComponent[view] || viewComponent.dashboard
      )
    )
  );
}

// Mount
const erpRoot = ReactDOM.createRoot(document.getElementById('erp-root'));
erpRoot.render(
  React.createElement(ERPProvider, null,
    React.createElement(ERPApp)
  )
);
