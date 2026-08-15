"use client";

/**
 * @module AnimatedCounter
 * @description A smooth animated number counter using requestAnimationFrame.
 * Interpolates between old and new values with a spring-like ease-out curve.
 * Used for balance displays throughout the dashboard to create a premium
 * "rolling number" effect when values change.
 */

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  /** The target numeric value to animate toward. */
  value: number;
  /** Currency prefix (default: "₹"). */
  prefix?: string;
  /** Suffix text (e.g., "INR"). */
  suffix?: string;
  /** Duration of the animation in milliseconds (default: 800). */
  duration?: number;
  /** Number of decimal places (default: 0). */
  decimals?: number;
  /** Additional CSS classes for the number. */
  className?: string;
  /** Additional CSS classes for the prefix. */
  prefixClassName?: string;
  /** Additional CSS classes for the suffix. */
  suffixClassName?: string;
}

export function AnimatedCounter({
  value,
  prefix = "₹",
  suffix,
  duration = 800,
  decimals = 0,
  className = "",
  prefixClassName = "",
  suffixClassName = "",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const from = previousValue.current;
    const to = value;

    // Don't animate if value hasn't changed
    if (from === to) return;

    // Cancel any running animation
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      const current = from + (to - from) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(to);
        previousValue.current = to;
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  // Format with locale and decimal control
  const formatted = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className="inline-flex items-baseline tabular-nums">
      {prefix && (
        <span className={prefixClassName}>{prefix}</span>
      )}
      <span className={className}>{formatted}</span>
      {suffix && (
        <span className={suffixClassName}>{suffix}</span>
      )}
    </span>
  );
}
