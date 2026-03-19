import { useState, useEffect } from 'react';

export function BlinkingCursor({ color = '#00ff87' }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const iv = setInterval(() => setVisible(v => !v), 530);
    return () => clearInterval(iv);
  }, []);
  return <span style={{ color, opacity: visible ? 1 : 0, marginLeft: '1px', fontWeight: 900 }}>|</span>;
}
