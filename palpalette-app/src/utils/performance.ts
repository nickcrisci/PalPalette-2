/**
 * Performance monitoring and optimization utilities
 */

export class PerformanceMonitor {
  private static metrics: Map<string, number> = new Map();
  private static timers: Map<string, number> = new Map();

  /**
   * Record a metric value
   */
  static recordMetric(name: string, value: number): void {
    this.metrics.set(name, value);
  }

  /**
   * Start timing an operation
   */
  static startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  /**
   * End timing an operation and record the duration
   */
  static endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`Timer "${name}" was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.set(name, duration);
    this.timers.delete(name);

    // Log slow operations in development
    if (process.env.NODE_ENV === "development" && duration > 100) {
      console.warn(
        `Slow operation detected: ${name} took ${duration.toFixed(2)}ms`
      );
    }

    return duration;
  }

  /**
   * Measure the performance of an async function
   */
  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(name);
    try {
      const result = await fn();
      return result;
    } finally {
      this.endTimer(name);
    }
  }

  /**
   * Measure the performance of a sync function
   */
  static measure<T>(name: string, fn: () => T): T {
    this.startTimer(name);
    try {
      const result = fn();
      return result;
    } finally {
      this.endTimer(name);
    }
  }

  /**
   * Get all recorded metrics
   */
  static getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Clear all metrics
   */
  static clearMetrics(): void {
    this.metrics.clear();
    this.timers.clear();
  }

  /**
   * Log performance summary
   */
  static logSummary(): void {
    if (this.metrics.size === 0) {
      console.log("No performance metrics recorded");
      return;
    }

    console.group("Performance Summary");
    const sortedMetrics = Array.from(this.metrics.entries()).sort(
      ([, a], [, b]) => b - a
    );

    sortedMetrics.forEach(([name, duration]) => {
      const color =
        duration > 100
          ? "color: red"
          : duration > 50
          ? "color: orange"
          : "color: green";
      console.log(`%c${name}: ${duration.toFixed(2)}ms`, color);
    });
    console.groupEnd();
  }
}

/**
 * Higher-order component to measure component render time
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const name =
    componentName || Component.displayName || Component.name || "Anonymous";

  const WrappedComponent = (props: P) => {
    const renderStart = performance.now();

    React.useEffect(() => {
      const renderTime = performance.now() - renderStart;
      PerformanceMonitor.recordMetric(`${name}_render`, renderTime);

      if (renderTime > 16) {
        // More than one frame at 60fps
        console.warn(`Slow render: ${name} took ${renderTime.toFixed(2)}ms`);
      }
    });

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withPerformanceTracking(${name})`;
  return WrappedComponent;
}

/**
 * Hook to track component lifecycle performance
 */
export function usePerformanceTracking(componentName: string) {
  const mountTime = React.useRef<number>(0);

  React.useEffect(() => {
    mountTime.current = performance.now();
    PerformanceMonitor.startTimer(`${componentName}_mount`);

    return () => {
      PerformanceMonitor.endTimer(`${componentName}_mount`);
    };
  }, [componentName]);

  const trackOperation = React.useCallback(
    (operationName: string, fn: () => void | Promise<void>) => {
      const fullName = `${componentName}_${operationName}`;

      if (fn.constructor.name === "AsyncFunction") {
        return PerformanceMonitor.measureAsync(
          fullName,
          fn as () => Promise<void>
        );
      } else {
        return PerformanceMonitor.measure(fullName, fn as () => void);
      }
    },
    [componentName]
  );

  return { trackOperation };
}

// Re-export React for the HOC
import React from "react";
