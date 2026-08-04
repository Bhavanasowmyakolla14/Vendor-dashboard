import { useEffect, useRef, useState } from 'react';

export function useInView<T extends Element = HTMLElement>(threshold = 0.05) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Safety timeout to guarantee elements become visible even if IntersectionObserver fails
    const timer = setTimeout(() => {
      setInView(true);
    }, 1000);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          clearTimeout(timer);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [threshold]);

  return { ref, inView };
}
