// ERP Data Store — localStorage persistence + default demo data
const { useState, useEffect, useCallback, createContext, useContext } = React;

const ERPContext = createContext(null);

function useERP() { return useContext(ERPContext); }

function generateId() { return Math.random().toString(36).slice(2, 10); }

function todayStr() { return new Date().toISOString().slice(0, 10); }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); }
function daysFromNow(n) { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
function formatCurrency(n) { return '₹' + Number(n || 0).toLocaleString('en-IN'); }
function formatDate(d) { if (!d) return ''; return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
function formatTime(t) { if (!t) return ''; const [h, m] = t.split(':'); const hr = parseInt(h); return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`; }

// Expose utilities globally
Object.assign(window, { generateId, todayStr, daysAgo, daysFromNow, formatCurrency, formatDate, formatTime, useERP, ERPContext });

const ERP_KEY = 'erpStudio.v2';

function getDefaultData() {
  return {
    inventory: [
      { id: generateId(), name: 'Espresso Beans', category: 'Beverages', stock: 2.5, unit: 'kg', reorderLevel: 1, costPerUnit: 1200, supplier: 'Metro Coffee Roasters' },
      { id: generateId(), name: 'Whole Milk', category: 'Dairy', stock: 15, unit: 'L', reorderLevel: 5, costPerUnit: 60, supplier: 'Dairy Best' },
      { id: generateId(), name: 'Oat Milk', category: 'Dairy', stock: 8, unit: 'L', reorderLevel: 3, costPerUnit: 180, supplier: 'Dairy Best' },
      { id: generateId(), name: 'All-Purpose Flour', category: 'Dry Goods', stock: 10, unit: 'kg', reorderLevel: 3, costPerUnit: 55, supplier: "Baker's Choice" },
      { id: generateId(), name: 'Butter', category: 'Dairy', stock: 5, unit: 'kg', reorderLevel: 2, costPerUnit: 480, supplier: 'Dairy Best' },
      { id: generateId(), name: 'Sugar', category: 'Dry Goods', stock: 8, unit: 'kg', reorderLevel: 2, costPerUnit: 42, supplier: "Baker's Choice" },
      { id: generateId(), name: 'Avocados', category: 'Produce', stock: 20, unit: 'pcs', reorderLevel: 8, costPerUnit: 45, supplier: 'Fresh Farms Co.' },
      { id: generateId(), name: 'Eggs', category: 'Produce', stock: 2, unit: 'dozen', reorderLevel: 3, costPerUnit: 96, supplier: 'Fresh Farms Co.' },
      { id: generateId(), name: 'Sourdough Bread', category: 'Bakery', stock: 12, unit: 'loaves', reorderLevel: 4, costPerUnit: 85, supplier: "Baker's Choice" },
      { id: generateId(), name: 'Dark Chocolate 70%', category: 'Dry Goods', stock: 3, unit: 'kg', reorderLevel: 1, costPerUnit: 650, supplier: "Baker's Choice" },
      { id: generateId(), name: 'Vanilla Extract', category: 'Spices', stock: 0.5, unit: 'L', reorderLevel: 0.2, costPerUnit: 3200, supplier: "Baker's Choice" },
      { id: generateId(), name: 'Salmon Fillet', category: 'Meat & Fish', stock: 2, unit: 'kg', reorderLevel: 1, costPerUnit: 1400, supplier: 'Fresh Farms Co.' },
      { id: generateId(), name: 'Cinnamon Powder', category: 'Spices', stock: 0.8, unit: 'kg', reorderLevel: 0.3, costPerUnit: 480, supplier: "Baker's Choice" },
      { id: generateId(), name: 'Paper Cups (12oz)', category: 'Packaging', stock: 150, unit: 'pcs', reorderLevel: 50, costPerUnit: 4, supplier: 'PackMart' },
      { id: generateId(), name: 'Napkins', category: 'Packaging', stock: 300, unit: 'pcs', reorderLevel: 100, costPerUnit: 1.5, supplier: 'PackMart' },
    ],
    staff: [
      { id: generateId(), name: 'Priya Sharma', role: 'Manager', phone: '+91 98765 43210', email: 'priya@aurora.cafe', monthlySalary: 45000, status: 'active' },
      { id: generateId(), name: 'Arjun Patel', role: 'Head Chef', phone: '+91 98765 43211', email: 'arjun@aurora.cafe', monthlySalary: 40000, status: 'active' },
      { id: generateId(), name: 'Meera Reddy', role: 'Barista', phone: '+91 98765 43212', email: 'meera@aurora.cafe', monthlySalary: 22000, status: 'active' },
      { id: generateId(), name: 'Rahul Kumar', role: 'Sous Chef', phone: '+91 98765 43213', email: 'rahul@aurora.cafe', monthlySalary: 32000, status: 'active' },
      { id: generateId(), name: 'Anita Singh', role: 'Server', phone: '+91 98765 43214', email: 'anita@aurora.cafe', monthlySalary: 18000, status: 'active' },
      { id: generateId(), name: 'Dev Mehta', role: 'Server', phone: '+91 98765 43215', email: 'dev@aurora.cafe', monthlySalary: 18000, status: 'active' },
      { id: generateId(), name: 'Sneha Joshi', role: 'Barista', phone: '+91 98765 43216', email: 'sneha@aurora.cafe', monthlySalary: 22000, status: 'on-leave' },
    ],
    shifts: [], // populated below
    shiftSwaps: [],
    suppliers: [
      { id: generateId(), name: 'Fresh Farms Co.', contact: 'Vikram Desai', phone: '+91 99887 76655', email: 'orders@freshfarms.in', category: 'Produce', paymentTerms: 'Net 15', rating: 4.5 },
      { id: generateId(), name: 'Metro Coffee Roasters', contact: 'Rajan Nair', phone: '+91 99887 76656', email: 'sales@metrocoffee.in', category: 'Coffee', paymentTerms: 'Net 30', rating: 5 },
      { id: generateId(), name: 'Dairy Best', contact: 'Sunita Rao', phone: '+91 99887 76657', email: 'supply@dairybest.in', category: 'Dairy', paymentTerms: 'COD', rating: 4 },
      { id: generateId(), name: "Baker's Choice", contact: 'Amir Khan', phone: '+91 99887 76658', email: 'orders@bakerschoice.in', category: 'Bakery & Dry Goods', paymentTerms: 'Net 7', rating: 4.5 },
      { id: generateId(), name: 'PackMart', contact: 'Lisa Fernandes', phone: '+91 99887 76659', email: 'lisa@packmart.in', category: 'Packaging', paymentTerms: 'Net 15', rating: 3.5 },
    ],
    purchaseOrders: [
      { id: generateId(), supplier: 'Fresh Farms Co.', items: 'Avocados ×40, Eggs ×5dz, Salmon ×3kg', total: 7480, status: 'delivered', date: daysAgo(2) },
      { id: generateId(), supplier: 'Metro Coffee Roasters', items: 'Espresso Beans ×5kg', total: 6000, status: 'in-transit', date: daysAgo(1) },
      { id: generateId(), supplier: 'Dairy Best', items: 'Whole Milk ×20L, Oat Milk ×10L, Butter ×3kg', total: 4440, status: 'pending', date: todayStr() },
      { id: generateId(), supplier: "Baker's Choice", items: 'Flour ×10kg, Chocolate ×2kg, Vanilla ×0.5L', total: 3450, status: 'delivered', date: daysAgo(5) },
    ],
    tables: [
      { id: generateId(), number: 1, seats: 2, status: 'available', floor: 'Main' },
      { id: generateId(), number: 2, seats: 2, status: 'occupied', floor: 'Main' },
      { id: generateId(), number: 3, seats: 4, status: 'available', floor: 'Main' },
      { id: generateId(), number: 4, seats: 4, status: 'reserved', floor: 'Main' },
      { id: generateId(), number: 5, seats: 6, status: 'occupied', floor: 'Main' },
      { id: generateId(), number: 6, seats: 2, status: 'available', floor: 'Patio' },
      { id: generateId(), number: 7, seats: 4, status: 'available', floor: 'Patio' },
      { id: generateId(), number: 8, seats: 8, status: 'reserved', floor: 'Patio' },
      { id: generateId(), number: 9, seats: 2, status: 'available', floor: 'Upstairs' },
      { id: generateId(), number: 10, seats: 6, status: 'available', floor: 'Upstairs' },
    ],
    reservations: [
      { id: generateId(), guestName: 'Kavita Nair', phone: '+91 98001 11111', date: todayStr(), time: '12:30', partySize: 4, tableId: null, status: 'confirmed', notes: 'Birthday celebration' },
      { id: generateId(), guestName: 'Ravi Menon', phone: '+91 98001 22222', date: todayStr(), time: '19:00', partySize: 2, tableId: null, status: 'confirmed', notes: '' },
      { id: generateId(), guestName: 'Corporate Group', phone: '+91 98001 33333', date: daysFromNow(1), time: '13:00', partySize: 8, tableId: null, status: 'pending', notes: 'Need projector setup' },
      { id: generateId(), guestName: 'Anjali & Rohan', phone: '+91 98001 44444', date: daysFromNow(2), time: '20:00', partySize: 2, tableId: null, status: 'confirmed', notes: 'Anniversary dinner' },
    ],
    customers: [
      { id: generateId(), name: 'Kavita Nair', phone: '+91 98001 11111', email: 'kavita@gmail.com', visits: 23, totalSpent: 18400, lastVisit: daysAgo(3), loyalty: 'Gold', notes: 'Prefers window seating' },
      { id: generateId(), name: 'Ravi Menon', phone: '+91 98001 22222', email: 'ravi.m@outlook.com', visits: 45, totalSpent: 34200, lastVisit: daysAgo(1), loyalty: 'Platinum', notes: 'Regular — flat white, no sugar' },
      { id: generateId(), name: 'Preethi Das', phone: '+91 98001 55555', email: 'preethi@gmail.com', visits: 8, totalSpent: 5600, lastVisit: daysAgo(7), loyalty: 'Silver', notes: 'Vegan — always asks for oat milk' },
      { id: generateId(), name: 'Sameer Gupta', phone: '+91 98001 66666', email: 'sameer.g@yahoo.com', visits: 15, totalSpent: 12800, lastVisit: daysAgo(2), loyalty: 'Gold', notes: '' },
      { id: generateId(), name: 'Nisha Jain', phone: '+91 98001 77777', email: 'nisha.j@gmail.com', visits: 3, totalSpent: 2100, lastVisit: daysAgo(14), loyalty: 'Bronze', notes: 'New customer, tried brunch menu' },
      { id: generateId(), name: 'Aarav Iyer', phone: '+91 98001 88888', email: '', visits: 31, totalSpent: 24600, lastVisit: todayStr(), loyalty: 'Platinum', notes: 'Brings laptop, stays 3-4 hrs' },
    ],
    expenses: [
      { id: generateId(), date: daysAgo(0), category: 'Ingredients', description: 'Weekly produce order', amount: 12400, method: 'Bank Transfer' },
      { id: generateId(), date: daysAgo(1), category: 'Utilities', description: 'Electricity bill — June', amount: 8500, method: 'Online' },
      { id: generateId(), date: daysAgo(2), category: 'Salaries', description: 'Staff salaries — first half', amount: 85000, method: 'Bank Transfer' },
      { id: generateId(), date: daysAgo(3), category: 'Maintenance', description: 'Espresso machine servicing', amount: 4500, method: 'Cash' },
      { id: generateId(), date: daysAgo(5), category: 'Rent', description: 'Monthly rent — June', amount: 120000, method: 'Bank Transfer' },
      { id: generateId(), date: daysAgo(6), category: 'Marketing', description: 'Instagram ads — weekly', amount: 3500, method: 'Online' },
      { id: generateId(), date: daysAgo(7), category: 'Ingredients', description: 'Coffee beans restock', amount: 6000, method: 'UPI' },
      { id: generateId(), date: daysAgo(8), category: 'Insurance', description: 'Quarterly fire insurance', amount: 15000, method: 'Bank Transfer' },
      { id: generateId(), date: daysAgo(10), category: 'Miscellaneous', description: 'New menu printing', amount: 2200, method: 'Cash' },
      { id: generateId(), date: daysAgo(12), category: 'Ingredients', description: 'Bakery supplies', amount: 8900, method: 'UPI' },
    ],
    revenue: Array.from({ length: 30 }, (_, i) => ({
      date: daysAgo(29 - i),
      amount: Math.round(15000 + Math.random() * 18000 + (i > 20 ? 5000 : 0) + ([5,6,12,13,19,20,26,27].includes(i) ? 8000 : 0)),
      orders: Math.round(30 + Math.random() * 40 + ([5,6,12,13,19,20,26,27].includes(i) ? 20 : 0)),
    })),
  };
}

function populateShifts(data) {
  const shiftTypes = ['morning', 'afternoon', 'evening', 'off'];
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay() + i);
    return d.toISOString().slice(0, 10);
  });
  data.shifts = data.staff.map(s => ({
    staffId: s.id,
    staffName: s.name,
    schedule: days.map((day, di) => ({
      date: day,
      shift: s.status === 'on-leave' ? 'off' : shiftTypes[(s.name.charCodeAt(0) + di) % 3],
    })),
  }));
  // Demo shift swaps
  if (data.staff.length >= 3) {
    data.shiftSwaps = [
      { id: generateId(), from: data.staff[2].name, to: data.staff[4]?.name || data.staff[1].name, date: days[3], shiftFrom: 'morning', shiftTo: 'evening', status: 'pending', reason: 'Doctor appointment in the morning' },
      { id: generateId(), from: data.staff[5]?.name || data.staff[1].name, to: data.staff[3]?.name || data.staff[0].name, date: days[5], shiftFrom: 'afternoon', shiftTo: 'morning', status: 'approved', reason: 'Family event' },
    ];
  }
  return data;
}

function loadERPData() {
  try {
    const saved = localStorage.getItem(ERP_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { console.warn('ERP load failed', e); }
  return populateShifts(getDefaultData());
}

function ERPProvider({ children }) {
  const [data, setData] = useState(loadERPData);

  useEffect(() => {
    localStorage.setItem(ERP_KEY, JSON.stringify(data));
  }, [data]);

  const update = useCallback((key, updater) => {
    setData(prev => {
      const next = { ...prev };
      next[key] = typeof updater === 'function' ? updater(prev[key]) : updater;
      return next;
    });
  }, []);

  const addItem = useCallback((key, item) => {
    update(key, prev => [...prev, { id: generateId(), ...item }]);
  }, [update]);

  const updateItem = useCallback((key, id, changes) => {
    update(key, prev => prev.map(it => it.id === id ? { ...it, ...changes } : it));
  }, [update]);

  const deleteItem = useCallback((key, id) => {
    update(key, prev => prev.filter(it => it.id !== id));
  }, [update]);

  const resetData = useCallback(() => {
    const fresh = populateShifts(getDefaultData());
    setData(fresh);
  }, []);

  const value = { data, setData, update, addItem, updateItem, deleteItem, resetData };
  return React.createElement(ERPContext.Provider, { value }, children);
}

Object.assign(window, { ERPProvider });
