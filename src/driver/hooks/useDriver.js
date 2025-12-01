import { useCallback, useEffect, useRef, useState } from 'react';
import { driver } from '../driver.js';

/**
 * React hook for using driver.js tour functionality
 * @param {Object} options - Driver configuration options
 * @returns {Object} Driver API and state
 */
export function useDriver(options = {}) {
  const driverRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isFirstStep, setIsFirstStep] = useState(false);
  const [isLastStep, setIsLastStep] = useState(false);
  const [hasNextStep, setHasNextStep] = useState(false);
  const [hasPreviousStep, setHasPreviousStep] = useState(false);

  // Update React state based on driver state
  const updateDriverState = useCallback(() => {
    if (!driverRef.current) return;

    setIsActive(driverRef.current.isActive());
    setActiveIndex(driverRef.current.getActiveIndex());
    setIsFirstStep(driverRef.current.isFirstStep());
    setIsLastStep(driverRef.current.isLastStep());
    setHasNextStep(driverRef.current.hasNextStep());
    setHasPreviousStep(driverRef.current.hasPreviousStep());
  }, []);

  // Initialize driver instance
  const initializeDriver = useCallback((driverOptions = {}) => {
    if (driverRef.current) {
      driverRef.current.destroy();
    }

    const mergedOptions = {
      ...options,
      ...driverOptions,
    };

    driverRef.current = driver(mergedOptions);
    
    // Set initial state
    updateDriverState();
    
    return driverRef.current;
  }, [options, updateDriverState]);

  // Start the tour
  const start = useCallback((stepIndex = 0, driverOptions) => {
    const instance = initializeDriver(driverOptions);
    instance.drive(stepIndex);
    updateDriverState();
  }, [initializeDriver, updateDriverState]);

  // Move to next step
  const next = useCallback(() => {
    if (driverRef.current && driverRef.current.isActive()) {
      driverRef.current.moveNext();
      updateDriverState();
    }
  }, [updateDriverState]);

  // Move to previous step
  const previous = useCallback(() => {
    if (driverRef.current && driverRef.current.isActive()) {
      driverRef.current.movePrevious();
      updateDriverState();
    }
  }, [updateDriverState]);

  // Move to specific step
  const goTo = useCallback((stepIndex) => {
    if (driverRef.current && driverRef.current.isActive()) {
      driverRef.current.moveTo(stepIndex);
      updateDriverState();
    }
  }, [updateDriverState]);

  // Stop the tour
  const stop = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
      setIsActive(false);
      setActiveIndex(null);
      setIsFirstStep(false);
      setIsLastStep(false);
      setHasNextStep(false);
      setHasPreviousStep(false);
    }
  }, []);

  // Refresh the tour (useful when DOM changes)
  const refresh = useCallback(() => {
    if (driverRef.current && driverRef.current.isActive()) {
      driverRef.current.refresh();
    }
  }, []);

  // Highlight a specific element without starting full tour
  const highlight = useCallback((step) => {
    const instance = initializeDriver();
    instance.highlight(step);
    updateDriverState();
  }, [initializeDriver, updateDriverState]);

  // Update configuration
  const setConfig = useCallback((newConfig) => {
    if (driverRef.current) {
      driverRef.current.setConfig(newConfig);
    }
  }, []);

  // Update steps
  const setSteps = useCallback((steps) => {
    if (driverRef.current) {
      driverRef.current.setSteps(steps);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, []);

  return {
    // State
    isActive,
    activeIndex,
    isFirstStep,
    isLastStep,
    hasNextStep,
    hasPreviousStep,
    
    // Actions
    start,
    stop,
    next,
    previous,
    goTo,
    refresh,
    highlight,
    setConfig,
    setSteps,
    
    // Helper methods (lazy evaluation to avoid accessing ref during render)
    getConfig: () => driverRef.current?.getConfig(),
    getState: () => driverRef.current?.getState(),
    getActiveStep: () => driverRef.current?.getActiveStep(),
    getActiveElement: () => driverRef.current?.getActiveElement(),
    
    // Direct access to driver instance (lazy getter)
    get driver() {
      return driverRef.current;
    },
  };
}

// Export as default for convenience
export default useDriver;