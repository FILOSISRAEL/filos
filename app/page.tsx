'use client';
import { useEffect, useState } from 'react';
import { createClient } from './lib/supabase';

const categories = [
  {name:'שואבי רובוט',emoji:'🤖'},{name:'בית חכם',emoji:'📱'},
  {name:'גאדג\'טים',emoji:'🎮'},{name:'סוללות',emoji:'🔋'},
  {name:'מסני HEPA',emoji:'💨'},{name:'אביזרים',emoji:'🔌'},
  {name:'תאורה חכמה',emoji:'💡'},{name:'מתנות',emoji:'🎁'},
];

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('הכל');
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    supabase.from('products').select('*').eq('in_stock', true).then(({ data }) => {
      if (data) setProducts(data);
      setLoading(false);
    });
  }, []);

  const addToCart = (product: any) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? {...i, qty: i.qty+1} : i);
      return [...prev, {...product, qty: 1}];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev
      .map(i => i.id === id ? {...i, qty: i.qty + delta} : i)
      .filter(i => i.qty > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const goToCheckout = () => {
    localStorage.setItem('filos_cart', JSON.stringify(cart));
    window.location.href = '/checkout';
  };

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const filters = ['הכל', 'שואבי רובוט', 'אביזרים'];
  const filtered = activeFilter === 'הכל' ? products : products.filter(p => p.category === activeFilter);

  return (
    <div style={{fontFamily:'system-ui,sans-serif',direction:'rtl',backgroundColor:'#f5f5f0',minHeight:'100vh'}}>

      <header style={{backgroundColor:'white',padding:'0 40px',height:'64px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #eee',position:'sticky',top:0,zIndex:100,boxShadow:'0 1px 8px rgba(0,0,0,0.06)'}}>
        <span style={{fontSize:'22px',fontWeight:'900',color:'#0ea5e9',letterSpacing:'-1px'}}>FILOS</span>
        <nav style={{display:'flex',gap:'32px'}}>
          {['קטגוריות','מבצעים 🔥','מוצרים','למה FILOS?'].map(item=>(
            <a key={item} href="#" style={{fontSize:'14px',color:'#444',textDecoration:'none',fontWeight:'500'}}>{item}</a>
          ))}
        </nav>
        <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
          <div onClick={()=>setCartOpen(!cartOpen)} style={{cursor:'pointer',position:'relative',fontSize:'20px'}}>
            🛒
            {cartCount>0&&<span style={{position:'absolute',top:'-8px',right:'-8px',backgroundColor:'#f97316',color:'white',borderRadius:'50%',width:'18px',height:'18px',fontSize:'11px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'700'}}>{cartCount}</span>}
          </div>
          {user ? (
            <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
              <a href="/profile" style={{fontSize:'13px',color:'#444',textDecoration:'none',fontWeight:'600',backgroundColor:'#f1f5f9',padding:'8px 12px',borderRadius:'8px'}}>👤 {user.email?.split('@')[0]}</a>
              <button onClick={()=>supabase.auth.signOut().then(()=>setUser(null))} style={{backgroundColor:'#f1f5f9',color:'#444',border:'none',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',fontWeight:'600',fontSize:'14px'}}>יציאה</button>
            </div>
          ) : (
            <button onClick={()=>window.location.href='/login'} style={{backgroundColor:'#0ea5e9',color:'white',border:'none',padding:'8px 20px',borderRadius:'8px',cursor:'pointer',fontWeight:'700',fontSize:'14px'}}>כניסה</button>
          )}
        </div>
      </header>

      {cartOpen&&(
        <div style={{position:'fixed',top:'64px',left:'40px',backgroundColor:'white',borderRadius:'16px',padding:'20px',boxShadow:'0 8px 32px rgba(0,0,0,0.15)',zIndex:200,minWidth:'300px',maxWidth:'340px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
            <h3 style={{margin:0,fontSize:'16px',fontWeight:'700'}}>🛒 העגלה שלי ({cartCount})</h3>
            <button onClick={()=>setCartOpen(false)} style={{background:'none',border:'none',fontSize:'18px',cursor:'pointer',color:'#888'}}>✕</button>
          </div>

          {cartCount===0 ? (
            <p style={{color:'#888',fontSize:'14px',textAlign:'center',padding:'16px 0'}}>העגלה ריקה</p>
          ) : (
            <>
              <div style={{maxHeight:'320px',overflowY:'auto'}}>
                {cart.map(item=>(
                  <div key={item.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 0',borderBottom:'1px solid #f0f0f0'}}>
                    <div style={{fontSize:'28px'}}>{item.emoji}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:'700',fontSize:'13px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</div>
                      <div style={{fontSize:'12px',color:'#0ea5e9',fontWeight:'700'}}>₪{item.price.toLocaleString()}</div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                      <button onClick={()=>updateQty(item.id,-1)} style={{width:'24px',height:'24px',borderRadius:'50%',border:'1.5px solid #e2e8f0',backgroundColor:'white',fontSize:'14px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'700',color:'#444'}}>−</button>
                      <span style={{fontSize:'13px',fontWeight:'700',minWidth:'16px',textAlign:'center'}}>{item.qty}</span>
                      <button onClick={()=>updateQty(item.id,1)} style={{width:'24px',height:'24px',borderRadius:'50%',border:'1.5px solid #e2e8f0',backgroundColor:'white',fontSize:'14px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'700',color:'#444'}}>+</button>
                      <button onClick={()=>removeFromCart(item.id)} style={{width:'24px',height:'24px',borderRadius:'50%',border:'none',backgroundColor:'#fee2e2',fontSize:'12px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#dc2626'}}>✕</button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0 8px',fontWeight:'700',fontSize:'15px',borderTop:'2px solid #f0f0f0',marginTop:'4px'}}>
                <span>סה"כ</span>
                <span style={{color:'#0ea5e9'}}>₪{cartTotal.toLocaleString()}</span>
              </div>
              <button onClick={goToCheckout} style={{width:'100%',backgroundColor:'#0ea5e9',color:'white',border:'none',padding:'12px',borderRadius:'10px',fontWeight:'700',cursor:'pointer',fontSize:'15px'}}>
                לתשלום ←
              </button>
            </>
          )}
        </div>
      )}

      <section style={{backgroundColor:'white',padding:'80px 40px',textAlign:'center'}}>
        <div style={{display:'inline-block',backgroundColor:'#e0f2fe',color:'#0369a1',padding:'6px 16px',borderRadius:'20px',fontSize:'13px',fontWeight:'700',marginBottom:'24px'}}>• החנות החכמה של ישראל</div>
        <h1 style={{fontSize:'60px',fontWeight:'900',lineHeight:'1.1',marginBottom:'16px',color:'#0f172a'}}>קנה <span style={{color:'#0ea5e9'}}>חכם.</span><br/>חסוך יותר.</h1>
        <p style={{fontSize:'18px',color:'#666',maxWidth:'500px',margin:'0 auto 32px'}}>שואבי רובוט, בית חכם, גאדג'טים וסוללות — במחיר שלא תמצא בשום מקום אחר.</p>
        <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap'}}>
          <button style={{backgroundColor:'#0f172a',color:'white',border:'none',padding:'14px 32px',borderRadius:'12px',fontSize:'16px',fontWeight:'700',cursor:'pointer'}}>גלה את המוצרים ↓</button>
          <button style={{backgroundColor:'white',color:'#0f172a',border:'2px solid #0f172a',padding:'14px 32px',borderRadius:'12px',fontSize:'16px',fontWeight:'700',cursor:'pointer'}}>דבר עם FILOS AI</button>
        </div>
        <div style={{display:'flex',gap:'48px',justifyContent:'center',marginTop:'48px'}}>
          {[['15K+','לקוחות מרוצים'],['★4.9','דירוג ממוצע'],['48h','משלוח מהיר'],['₪0','משלוח חינם מ-299']].map(([val,label])=>(
            <div key={label} style={{textAlign:'center'}}>
              <div style={{fontSize:'22px',fontWeight:'900',color:'#0ea5e9'}}>{val}</div>
              <div style={{fontSize:'12px',color:'#888',marginTop:'4px'}}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{backgroundColor:'#0f172a',padding:'12px 40px',display:'flex',justifyContent:'center',gap:'48px'}}>
        {['🚚 משלוח חינם מ-₪299','🛡️ אחריות ישראלית','💰 מחיר הוגן תמיד','📞 תמיכה 24/7'].map(item=>(
          <span key={item} style={{color:'#cbd5e1',fontSize:'13px',fontWeight:'500'}}>{item}</span>
        ))}
      </div>

      <section style={{padding:'48px 40px',textAlign:'center'}}>
        <p style={{color:'#0ea5e9',fontSize:'13px',fontWeight:'700',marginBottom:'8px'}}>קנה לפי קטגוריה</p>
        <h2 style={{fontSize:'32px',fontWeight:'900',marginBottom:'32px',color:'#0f172a'}}>מה אתה מחפש היום?</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:'12px',maxWidth:'960px',margin:'0 auto'}}>
          {categories.map(cat=>(
            <div key={cat.name} onClick={()=>setActiveFilter(cat.name)} style={{backgroundColor:'white',borderRadius:'16px',padding:'20px 8px',textAlign:'center',cursor:'pointer',border:'2px solid #eee'}}
              onMouseEnter={e=>(e.currentTarget.style.borderColor='#0ea5e9')}
              onMouseLeave={e=>(e.currentTarget.style.borderColor='#eee')}>
              <div style={{fontSize:'32px',marginBottom:'8px'}}>{cat.emoji}</div>
              <div style={{fontSize:'12px',fontWeight:'700',color:'#333'}}>{cat.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{padding:'0 40px 64px'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <p style={{color:'#0ea5e9',fontSize:'13px',fontWeight:'700',marginBottom:'8px'}}>הכי נמכרים</p>
          <h2 style={{fontSize:'32px',fontWeight:'900',color:'#0f172a',marginBottom:'24px'}}>מוצרים מומלצים</h2>
          <div style={{display:'flex',gap:'8px',justifyContent:'center'}}>
            {filters.map(f=>(
              <button key={f} onClick={()=>setActiveFilter(f)} style={{padding:'8px 20px',borderRadius:'20px',border:'2px solid',borderColor:activeFilter===f?'#0ea5e9':'#ddd',backgroundColor:activeFilter===f?'#0ea5e9':'white',color:activeFilter===f?'white':'#444',fontWeight:'700',fontSize:'13px',cursor:'pointer'}}>{f}</button>
            ))}
          </div>
        </div>
        {loading ? (
          <div style={{textAlign:'center',padding:'60px',color:'#888',fontSize:'16px'}}>טוען מוצרים...</div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'20px',maxWidth:'1100px',margin:'0 auto'}}>
            {filtered.map(p=>(
              <div key={p.id} style={{backgroundColor:'white',borderRadius:'20px',padding:'20px',textAlign:'center',position:'relative',border:'1px solid #f0f0f0',boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}}>
                {p.discount>0&&<span style={{position:'absolute',top:'12px',right:'12px',backgroundColor:'#f59e0b',color:'white',fontSize:'11px',fontWeight:'700',padding:'4px 8px',borderRadius:'8px'}}>-{p.discount}%</span>}
                {p.badge&&<span style={{position:'absolute',top:'12px',left:'12px',backgroundColor:p.badge==='חדש'?'#10b981':'#ef4444',color:'white',fontSize:'11px',fontWeight:'700',padding:'4px 8px',borderRadius:'8px'}}>{p.badge}</span>}
                <div style={{fontSize:'52px',margin:'16px 0'}}>{p.emoji}</div>
                <div style={{fontSize:'11px',color:'#0ea5e9',fontWeight:'700',marginBottom:'4px',letterSpacing:'1px'}}>{p.brand}</div>
                <div style={{fontSize:'14px',fontWeight:'700',marginBottom:'12px',color:'#0f172a',lineHeight:'1.3'}}>{p.name}</div>
                <div style={{fontSize:'22px',fontWeight:'900',color:'#0f172a'}}>₪{p.price.toLocaleString()}</div>
                {p.old_price>0&&<div style={{fontSize:'12px',color:'#999',textDecoration:'line-through',marginBottom:'4px'}}>₪{p.old_price.toLocaleString()}</div>}
                <button onClick={()=>addToCart(p)} style={{marginTop:'12px',width:'100%',backgroundColor:'#f97316',color:'white',border:'none',padding:'10px',borderRadius:'10px',fontWeight:'700',cursor:'pointer',fontSize:'14px'}}>
                  {cart.find(i=>i.id===p.id) ? `בעגלה (${cart.find(i=>i.id===p.id)?.qty}) +` : '+ הוסף לעגלה'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{background:'linear-gradient(135deg,#0ea5e9,#0284c7)',padding:'64px 40px',textAlign:'center'}}>
        <h2 style={{fontSize:'36px',fontWeight:'900',color:'white',marginBottom:'12px'}}>לא יודע מה לבחור?</h2>
        <p style={{color:'rgba(255,255,255,0.85)',fontSize:'16px',marginBottom:'28px'}}>ספר לנו על הבית שלך ואנחנו נמצא את הרובוט המושלם — בחינם, בשניות.</p>
        <button style={{backgroundColor:'white',color:'#0ea5e9',border:'none',padding:'14px 32px',borderRadius:'12px',fontSize:'16px',fontWeight:'700',cursor:'pointer'}}>→ פתח שיחה עם AI</button>
      </section>

      <footer style={{backgroundColor:'#0f172a',padding:'40px',color:'#64748b',fontSize:'13px'}}>
        <div style={{display:'flex',justifyContent:'space-between',maxWidth:'1100px',margin:'0 auto',flexWrap:'wrap',gap:'24px'}}>
          <div>
            <div style={{fontSize:'20px',fontWeight:'900',color:'#0ea5e9',marginBottom:'8px'}}>FILOS</div>
            <div>החנות החכמה של ישראל</div>
          </div>
          {[['חנות',['כל המוצרים','שואבי רובוט','בית חכם','מבצעים']],['שירות',['צור קשר','החזרות','אחריות','שאלות נפוצות']],['משפטי',['תנאי שימוש','פרטיות','נגישות']]].map(([title,links])=>(
            <div key={title as string}>
              <div style={{color:'white',fontWeight:'700',marginBottom:'12px'}}>{title as string}</div>
              {(links as string[]).map(l=><div key={l} style={{marginBottom:'8px',cursor:'pointer'}}>{l}</div>)}
            </div>
          ))}
        </div>
        <div style={{textAlign:'center',marginTop:'32px',borderTop:'1px solid #1e293b',paddingTop:'24px'}}>© FILOS 2026 — נבנה עם ❤️ בישראל</div>
      </footer>
    </div>
  );
}