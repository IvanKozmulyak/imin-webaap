'use client';

export default function CallToActionSection() {
  const scrollToPartner = () => {
    const element = document.getElementById('partner-access');
    if (element) {
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const viewportHeight = window.innerHeight;
      const elementHeight = elementRect.height;
      const scrollPosition = absoluteElementTop - (viewportHeight / 2) + (elementHeight / 2);
      
      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div style={{ marginBottom: '100px' }}>
      <div className="glass-card cta-section-card" style={{ 
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(0, 0, 0, 0.3))',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        borderRadius: '24px',
        padding: '60px 40px',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '20px', letterSpacing: '-0.02em' }}>
          Ready to fill the floor?
        </h2>
        <p style={{ 
          color: 'var(--text-gray)', 
          fontSize: '1.1rem', 
          marginBottom: '40px',
          maxWidth: '600px',
          margin: '0 auto 40px auto'
        }}>
          Join 150+ organizers leveraging social infrastructure to drive revenue.
        </p>
        
        <button
          onClick={scrollToPartner}
          style={{
            padding: '16px 48px',
            background: 'white',
            color: '#000',
            border: 'none',
            borderRadius: '50px',
            fontWeight: 700,
            fontSize: '1.1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '20px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          List My Event
        </button>
        
        <p style={{ 
          color: 'var(--text-gray)', 
          fontSize: '0.9rem',
          marginTop: '20px'
        }}>
          Performance basis. No monthly fees.
        </p>
      </div>
    </div>
  );
}
