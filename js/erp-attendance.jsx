// ERP Attendance & Leave Tracker
function AttendanceView() {
  const { data, update } = useERP();
  const [tab, setTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [leaveModal, setLeaveModal] = useState(null);

  const activeStaff = data.staff.filter(s => s.status !== 'inactive');
  const todayRecords = (data.attendance || []).filter(a => a.date === selectedDate);
  const leaveBalances = data.leaveBalances || [];

  // Stats
  const present = todayRecords.filter(a => a.status === 'present' || a.status === 'late').length;
  const absent = todayRecords.filter(a => a.status === 'absent').length;
  const late = todayRecords.filter(a => a.status === 'late').length;
  const halfDay = todayRecords.filter(a => a.status === 'half-day').length;
  const notMarked = activeStaff.length - todayRecords.length;

  // Ensure records exist for all staff on selected date
  function ensureRecords() {
    const existing = new Set(todayRecords.map(a => a.staffId));
    const missing = activeStaff.filter(s => !existing.has(s.id));
    if (missing.length > 0) {
      update('attendance', prev => [
        ...prev,
        ...missing.map(s => ({ id: generateId(), staffId: s.id, staffName: s.name, date: selectedDate, checkIn: null, checkOut: null, status: 'absent', leaveType: null, notes: '' }))
      ]);
    }
  }

  function markCheckIn(staffId) {
    const now = new Date();
    const time = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    const isLate = now.getHours() >= 10;
    const rec = todayRecords.find(a => a.staffId === staffId);
    if (rec) {
      update('attendance', prev => prev.map(a =>
        a.id === rec.id ? { ...a, checkIn: time, status: isLate ? 'late' : 'present' } : a
      ));
    } else {
      update('attendance', prev => [...prev, {
        id: generateId(), staffId, staffName: activeStaff.find(s => s.id === staffId)?.name || '',
        date: selectedDate, checkIn: time, checkOut: null, status: isLate ? 'late' : 'present', leaveType: null, notes: ''
      }]);
    }
  }

  function markCheckOut(staffId) {
    const now = new Date();
    const time = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    const rec = todayRecords.find(a => a.staffId === staffId);
    if (rec) {
      update('attendance', prev => prev.map(a => a.id === rec.id ? { ...a, checkOut: time } : a));
    }
  }

  function markStatus(staffId, status) {
    const rec = todayRecords.find(a => a.staffId === staffId);
    if (rec) {
      update('attendance', prev => prev.map(a => a.id === rec.id ? { ...a, status } : a));
    }
  }

  function handleLeaveApply(staffId, leaveType) {
    const rec = todayRecords.find(a => a.staffId === staffId);
    if (rec) {
      update('attendance', prev => prev.map(a =>
        a.id === rec.id ? { ...a, status: 'absent', leaveType } : a
      ));
    }
    // Deduct from balance
    const balKey = leaveType + 'Used';
    update('leaveBalances', prev => prev.map(lb =>
      lb.staffId === staffId ? { ...lb, [balKey]: (lb[balKey] || 0) + 1 } : lb
    ));
    setLeaveModal(null);
  }

  // Monthly overview data
  const last30 = [];
  for (let i = 29; i >= 0; i--) { last30.push(daysAgo(i)); }
  const monthlyByStaff = activeStaff.map(s => {
    const records = (data.attendance || []).filter(a => a.staffId === s.id && last30.includes(a.date));
    const presentDays = records.filter(a => a.status === 'present' || a.status === 'late').length;
    const absentDays = records.filter(a => a.status === 'absent').length;
    const lateDays = records.filter(a => a.status === 'late').length;
    const halfDays = records.filter(a => a.status === 'half-day').length;
    // Calculate avg hours
    const withHours = records.filter(a => a.checkIn && a.checkOut);
    let avgHrs = 0;
    if (withHours.length > 0) {
      const totalMins = withHours.reduce((s, a) => {
        const [h1, m1] = a.checkIn.split(':').map(Number);
        const [h2, m2] = a.checkOut.split(':').map(Number);
        return s + (h2 * 60 + m2) - (h1 * 60 + m1);
      }, 0);
      avgHrs = Math.round((totalMins / withHours.length / 60) * 10) / 10;
    }
    return { ...s, presentDays, absentDays, lateDays, halfDays, avgHrs, totalRecords: records.length };
  });

  const statusColors = { present: '#18b08a', late: '#ffc200', absent: '#ff4757', 'half-day': '#6b5cff' };
  const statusLabels = { present: 'Present', late: 'Late', absent: 'Absent', 'half-day': 'Half Day' };

  return React.createElement('div', null,
    React.createElement(TabBar, { tabs: [
      { id: 'today', label: 'Daily Attendance' },
      { id: 'monthly', label: 'Monthly Overview' },
      { id: 'leaves', label: 'Leave Balances' },
    ], active: tab, onChange: setTab }),

    tab === 'today' && React.createElement('div', null,
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 } },
        React.createElement('input', { type: 'date', value: selectedDate, onChange: e => setSelectedDate(e.target.value),
          style: { padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(var(--overlay-rgb),0.08)', background: 'rgba(var(--overlay-rgb),0.04)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: 13 }
        }),
        React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: ensureRecords }, 'Initialize All Staff')
      ),

      React.createElement('div', { className: 'kpi-grid' },
        React.createElement(StatCard, { label: 'Present', value: present, accent: 'accent-green' }),
        React.createElement(StatCard, { label: 'Absent', value: absent, accent: 'accent-red' }),
        React.createElement(StatCard, { label: 'Late Arrivals', value: late, accent: 'accent-yellow' }),
        React.createElement(StatCard, { label: 'Half Day', value: halfDay, accent: 'accent-purple' })
      ),

      // Staff attendance cards
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        activeStaff.map((s, i) => {
          const rec = todayRecords.find(a => a.staffId === s.id);
          const status = rec ? rec.status : 'not-marked';
          const checkIn = rec?.checkIn;
          const checkOut = rec?.checkOut;

          return React.createElement('div', { key: s.id, className: 'section-card', style: { padding: '14px 18px', marginBottom: 0, display: 'flex', alignItems: 'center', gap: 14 } },
            React.createElement('div', { className: `avatar avatar-${(i % 6) + 1}`, style: { width: 36, height: 36, fontSize: 12 } },
              s.name.split(' ').map(w => w[0]).join('').slice(0, 2)
            ),
            React.createElement('div', { style: { flex: 1, minWidth: 0 } },
              React.createElement('div', { style: { fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' } }, s.name),
              React.createElement('div', { style: { fontSize: 11, color: 'var(--text-dim)' } }, s.role)
            ),
            // Check-in/out times
            React.createElement('div', { style: { display: 'flex', gap: 16, alignItems: 'center', fontSize: 12 } },
              React.createElement('div', { style: { textAlign: 'center' } },
                React.createElement('div', { style: { fontSize: 9, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' } }, 'In'),
                React.createElement('div', { style: { fontFamily: "'Space Grotesk', monospace", fontWeight: 600, color: checkIn ? 'var(--success)' : 'var(--text-faint)' } }, checkIn ? formatTime(checkIn) : '—')
              ),
              React.createElement('div', { style: { textAlign: 'center' } },
                React.createElement('div', { style: { fontSize: 9, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' } }, 'Out'),
                React.createElement('div', { style: { fontFamily: "'Space Grotesk', monospace", fontWeight: 600, color: checkOut ? 'var(--danger)' : 'var(--text-faint)' } }, checkOut ? formatTime(checkOut) : '—')
              ),
              // Hours worked
              checkIn && checkOut && React.createElement('div', { style: { textAlign: 'center' } },
                React.createElement('div', { style: { fontSize: 9, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' } }, 'Hours'),
                React.createElement('div', { style: { fontFamily: "'Space Grotesk', monospace", fontWeight: 600, color: 'var(--text-primary)' } },
                  (() => { const [h1, m1] = checkIn.split(':').map(Number); const [h2, m2] = checkOut.split(':').map(Number); const mins = (h2 * 60 + m2) - (h1 * 60 + m1); return (mins / 60).toFixed(1) + 'h'; })()
                )
              )
            ),
            // Status badge
            React.createElement('span', { className: `badge ${status === 'present' ? 'badge-green' : status === 'late' ? 'badge-yellow' : status === 'absent' ? 'badge-red' : status === 'half-day' ? 'badge-purple' : 'badge-gray'}` },
              React.createElement('span', { className: `status-dot ${status === 'present' ? 'dot-green' : status === 'late' ? 'dot-yellow' : status === 'absent' ? 'dot-red' : 'dot-blue'}` }),
              statusLabels[status] || 'Not Marked'
            ),
            // Action buttons
            React.createElement('div', { style: { display: 'flex', gap: 4 } },
              !checkIn && React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: () => markCheckIn(s.id) }, 'Check In'),
              checkIn && !checkOut && React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => markCheckOut(s.id) }, 'Check Out'),
              rec && React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => setLeaveModal(s.id), title: 'Mark Leave' }, '📋')
            )
          );
        })
      )
    ),

    tab === 'monthly' && React.createElement('div', null,
      React.createElement('div', { className: 'section-card', style: { marginBottom: 16 } },
        React.createElement('h3', null, 'Last 30 Days Summary'),
        React.createElement('p', { style: { fontSize: 12, color: 'var(--text-dim)', margin: '-8px 0 14px' } }, 'Attendance overview per staff member')
      ),
      React.createElement('div', { className: 'table-panel' },
        React.createElement('div', { className: 'table-panel-body' },
          React.createElement('table', { className: 'data-table' },
            React.createElement('thead', null, React.createElement('tr', null,
              ['Staff', 'Role', 'Present', 'Absent', 'Late', 'Half Day', 'Avg Hours', 'Attendance %'].map(h => React.createElement('th', { key: h }, h))
            )),
            React.createElement('tbody', null,
              monthlyByStaff.map((s, i) => {
                const pct = s.totalRecords > 0 ? Math.round(((s.presentDays + s.lateDays) / s.totalRecords) * 100) : 0;
                return React.createElement('tr', { key: s.id },
                  React.createElement('td', null,
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                      React.createElement('div', { className: `avatar avatar-${(i % 6) + 1}`, style: { width: 26, height: 26, fontSize: 9 } }, s.name.split(' ').map(w => w[0]).join('').slice(0, 2)),
                      React.createElement('span', { className: 'cell-primary' }, s.name)
                    )
                  ),
                  React.createElement('td', null, React.createElement('span', { className: 'badge badge-blue' }, s.role)),
                  React.createElement('td', { className: 'cell-mono', style: { color: 'var(--success)' } }, s.presentDays),
                  React.createElement('td', { className: 'cell-mono', style: { color: 'var(--danger)' } }, s.absentDays),
                  React.createElement('td', { className: 'cell-mono', style: { color: 'var(--warning)' } }, s.lateDays),
                  React.createElement('td', { className: 'cell-mono', style: { color: 'var(--purple)' } }, s.halfDays),
                  React.createElement('td', { className: 'cell-mono' }, s.avgHrs > 0 ? s.avgHrs + 'h' : '—'),
                  React.createElement('td', null,
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                      React.createElement('div', { className: 'progress-bar', style: { flex: 1, minWidth: 60 } },
                        React.createElement('div', { className: 'progress-fill', style: { width: pct + '%', background: pct >= 85 ? 'var(--success)' : pct >= 70 ? 'var(--warning)' : 'var(--danger)' } })
                      ),
                      React.createElement('span', { style: { fontSize: 11, fontWeight: 700, fontFamily: "'Space Grotesk', monospace", color: pct >= 85 ? 'var(--success)' : pct >= 70 ? 'var(--warning)' : 'var(--danger)' } }, pct, '%')
                    )
                  )
                );
              })
            )
          )
        )
      )
    ),

    tab === 'leaves' && React.createElement('div', null,
      React.createElement('div', { className: 'section-card', style: { marginBottom: 16 } },
        React.createElement('h3', null, 'Leave Balances'),
        React.createElement('p', { style: { fontSize: 12, color: 'var(--text-dim)', margin: '-8px 0 0' } }, 'Annual leave allocation and usage per staff')
      ),
      React.createElement('div', { className: 'table-panel' },
        React.createElement('div', { className: 'table-panel-body' },
          React.createElement('table', { className: 'data-table' },
            React.createElement('thead', null, React.createElement('tr', null,
              ['Staff', 'Casual (Used/Total)', 'Sick (Used/Total)', 'Earned (Used/Total)', 'Total Remaining'].map(h => React.createElement('th', { key: h }, h))
            )),
            React.createElement('tbody', null,
              leaveBalances.map((lb, i) => {
                const casualRem = lb.casual - (lb.casualUsed || 0);
                const sickRem = lb.sick - (lb.sickUsed || 0);
                const earnedRem = lb.earned - (lb.earnedUsed || 0);
                const totalRem = casualRem + sickRem + earnedRem;
                return React.createElement('tr', { key: lb.staffId },
                  React.createElement('td', null,
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                      React.createElement('div', { className: `avatar avatar-${(i % 6) + 1}`, style: { width: 26, height: 26, fontSize: 9 } }, lb.staffName.split(' ').map(w => w[0]).join('').slice(0, 2)),
                      React.createElement('span', { className: 'cell-primary' }, lb.staffName)
                    )
                  ),
                  React.createElement('td', null,
                    React.createElement('span', { className: 'cell-mono' }, lb.casualUsed || 0, '/', lb.casual),
                    React.createElement('span', { style: { fontSize: 10, color: casualRem <= 2 ? 'var(--danger)' : 'var(--success)', marginLeft: 6 } }, casualRem, ' left')
                  ),
                  React.createElement('td', null,
                    React.createElement('span', { className: 'cell-mono' }, lb.sickUsed || 0, '/', lb.sick),
                    React.createElement('span', { style: { fontSize: 10, color: sickRem <= 1 ? 'var(--danger)' : 'var(--success)', marginLeft: 6 } }, sickRem, ' left')
                  ),
                  React.createElement('td', null,
                    React.createElement('span', { className: 'cell-mono' }, lb.earnedUsed || 0, '/', lb.earned),
                    React.createElement('span', { style: { fontSize: 10, color: earnedRem <= 3 ? 'var(--danger)' : 'var(--success)', marginLeft: 6 } }, earnedRem, ' left')
                  ),
                  React.createElement('td', null,
                    React.createElement('span', { style: { fontSize: 16, fontWeight: 800, fontFamily: "'Space Grotesk', monospace", color: totalRem <= 5 ? 'var(--danger)' : totalRem <= 15 ? 'var(--warning)' : 'var(--success)' } }, totalRem),
                    React.createElement('span', { style: { fontSize: 10, color: 'var(--text-dim)', marginLeft: 4 } }, 'days')
                  )
                );
              })
            )
          )
        )
      )
    ),

    leaveModal && React.createElement(LeaveTypeModal, { staffId: leaveModal, onApply: handleLeaveApply, onClose: () => setLeaveModal(null) })
  );
}

function LeaveTypeModal({ staffId, onApply, onClose }) {
  const [type, setType] = useState('casual');
  return React.createElement(Modal, { title: 'Mark Leave', onClose },
    React.createElement('div', { className: 'modal-body' },
      React.createElement(FormField, { label: 'Leave Type' },
        React.createElement('div', { style: { display: 'flex', gap: 8 } },
          ['casual', 'sick', 'earned'].map(t => React.createElement('button', {
            key: t, className: `btn ${type === t ? 'btn-primary' : 'btn-ghost'} btn-sm`,
            onClick: () => setType(t), style: { flex: 1, justifyContent: 'center', textTransform: 'capitalize' }
          }, t))
        )
      )
    ),
    React.createElement('div', { className: 'modal-footer' },
      React.createElement('button', { className: 'btn btn-ghost', onClick: onClose }, 'Cancel'),
      React.createElement('button', { className: 'btn btn-primary', onClick: () => onApply(staffId, type) }, 'Apply Leave')
    )
  );
}

Object.assign(window, { AttendanceView });
