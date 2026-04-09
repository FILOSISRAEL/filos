'use client';
import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ orders:0, revenue:0, users:0, products:0 });
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({ name:'', brand:'', price:'', old_price:'', discount:'', emoji:'🤖', badge:'', category:'שואבי רובוט', stock_quantity:'10' });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }

      const { data: admin } = await supabase.from('admins').select('id').eq('id', user.id).single();
      if (!admin) { window.location.href = '/'; return; }

      setAuthorized(true);

      const [
        { data: ords },
        { data: prods },
        { count: userCount },
      ] = await Promise.all([
        supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ]);

      const revenue = (ords||[]).reduce((s:number, o:any) => s + (o.total||0), 0);
      setStats({ orders: ords?.length||0, revenue, users: userCount||0, products: prods?.length||0 });
      setOrders(ords||[]);
      setProducts(prods||[]);
      setLoading(false);
    };
    init();
  }, []);

  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders(prev => prev.map(o => o.id===id ? {...o, status} : o));
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('למחוק מוצר זה?')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const saveProduct = async () => {
    if (editingProduct) {
      await supabase.from('products').update({
        name: editingProduct.name,
        brand: editingProduct.brand,
        price: Number(editingProduct.price),
        old_price: Number(editingProduct.old_price),
        discount: Number(editingProduct.discount),
        emoji: editingProduct.emoji,
        badge: editingProduct.badge,
        category: editingProduct.category,
        stock_quantity: Number(editingProduct.stock_quantity),
        in_stock: Number(editingProduct.stock_quantity) > 0,
      }).eq('id', editingProduct.id);
      setProducts(prev => prev.map(p => p.id===editingProduct.id ? {...p, ...editingProduct} : p));
      setEditingProduct(null);
    }
  };

  const addProduct = async () => {
    const { data } = await supabase.from('products').insert({
      name: newProduct.name,
      brand: newProduct.brand,
      price: Number(newProduct.price),
      old_price: Number(newProduct.old_price)||0,
      discount: Number(newProduct.discount)||0,
      emoji: newProduct.emoji,
      badge: newProduct.badge,
      category: newProduct.category,
      stock_quantity: Number(newProduct.stock_quantity)||10,
      in_stock: true,
    }).select().single();
    if (data) setProducts(prev => [data, ...prev]);
    setShowAddProduct(false);
    setNewProduct({ name:'', brand:'', price:'', old_price:'', discount:'', emoji:'🤖', badge:'', category:'שואבי רובוט', stock_quantity:'10' });
  };

  const statusLabel: Record<string,string> = {
    pending:'⏳ ממתין', processing:'🔄 בטיפול', shipped:'🚚 נשלח', delivered:'✅ נמסר', cancelled:'❌ בוטל'
  };

  const statusColor: Record<string,string> = {
    pending:'#f59e0b', processing:'#3b82f6', shipped:'#8b5cf6', delivered:'#10b981', cancelled:'#ef4444'
  };

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontSize:'16px',color:'#888'}}>
      {authorized ? 'טוען נתונים...' : 'בודק הרשאות...'}
    </div>
  );

  return (
    <div style={{fontFamily:'system-ui,sans-serif',direction:'rtl',backgroundColor:'#f1f5f9',minHeight:'100vh'}}>

      <header style={{backgroundColor:'#0f172a',padding:'0 32px',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          <span style={{fontSize:'20px',fontWeight:'900',color:'#0ea5e9'}}>FILOS</span>
          <span style={{fontSize:'13px',color:'#64748b',backgroundColor:'#1e293b',padding:'4px 10px',borderRadius:'6px'}}>Admin Panel</span>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <a href="/" style={{color:'#64748b',fontSize:'13px',textDecoration:'none',padding:'6px 12px',borderRadius:'6px',backgroundColor:'#1e293b'}}>← חזור לחנות</a>
        </div>
      </header>

      <div style={{display:'flex',height:'calc(100vh - 60px)'}}>

        {/* Sidebar */}
        <div style={{width:'200px',backgroundColor:'#0f172a',padding:'16px 0',flexShrink:0}}>
          {[
            ['dashboard','📊','דשבורד'],
            ['orders','📦','הזמנות'],
            ['products','🛍️','מוצרים'],
            ['customers','👥','לקוחות'],
          ].map(([tab,icon,label])=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{width:'100%',padding:'12px 20px',display:'flex',alignItems:'center',gap:'10px',backgroundColor:activeTab===tab?'#1e293b':'transparent',color:activeTab===tab?'#0ea5e9':'#94a3b8',border:'none',cursor:'pointer',fontSize:'14px',fontWeight:activeTab===tab?'700':'400',textAlign:'right'}}>
              <span>{icon}</span><span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{flex:1,overflow:'auto',padding:'24px'}}>

          {/* Dashboard */}
          {activeTab==='dashboard'&&(
            <div>
              <h2 style={{margin:'0 0 20px',fontSize:'20px',fontWeight:'800',color:'#0f172a'}}>📊 סקירה כללית</h2>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'24px'}}>
                {[
                  ['💰','הכנסות',`₪${stats.revenue.toLocaleString()}`,'#0ea5e9'],
                  ['📦','הזמנות',stats.orders,'#8b5cf6'],
                  ['👥','לקוחות',stats.users,'#10b981'],
                  ['🛍️','מוצרים',stats.products,'#f59e0b'],
                ].map(([icon,label,value,color])=>(
                  <div key={label as string} style={{backgroundColor:'white',borderRadius:'12px',padding:'20px',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
                    <div style={{fontSize:'28px',marginBottom:'8px'}}>{icon}</div>
                    <div style={{fontSize:'13px',color:'#888',marginBottom:'4px'}}>{label as string}</div>
                    <div style={{fontSize:'24px',fontWeight:'900',color: color as string}}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{backgroundColor:'white',borderRadius:'12px',padding:'20px',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
                <h3 style={{margin:'0 0 16px',fontSize:'16px',fontWeight:'800'}}>📦 הזמנות אחרונות</h3>
                {orders.slice(0,5).map(order=>(
                  <div key={order.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #f1f5f9'}}>
                    <div>
                      <div style={{fontWeight:'700',fontSize:'14px'}}>#{order.id.slice(0,8).toUpperCase()}</div>
                      <div style={{fontSize:'12px',color:'#888'}}>{order.full_name} · {order.city}</div>
                    </div>
                    <div style={{fontSize:'13px',color: statusColor[order.status]||'#888',fontWeight:'700'}}>{statusLabel[order.status]||order.status}</div>
                    <div style={{fontWeight:'800',color:'#0ea5e9'}}>₪{order.total?.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab==='orders'&&(
            <div>
              <h2 style={{margin:'0 0 20px',fontSize:'20px',fontWeight:'800',color:'#0f172a'}}>📦 ניהול הזמנות</h2>
              {orders.map(order=>(
                <div key={order.id} style={{backgroundColor:'white',borderRadius:'12px',padding:'20px',marginBottom:'12px',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'}}>
                    <div>
                      <div style={{fontWeight:'800',fontSize:'16px'}}>#{order.id.slice(0,8).toUpperCase()}</div>
                      <div style={{fontSize:'13px',color:'#888',marginTop:'2px'}}>{new Date(order.created_at).toLocaleDateString('he-IL', {day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
                      <div style={{fontSize:'13px',color:'#444',marginTop:'4px'}}>👤 {order.full_name} · 📱 {order.phone} · 📍 {order.address}, {order.city}</div>
                    </div>
                    <div style={{textAlign:'left'}}>
                      <div style={{fontSize:'20px',fontWeight:'900',color:'#0ea5e9',marginBottom:'8px'}}>₪{order.total?.toLocaleString()}</div>
                      <select value={order.status} onChange={e=>updateOrderStatus(order.id, e.target.value)}
                        style={{padding:'6px 12px',borderRadius:'8px',border:`2px solid ${statusColor[order.status]||'#e2e8f0'}`,backgroundColor:'white',fontWeight:'700',fontSize:'13px',cursor:'pointer',color:statusColor[order.status]||'#444'}}>
                        {Object.entries(statusLabel).map(([val,label])=>(
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {order.order_items?.length>0&&(
                    <div style={{backgroundColor:'#f8fafc',borderRadius:'8px',padding:'12px',fontSize:'13px'}}>
                      {order.order_items.map((item:any,i:number)=>(
                        <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'4px 0'}}>
                          <span style={{color:'#444'}}>{item.product_name} x{item.quantity}</span>
                          <span style={{fontWeight:'700'}}>₪{(item.price*item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Products */}
          {activeTab==='products'&&(
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                <h2 style={{margin:0,fontSize:'20px',fontWeight:'800',color:'#0f172a'}}>🛍️ ניהול מוצרים</h2>
                <button onClick={()=>setShowAddProduct(!showAddProduct)} style={{backgroundColor:'#0ea5e9',color:'white',border:'none',padding:'10px 20px',borderRadius:'10px',fontWeight:'700',cursor:'pointer',fontSize:'14px'}}>
                  + הוסף מוצר
                </button>
              </div>

              {showAddProduct&&(
                <div style={{backgroundColor:'white',borderRadius:'12px',padding:'24px',marginBottom:'20px',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
                  <h3 style={{margin:'0 0 16px',fontSize:'16px',fontWeight:'800'}}>➕ מוצר חדש</h3>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px'}}>
                    {[['name','שם מוצר'],['brand','מותג'],['price','מחיר'],['old_price','מחיר מקורי'],['discount','הנחה %'],['emoji','אמוג׳י'],['badge','תגית'],['category','קטגוריה'],['stock_quantity','מלאי']].map(([key,label])=>(
                      <div key={key}>
                        <label style={{display:'block',fontSize:'12px',fontWeight:'600',marginBottom:'4px',color:'#374151'}}>{label}</label>
                        <input value={newProduct[key as keyof typeof newProduct]} onChange={e=>setNewProduct({...newProduct,[key]:e.target.value})}
                          style={{width:'100%',padding:'8px',border:'2px solid #e2e8f0',borderRadius:'8px',fontSize:'13px',boxSizing:'border-box'}}/>
                      </div>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:'8px',marginTop:'16px'}}>
                    <button onClick={addProduct} style={{backgroundColor:'#10b981',color:'white',border:'none',padding:'10px 24px',borderRadius:'8px',fontWeight:'700',cursor:'pointer'}}>✓ שמור מוצר</button>
                    <button onClick={()=>setShowAddProduct(false)} style={{backgroundColor:'#f1f5f9',color:'#444',border:'none',padding:'10px 24px',borderRadius:'8px',fontWeight:'700',cursor:'pointer'}}>ביטול</button>
                  </div>
                </div>
              )}

              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'16px'}}>
                {products.map(p=>(
                  <div key={p.id} style={{backgroundColor:'white',borderRadius:'12px',padding:'16px',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
                    {editingProduct?.id===p.id ? (
                      <div>
                        {[['name','שם'],['brand','מותג'],['price','מחיר'],['old_price','מחיר מקורי'],['discount','הנחה %'],['emoji','אמוג׳י'],['badge','תגית'],['stock_quantity','מלאי']].map(([key,label])=>(
                          <div key={key} style={{marginBottom:'8px'}}>
                            <label style={{fontSize:'11px',fontWeight:'600',color:'#888'}}>{label}</label>
                            <input value={editingProduct[key]||''} onChange={e=>setEditingProduct({...editingProduct,[key]:e.target.value})}
                              style={{width:'100%',padding:'6px',border:'2px solid #0ea5e9',borderRadius:'6px',fontSize:'13px',boxSizing:'border-box'}}/>
                          </div>
                        ))}
                        <div style={{display:'flex',gap:'8px',marginTop:'8px'}}>
                          <button onClick={saveProduct} style={{flex:1,backgroundColor:'#10b981',color:'white',border:'none',padding:'8px',borderRadius:'8px',fontWeight:'700',cursor:'pointer',fontSize:'13px'}}>✓ שמור</button>
                          <button onClick={()=>setEditingProduct(null)} style={{flex:1,backgroundColor:'#f1f5f9',color:'#444',border:'none',padding:'8px',borderRadius:'8px',fontWeight:'700',cursor:'pointer',fontSize:'13px'}}>ביטול</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                          <div style={{fontSize:'32px'}}>{p.emoji}</div>
                          <div style={{display:'flex',gap:'6px'}}>
                            <button onClick={()=>setEditingProduct(p)} style={{backgroundColor:'#eff6ff',color:'#1d4ed8',border:'none',padding:'4px 10px',borderRadius:'6px',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>✏️</button>
                            <button onClick={()=>deleteProduct(p.id)} style={{backgroundColor:'#fee2e2',color:'#dc2626',border:'none',padding:'4px 10px',borderRadius:'6px',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>🗑️</button>
                          </div>
                        </div>
                        <div style={{fontWeight:'700',fontSize:'14px',marginTop:'8px'}}>{p.name}</div>
                        <div style={{fontSize:'12px',color:'#0ea5e9',fontWeight:'700'}}>{p.brand}</div>
                        <div style={{display:'flex',justifyContent:'space-between',marginTop:'8px',alignItems:'center'}}>
                          <div style={{fontSize:'18px',fontWeight:'900',color:'#0f172a'}}>₪{p.price?.toLocaleString()}</div>
                          <div style={{fontSize:'12px',color:p.in_stock?'#10b981':'#ef4444',fontWeight:'700'}}>{p.in_stock?`✓ מלאי: ${p.stock_quantity}`:'✗ אזל'}</div>
                        </div>
                        {p.badge&&<div style={{marginTop:'6px'}}><span style={{backgroundColor:'#fee2e2',color:'#dc2626',fontSize:'11px',fontWeight:'700',padding:'2px 8px',borderRadius:'4px'}}>{p.badge}</span></div>}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers */}
          {activeTab==='customers'&&(
            <div>
              <h2 style={{margin:'0 0 20px',fontSize:'20px',fontWeight:'800',color:'#0f172a'}}>👥 לקוחות</h2>
              <div style={{backgroundColor:'white',borderRadius:'12px',padding:'20px',boxShadow:'0 1px 4px rgba(0,0,0,0.06)',textAlign:'center',color:'#888',padding:'60px'}}>
                <div style={{fontSize:'48px',marginBottom:'12px'}}>👥</div>
                <p style={{fontSize:'16px'}}>רשימת לקוחות תהיה זמינה בקרוב</p>
                <p style={{fontSize:'13px'}}>כרגע יש <strong>{stats.users}</strong> משתמשים רשומים</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}