'use client';
import { useState } from 'react';
import { createClient } from '../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleAuth = async () => {
    setLoading(true);
    setMessage('');
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else { setMessage('✅ התחברת בהצלחה!'); window.location.href = '/'; }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage('✅ נשלח אימייל אימות — בדוק את תיבת הדואר!');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',fontFamily:'system-ui,sans-serif',direction:'rtl'}}>
      {/* Left - Form */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'40px',backgroundColor:'white'}}>
        <div style={{width:'100%',maxWidth:'400px'}}>
          <a href="/" style={{fontSize:'24px',fontWeight:'900',color:'#0ea5e9',textDecoration:'none',display:'block',marginBottom:'40px'}}>FILOS</a>
          
          <div style={{display:'flex',backgroundColor:'#f1f5f9',borderRadius:'12px',padding:'4px',marginBottom:'32px'}}>
            <button onClick={()=>setIsLogin(true)} style={{flex:1,padding:'10px',border:'none',borderRadius:'10px',fontWeight:'700',fontSize:'14px',cursor:'pointer',backgroundColor:isLogin?'white':'transparent',color:isLogin?'#0f172a':'#64748b',boxShadow:isLogin?'0 1px 4px rgba(0,0,0,0.1)':'none'}}>כניסה</button>
            <button onClick={()=>setIsLogin(false)} style={{flex:1,padding:'10px',border:'none',borderRadius:'10px',fontWeight:'700',fontSize:'14px',cursor:'pointer',backgroundColor:!isLogin?'white':'transparent',color:!isLogin?'#0f172a':'#64748b',boxShadow:!isLogin?'0 1px 4px rgba(0,0,0,0.1)':'none'}}>הרשמה חינמית</button>
          </div>

          <h1 style={{fontSize:'28px',fontWeight:'900',marginBottom:'8px',color:'#0f172a'}}>
            {isLogin ? '👋 שלום, נעים להכיר' : '🚀 הצטרף ל-FILOS'}
          </h1>
          <p style={{color:'#64748b',fontSize:'14px',marginBottom:'28px'}}>
            {isLogin ? 'היכנס לחשבון כדי לצפות בהזמנות' : 'הצטרף לאלפי לקוחות שכבר גילו את החנות החכמה'}
          </p>

          <button onClick={handleGoogle} style={{width:'100%',padding:'12px',border:'2px solid #e2e8f0',borderRadius:'12px',backgroundColor:'white',fontSize:'14px',fontWeight:'600',cursor:'pointer',marginBottom:'20px',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
            <span style={{fontSize:'18px'}}>G</span> המשך עם Google
          </button>

          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
            <div style={{flex:1,height:'1px',backgroundColor:'#e2e8f0'}}/>
            <span style={{color:'#94a3b8',fontSize:'12px'}}>או עם אימייל</span>
            <div style={{flex:1,height:'1px',backgroundColor:'#e2e8f0'}}/>
          </div>

          <div style={{marginBottom:'16px'}}>
            <label style={{display:'block',fontSize:'13px',fontWeight:'600',marginBottom:'6px',color:'#374151'}}>כתובת אימייל</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="your@email.com" style={{width:'100%',padding:'12px',border:'2px solid #e2e8f0',borderRadius:'10px',fontSize:'14px',outline:'none',boxSizing:'border-box'}}/>
          </div>

          <div style={{marginBottom:'24px'}}>
            <label style={{display:'block',fontSize:'13px',fontWeight:'600',marginBottom:'6px',color:'#374151'}}>סיסמה</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••" style={{width:'100%',padding:'12px',border:'2px solid #e2e8f0',borderRadius:'10px',fontSize:'14px',outline:'none',boxSizing:'border-box'}}/>
          </div>

          {message && <div style={{padding:'12px',borderRadius:'10px',marginBottom:'16px',backgroundColor:message.includes('✅')?'#f0fdf4':'#fef2f2',color:message.includes('✅')?'#166534':'#991b1b',fontSize:'13px',fontWeight:'600'}}>{message}</div>}

          <button onClick={handleAuth} disabled={loading} style={{width:'100%',padding:'14px',backgroundColor:'#0ea5e9',color:'white',border:'none',borderRadius:'12px',fontSize:'16px',fontWeight:'700',cursor:'pointer'}}>
            {loading ? '...' : isLogin ? '→ כניסה לחשבון' : '→ יצירת חשבון חינמי'}
          </button>
        </div>
      </div>

      {/* Right - Visual */}
      <div style={{flex:1,backgroundColor:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',padding:'40px'}}>
        <div style={{textAlign:'center',color:'white'}}>
          <div style={{fontSize:'64px',marginBottom:'24px'}}>🛒</div>
          <h2 style={{fontSize:'32px',fontWeight:'900',marginBottom:'12px'}}>קנה חכם.<br/><span style={{color:'#0ea5e9'}}>חסוך יותר.</span></h2>
          <p style={{color:'#94a3b8',fontSize:'16px',marginBottom:'32px'}}>הצטרף לאלפי לקוחות שכבר גילו את החנות החכמה בישראל</p>
          {[['🤖 יועץ AI אישי','מציאות המוצר המושלם'],['🚚 משלוח חינם מ-₪299','תוך 48 שעות'],['🛡️ אחריות ישראלית','שירות מהיר ומקומי'],['💰 מחיר הוגן — תמיד','נשוואה עם השוק']].map(([title,sub])=>(
            <div key={title} style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px',textAlign:'right'}}>
              <div style={{fontSize:'16px',fontWeight:'700',color:'white'}}>{title}</div>
              <div style={{fontSize:'13px',color:'#64748b'}}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}