
import { useState, useCallback } from 'react';

export interface ProgressStep {
  id: string;
  label: string;
  duration: number; // in milliseconds
}

export const useProgressLoader = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const startProgress = useCallback(async (steps: ProgressStep[], onComplete?: () => void) => {
    setIsLoading(true);
    setProgress(0);
    
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    let currentProgress = 0;
    let elapsedTime = 0;

    for (const step of steps) {
      setCurrentStep(step.label);
      
      // Animate progress for this step
      const startTime = Date.now();
      const stepProgress = (step.duration / totalDuration) * 100;
      
      const animateStep = () => {
        const now = Date.now();
        const stepElapsed = now - startTime;
        
        if (stepElapsed >= step.duration) {
          currentProgress += stepProgress;
          elapsedTime += step.duration;
          setProgress(Math.min(currentProgress, 100));
          return;
        }
        
        const stepPercentage = (stepElapsed / step.duration) * stepProgress;
        setProgress(Math.min(currentProgress + stepPercentage, 100));
        
        requestAnimationFrame(animateStep);
      };
      
      animateStep();
      
      // Wait for step to complete
      await new Promise(resolve => setTimeout(resolve, step.duration));
      currentProgress += stepProgress;
    }
    
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      onComplete?.();
    }, 500);
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
    startProgress,
    resetProgress,
  };
};
