// global.d.ts
import "framer-motion";
import { MotionStyle } from "framer-motion";

// Extensão da interface MotionProps para incluir as propriedades desejadas sem conflitos
declare module "framer-motion" {
  interface MotionProps {
    className?: string;
    disabled?: boolean;
    // Podemos omitir as re-declarações de onDrag, pois a própria lib já as tipa.
  }
}

declare global {
  interface HTMLMotionProps<T> {
    className?: string;
    disabled?: boolean;
  }
}

export { };
