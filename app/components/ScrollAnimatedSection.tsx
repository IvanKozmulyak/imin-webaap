'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollAnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
}

export default function ScrollAnimatedSection({ children, className = '' }: ScrollAnimatedSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className={`scroll-animated-section ${isVisible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
