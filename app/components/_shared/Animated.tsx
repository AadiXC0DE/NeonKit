"use client";

import { motion, type MotionProps } from "framer-motion";

export function AnimatedDiv(
  props: React.PropsWithChildren<
    React.HTMLAttributes<HTMLDivElement> & MotionProps
  >,
) {
  return <motion.div {...props} />;
}

export function AnimatedSection(
  props: React.PropsWithChildren<
    React.HTMLAttributes<HTMLElement> & MotionProps
  >,
) {
  return <motion.section {...props} />;
}
