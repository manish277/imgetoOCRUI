import { useState, useEffect } from 'react';

interface ProgressBarProps {
  isLoading: boolean;
}

export function ProgressBar({ isLoading }: ProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { name: 'Uploading file', description: 'Sending file to server...', duration: 5 }, // 5% - quick
    { name: 'OCR Processing', description: 'Extracting text from document...', duration: 20 }, // 50% - takes longest
    { name: 'LLM Analysis', description: 'Analyzing and structuring data...', duration: 50 }, // 35% - second longest
    { name: 'Generating Excel', description: 'Creating Excel file...', duration: 10 }, // 8% - quick
    { name: 'Finalizing', description: 'Almost done...', duration: 2 }, // 2% - quick
  ];

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      setCurrentStep(0);
      return;
    }

    let currentProgress = 0;
    let stepIndex = 0;
    let stepProgress = 0;

    const updateProgress = () => {
      if (currentProgress >= 100) {
        return;
      }

      const currentStepData = steps[stepIndex];
      const stepStartProgress = steps.slice(0, stepIndex).reduce((sum, s) => sum + s.duration, 0);

      // Increment within current step (slower for OCR and LLM)
      const incrementSpeed = stepIndex === 1 || stepIndex === 2 ? 0.2 : 0.4; // Slower for OCR (1) and LLM (2)
      stepProgress += incrementSpeed;
      const stepPercent = Math.min(stepProgress / currentStepData.duration, 1);
      currentProgress = stepStartProgress + (stepPercent * currentStepData.duration);

      // Move to next step if current step is complete
      if (stepPercent >= 1 && stepIndex < steps.length - 1) {
        stepIndex++;
        stepProgress = 0;
        setCurrentStep(stepIndex);
      }

      setProgress(Math.min(currentProgress, 100));

      // Continue updating if not at 100%
      if (currentProgress < 100) {
        setTimeout(updateProgress, 150); // Slower update interval (150ms instead of 200ms)
      }
    };

    // Start progress updates
    updateProgress();
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 mb-4">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            {steps[currentStep]?.name || 'Processing...'}
          </span>
          <span className="text-sm font-bold text-indigo-600">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-300 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {steps[currentStep]?.description || 'Processing your document...'}
        </p>
      </div>

      {/* Current Step Info */}
      <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
        <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900">{steps[currentStep]?.name || 'Processing'}</div>
          <div className="text-xs text-gray-600">{steps[currentStep]?.description || 'Please wait...'}</div>
        </div>
      </div>
    </div>
  );
}

