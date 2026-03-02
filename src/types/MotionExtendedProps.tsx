// global.d.ts
import "framer-motion";
import {
  MotionStyle,
  MotionValue,
  // MotionValueNumber,
  // MotionValueString,
} from "framer-motion";

// Extensão da interface MotionProps para incluir className
declare module "framer-motion" {
  // Apenas estendemos MotionProps — removida a declaração de HTMLMotionProps que causava conflito.
  interface MotionProps extends React.HTMLAttributes<HTMLElement> {
    style?: MotionStyle;
    onDrag?: (event: DragEvent) => void;
    onDragEnd?: (event: DragEvent) => void;
    onDragStart?: (event: DragEvent) => void;
    // onAnimationStart?: (event: AnimationEvent) => void;
  }

}
// Preciso estenter a `disabled?: boolean;` para evitar erros em botões animados
declare global {
  interface HTMLMotionProps<T> {
    style?: MotionStyle;
    // onAnimationStart?: (event: AnimationEvent) => void;
  }
  interface MotionNodeOptions {
    style?: MotionStyle;
    // onAnimationStart?: (event: AnimationEvent) => void;
  }
}

export { };
