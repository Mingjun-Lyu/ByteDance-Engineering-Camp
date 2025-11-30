import { StepNavigationManager } from '../core/StepNavigationManager.js';

describe('StepNavigationManager', () => {
  let navigationManager;
  
  beforeEach(() => {
    navigationManager = new StepNavigationManager({ debug: false });
  });
  
  afterEach(() => {
    navigationManager = null;
  });
  
  describe('Initialization', () => {
    it('should initialize with default state', () => {
      expect(navigationManager.state.currentStepIndex).toBe(-1);
      expect(navigationManager.state.currentGuide).toBeNull();
      expect(navigationManager.state.navigationHistory).toHaveLength(0);
      expect(navigationManager.state.canGoBack).toBe(false);
      expect(navigationManager.state.canGoForward).toBe(false);
      expect(navigationManager.state.isNavigating).toBe(false);
    });
    
    it('should initialize with custom options', () => {
      const customManager = new StepNavigationManager({
        maxHistorySize: 100,
        allowBackNavigation: false,
        allowSkip: false,
        debug: true
      });
      
      expect(customManager.options.maxHistorySize).toBe(100);
      expect(customManager.options.allowBackNavigation).toBe(false);
      expect(customManager.options.allowSkip).toBe(false);
      expect(customManager.options.debug).toBe(true);
    });
  });
  
  describe('Guide Steps Management', () => {
    it('should set guide steps correctly', () => {
      const guideId = 'test-guide';
      const steps = [{ id: 'step1' }, { id: 'step2' }];
      
      navigationManager.setGuideSteps(guideId, steps);
      
      expect(navigationManager.guideSteps.get(guideId)).toEqual(steps);
      expect(navigationManager.state.currentGuide).toBe(guideId);
    });
    
    it('should throw error when setting invalid guide steps', () => {
      expect(() => navigationManager.setGuideSteps(null, [])).toThrow();
      expect(() => navigationManager.setGuideSteps('test', null)).toThrow();
    });
  });
  
  describe('Step Navigation', () => {
    beforeEach(() => {
      navigationManager.setGuideSteps('test-guide', [
        { id: 'step1', title: 'Step 1' },
        { id: 'step2', title: 'Step 2' },
        { id: 'step3', title: 'Step 3' }
      ]);
    });
    
    it('should navigate to specific step', async () => {
      const step = await navigationManager.navigateToStep(1);
      
      expect(step).toEqual({ id: 'step2', title: 'Step 2' });
      expect(navigationManager.state.currentStepIndex).toBe(1);
      expect(navigationManager.state.canGoBack).toBe(true);
      expect(navigationManager.state.canGoForward).toBe(true);
    });
    
    it('should navigate to next step', async () => {
      await navigationManager.navigateToStep(0);
      const step = await navigationManager.nextStep();
      
      expect(step).toEqual({ id: 'step2', title: 'Step 2' });
      expect(navigationManager.state.currentStepIndex).toBe(1);
    });
    
    it('should navigate to previous step when allowed', async () => {
      await navigationManager.navigateToStep(1);
      const step = await navigationManager.previousStep();
      
      expect(step).toEqual({ id: 'step1', title: 'Step 1' });
      expect(navigationManager.state.currentStepIndex).toBe(0);
    });
    
    it('should throw error when back navigation is not allowed', async () => {
      navigationManager.options.allowBackNavigation = false;
      await navigationManager.navigateToStep(1);
      
      await expect(navigationManager.previousStep()).rejects.toThrow('Back navigation is not allowed');
    });
    
    it('should navigate to first step', async () => {
      await navigationManager.navigateToStep(2);
      const step = await navigationManager.firstStep();
      
      expect(step).toEqual({ id: 'step1', title: 'Step 1' });
      expect(navigationManager.state.currentStepIndex).toBe(0);
    });
    
    it('should navigate to last step', async () => {
      const step = await navigationManager.lastStep();
      
      expect(step).toEqual({ id: 'step3', title: 'Step 3' });
      expect(navigationManager.state.currentStepIndex).toBe(2);
    });
    
    it('should throw error when navigating to invalid step', async () => {
      await expect(navigationManager.navigateToStep(-1)).rejects.toThrow('Invalid step index');
      await expect(navigationManager.navigateToStep(5)).rejects.toThrow('Invalid step index');
    });
    
    it('should throw error when no guide is active', async () => {
      navigationManager.state.currentGuide = null;
      await expect(navigationManager.navigateToStep(0)).rejects.toThrow('No guide is currently active');
    });
  });
  
  describe('Navigation History', () => {
    beforeEach(() => {
      navigationManager.setGuideSteps('test-guide', [
        { id: 'step1' }, { id: 'step2' }, { id: 'step3' }
      ]);
    });
    
    it('should maintain navigation history', async () => {
      await navigationManager.navigateToStep(0);
      await navigationManager.navigateToStep(1);
      await navigationManager.navigateToStep(2);
      
      const history = navigationManager.getNavigationHistory();
      expect(history).toHaveLength(3);
      expect(history[0].fromStep).toBe(-1);
      expect(history[0].toStep).toBe(0);
      expect(history[1].fromStep).toBe(0);
      expect(history[1].toStep).toBe(1);
      expect(history[2].fromStep).toBe(1);
      expect(history[2].toStep).toBe(2);
    });
    
    it('should respect max history size', async () => {
      navigationManager.options.maxHistorySize = 2;
      
      await navigationManager.navigateToStep(0);
      await navigationManager.navigateToStep(1);
      await navigationManager.navigateToStep(2);
      
      const history = navigationManager.getNavigationHistory();
      expect(history).toHaveLength(2);
      expect(history[0].toStep).toBe(1);
      expect(history[1].toStep).toBe(2);
    });
  });
  
  describe('Skip Guide', () => {
    it('should skip guide when allowed', async () => {
      navigationManager.setGuideSteps('test-guide', [{ id: 'step1' }]);
      
      const result = await navigationManager.skipGuide();
      
      expect(result).toBe(true);
      expect(navigationManager.state.currentStepIndex).toBe(-1);
      expect(navigationManager.state.currentGuide).toBeNull();
    });
    
    it('should throw error when skipping is not allowed', async () => {
      navigationManager.options.allowSkip = false;
      
      await expect(navigationManager.skipGuide()).rejects.toThrow('Skipping guide is not allowed');
    });
  });
  
  describe('Reset Navigation', () => {
    it('should reset navigation state', () => {
      navigationManager.setGuideSteps('test-guide', [{ id: 'step1' }]);
      navigationManager.state.currentStepIndex = 0;
      navigationManager.state.navigationHistory = [{ fromStep: -1, toStep: 0 }];
      
      navigationManager.resetNavigation();
      
      expect(navigationManager.state.currentStepIndex).toBe(-1);
      expect(navigationManager.state.currentGuide).toBeNull();
      expect(navigationManager.state.navigationHistory).toHaveLength(0);
      expect(navigationManager.guideSteps.size).toBe(0);
    });
  });
  
  describe('State Management', () => {
    beforeEach(() => {
      navigationManager.setGuideSteps('test-guide', [
        { id: 'step1' }, { id: 'step2' }
      ]);
    });
    
    it('should get current step', async () => {
      await navigationManager.navigateToStep(0);
      const currentStep = navigationManager.getCurrentStep();
      
      expect(currentStep).toEqual({ id: 'step1' });
    });
    
    it('should get navigation state', () => {
      const state = navigationManager.getNavigationState();
      
      expect(state.currentStepIndex).toBe(-1);
      expect(state.totalSteps).toBe(2);
      expect(state.progress).toBe(0);
    });
  });
});