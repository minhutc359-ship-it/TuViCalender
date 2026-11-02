import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useVisualTheme } from './astro/VisualTheme';

export function EditorialIllustration({
  src,
  alt,
  eyebrow,
  title,
  children,
  className = '',
}: {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const { motion: motionPreference } = useVisualTheme();
  const reduceMotion = prefersReducedMotion || motionPreference === 'calm';

  return (
    <motion.figure
      className={`editorial-illustration panel ${className}`.trim()}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="editorial-visual">
        <motion.img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          whileHover={reduceMotion ? undefined : { scale: 1.035 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        <span className="illustration-orbit" aria-hidden="true">
          <i />
          <i />
        </span>
      </div>
      <figcaption>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{children}</p>
      </figcaption>
    </motion.figure>
  );
}
