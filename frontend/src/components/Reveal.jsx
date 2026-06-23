import { useEffect, useRef, useState } from 'react';

// Wrap any block to fade-up on first scroll into view.
export default function Reveal({ children, delay = 0, as: Tag = 'div', className = '', ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            obs.disconnect();
          }
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const delayCls = delay ? ` reveal-delay-${delay}` : '';
  return (
    <Tag
      ref={ref}
      className={`reveal${shown ? ' in' : ''}${delayCls} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
