import { useState, useEffect, createContext, useContext } from "react";

// ============================================================
// DATA & CONTEXT
// ============================================================
const INITIAL_DATA = {
  users: [
    { id: 1, username: "admin", password: "admin123", name: "مدیر سیستم", role: "admin" },
    { id: 2, username: "anbardar", password: "anbar123", name: "انباردار اول", role: "warehouse" },
    { id: 3, username: "viewer", password: "view123", name: "بازدیدکننده", role: "viewer" },
  ],
  categories: [
    { id: 1, name: "لوازم اداری" },
    { id: 2, name: "تجهیزات IT" },
    { id: 3, name: "لوازم نظافتی" },
    { id: 4, name: "مبلمان" },
  ],
  items: [
    { id: 1, code: "IT-001", name: "لپ‌تاپ", categoryId: 2, unit: "دستگاه", stock: 5, minStock: 2 },
    { id: 2, code: "OF-001", name: "کاغذ A4", categoryId: 1, unit: "بسته", stock: 30, minStock: 10 },
    { id: 3, code: "CL-001", name: "مایع دستشویی", categoryId: 3, unit: "بطری", stock: 8, minStock: 5 },
    { id: 4, code: "FR-001", name: "صندلی اداری", categoryId: 4, unit: "عدد", stock: 12, minStock: 3 },
  ],
  transactions: [
    { id: 1, type: "in", itemId: 1, quantity: 3, date: "1403/04/01", party: "شرکت دیجیکالا", subject: "خرید لپ‌تاپ جدید", description: "لپ‌تاپ برای کارمندان جدید", categoryId: 2, userId: 1, createdAt: "2024-06-21" },
    { id: 2, type: "out", itemId: 1, quantity: 1, date: "1403/04/05", party: "مدرسه شهید رجایی", subject: "تحویل تجهیزات", description: "لپ‌تاپ برای آزمایشگاه مدرسه", categoryId: 2, userId: 2, createdAt: "2024-06-25" },
    { id: 3, type: "in", itemId: 2, quantity: 50, date: "1403/04/03", party: "نوسازی مدارس", subject: "تحویل کاغذ", description: "کاغذ برای دفاتر", categoryId: 1, userId: 2, createdAt: "2024-06-23" },
    { id: 4, type: "out", itemId: 2, quantity: 10, date: "1403/04/06", party: "مدرسه امام خمینی", subject: "توزیع لوازم", description: "کاغذ برای دفتر مدرسه", categoryId: 1, userId: 2, createdAt: "2024-06-26" },
  ],
  parties: ["شرکت دیجیکالا", "نوسازی مدارس", "مدرسه شهید رجایی", "مدرسه امام خمینی", "اداره کل"],
};

function loadData() {
  try {
    const saved = localStorage.getItem("warehouse_data");
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  } catch { return INITIAL_DATA; }
}
function saveData(data) { localStorage.setItem("warehouse_data", JSON.stringify(data)); }

// ============================================================
// STYLES
// ============================================================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --navy: #1a2744; --navy-light: #243360;
    --teal: #0d9488; --teal-light: #14b8a6;
    --amber: #f59e0b; --red: #ef4444; --green: #22c55e;
    --bg: #f0f4f8; --surface: #ffffff; --border: #e2e8f0;
    --text: #1e293b; --text-muted: #64748b; --sidebar-w: 240px;
  }
  body { font-family: 'Vazirmatn', sans-serif; background: var(--bg); color: var(--text); direction: rtl; min-height: 100vh; }

  .login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 50%, #1e4d6b 100%); }
  .login-box { background: white; border-radius: 20px; padding: 48px 40px; width: 380px; box-shadow: 0 25px 60px rgba(0,0,0,0.3); }
  .login-logo { text-align: center; margin-bottom: 32px; }
  .login-logo .icon-wrap { width: 72px; height: 72px; background: linear-gradient(135deg, var(--teal), var(--teal-light)); border-radius: 18px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 32px; }
  .login-logo h1 { font-size: 22px; font-weight: 700; color: var(--navy); }
  .login-logo p { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
  .demo-box { margin-top: 20px; padding: 14px; background: #f8fafc; border-radius: 10px; font-size: 12px; color: var(--text-muted); line-height: 1.8; }

  .form-group { margin-bottom: 18px; }
  .form-group label { display: block; font-size: 13px; font-weight: 600; color: var(--navy); margin-bottom: 6px; }
  .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 11px 14px; border: 1.5px solid var(--border); border-radius: 10px; font-family: inherit; font-size: 14px; color: var(--text); background: #f8fafc; transition: border-color .2s, box-shadow .2s; direction: rtl; }
  .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: var(--teal); box-shadow: 0 0 0 3px rgba(13,148,136,.12); background: white; }
  .form-group textarea { resize: vertical; min-height: 80px; }

  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 10px; border: none; font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s; }
  .btn-primary { background: var(--teal); color: white; }
  .btn-primary:hover { background: #0b8077; transform: translateY(-1px); }
  .btn-secondary { background: var(--bg); color: var(--text); border: 1.5px solid var(--border); }
  .btn-secondary:hover { background: var(--border); }
  .btn-danger { background: var(--red); color: white; }
  .btn-danger:hover { background: #dc2626; }
  .btn-amber { background: var(--amber); color: white; }
  .btn-amber:hover { background: #d97706; }
  .btn-block { width: 100%; justify-content: center; padding: 13px; font-size: 15px; }

  .error-msg { background: #fef2f2; color: var(--red); padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; border: 1px solid #fecaca; }

  .app-layout { display: flex; min-height: 100vh; }
  .sidebar { width: var(--sidebar-w); background: var(--navy); display: flex; flex-direction: column; position: fixed; top: 0; right: 0; bottom: 0; z-index: 100; box-shadow: -4px 0 20px rgba(0,0,0,.15); }
  .sidebar-header { padding: 24px 20px 20px; border-bottom: 1px solid rgba(255,255,255,.1); }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand-icon { width: 40px; height: 40px; background: linear-gradient(135deg, var(--teal), var(--teal-light)); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .brand-name { font-size: 15px; font-weight: 700; color: white; line-height: 1.3; }
  .brand-sub { font-size: 11px; color: rgba(255,255,255,.5); }
  .sidebar-nav { flex: 1; padding: 16px 12px; overflow-y: auto; }
  .nav-section { margin-bottom: 20px; }
  .nav-section-title { font-size: 10px; font-weight: 700; letter-spacing: 1px; color: rgba(255,255,255,.35); text-transform: uppercase; padding: 0 8px; margin-bottom: 6px; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; color: rgba(255,255,255,.65); font-size: 13.5px; font-weight: 500; cursor: pointer; transition: all .2s; margin-bottom: 2px; border: none; background: none; width: 100%; text-align: right; }
  .nav-item:hover { background: rgba(255,255,255,.08); color: white; }
  .nav-item.active { background: var(--teal); color: white; }
  .nav-item .nav-icon { font-size: 17px; width: 22px; text-align: center; flex-shrink: 0; }
  .sidebar-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,.1); }
  .user-chip { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 10px; background: rgba(255,255,255,.07); }
  .user-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--teal); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: white; flex-shrink: 0; }
  .user-name { font-size: 13px; font-weight: 600; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-role-label { font-size: 11px; color: rgba(255,255,255,.45); }
  .logout-btn { background: none; border: none; color: rgba(255,255,255,.4); cursor: pointer; padding: 4px; font-size: 16px; transition: color .2s; flex-shrink: 0; }
  .logout-btn:hover { color: var(--red); }

  .main-content { flex: 1; margin-right: var(--sidebar-w); min-height: 100vh; padding: 28px; max-width: calc(100vw - var(--sidebar-w)); }
  .page-header { margin-bottom: 28px; }
  .page-header h2 { font-size: 24px; font-weight: 700; color: var(--navy); }
  .page-header p { font-size: 14px; color: var(--text-muted); margin-top: 4px; }

  .card { background: white; border-radius: 16px; border: 1px solid var(--border); padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,.05); }
  .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .card-title { font-size: 16px; font-weight: 700; color: var(--navy); }

  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px,1fr)); gap: 16px; margin-bottom: 24px; }
  .stat-card { background: white; border-radius: 16px; padding: 20px; border: 1px solid var(--border); display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 4px rgba(0,0,0,.05); }
  .stat-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
  .stat-icon.teal { background: #ccfbf1; }
  .stat-icon.blue { background: #dbeafe; }
  .stat-icon.amber { background: #fef3c7; }
  .stat-icon.red { background: #fee2e2; }
  .stat-value { font-size: 26px; font-weight: 700; color: var(--navy); line-height: 1; }
  .stat-label { font-size: 12.5px; color: var(--text-muted); margin-top: 4px; }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  th { background: #f8fafc; padding: 11px 14px; text-align: right; font-weight: 600; color: var(--text-muted); font-size: 12px; border-bottom: 1px solid var(--border); white-space: nowrap; }
  td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; color: var(--text); }
  tr:hover td { background: #f8fafc; }
  tr:last-child td { border-bottom: none; }

  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .badge-in { background: #dcfce7; color: #16a34a; }
  .badge-out { background: #fee2e2; color: #dc2626; }
  .badge-admin { background: #ede9fe; color: #7c3aed; }
  .badge-warehouse { background: #dbeafe; color: #2563eb; }
  .badge-viewer { background: #f1f5f9; color: #64748b; }
  .badge-low { background: #fef3c7; color: #d97706; }
  .badge-ok { background: #dcfce7; color: #16a34a; }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .grid-2-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
  .modal { background: white; border-radius: 20px; padding: 32px; width: 100%; max-width: 540px; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 60px rgba(0,0,0,.25); }
  .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .modal-title { font-size: 18px; font-weight: 700; color: var(--navy); }
  .modal-close { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-muted); transition: color .2s; }
  .modal-close:hover { color: var(--red); }
  .modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border); }

  .tabs { display: flex; gap: 4px; background: #f1f5f9; border-radius: 12px; padding: 4px; margin-bottom: 24px; }
  .tab { flex: 1; padding: 8px 16px; border: none; background: none; border-radius: 9px; font-family: inherit; font-size: 13.5px; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: all .2s; }
  .tab.active { background: white; color: var(--navy); box-shadow: 0 1px 4px rgba(0,0,0,.1); }

  .search-bar { display: flex; gap: 12px; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
  .search-input-wrap { position: relative; flex: 1; min-width: 200px; }
  .search-input-wrap input { width: 100%; padding: 10px 14px 10px 38px; border: 1.5px solid var(--border); border-radius: 10px; font-family: inherit; font-size: 14px; background: white; transition: border-color .2s; }
  .search-input-wrap input:focus { outline: none; border-color: var(--teal); }
  .search-icon-abs { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 16px; pointer-events: none; }

  .alert { padding: 12px 16px; border-radius: 10px; font-size: 13.5px; margin-bottom: 16px; }
  .alert-warn { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
  .alert-info { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }

  .empty-state { text-align: center; padding: 60px 20px; }
  .empty-icon { font-size: 52px; margin-bottom: 12px; }
  .empty-state p { color: var(--text-muted); font-size: 14px; }

  .party-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--border); cursor: pointer; transition: background .15s; border-radius: 8px; padding: 12px 8px; }
  .party-item:hover { background: #f8fafc; }
  .party-item:last-child { border-bottom: none; }
  .party-name { font-weight: 600; color: var(--navy); font-size: 14px; }
  .party-meta { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
  .party-stats { display: flex; gap: 8px; align-items: center; }

  .stock-bar-wrap { background: #f1f5f9; border-radius: 6px; height: 6px; overflow: hidden; margin-top: 4px; }
  .stock-bar { height: 100%; border-radius: 6px; transition: width .3s; }

  .filter-select { padding: 10px 14px; border: 1.5px solid var(--border); border-radius: 10px; font-family: inherit; font-size: 14px; background: white; color: var(--text); }

  @media (max-width: 768px) {
    :root { --sidebar-w: 60px; }
    .brand-name, .brand-sub, .nav-item span:last-child, .user-name, .user-role-label, .nav-section-title { display: none; }
    .nav-item { justify-content: center; }
    .user-chip { justify-content: center; }
    .main-content { padding: 16px; }
    .grid-2, .grid-2-layout { grid-template-columns: 1fr; }
    .stats-grid { grid-template-columns: 1fr 1fr; }
  }
`;

// UTILS
const ROLE_LABELS = { admin: "مدیر", warehouse: "انباردار", viewer: "بازدیدکننده" };
const canEdit = (role) => role === "admin" || role === "warehouse";
const canAdmin = (role) => role === "admin";
function today() {
  const d = new Date();
  const y = d.getFullYear() - 621;
  return `${y}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}`;
}

// MODAL
function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// DASHBOARD
function Dashboard({ data }) {
  const totalItems = data.items.length;
  const totalStock = data.items.reduce((s, i) => s + i.stock, 0);
  const totalIn = data.transactions.filter(t => t.type === "in").reduce((s, t) => s + t.quantity, 0);
  const totalOut = data.transactions.filter(t => t.type === "out").reduce((s, t) => s + t.quantity, 0);
  const lowStock = data.items.filter(i => i.stock <= i.minStock);
  const recent = [...data.transactions].reverse().slice(0, 8);
  const getItem = id => data.items.find(i => i.id === id);

  return (
    <div>
      <div className="page-header">
        <h2>📊 داشبورد انبار</h2>
        <p>خلاصه وضعیت انبار در یک نگاه</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon teal">📦</div><div><div className="stat-value">{totalItems}</div><div className="stat-label">نوع کالا</div></div></div>
        <div className="stat-card"><div className="stat-icon blue">🗄️</div><div><div className="stat-value">{totalStock}</div><div className="stat-label">کل موجودی</div></div></div>
        <div className="stat-card"><div className="stat-icon teal">📥</div><div><div className="stat-value">{totalIn}</div><div className="stat-label">کل ورودی</div></div></div>
        <div className="stat-card"><div className="stat-icon amber">📤</div><div><div className="stat-value">{totalOut}</div><div className="stat-label">کل خروجی</div></div></div>
      </div>
      {lowStock.length > 0 && (
        <div className="alert alert-warn">⚠️ <strong>{lowStock.length} کالا</strong> زیر حد مجاز موجودی: {lowStock.map(i => i.name).join("، ")}</div>
      )}
      <div className="grid-2-layout">
        <div className="card">
          <div className="card-header"><span className="card-title">آخرین تراکنش‌ها</span></div>
          {recent.length === 0 ? <div className="empty-state"><div className="empty-icon">📋</div><p>هنوز تراکنشی ثبت نشده</p></div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>نوع</th><th>کالا</th><th>طرف</th><th>تعداد</th><th>تاریخ</th></tr></thead>
                <tbody>
                  {recent.map(t => (
                    <tr key={t.id}>
                      <td><span className={`badge badge-${t.type}`}>{t.type === "in" ? "📥 ورودی" : "📤 خروجی"}</span></td>
                      <td>{getItem(t.itemId)?.name || "—"}</td>
                      <td style={{fontSize:12}}>{t.party}</td>
                      <td><strong>{t.quantity}</strong></td>
                      <td style={{fontSize:12,color:"var(--text-muted)"}}>{t.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">وضعیت موجودی</span></div>
          {data.items.map(item => {
            const pct = item.minStock > 0 ? Math.min((item.stock / (item.minStock * 3)) * 100, 100) : 100;
            const isLow = item.stock <= item.minStock;
            return (
              <div key={item.id} style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:13}}>
                  <span style={{fontWeight:600}}>{item.name}</span>
                  <span style={{color:isLow?"var(--red)":"var(--teal)",fontWeight:700}}>{item.stock} {item.unit}</span>
                </div>
                <div className="stock-bar-wrap">
                  <div className="stock-bar" style={{width:`${pct}%`,background:isLow?"var(--red)":"var(--teal)"}} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ITEMS
function Items({ data, setData, userRole }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [err, setErr] = useState("");
  const getCat = id => data.categories.find(c => c.id === id);
  const filtered = data.items.filter(i => {
    return (i.name.includes(search) || i.code.includes(search)) &&
      (catFilter === "all" || i.categoryId === Number(catFilter));
  });
  function openAdd() { setForm({code:"",name:"",categoryId:"",unit:"عدد",stock:0,minStock:0}); setErr(""); setModal("add"); }
  function openEdit(item) { setForm({...item}); setErr(""); setModal("edit"); }
  function save() {
    if (!form.code || !form.name || !form.categoryId) return setErr("لطفاً همه فیلدهای ضروری را پر کنید");
    if (modal === "add") {
      const nd = {...data, items: [...data.items, {...form, id:Date.now(), stock:Number(form.stock)||0, minStock:Number(form.minStock)||0, categoryId:Number(form.categoryId)}]};
      setData(nd); saveData(nd);
    } else {
      const nd = {...data, items: data.items.map(i => i.id===form.id ? {...form,stock:Number(form.stock),minStock:Number(form.minStock),categoryId:Number(form.categoryId)} : i)};
      setData(nd); saveData(nd);
    }
    setModal(null);
  }
  function del(id) {
    if (!confirm("این کالا حذف شود؟")) return;
    const nd = {...data, items: data.items.filter(i => i.id !== id)};
    setData(nd); saveData(nd);
  }
  return (
    <div>
      <div className="page-header"><h2>📦 مدیریت کالاها</h2><p>لیست تمام کالاهای انبار</p></div>
      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrap">
            <span className="search-icon-abs">🔍</span>
            <input placeholder="جستجو نام یا کد..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={catFilter} onChange={e=>setCatFilter(e.target.value)}>
            <option value="all">همه دسته‌ها</option>
            {data.categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {canEdit(userRole) && <button className="btn btn-primary" onClick={openAdd}>＋ کالای جدید</button>}
        </div>
        {filtered.length===0 ? <div className="empty-state"><div className="empty-icon">📦</div><p>کالایی یافت نشد</p></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>کد</th><th>نام کالا</th><th>دسته‌بندی</th><th>واحد</th><th>موجودی</th><th>حد هشدار</th><th>وضعیت</th>{canEdit(userRole)&&<th>عملیات</th>}</tr></thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}>
                    <td style={{fontFamily:"monospace",fontSize:12}}>{item.code}</td>
                    <td style={{fontWeight:600}}>{item.name}</td>
                    <td>{getCat(item.categoryId)?.name||"—"}</td>
                    <td>{item.unit}</td>
                    <td><strong style={{color:item.stock<=item.minStock?"var(--red)":"var(--teal)"}}>{item.stock}</strong></td>
                    <td style={{color:"var(--text-muted)"}}>{item.minStock}</td>
                    <td><span className={`badge ${item.stock<=item.minStock?"badge-low":"badge-ok"}`}>{item.stock<=item.minStock?"⚠️ کم":"✅ مناسب"}</span></td>
                    {canEdit(userRole)&&(
                      <td><div style={{display:"flex",gap:6}}>
                        <button className="btn btn-secondary" style={{padding:"6px 12px",fontSize:12}} onClick={()=>openEdit(item)}>✏️</button>
                        {canAdmin(userRole)&&<button className="btn btn-danger" style={{padding:"6px 12px",fontSize:12}} onClick={()=>del(item.id)}>🗑️</button>}
                      </div></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modal && (
        <Modal title={modal==="add"?"➕ افزودن کالا":"✏️ ویرایش کالا"} onClose={()=>setModal(null)}
          footer={<><button className="btn btn-secondary" onClick={()=>setModal(null)}>انصراف</button><button className="btn btn-primary" onClick={save}>💾 ذخیره</button></>}>
          {err&&<div className="error-msg">{err}</div>}
          <div className="grid-2">
            <div className="form-group"><label>کد کالا *</label><input value={form.code||""} onChange={e=>setForm({...form,code:e.target.value})} placeholder="IT-001" /></div>
            <div className="form-group"><label>نام کالا *</label><input value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})} /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label>دسته‌بندی *</label>
              <select value={form.categoryId||""} onChange={e=>setForm({...form,categoryId:e.target.value})}>
                <option value="">انتخاب کنید</option>
                {data.categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>واحد</label><input value={form.unit||""} onChange={e=>setForm({...form,unit:e.target.value})} placeholder="عدد/بسته/متر" /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label>موجودی اولیه</label><input type="number" min="0" value={form.stock||0} onChange={e=>setForm({...form,stock:e.target.value})} /></div>
            <div className="form-group"><label>حداقل موجودی (هشدار)</label><input type="number" min="0" value={form.minStock||0} onChange={e=>setForm({...form,minStock:e.target.value})} /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// TRANSACTIONS
function Transactions({ data, setData, userRole, defaultType }) {
  const [tab, setTab] = useState(defaultType || "in");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [err, setErr] = useState("");
  const getItem = id => data.items.find(i => i.id === id);
  const getCat = id => data.categories.find(c => c.id === id);
  const list = data.transactions.filter(t => {
    if (t.type !== tab) return false;
    const item = getItem(t.itemId);
    return !search || t.party?.includes(search) || t.subject?.includes(search) || item?.name?.includes(search);
  }).reverse();
  function openAdd() {
    setForm({type:tab,itemId:"",quantity:1,date:today(),party:"",subject:"",description:"",categoryId:""});
    setErr(""); setModal(true);
  }
  function save() {
    if (!form.itemId||!form.quantity||!form.party||!form.subject) return setErr("لطفاً همه فیلدهای ضروری را پر کنید");
    const qty = Number(form.quantity);
    if (qty<=0) return setErr("تعداد باید بیشتر از صفر باشد");
    const item = data.items.find(i=>i.id===Number(form.itemId));
    if (!item) return setErr("کالا یافت نشد");
    if (tab==="out" && item.stock<qty) return setErr(`موجودی کافی نیست. موجودی فعلی: ${item.stock} ${item.unit}`);
    const newT = {...form,id:Date.now(),itemId:Number(form.itemId),quantity:qty,categoryId:Number(form.categoryId)||item.categoryId,userId:1,createdAt:new Date().toISOString().split("T")[0]};
    const newStock = tab==="in" ? item.stock+qty : item.stock-qty;
    const nd = {
      ...data,
      transactions:[...data.transactions,newT],
      items:data.items.map(i=>i.id===item.id?{...i,stock:newStock}:i),
      parties:data.parties.includes(form.party)?data.parties:[...data.parties,form.party]
    };
    setData(nd); saveData(nd); setModal(false);
  }
  return (
    <div>
      <div className="page-header">
        <h2>{tab==="in"?"📥 ورودی انبار":"📤 خروجی انبار"}</h2>
        <p>{tab==="in"?"ثبت کالاهای دریافت‌شده":"ثبت کالاهای تحویل داده‌شده"}</p>
      </div>
      <div className="tabs">
        <button className={`tab ${tab==="in"?"active":""}`} onClick={()=>setTab("in")}>📥 ورودی‌ها</button>
        <button className={`tab ${tab==="out"?"active":""}`} onClick={()=>setTab("out")}>📤 خروجی‌ها</button>
      </div>
      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrap">
            <span className="search-icon-abs">🔍</span>
            <input placeholder="جستجو در طرف، کالا، موضوع..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          {canEdit(userRole)&&<button className={`btn ${tab==="in"?"btn-primary":"btn-amber"}`} onClick={openAdd}>＋ ثبت {tab==="in"?"ورودی":"خروجی"}</button>}
        </div>
        {list.length===0 ? <div className="empty-state"><div className="empty-icon">{tab==="in"?"📥":"📤"}</div><p>هنوز {tab==="in"?"ورودی":"خروجی"} ثبت نشده</p></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>تاریخ</th><th>کالا</th><th>تعداد</th><th>{tab==="in"?"تحویل‌دهنده":"تحویل‌گیرنده"}</th><th>موضوع</th><th>دسته‌بندی</th><th>توضیحات</th></tr></thead>
              <tbody>
                {list.map(t=>(
                  <tr key={t.id}>
                    <td style={{fontSize:12,color:"var(--text-muted)",whiteSpace:"nowrap"}}>{t.date}</td>
                    <td style={{fontWeight:600}}>{getItem(t.itemId)?.name||"—"}</td>
                    <td><span className={`badge badge-${t.type}`}>{t.quantity} {getItem(t.itemId)?.unit}</span></td>
                    <td style={{fontWeight:600,color:"var(--navy)"}}>{t.party}</td>
                    <td>{t.subject}</td>
                    <td style={{fontSize:12}}>{getCat(t.categoryId)?.name||"—"}</td>
                    <td style={{fontSize:12,color:"var(--text-muted)",maxWidth:150}}>{t.description||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modal && (
        <Modal title={tab==="in"?"📥 ثبت ورودی جدید":"📤 ثبت خروجی جدید"} onClose={()=>setModal(false)}
          footer={<><button className="btn btn-secondary" onClick={()=>setModal(false)}>انصراف</button><button className={`btn ${tab==="in"?"btn-primary":"btn-amber"}`} onClick={save}>💾 ثبت</button></>}>
          {err&&<div className="error-msg">{err}</div>}
          <div className="grid-2">
            <div className="form-group"><label>کالا *</label>
              <select value={form.itemId||""} onChange={e=>setForm({...form,itemId:e.target.value})}>
                <option value="">انتخاب کالا</option>
                {data.items.map(i=><option key={i.id} value={i.id}>{i.name} (موجودی: {i.stock})</option>)}
              </select>
            </div>
            <div className="form-group"><label>تعداد *</label><input type="number" min="1" value={form.quantity||""} onChange={e=>setForm({...form,quantity:e.target.value})} /></div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>{tab==="in"?"تحویل‌دهنده *":"تحویل‌گیرنده *"}</label>
              <input list="parties-list" value={form.party||""} onChange={e=>setForm({...form,party:e.target.value})} placeholder="نام شخص، مدرسه یا سازمان" />
              <datalist id="parties-list">{data.parties.map((p,i)=><option key={i} value={p}/>)}</datalist>
            </div>
            <div className="form-group"><label>تاریخ *</label><input value={form.date||""} onChange={e=>setForm({...form,date:e.target.value})} placeholder="1403/04/01" /></div>
          </div>
          <div className="form-group"><label>موضوع *</label><input value={form.subject||""} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="مثال: خرید لوازم اداری" /></div>
          <div className="form-group"><label>دسته‌بندی</label>
            <select value={form.categoryId||""} onChange={e=>setForm({...form,categoryId:e.target.value})}>
              <option value="">خودکار (از کالا)</option>
              {data.categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label>توضیحات</label><textarea value={form.description||""} onChange={e=>setForm({...form,description:e.target.value})} placeholder="توضیحات بیشتر..." /></div>
        </Modal>
      )}
    </div>
  );
}

// REPORTS
function Reports({ data }) {
  const [mode, setMode] = useState("party");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const getItem = id => data.items.find(i => i.id === id);

  const partyMap = {};
  data.transactions.forEach(t => {
    if (!partyMap[t.party]) partyMap[t.party] = {in:[],out:[]};
    partyMap[t.party][t.type].push(t);
  });
  const parties = Object.entries(partyMap).filter(([p])=>p.includes(search));

  const itemMap = {};
  data.transactions.forEach(t => {
    if (!itemMap[t.itemId]) itemMap[t.itemId]={in:[],out:[]};
    itemMap[t.itemId][t.type].push(t);
  });
  const itemEntries = Object.entries(itemMap).filter(([id])=>getItem(Number(id))?.name.includes(search));

  if (selected) {
    const isParty = mode==="party";
    const txList = isParty
      ? data.transactions.filter(t=>t.party===selected).reverse()
      : data.transactions.filter(t=>t.itemId===Number(selected)).reverse();
    const totalIn = txList.filter(t=>t.type==="in").reduce((s,t)=>s+t.quantity,0);
    const totalOut = txList.filter(t=>t.type==="out").reduce((s,t)=>s+t.quantity,0);
    const label = isParty ? selected : getItem(Number(selected))?.name;
    return (
      <div>
        <div className="page-header">
          <button className="btn btn-secondary" style={{marginBottom:12}} onClick={()=>setSelected(null)}>← برگشت</button>
          <h2>📊 گزارش: {label}</h2>
        </div>
        <div className="stats-grid" style={{gridTemplateColumns:"1fr 1fr 1fr"}}>
          <div className="stat-card"><div className="stat-icon teal">📥</div><div><div className="stat-value">{totalIn}</div><div className="stat-label">کل ورودی</div></div></div>
          <div className="stat-card"><div className="stat-icon amber">📤</div><div><div className="stat-value">{totalOut}</div><div className="stat-label">کل خروجی</div></div></div>
          <div className="stat-card"><div className="stat-icon blue">📋</div><div><div className="stat-value">{txList.length}</div><div className="stat-label">تعداد تراکنش</div></div></div>
        </div>
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>نوع</th><th>تاریخ</th>{isParty?<th>کالا</th>:<th>طرف</th>}<th>تعداد</th><th>موضوع</th><th>توضیحات</th></tr></thead>
              <tbody>
                {txList.map(t=>(
                  <tr key={t.id}>
                    <td><span className={`badge badge-${t.type}`}>{t.type==="in"?"📥 ورودی":"📤 خروجی"}</span></td>
                    <td style={{fontSize:12}}>{t.date}</td>
                    {isParty?<td style={{fontWeight:600}}>{getItem(t.itemId)?.name}</td>:<td style={{fontWeight:600}}>{t.party}</td>}
                    <td><strong>{t.quantity}</strong> {getItem(t.itemId)?.unit}</td>
                    <td>{t.subject}</td>
                    <td style={{fontSize:12,color:"var(--text-muted)"}}>{t.description||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header"><h2>📊 گزارش‌ها</h2><p>ببین هر طرف چی گرفته یا هر کالا کجا رفته</p></div>
      <div className="tabs">
        <button className={`tab ${mode==="party"?"active":""}`} onClick={()=>{setMode("party");setSearch("");setSelected(null);}}>🏢 بر اساس طرف</button>
        <button className={`tab ${mode==="item"?"active":""}`} onClick={()=>{setMode("item");setSearch("");setSelected(null);}}>📦 بر اساس کالا</button>
      </div>
      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrap">
            <span className="search-icon-abs">🔍</span>
            <input placeholder={mode==="party"?"جستجو مدرسه، سازمان...":"جستجو نام کالا..."} value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        </div>
        {mode==="party" && (
          parties.length===0 ? <div className="empty-state"><div className="empty-icon">🏢</div><p>موردی یافت نشد</p></div> :
          parties.map(([party,txs])=>(
            <div key={party} className="party-item" onClick={()=>setSelected(party)}>
              <div>
                <div className="party-name">🏢 {party}</div>
                <div className="party-meta">{txs.in.length+txs.out.length} تراکنش</div>
              </div>
              <div className="party-stats">
                <span className="badge badge-in">📥 {txs.in.reduce((s,t)=>s+t.quantity,0)}</span>
                <span className="badge badge-out">📤 {txs.out.reduce((s,t)=>s+t.quantity,0)}</span>
                <span style={{fontSize:20,color:"var(--text-muted)"}}>›</span>
              </div>
            </div>
          ))
        )}
        {mode==="item" && (
          itemEntries.length===0 ? <div className="empty-state"><div className="empty-icon">📦</div><p>موردی یافت نشد</p></div> :
          itemEntries.map(([itemId,txs])=>{
            const item = getItem(Number(itemId));
            if (!item) return null;
            return (
              <div key={itemId} className="party-item" onClick={()=>setSelected(itemId)}>
                <div>
                  <div className="party-name">📦 {item.name}</div>
                  <div className="party-meta">موجودی فعلی: {item.stock} {item.unit}</div>
                </div>
                <div className="party-stats">
                  <span className="badge badge-in">📥 {txs.in.reduce((s,t)=>s+t.quantity,0)}</span>
                  <span className="badge badge-out">📤 {txs.out.reduce((s,t)=>s+t.quantity,0)}</span>
                  <span style={{fontSize:20,color:"var(--text-muted)"}}>›</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// CATEGORIES
function Categories({ data, setData, userRole }) {
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  function save() {
    if (!name) return setErr("نام الزامی است");
    const nd = {...data, categories:[...data.categories,{id:Date.now(),name}]};
    setData(nd); saveData(nd); setModal(false); setName("");
  }
  function del(id) {
    if (!confirm("حذف شود؟")) return;
    const nd = {...data, categories:data.categories.filter(c=>c.id!==id)};
    setData(nd); saveData(nd);
  }
  return (
    <div>
      <div className="page-header"><h2>🗂️ دسته‌بندی‌ها</h2><p>مدیریت دسته‌بندی کالاها</p></div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">لیست دسته‌بندی‌ها</span>
          {canAdmin(userRole)&&<button className="btn btn-primary" onClick={()=>{setName("");setErr("");setModal(true);}}>＋ دسته‌بندی جدید</button>}
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>نام</th><th>تعداد کالا</th><th>تعداد تراکنش</th>{canAdmin(userRole)&&<th>عملیات</th>}</tr></thead>
            <tbody>
              {data.categories.map(cat=>(
                <tr key={cat.id}>
                  <td style={{fontWeight:600}}>🗂️ {cat.name}</td>
                  <td>{data.items.filter(i=>i.categoryId===cat.id).length}</td>
                  <td>{data.transactions.filter(t=>t.categoryId===cat.id).length}</td>
                  {canAdmin(userRole)&&<td><button className="btn btn-danger" style={{padding:"6px 12px",fontSize:12}} onClick={()=>del(cat.id)}>🗑️</button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal&&(
        <Modal title="➕ دسته‌بندی جدید" onClose={()=>setModal(false)}
          footer={<><button className="btn btn-secondary" onClick={()=>setModal(false)}>انصراف</button><button className="btn btn-primary" onClick={save}>💾 ذخیره</button></>}>
          {err&&<div className="error-msg">{err}</div>}
          <div className="form-group"><label>نام دسته‌بندی *</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="مثال: لوازم برقی" /></div>
        </Modal>
      )}
    </div>
  );
}

// USERS
function Users({ data, setData }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [err, setErr] = useState("");
  function save() {
    if (!form.username||!form.password||!form.name) return setErr("همه فیلدها الزامی است");
    if (data.users.find(u=>u.username===form.username)) return setErr("این نام کاربری قبلاً استفاده شده");
    const nd = {...data, users:[...data.users,{...form,id:Date.now()}]};
    setData(nd); saveData(nd); setModal(false);
  }
  function del(id) {
    if (!confirm("حذف شود؟")) return;
    const nd = {...data, users:data.users.filter(u=>u.id!==id)};
    setData(nd); saveData(nd);
  }
  return (
    <div>
      <div className="page-header"><h2>👥 مدیریت کاربران</h2><p>کنترل دسترسی کاربران</p></div>
      <div className="alert alert-info">ℹ️ <strong>سطوح:</strong> مدیر (همه کارها) | انباردار (ثبت ورودی/خروجی) | بازدیدکننده (فقط گزارش)</div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">لیست کاربران</span>
          <button className="btn btn-primary" onClick={()=>{setForm({username:"",password:"",name:"",role:"warehouse"});setErr("");setModal(true);}}>＋ کاربر جدید</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>نام</th><th>نام کاربری</th><th>نقش</th><th>عملیات</th></tr></thead>
            <tbody>
              {data.users.map(u=>(
                <tr key={u.id}>
                  <td style={{fontWeight:600}}>{u.name}</td>
                  <td style={{fontFamily:"monospace",fontSize:13}}>{u.username}</td>
                  <td><span className={`badge badge-${u.role}`}>{ROLE_LABELS[u.role]}</span></td>
                  <td><button className="btn btn-danger" style={{padding:"6px 12px",fontSize:12}} onClick={()=>del(u.id)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal&&(
        <Modal title="➕ کاربر جدید" onClose={()=>setModal(false)}
          footer={<><button className="btn btn-secondary" onClick={()=>setModal(false)}>انصراف</button><button className="btn btn-primary" onClick={save}>💾 ذخیره</button></>}>
          {err&&<div className="error-msg">{err}</div>}
          <div className="grid-2">
            <div className="form-group"><label>نام کامل *</label><input value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})} /></div>
            <div className="form-group"><label>نام کاربری *</label><input value={form.username||""} onChange={e=>setForm({...form,username:e.target.value})} /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label>رمز عبور *</label><input type="password" value={form.password||""} onChange={e=>setForm({...form,password:e.target.value})} /></div>
            <div className="form-group"><label>نقش *</label>
              <select value={form.role||"warehouse"} onChange={e=>setForm({...form,role:e.target.value})}>
                <option value="admin">مدیر</option>
                <option value="warehouse">انباردار</option>
                <option value="viewer">بازدیدکننده</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// MAIN APP
export default function App() {
  const [data, setData] = useState(loadData);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [loginForm, setLoginForm] = useState({username:"",password:""});
  const [loginErr, setLoginErr] = useState("");

  function login() {
    const found = data.users.find(u=>u.username===loginForm.username&&u.password===loginForm.password);
    if (!found) return setLoginErr("نام کاربری یا رمز عبور اشتباه است");
    setUser(found); setLoginErr("");
  }

  if (!user) return (
    <>
      <style>{styles}</style>
      <div className="login-wrap">
        <div className="login-box">
          <div className="login-logo">
            <div className="icon-wrap">🏛️</div>
            <h1>سیستم انبار اداره</h1>
            <p>مدیریت موجودی و تراکنش‌های انبار</p>
          </div>
          {loginErr&&<div className="error-msg">{loginErr}</div>}
          <div className="form-group">
            <label>نام کاربری</label>
            <input value={loginForm.username} onChange={e=>setLoginForm({...loginForm,username:e.target.value})} placeholder="نام کاربری خود را وارد کنید" onKeyDown={e=>e.key==="Enter"&&login()} />
          </div>
          <div className="form-group">
            <label>رمز عبور</label>
            <input type="password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} placeholder="رمز عبور" onKeyDown={e=>e.key==="Enter"&&login()} />
          </div>
          <button className="btn btn-primary btn-block" onClick={login}>ورود به سیستم</button>
          <div className="demo-box">
            <strong>کاربران نمونه برای تست:</strong><br/>
            admin / admin123 ← مدیر سیستم<br/>
            anbardar / anbar123 ← انباردار<br/>
            viewer / view123 ← بازدیدکننده
          </div>
        </div>
      </div>
    </>
  );

  const navItems = [
    {id:"dashboard",label:"داشبورد",icon:"📊",section:"main"},
    {id:"items",label:"کالاها",icon:"📦",section:"main"},
    {id:"in",label:"ورودی انبار",icon:"📥",section:"main"},
    {id:"out",label:"خروجی انبار",icon:"📤",section:"main"},
    {id:"reports",label:"گزارش‌ها",icon:"📈",section:"main"},
    {id:"categories",label:"دسته‌بندی‌ها",icon:"🗂️",section:"settings"},
    ...(canAdmin(user.role)?[{id:"users",label:"کاربران",icon:"👥",section:"settings"}]:[]),
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="brand">
              <div className="brand-icon">🏛️</div>
              <div><div className="brand-name">انبار اداره</div><div className="brand-sub">سیستم مدیریت موجودی</div></div>
            </div>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-section">
              <div className="nav-section-title">منو اصلی</div>
              {navItems.filter(n=>n.section==="main").map(item=>(
                <button key={item.id} className={`nav-item ${page===item.id?"active":""}`} onClick={()=>setPage(item.id)}>
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            <div className="nav-section">
              <div className="nav-section-title">تنظیمات</div>
              {navItems.filter(n=>n.section==="settings").map(item=>(
                <button key={item.id} className={`nav-item ${page===item.id?"active":""}`} onClick={()=>setPage(item.id)}>
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
          <div className="sidebar-footer">
            <div className="user-chip">
              <div className="user-avatar">{user.name[0]}</div>
              <div style={{flex:1,minWidth:0}}>
                <div className="user-name">{user.name}</div>
                <div className="user-role-label">{ROLE_LABELS[user.role]}</div>
              </div>
              <button className="logout-btn" title="خروج" onClick={()=>setUser(null)}>⏻</button>
            </div>
          </div>
        </aside>
        <main className="main-content">
          {page==="dashboard"&&<Dashboard data={data}/>}
          {page==="items"&&<Items data={data} setData={setData} userRole={user.role}/>}
          {(page==="in"||page==="out")&&<Transactions data={data} setData={setData} userRole={user.role} defaultType={page}/>}
          {page==="reports"&&<Reports data={data}/>}
          {page==="categories"&&<Categories data={data} setData={setData} userRole={user.role}/>}
          {page==="users"&&canAdmin(user.role)&&<Users data={data} setData={setData}/>}
        </main>
      </div>
    </>
  );
}
