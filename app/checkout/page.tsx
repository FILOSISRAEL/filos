'use client';
import { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase';

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [form, setForm] = useState({ name:'', email:'', phone:'', address:'', city:'' });
  const supabase = createClient();

  const total = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const shipping = total >= 299 ? 0 : 29;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user?.email) setForm(f => ({...f, email: data.user.email || ''}));
    });
    const stored = localStorage.getItem('filos_cart');
    if (stored) {
      try { setCart(JSON.parse(stored)); } catch {}
    }
  }, []);

  const updateQty = (id: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(i => i.id === id ? {...i, qty: Math.max(1, i.qty + delta)} : i);
      localStorage.setItem('filos_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (id: string) => {
    setCart(prev => {
      const updated = prev.filter(i => i.id !== id);
      localStorage.setItem('filos_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const placeOrder = async () => {
    setLoading(true);
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          total: total + shipping,
          shipping,
          status: 'pending',
          payment_status: 'pending',
          full_name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
        })
        .select()
        .single();

      if (error || !order) throw error;

      await supabase.from('order_items').insert(
        cart.map(item => ({
          order_id: order.id,
          product_id: item.id,
          product_name: item.name,
          quantity: item.qty,
          price: item.price,
        }))
      );

      if (user?.id) {
        const points = Math.floor((total + shipping) / 10);
        const { data: loyalty } = await supabase
          .from('loyalty').select('*').eq('user_id', user.id).single();
        if (loyalty) {
          await supabase.from('loyalty').update({
            points: loyalty.points + points,
            total_spent: loyalty.total_spent + total + shipping,
          }).eq('user_id', user.id);
        } else {
          await supabase.from('loyalty').insert({ user_id: user.id, points, total_spent: total + shipping });
        }
        await supabase.from('loyalty_events').insert({
          user_id: user.id, points,
          reason: `רכישה #${order.id.slice(0,8)}`,
          order_id: order.id,
        });
      }

      localStorage.removeItem('filos_cart');
      setOrderId(order.id.slice(0,8).toUpperCase());
      setStep(4);
    } catch {
      alert('שגיאה בשמירת ההזמנה, נסה שוב');
    }
    setLoading(false);
  };

  return (
    <div style={{fontFamily:'system-ui,sans-serif',direction:'rtl',backgroundColor:'#f5f5f0',minHeight:'100vh'}}>

      <header style={{backgroundColor:'white',padding:'0 40px',height:'64px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #eee',boxShadow:'0 1px 8px rgba(0,0,0,0.06)'}}>
        <a href="/" style={{fontSize:'22px',fontWeight:'900',color:'#0ea5e9',textDecoration:'none'}}>FILOS</a>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          {['עגלה','פרטים','תשלום','אישור'].map((s,i)=>(
            <div key={s} style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <div style={{width:'28px',height:'28px',borderRadius:'50%',backgroundColor:step>i?'#0ea5e9':step===i+1?'#0f172a':'#e2e8f0',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:'700'}}>
                {step>i?'✓':i+1}
              </div>
              <span style={{fontSize:'13px',fontWeight:step===i+1?'700':'400',color:step===i+1?'#0f172a':'#94a3b8'}}>{s}</span>
              {i<3&&<div style={{width:'24px',height:'1px',backgroundColor:'#e2e8f0'}}/>}
            </div>
          ))}
        </div>
        <div/>
      </header>

      <div style={{maxWidth:'1000px',margin:'40px auto',padding:'0 24px',display:'grid',gridTemplateColumns:'1fr 360px',gap:'24px'}}>

        <div>
          {step===1&&(
            <div style={{backgroundColor:'white',borderRadius:'16px',padding:'32px'}}>
              <h2 style={{fontSize:'20px',fontWeight:'800',marginBottom:'24px'}}>🛒 העגלה שלי</h2>
              {cart.length===0 ? (
                <div style={{textAlign:'center',padding:'40px',color:'#888'}}>
                  <div style={{fontSize:'48px',marginBottom:'16px'}}>🛒</div>
                  <p>העגלה ריקה</p>
                  <a href="/" style={{color:'#0ea5e9',fontWeight:'700'}}>חזור לחנות</a>
                </div>
              ) : (
                <>
                  {cart.map((item)=>(
                    <div key={item.id} style={{display:'flex',alignItems:'center',gap:'16px',padding:'16px 0',borderBottom:'1px solid #f0f0f0'}}>
                      <div style={{fontSize:'36px'}}>{item.emoji}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:'700',fontSize:'15px'}}>{item.name}</div>
                        <div style={{fontSize:'13px',color:'#888',marginTop:'2px'}}>{item.brand}</div>
                        <div style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'8px'}}>
                          <button onClick={()=>updateQty(item.id,-1)} style={{width:'28px',height:'28px',borderRadius:'50%',border:'2px solid #e2e8f0',backgroundColor:'white',fontSize:'16px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'700'}}>−</button>
                          <span style={{fontSize:'15px',fontWeight:'700',minWidth:'20px',textAlign:'center'}}>{item.qty}</span>
                          <button onClick={()=>updateQty(item.id,1)} style={{width:'28px',height:'28px',borderRadius:'50%',border:'2px solid #e2e8f0',backgroundColor:'white',fontSize:'16px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'700'}}>+</button>
                        </div>
                      </div>
                      <div style={{textAlign:'left'}}>
                        <div style={{fontSize:'18px',fontWeight:'800'}}>₪{(item.price*item.qty).toLocaleString()}</div>
                        <button onClick={()=>removeItem(item.id)} style={{marginTop:'8px',backgroundColor:'#fee2e2',color:'#dc2626',border:'none',padding:'4px 10px',borderRadius:'6px',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>הסר</button>
                      </div>
                    </div>
                  ))}
                  <button onClick={()=>setStep(2)} style={{marginTop:'24px',width:'100%',backgroundColor:'#0ea5e9',color:'white',border:'none',padding:'14px',borderRadius:'12px',fontSize:'16px',fontWeight:'700',cursor:'pointer'}}>
                    המשך לפרטי משלוח ←
                  </button>
                </>
              )}
            </div>
          )}

          {step===2&&(
            <div style={{backgroundColor:'white',borderRadius:'16px',padding:'32px'}}>
              <h2 style={{fontSize:'20px',fontWeight:'800',marginBottom:'24px'}}>📦 פרטי משלוח</h2>
              {[['name','שם מלא','ישראל ישראלי'],['email','אימייל','your@email.com'],['phone','טלפון','050-0000000'],['address','כתובת','רחוב הרצל 1'],['city','עיר','תל אביב']].map(([key,label,ph])=>(
                <div key={key} style={{marginBottom:'16px'}}>
                  <label style={{display:'block',fontSize:'13px',fontWeight:'600',marginBottom:'6px',color:'#374151'}}>{label}</label>
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={e=>setForm({...form,[key]:e.target.value})}
                    placeholder={ph}
                    style={{width:'100%',padding:'12px',border:'2px solid #e2e8f0',borderRadius:'10px',fontSize:'14px',outline:'none',boxSizing:'border-box'}}/>
                </div>
              ))}
              <div style={{display:'flex',gap:'12px',marginTop:'8px'}}>
                <button onClick={()=>setStep(1)} style={{flex:1,backgroundColor:'#f1f5f9',color:'#444',border:'none',padding:'14px',borderRadius:'12px',fontSize:'15px',fontWeight:'600',cursor:'pointer'}}>← חזור</button>
                <button onClick={()=>setStep(3)} disabled={!form.name||!form.email||!form.phone} style={{flex:2,backgroundColor:form.name&&form.email&&form.phone?'#0ea5e9':'#cbd5e1',color:'white',border:'none',padding:'14px',borderRadius:'12px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>המשך לתשלום ←</button>
              </div>
            </div>
          )}

          {step===3&&(
            <div style={{backgroundColor:'white',borderRadius:'16px',padding:'32px'}}>
              <h2 style={{fontSize:'20px',fontWeight:'800',marginBottom:'8px'}}>💳 תשלום מאובטח</h2>
              <p style={{color:'#888',fontSize:'14px',marginBottom:'24px'}}>🔒 מאובטח על ידי HYP — אחריות מלאה</p>
              <div style={{backgroundColor:'#f8fafc',borderRadius:'12px',padding:'24px',textAlign:'center',border:'2px dashed #e2e8f0',marginBottom:'24px'}}>
                <div style={{fontSize:'48px',marginBottom:'12px'}}>🏦</div>
                <div style={{fontSize:'16px',fontWeight:'700',color:'#0f172a',marginBottom:'8px'}}>בקרוב — תשלום דרך HYP</div>
                <div style={{fontSize:'13px',color:'#888'}}>Bit, כרטיס אשראי, Apple Pay ועוד</div>
              </div>
              <div style={{display:'flex',gap:'12px'}}>
                <button onClick={()=>setStep(2)} style={{flex:1,backgroundColor:'#f1f5f9',color:'#444',border:'none',padding:'14px',borderRadius:'12px',fontSize:'15px',fontWeight:'600',cursor:'pointer'}}>← חזור</button>
                <button onClick={placeOrder} disabled={loading} style={{flex:2,backgroundColor:'#10b981',color:'white',border:'none',padding:'14px',borderRadius:'12px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>
                  {loading?'⏳ שומר הזמנה...':'✓ השלם הזמנה'}
                </button>
              </div>
            </div>
          )}

          {step===4&&(
            <div style={{backgroundColor:'white',borderRadius:'16px',padding:'48px',textAlign:'center'}}>
              <div style={{fontSize:'64px',marginBottom:'16px'}}>🎉</div>
              <h2 style={{fontSize:'28px',fontWeight:'900',color:'#0f172a',marginBottom:'8px'}}>ההזמנה התקבלה!</h2>
              <p style={{color:'#666',fontSize:'16px',marginBottom:'8px'}}>מספר הזמנה: <strong style={{color:'#0ea5e9'}}>#{orderId}</strong></p>
              <p style={{color:'#666',fontSize:'14px',marginBottom:'32px'}}>תודה על הקנייה! נשלח לך אימייל אישור בקרוב.</p>
              {user&&(
                <div style={{backgroundColor:'#f0fdf4',borderRadius:'12px',padding:'16px',marginBottom:'24px',fontSize:'14px',color:'#166534'}}>
                  🎁 צברת <strong>{Math.floor((total+shipping)/10)}</strong> נקודות במועדון FILOS!
                </div>
              )}
              <a href="/" style={{backgroundColor:'#0ea5e9',color:'white',padding:'14px 32px',borderRadius:'12px',fontSize:'16px',fontWeight:'700',textDecoration:'none'}}>← חזור לחנות</a>
            </div>
          )}
        </div>

        <div>
          <div style={{backgroundColor:'white',borderRadius:'16px',padding:'24px',position:'sticky',top:'80px'}}>
            <h3 style={{fontSize:'16px',fontWeight:'800',marginBottom:'16px'}}>סיכום הזמנה</h3>
            {cart.map((item)=>(
              <div key={item.id} style={{display:'flex',justifyContent:'space-between',fontSize:'13px',marginBottom:'8px'}}>
                <span style={{color:'#666'}}>{item.emoji} {item.name} x{item.qty}</span>
                <span style={{fontWeight:'600'}}>₪{(item.price*item.qty).toLocaleString()}</span>
              </div>
            ))}
            <div style={{borderTop:'1px solid #f0f0f0',marginTop:'12px',paddingTop:'12px'}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',marginBottom:'6px'}}>
                <span style={{color:'#666'}}>משלוח</span>
                <span style={{color:shipping===0?'#10b981':'#0f172a',fontWeight:'600'}}>{shipping===0?'חינם':'₪'+shipping}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'18px',fontWeight:'900',marginTop:'12px',paddingTop:'12px',borderTop:'2px solid #0f172a'}}>
                <span>סה"כ</span>
                <span style={{color:'#0ea5e9'}}>₪{(total+shipping).toLocaleString()}</span>
              </div>
            </div>
            <div style={{marginTop:'16px',backgroundColor:'#f0fdf4',borderRadius:'8px',padding:'10px',fontSize:'12px',color:'#166534',textAlign:'center'}}>
              🛡️ אחריות ישראלית מלאה | החזר 30 יום
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}