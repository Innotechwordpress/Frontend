import { useState, useCallback } from 'react';

export interface ProgressStep {
  id: string;
  label: string;
  weight: number; // relative weight instead of duration
}

export const useProgressLoader = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const startDynamicProgress = useCallback((steps: ProgressStep[]) => {
    setIsLoading(true);
    setProgress(0);
    
    const totalWeight = steps.reduce((sum, step) => sum + step.weight, 0);
    let currentStepIndex = 0;
    let accumulatedWeight = 0;
    
    // Start with first step
    setCurrentStep(steps[0].label);

    // Gradually move through steps
    const progressInterval = setInterval(() => {
      if (currentStepIndex < steps.length - 1) {
        // Move to next step every 2.5 seconds
        accumulatedWeight += steps[currentStepIndex].weight;
        currentStepIndex++;
        setCurrentStep(steps[currentStepIndex].label);

        // Calculate progress based on completed steps (max 90%)
        const stepProgress = (accumulatedWeight / totalWeight) * 90;
        setProgress(Math.min(stepProgress, 90));
      }
    }, 2500);

    // Store interval reference for cleanup
    return progressInterval;
  }, []);

  const completeProgress = useCallback(() => {
    setCurrentStep('Processing complete! Loading results...');
    setProgress(100);
    
    // Brief delay before hiding
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(0);
    setCurrentStep('');
    setIsLoading(false);
  }, []);

  return {
    progress,
    currentStep,
    isLoading,
    startDynamicProgress,
    completeProgress,
    resetProgress,
  };
};