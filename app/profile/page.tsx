'use client';
import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase';

const tierColors: Record<string, string> = {
  'רגיל': '#94a3b8',
  'Silver': '#94a3b8',
  'Gold': '#f59e0b',
  'VIP': '#8b5cf6',
};

const tierBenefits: Record<string, string[]> = {
  'רגיל': ['נקודות על כל קנייה', 'גישה למבצעים'],
  'Silver': ['נקודות כפולות', 'משלוח מהיר בחינם', 'גישה מוקדמת למבצעים'],
  'Gold': ['נקודות משולשות', 'החזרה חינם', 'תמיכה עדיפה', 'הנחה 5%'],
  'VIP': ['נקודות x5', 'מנהל אישי', 'הנחה 10%', 'גישה ל-drops בלעדיים'],
};

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loyalty, setLoyalty] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name:'', phone:'', address:'', city:'' });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/login'; return; }
      setUser(data.user);

      const [{ data: prof }, { data: loy }, { data: ords }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', data.user.id).single(),
        supabase.from('loyalty').select('*').eq('user_id', data.user.id).single(),
        supabase.from('orders').select('*, order_items(*)').eq('user_id', data.user.id).order('created_at', { ascending: false }).limit(10),
      ]);

      setProfile(prof);
      setLoyalty(loy);
      setOrders(ords || []);
      if (prof) setForm({ full_name: prof.full_name||'', phone: prof.phone||'', address: prof.address||'', city: prof.city||'' });
    });
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    await supabase.from('profiles').upsert({ id: user.id, ...form });
    setProfile((p: any) => ({...p, ...form}));
    setEditing(false);
    setSaving(false);
  };

  const nextTier = loyalty?.tier === 'רגיל' ? 'Silver' : loyalty?.tier === 'Silver' ? 'Gold' : loyalty?.tier === 'Gold' ? 'VIP' : null;
  const nextTierSpend = loyalty?.tier === 'רגיל' ? 500 : loyalty?.tier === 'Silver' ? 2000 : loyalty?.tier === 'Gold' ? 5000 : null;
  const progress = nextTierSpend ? Math.min(100, ((loyalty?.total_spent || 0) / nextTierSpend) * 100) : 100;

  const statusLabel: Record<string, string> = {
    pending: '⏳ ממתין',
    processing: '🔄 בטיפול',
    shipped: '🚚 נשלח',
    delivered: '✅ נמסר',
    cancelled: '❌ בוטל',
  };

  if (!user) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontSize:'16px',color:'#888'}}>
      טוען...
    </div>
  );

  return (
    <div style={{fontFamily:'system-ui,sans-serif',direction:'rtl',backgroundColor:'#f5f5f0',minHeight:'100vh'}}>

      <header style={{backgroundColor:'white',padding:'0 40px',height:'64px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #eee',boxShadow:'0 1px 8px rgba(0,0,0,0.06)'}}>
        <a href="/" style={{fontSize:'22px',fontWeight:'900',color:'#0ea5e9',textDecoration:'none'}}>FILOS</a>
        <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
          <span style={{fontSize:'13px',color:'#666'}}>{user.email}</span>
          <button onClick={()=>supabase.auth.signOut().then(()=>window.location.href='/')} style={{backgroundColor:'#f1f5f9',color:'#444',border:'none',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',fontWeight:'600',fontSize:'14px'}}>יציאה</button>
        </div>
      </header>

      <div style={{maxWidth:'1000px',margin:'32px auto',padding:'0 24px'}}>

        {/* Hero card */}
        <div style={{backgroundColor:'white',borderRadius:'20px',padding:'32px',marginBottom:'24px',display:'flex',alignItems:'center',gap:'24px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          <div style={{width:'72px',height:'72px',borderRadius:'50%',backgroundColor:'#0ea5e9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'32px',flexShrink:0}}>
            👤
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:'22px',fontWeight:'900',color:'#0f172a'}}>{profile?.full_name || user.email?.split('@')[0]}</div>
            <div style={{fontSize:'14px',color:'#888',marginTop:'2px'}}>{user.email}</div>
            <div style={{display:'flex',gap:'12px',marginTop:'8px',flexWrap:'wrap'}}>
              <span style={{backgroundColor: tierColors[loyalty?.tier||'רגיל']+'22', color: tierColors[loyalty?.tier||'רגיל'], padding:'4px 12px',borderRadius:'20px',fontSize:'13px',fontWeight:'700'}}>
                {loyalty?.tier === 'VIP' ? '👑' : loyalty?.tier === 'Gold' ? '🥇' : loyalty?.tier === 'Silver' ? '🥈' : '🎖️'} {loyalty?.tier || 'רגיל'}
              </span>
              <span style={{backgroundColor:'#f0fdf4',color:'#166534',padding:'4px 12px',borderRadius:'20px',fontSize:'13px',fontWeight:'700'}}>
                🎁 {loyalty?.points?.toLocaleString() || 0} נקודות
              </span>
              <span style={{backgroundColor:'#eff6ff',color:'#1d4ed8',padding:'4px 12px',borderRadius:'20px',fontSize:'13px',fontWeight:'700'}}>
                🛒 {orders.length} הזמנות
              </span>
            </div>
          </div>
          <button onClick={()=>setEditing(!editing)} style={{backgroundColor:'#f1f5f9',color:'#444',border:'none',padding:'10px 20px',borderRadius:'10px',cursor:'pointer',fontWeight:'600',fontSize:'14px',flexShrink:0}}>
            {editing ? 'ביטול' : '✏️ עריכה'}
          </button>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:'8px',marginBottom:'24px',flexWrap:'wrap'}}>
          {[['overview','🏠 סקירה'],['orders','📦 הזמנות'],['loyalty','🎁 מועדון'],['settings','⚙️ הגדרות']].map(([tab,label])=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:'10px 20px',borderRadius:'10px',border:'2px solid',borderColor:activeTab===tab?'#0ea5e9':'#e2e8f0',backgroundColor:activeTab===tab?'#0ea5e9':'white',color:activeTab===tab?'white':'#444',fontWeight:'700',fontSize:'14px',cursor:'pointer'}}>
              {label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab==='overview'&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
            <div style={{backgroundColor:'white',borderRadius:'16px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              <h3 style={{margin:'0 0 16px',fontSize:'16px',fontWeight:'800'}}>📊 סטטיסטיקות</h3>
              {[
                ['סה"כ קניות', `₪${loyalty?.total_spent?.toLocaleString() || 0}`],
                ['נקודות שצברת', `${loyalty?.points?.toLocaleString() || 0} נק׳`],
                ['הזמנות שבוצעו', `${orders.length}`],
                ['דרגה נוכחית', loyalty?.tier || 'רגיל'],
              ].map(([label, value])=>(
                <div key={label} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #f5f5f5',fontSize:'14px'}}>
                  <span style={{color:'#666'}}>{label}</span>
                  <span style={{fontWeight:'700',color:'#0f172a'}}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{backgroundColor:'white',borderRadius:'16px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              <h3 style={{margin:'0 0 16px',fontSize:'16px',fontWeight:'800'}}>🚀 התקדמות לדרגה הבאה</h3>
              {nextTier ? (
                <>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',marginBottom:'8px'}}>
                    <span style={{color:'#666'}}>לקראת {nextTier}</span>
                    <span style={{fontWeight:'700'}}>₪{loyalty?.total_spent?.toLocaleString() || 0} / ₪{nextTierSpend?.toLocaleString()}</span>
                  </div>
                  <div style={{backgroundColor:'#f1f5f9',borderRadius:'8px',height:'12px',overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${progress}%`,backgroundColor:'#0ea5e9',borderRadius:'8px',transition:'width 0.5s'}}/>
                  </div>
                  <div style={{fontSize:'12px',color:'#888',marginTop:'8px'}}>
                    עוד ₪{((nextTierSpend||0) - (loyalty?.total_spent||0)).toLocaleString()} לדרגת {nextTier}
                  </div>
                </>
              ) : (
                <div style={{textAlign:'center',padding:'16px',color:'#8b5cf6',fontWeight:'700',fontSize:'16px'}}>
                  👑 הגעת לדרגה הגבוהה ביותר!
                </div>
              )}

              <div style={{marginTop:'20px'}}>
                <div style={{fontSize:'13px',fontWeight:'700',marginBottom:'8px',color:'#444'}}>הטבות הדרגה שלך:</div>
                {(tierBenefits[loyalty?.tier||'רגיל']||[]).map((b:string)=>(
                  <div key={b} style={{fontSize:'13px',color:'#666',padding:'4px 0'}}>✓ {b}</div>
                ))}
              </div>
            </div>

            <div style={{backgroundColor:'white',borderRadius:'16px',padding:'24px',gridColumn:'1/-1',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              <h3 style={{margin:'0 0 16px',fontSize:'16px',fontWeight:'800'}}>📦 הזמנות אחרונות</h3>
              {orders.length===0 ? (
                <p style={{color:'#888',textAlign:'center',padding:'20px'}}>אין הזמנות עדיין</p>
              ) : orders.slice(0,3).map(order=>(
                <div key={order.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #f5f5f5'}}>
                  <div>
                    <div style={{fontWeight:'700',fontSize:'14px'}}>#{order.id.slice(0,8).toUpperCase()}</div>
                    <div style={{fontSize:'12px',color:'#888'}}>{new Date(order.created_at).toLocaleDateString('he-IL')}</div>
                  </div>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:'13px'}}>{statusLabel[order.status]||order.status}</div>
                  </div>
                  <div style={{fontWeight:'800',color:'#0ea5e9'}}>₪{order.total?.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders */}
        {activeTab==='orders'&&(
          <div style={{backgroundColor:'white',borderRadius:'16px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
            <h3 style={{margin:'0 0 20px',fontSize:'16px',fontWeight:'800'}}>📦 כל ההזמנות שלי</h3>
            {orders.length===0 ? (
              <div style={{textAlign:'center',padding:'40px',color:'#888'}}>
                <div style={{fontSize:'48px',marginBottom:'12px'}}>📦</div>
                <p>אין הזמנות עדיין</p>
                <a href="/" style={{color:'#0ea5e9',fontWeight:'700'}}>בוא נתחיל לקנות!</a>
              </div>
            ) : orders.map(order=>(
              <div key={order.id} style={{border:'1px solid #f0f0f0',borderRadius:'12px',padding:'16px',marginBottom:'12px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                  <div>
                    <div style={{fontWeight:'800',fontSize:'15px'}}>#{order.id.slice(0,8).toUpperCase()}</div>
                    <div style={{fontSize:'12px',color:'#888'}}>{new Date(order.created_at).toLocaleDateString('he-IL', {day:'numeric',month:'long',year:'numeric'})}</div>
                  </div>
                  <div style={{textAlign:'left'}}>
                    <div style={{fontSize:'14px',marginBottom:'4px'}}>{statusLabel[order.status]||order.status}</div>
                    <div style={{fontSize:'18px',fontWeight:'900',color:'#0ea5e9'}}>₪{order.total?.toLocaleString()}</div>
                  </div>
                </div>
                {order.order_items?.length>0&&(
                  <div style={{fontSize:'13px',color:'#666',borderTop:'1px solid #f5f5f5',paddingTop:'8px'}}>
                    {order.order_items.map((item:any,i:number)=>(
                      <span key={i}>{item.product_name}{i<order.order_items.length-1?', ':''}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Loyalty */}
        {activeTab==='loyalty'&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
            <div style={{backgroundColor:'white',borderRadius:'16px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              <h3 style={{margin:'0 0 16px',fontSize:'16px',fontWeight:'800'}}>🎁 הנקודות שלי</h3>
              <div style={{textAlign:'center',padding:'24px 0'}}>
                <div style={{fontSize:'52px',fontWeight:'900',color:'#0ea5e9'}}>{loyalty?.points?.toLocaleString() || 0}</div>
                <div style={{fontSize:'14px',color:'#888',marginTop:'4px'}}>נקודות זמינות</div>
                <div style={{fontSize:'13px',color:'#666',marginTop:'16px',backgroundColor:'#f8fafc',padding:'12px',borderRadius:'8px'}}>
                  💡 כל 10 ₪ = נקודה אחת<br/>
                  100 נקודות = הנחה של ₪10
                </div>
              </div>
            </div>

            <div style={{backgroundColor:'white',borderRadius:'16px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              <h3 style={{margin:'0 0 16px',fontSize:'16px',fontWeight:'800'}}>🏆 דרגות המועדון</h3>
              {[['רגיל','🎖️','0+','#94a3b8'],['Silver','🥈','₪500+','#94a3b8'],['Gold','🥇','₪2,000+','#f59e0b'],['VIP','👑','₪5,000+','#8b5cf6']].map(([tier,icon,req,color])=>(
                <div key={tier} style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px',borderRadius:'8px',marginBottom:'8px',backgroundColor:loyalty?.tier===tier?color+'11':'transparent',border:`1px solid ${loyalty?.tier===tier?color:'#f0f0f0'}`}}>
                  <div style={{fontSize:'20px'}}>{icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:'700',fontSize:'14px',color:loyalty?.tier===tier?color:'#444'}}>{tier}</div>
                    <div style={{fontSize:'12px',color:'#888'}}>קנייה מצטברת {req}</div>
                  </div>
                  {loyalty?.tier===tier&&<span style={{fontSize:'11px',fontWeight:'700',color:color}}>הדרגה שלך ✓</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab==='settings'&&(
          <div style={{backgroundColor:'white',borderRadius:'16px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
            <h3 style={{margin:'0 0 20px',fontSize:'16px',fontWeight:'800'}}>⚙️ פרטים אישיים</h3>
            {[['full_name','שם מלא','ישראל ישראלי'],['phone','טלפון','050-0000000'],['address','כתובת','רחוב הרצל 1'],['city','עיר','תל אביב']].map(([key,label,ph])=>(
              <div key={key} style={{marginBottom:'16px'}}>
                <label style={{display:'block',fontSize:'13px',fontWeight:'600',marginBottom:'6px',color:'#374151'}}>{label}</label>
                <input
                  value={form[key as keyof typeof form]}
                  onChange={e=>setForm({...form,[key]:e.target.value})}
                  placeholder={ph}
                  disabled={!editing}
                  style={{width:'100%',padding:'12px',border:`2px solid ${editing?'#0ea5e9':'#e2e8f0'}`,borderRadius:'10px',fontSize:'14px',outline:'none',boxSizing:'border-box',backgroundColor:editing?'white':'#f8fafc',color:'#0f172a'}}/>
              </div>
            ))}
            <div style={{marginBottom:'16px'}}>
              <label style={{display:'block',fontSize:'13px',fontWeight:'600',marginBottom:'6px',color:'#374151'}}>אימייל</label>
              <input value={user.email} disabled style={{width:'100%',padding:'12px',border:'2px solid #e2e8f0',borderRadius:'10px',fontSize:'14px',backgroundColor:'#f8fafc',color:'#888',boxSizing:'border-box'}}/>
            </div>
            {editing&&(
              <button onClick={saveProfile} disabled={saving} style={{width:'100%',backgroundColor:'#0ea5e9',color:'white',border:'none',padding:'14px',borderRadius:'12px',fontSize:'16px',fontWeight:'700',cursor:'pointer'}}>
                {saving?'שומר...':'💾 שמור שינויים'}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}