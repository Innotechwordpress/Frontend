
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

  const startDynamicProgress = useCallback(async (steps: ProgressStep[], apiCall: () => Promise<any>) => {
    setIsLoading(true);
    setProgress(0);
    
    const totalWeight = steps.reduce((sum, step) => sum + step.weight, 0);
    let currentWeight = 0;
    let stepIndex = 0;
    
    const startTime = Date.now();
    
    // Start the API call
    const apiPromise = apiCall();
    
    // Animate progress while API is running
    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      
      // Update step based on elapsed time
      const stepDuration = 2000; // 2 seconds per step
      const targetStep = Math.min(Math.floor(elapsed / stepDuration), steps.length - 1);
      
      if (targetStep > stepIndex) {
        // Move to next step
        currentWeight += steps[stepIndex].weight;
        stepIndex = targetStep;
      }
      
      if (stepIndex < steps.length) {
        setCurrentStep(steps[stepIndex].label);
        
        // Calculate progress within current step
        const stepElapsed = elapsed - (stepIndex * stepDuration);
        const stepProgress = Math.min(stepElapsed / stepDuration, 1);
        const currentStepWeight = steps[stepIndex].weight * stepProgress;
        
        const totalProgress = (currentWeight + currentStepWeight) / totalWeight * 98; // Cap at 98%
        setProgress(Math.min(totalProgress, 98));
      }
      
      // Continue animation if API hasn't responded yet
      if (apiPromise) {
        requestAnimationFrame(animateProgress);
      }
    };
    
    // Start progress animation
    animateProgress();
    
    try {
      // Wait for API to complete
      const result = await apiPromise;
      
      // Complete progress
      setProgress(100);
      setCurrentStep('Processing complete! Loading results...');
      
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
      
      return result;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
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
    resetProgress,
  };
};
