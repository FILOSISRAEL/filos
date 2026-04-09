'use client';
import { useEffect, useState } from 'react';
import { createClient } from './lib/supabase';

const products = [
  { id:1, name:'Roborock S8 Pro Ultra', brand:'ROBOROCK', price:1999, oldPrice:2999, discount:30, emoji:'🤖', badge:'HOT', category:'שואבי רובוט' },
  { id:2, name:'Roomba Combo j9+', brand:'IROBOT', price:2499, oldPrice:3500, discount:30, emoji:'🤖', badge:'', category:'שואבי רובוט' },
  { id:3, name:'Deebot T30S Complete', brand:'ECOVACS', price:1749, oldPrice:2200, discount:20, emoji:'🤖', badge:'חדש', category:'שואבי רובוט' },
  { id:4, name:'Robot Vacuum S20+', brand:'XIAOMI', price:1099, oldPrice:1299, discount:15, emoji:'🤖', badge:'', category:'שואבי רובוט' },
  { id:5, name:'מנגנה HEPA מקורי 3 יח\'', brand:'FILOS', price:69, oldPrice:0, discount:0, emoji:'🫧', badge:'', category:'אביזרים' },
  { id:6, name:'סוללה חלופית Roomba', brand:'GENERIC', price:89, oldPrice:0, discount:0, emoji:'🔋', badge:'', category:'אביזרים' },
];

const categories = [
  {name:'שואבי רובוט',emoji:'🤖'},{name:'בית חכם',emoji:'📱'},
  {name:'גאדג\'טים',emoji:'🎮'},{name:'סוללות',emoji:'🔋'},
  {name:'מסני HEPA',emoji:'💨'},{name:'אביזרים',emoji:'🔌'},
  {name:'תאורה חכמה',emoji:'💡'},{name:'מתנות',emoji:'🎁'},
];

export default function Home() {
  const [cart, setCart] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState('הכל');
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const addToCart = (id: number) => setCart(prev => [...prev, id]);
  const cartCount = cart.length;
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
              <span style={{fontSize:'13px',color:'#444'}}>{user.email}</span>
              <button onClick={()=>supabase.auth.signOut().then(()=>setUser(null))} style={{backgroundColor:'#f1f5f9',color:'#444',border:'none',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',fontWeight:'600',fontSize:'14px'}}>יציאה</button>
            </div>
          ) : (
            <button onClick={()=>window.location.href='/login'} style={{backgroundColor:'#0ea5e9',color:'white',border:'none',padding:'8px 20px',borderRadius:'8px',cursor:'pointer',fontWeight:'700',fontSize:'14px'}}>כניסה</button>
          )}
        </div>
      </header>

      {cartOpen&&(
        <div style={{position:'fixed',top:'64px',left:'40px',backgroundColor:'white',borderRadius:'16px',padding:'20px',boxShadow:'0 8px 32px rgba(0,0,0,0.15)',zIndex:200,minWidth:'280px'}}>
          <h3 style={{margin:'0 0 12px',fontSize:'16px',fontWeight:'700'}}>🛒 העגלה שלי ({cartCount})</h3>
          {cartCount===0?<p style={{color:'#888',fontSize:'14px'}}>העגלה ריקה</p>:
            cart.map((id,i)=>{
              const p=products.find(x=>x.id===id);
              return p?<div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f0f0f0',fontSize:'14px'}}><span>{p.name}</span><span style={{fontWeight:'700'}}>₪{p.price}</span></div>:null;
            })
          }
          {cartCount>0&&<button style={{marginTop:'12px',width:'100%',backgroundColor:'#0ea5e9',color:'white',border:'none',padding:'10px',borderRadius:'8px',fontWeight:'700',cursor:'pointer'}}>לתשלום ←</button>}
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
            <div key={cat.name} style={{backgroundColor:'white',borderRadius:'16px',padding:'20px 8px',textAlign:'center',cursor:'pointer',border:'2px solid #eee'}}
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
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'20px',maxWidth:'1100px',margin:'0 auto'}}>
          {filtered.map(p=>(
            <div key={p.id} style={{backgroundColor:'white',borderRadius:'20px',padding:'20px',textAlign:'center',position:'relative',border:'1px solid #f0f0f0',boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}}>
              {p.discount>0&&<span style={{position:'absolute',top:'12px',right:'12px',backgroundColor:'#f59e0b',color:'white',fontSize:'11px',fontWeight:'700',padding:'4px 8px',borderRadius:'8px'}}>-{p.discount}%</span>}
              {p.badge&&<span style={{position:'absolute',top:'12px',left:'12px',backgroundColor:p.badge==='חדש'?'#10b981':'#ef4444',color:'white',fontSize:'11px',fontWeight:'700',padding:'4px 8px',borderRadius:'8px'}}>{p.badge}</span>}
              <div style={{fontSize:'52px',margin:'16px 0'}}>{p.emoji}</div>
              <div style={{fontSize:'11px',color:'#0ea5e9',fontWeight:'700',marginBottom:'4px',letterSpacing:'1px'}}>{p.brand}</div>
              <div style={{fontSize:'14px',fontWeight:'700',marginBottom:'12px',color:'#0f172a',lineHeight:'1.3'}}>{p.name}</div>
              <div style={{fontSize:'22px',fontWeight:'900',color:'#0f172a'}}>₪{p.price.toLocaleString()}</div>
              {p.oldPrice>0&&<div style={{fontSize:'12px',color:'#999',textDecoration:'line-through',marginBottom:'4px'}}>₪{p.oldPrice.toLocaleString()}</div>}
              <button onClick={()=>addToCart(p.id)} style={{marginTop:'12px',width:'100%',backgroundColor:'#f97316',color:'white',border:'none',padding:'10px',borderRadius:'10px',fontWeight:'700',cursor:'pointer',fontSize:'14px'}}>+ הוסף לעגלה</button>
            </div>
          ))}
        </div>
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