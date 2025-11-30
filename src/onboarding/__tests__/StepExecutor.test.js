import { StepExecutor } from '../core/StepExecutor.js';
import { AnimationManager } from '../utils/AnimationManager.js';

/**
 * @jest-environment jsdom
 */

// Mock AnimationManager
jest.mock('../utils/AnimationManager.js', () => {
  return {
    AnimationManager: jest.fn().mockImplementation(() => ({
      on: jest.fn(), // Add the missing 'on' method
      highlightElement: jest.fn().mockResolvedValue(() => {}),
      clearHighlight: jest.fn().mockResolvedValue(),
      fadeIn: jest.fn().mockResolvedValue(),
      fadeOut: jest.fn().mockResolvedValue(),
      slideIn: jest.fn().mockResolvedValue(),
      slideOut: jest.fn().mockResolvedValue(),
      transitionSteps: jest.fn().mockResolvedValue(),
      pause: jest.fn(),
      resume: jest.fn(),
      reset: jest.fn(),
      destroy: jest.fn()
    }))
  };
});

// Mock DOM elements
global.document = {
  createElement: jest.fn().mockReturnValue({
    style: {},
    appendChild: jest.fn(),
    removeChild: jest.fn()
  }),
  head: {
    appendChild: jest.fn()
  },
  getElementById: jest.fn().mockReturnValue(null)
};

describe('StepExecutor', () => {
  let executor;
  
  const mockStep = {
    id: 'test-step',
    title: 'Test Step',
    content: 'This is a test step',
    type: 'info',
    target: { selector: '#test-element' }
  };
  
  const mockContext = {
    user: { id: 'test-user' },
    appState: { initialized: true }
  };
  
  beforeEach(() => {
    executor = new StepExecutor({
      debug: false,
      enableFade: true,
      enableSlide: false,
      animationDuration: 300,
      transitionDelay: 100,
      highlightColor: '#4299e1',
      highlightOpacity: 0.3
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Initialization', () => {
    test('should initialize with default state', () => {
      expect(executor).toBeDefined();
      expect(executor.getExecutionState().isExecuting).toBe(false);
      expect(executor.getExecutionState().currentStep).toBeNull();
      expect(executor.getExecutionState().stepHistory).toEqual([]);
    });
    
    test('should accept custom options', () => {
      const customExecutor = new StepExecutor({
        debug: true,
        enableFade: false,
        enableSlide: true,
        animationDuration: 500
      });
      
      expect(customExecutor.options.debug).toBe(true);
      expect(customExecutor.options.enableFade).toBe(false);
      expect(customExecutor.options.enableSlide).toBe(true);
      expect(customExecutor.options.animationDuration).toBe(500);
    });
    
    test('should initialize animation manager', () => {
      expect(executor.animationManager).toBeDefined();
    });
  });
  
  describe('Step Execution', () => {
    test('should execute step successfully', async () => {
      const result = await executor.executeStep(mockStep, mockContext);
      
      expect(result).toBeDefined();
      expect(result.completed).toBe(true);
      expect(result.stepId).toBe('test-step');
      expect(executor.getExecutionState().isExecuting).toBe(false);
    });
    
    test('should handle step validation failure', async () => {
      const invalidStep = { title: 'Test Step' }; // 缺少id字段
      
      await expect(executor.executeStep(invalidStep, mockContext))
        .rejects
        .toThrow();
    });
    
    test('should handle step execution errors', async () => {
      // Mock executeStepCore to throw error
      const originalExecuteStepCore = executor.executeStepCore;
      executor.executeStepCore = jest.fn().mockRejectedValue(new Error('Execution failed'));
      
      await expect(executor.executeStep(mockStep, mockContext))
        .rejects
        .toThrow('Execution failed');
      
      // Restore original method
      executor.executeStepCore = originalExecuteStepCore;
    });
    
    test('should cache step result', async () => {
      await executor.executeStep(mockStep, mockContext);
      
      // Check if result is cached
      const cachedResult = executor.stepCache.get(mockStep.id);
      expect(cachedResult).toBeDefined();
      expect(cachedResult.step.id).toBe(mockStep.id);
      expect(cachedResult.result.completed).toBe(true);
    });
  });
  
  describe('Step Validation', () => {
    test('should validate step with required fields', () => {
      const validStep = { id: 'valid', title: 'Valid Step' };
      expect(() => executor.validateStep(validStep)).not.toThrow();
    });
    
    test('should throw error for invalid step', async () => {
      const invalidStep = { id: '', title: '' };
      await expect(executor.validateStep(invalidStep)).rejects.toThrow();
      
      const missingIdStep = { title: 'Test Step' };
      await expect(executor.validateStep(missingIdStep)).rejects.toThrow();
      
      const missingTitleStep = { id: 'test-step' };
      await expect(executor.validateStep(missingTitleStep)).rejects.toThrow();
      
      await expect(executor.validateStep(null)).rejects.toThrow();
      await expect(executor.validateStep(undefined)).rejects.toThrow();
    });
  });
  
  describe('Precondition Checking', () => {
    test('should check preconditions successfully', async () => {
      const stepWithPrecondition = {
        ...mockStep,
        conditions: [
          { type: 'userLoggedIn', value: true }
        ]
      };
      
      const result = await executor.checkPreconditions(stepWithPrecondition, mockContext);
      expect(result).toBe(true);
    });
    
    test('should handle precondition evaluation errors', async () => {
      const stepWithInvalidPrecondition = {
        ...mockStep,
        conditions: [
          { type: 'invalid', value: true }
        ]
      };
      
      // Mock evaluateCondition to throw error
      executor.evaluateCondition = jest.fn().mockRejectedValue(new Error('Precondition failed'));
      
      await expect(executor.checkPreconditions(stepWithInvalidPrecondition, mockContext))
        .rejects
        .toThrow('Precondition failed');
    });
  });
  
  describe('Target Element Handling', () => {
    beforeEach(() => {
      // Mock DOM element
      global.document.querySelector = jest.fn().mockReturnValue({
        style: {},
        appendChild: jest.fn(),
        removeChild: jest.fn()
      });
    });
    
    test('should locate target element', async () => {
      const element = await executor.locateTarget(mockStep.target);
      expect(element).toBeDefined();
      expect(global.document.querySelector).toHaveBeenCalledWith('#test-element');
    });
    
    test('should handle missing target element', async () => {
      global.document.querySelector = jest.fn().mockReturnValue(null);
      
      const element = await executor.locateTarget(mockStep.target);
      expect(element).toBeNull();
    });
    
    test('should highlight target element', async () => {
      const mockElement = { style: {} };
      
      await executor.highlightTarget(mockElement, mockStep);
      
      expect(executor.animationManager.highlightElement).toHaveBeenCalledWith(
        mockElement,
        expect.objectContaining({
          duration: 300,
          color: '#4299e1',
          opacity: 0.3,
          pulse: true
        })
      );
    });
    
    test('should clear highlight', async () => {
      const mockElement = { style: {} };
      
      await executor.clearHighlight(mockElement, 'test-step');
      
      expect(executor.animationManager.clearHighlight).toHaveBeenCalledWith(mockElement);
    });
  });
  
  describe('Step Transition Animation', () => {
    test('should apply step transition with animation', async () => {
      const mockElement = { style: {} };
      
      await executor.applyStepTransition(mockStep, mockContext, mockElement);
      
      // Should cache the previous step
      const cachedStep = executor.stepCache.get('previousStep');
      expect(cachedStep).toBeDefined();
      expect(cachedStep.id).toBe('test-step');
    });
    
    test('should handle transition animation errors gracefully', async () => {
      const mockElement = { style: {} };
      
      // Mock animation manager to throw error
      executor.animationManager.transitionSteps = jest.fn().mockRejectedValue(new Error('Animation failed'));
      
      // Should not throw error
      await expect(executor.applyStepTransition(mockStep, mockContext, mockElement))
        .resolves
        .toBeUndefined();
    });
    
    test('should skip transition when animations are disabled', async () => {
      const noAnimationExecutor = new StepExecutor({
        enableFade: false,
        enableSlide: false
      });
      
      const mockElement = { style: {} };
      
      await noAnimationExecutor.applyStepTransition(mockStep, mockContext, mockElement);
      
      // Animation manager should not be called
      expect(noAnimationExecutor.animationManager.transitionSteps).not.toHaveBeenCalled();
      expect(noAnimationExecutor.animationManager.fadeIn).not.toHaveBeenCalled();
    });
  });
  
  describe('State Management', () => {
    test('should get current execution state', () => {
      const state = executor.getExecutionState();
      
      expect(state).toEqual({
        currentStep: null,
        previousStep: null,
        isExecuting: false,
        isTransitioning: false,
        stepHistory: [],
        executionStartTime: null
      });
    });
    
    test('should get step history', () => {
      const history = executor.getStepHistory();
      expect(history).toEqual([]);
    });
    
    test('should reset execution state', async () => {
      // Execute a step first
      await executor.executeStep(mockStep, mockContext);
      
      // Verify state is updated
      expect(executor.getExecutionState().stepHistory.length).toBe(1);
      
      // Reset
      executor.reset();
      
      // Verify state is cleared
      const state = executor.getExecutionState();
      expect(state.currentStep).toBeNull();
      expect(state.isExecuting).toBe(false);
      expect(state.stepHistory).toEqual([]);
    });
    
    test('should clear step highlight', () => {
      // Mock a cleanup function in cache
      const mockCleanup = jest.fn();
      executor.stepCache.set('highlight_test-step', mockCleanup);
      
      executor.clearStepHighlight('test-step');
      
      expect(mockCleanup).toHaveBeenCalled();
      expect(executor.stepCache.has('highlight_test-step')).toBe(false);
    });
  });
  
  describe('Error Handling', () => {
    test('should handle errors gracefully', () => {
      const error = new Error('Test error');
      
      // Should not throw, just log and emit
      expect(() => {
        executor.handleError('Test message', error, mockContext);
      }).not.toThrow();
    });
    
    test('should log messages when debug is enabled', () => {
      const debugExecutor = new StepExecutor({ debug: true });
      
      // Mock console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      debugExecutor.log('Test message', 'info');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[StepExecutor INFO] Test message')
      );
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('Event Emission', () => {
    test('should emit step execution events', async () => {
      const stepStartListener = jest.fn();
      const stepCompleteListener = jest.fn();
      
      executor.on('stepExecutionStarted', stepStartListener);
      executor.on('stepExecutionCompleted', stepCompleteListener);
      
      await executor.executeStep(mockStep, mockContext);
      
      expect(stepStartListener).toHaveBeenCalledWith(
        expect.objectContaining({
          step: mockStep,
          context: mockContext
        })
      );
      
      expect(stepCompleteListener).toHaveBeenCalledWith(
        expect.objectContaining({
          step: mockStep,
          result: expect.objectContaining({ completed: true })
        })
      );
    });
    
    test('should emit error events', () => {
      const errorListener = jest.fn();
      executor.on('error', errorListener);
      
      const error = new Error('Test error');
      executor.handleError('Test message', error);
      
      expect(errorListener).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test message',
          error: error
        })
      );
    });
  });
});