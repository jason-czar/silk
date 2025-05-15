
import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from './use-mobile';

interface TiltStyles {
  transform: string;
  transition: string;
}

export function use3DTiltEffect(intensity: number = 15) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [styles, setStyles] = useState<TiltStyles>({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
    transition: 'transform 0.1s ease-out'
  });
  const isMobile = useIsMobile();

  useEffect(() => {
    // Skip effect on mobile devices
    if (isMobile || !elementRef.current) return;
    
    const element = elementRef.current;
    
    // Calculate tilt based on mouse position
    const handleMouseMove = (e: MouseEvent) => {
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      // Calculate rotation angle (between -intensity and intensity degrees)
      const rotateY = ((mouseX - centerX) / (rect.width / 2)) * (intensity / 2);
      const rotateX = ((centerY - mouseY) / (rect.height / 2)) * (intensity / 2);
      
      // Apply transform
      setStyles({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`,
        transition: 'transform 0.1s ease-out'
      });
    };

    // Reset tilt when mouse leaves
    const handleMouseLeave = () => {
      setStyles({
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
        transition: 'transform 0.3s ease-out'
      });
    };
    
    // Enter hover state
    const handleMouseEnter = () => {
      setStyles({
        ...styles, 
        transition: 'transform 0.1s ease-out'
      });
    };

    // Add event listeners
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mouseenter', handleMouseEnter);

    // Clean up event listeners
    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isMobile, intensity]);

  return { elementRef, styles };
}
