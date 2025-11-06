import React from 'react';

const Layout = ({ children, maxWidth = 600 }) => {
  const outer = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'flex-start', // do not vertically center the card
    justifyContent: 'center', // keep horizontal centering
    background: '#062633',
    position: 'relative',
    padding: '48px 16px'
  };

  // matte background (no blurry glows)

  const card = {
    position: 'relative',
    zIndex: 2,
    maxWidth,
    width: '100%',
    margin: '0 auto',
    padding: 32,
  background: '#0f1a34',
    borderRadius: 24,
    boxShadow: '0 20px 60px rgba(3,6,23,0.6), inset 0 1px 0 rgba(255,255,255,0.02)'
  };

  return (
    <div style={outer}>
      <div style={card}>{children}</div>
    </div>
  );
};

export default Layout;
