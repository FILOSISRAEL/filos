export default function Home() {
  return (
    <main style={{
      fontFamily: 'sans-serif',
      direction: 'rtl',
      textAlign: 'right',
      backgroundColor: '#f8f8f8',
      minHeight: '100vh',
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #eee',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0ea5e9' }}>FILOS</h1>
        <nav style={{ display: 'flex', gap: '24px' }}>
          <a href="#">קטגוריות</a>
          <a href="#">מבצעים</a>
          <a href="#">מוצרים</a>
        </nav>
        <button style={{
          backgroundColor: '#0ea5e9',
          color: 'white',
          border: 'none',
          padding: '8px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
        }}>כניסה</button>
      </header>

      {/* Hero */}
      <section style={{
        textAlign: 'center',
        padding: '80px 32px',
        backgroundColor: 'white',
      }}>
        <h2 style={{ fontSize: '48px', fontWeight: 'bold' }}>
          קנה <span style={{ color: '#0ea5e9' }}>חכם</span>.<br />חסוך יותר.
        </h2>
        <p style={{ fontSize: '18px', color: '#666', marginTop: '16px' }}>
          החנות החכמה של ישראל — מוצרים פרימיום במחיר שלא תמצא בשום מקום אחר.
        </p>
        <button style={{
          backgroundColor: '#0ea5e9',
          color: 'white',
          border: 'none',
          padding: '14px 32px',
          borderRadius: '12px',
          fontSize: '18px',
          cursor: 'pointer',
          marginTop: '32px',
        }}>גלה את המוצרים</button>
      </section>
    </main>
  );
}
