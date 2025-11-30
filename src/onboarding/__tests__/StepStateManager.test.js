import { StepStateManager } from '../core/StepStateManager.js';

describe('StepStateManager', () => {
  let stateManager;
  
  beforeEach(() => {
    stateManager = new StepStateManager({ debug: false });
  });
  
  afterEach(() => {
    stateManager = null;
  });
  
  describe('Initialization', () => {
    it('should initialize with default state', () => {
      expect(stateManager.state.currentExecution).toBeNull();
      expect(stateManager.state.executionHistory).toHaveLength(0);
      expect(stateManager.state.executionStats.size).toBe(0);
      expect(stateManager.state.errorHistory).toHaveLength(0);
      expect(stateManager.state.performanceMetrics.totalExecutions).toBe(0);
    });
    
    it('should initialize with custom options', () => {
      const customManager = new StepStateManager({
        maxStateHistory: 50,
        autoSave: false,
        debug: true
      });
      
      expect(customManager.options.maxStateHistory).toBe(50);
      expect(customManager.options.autoSave).toBe(false);
      expect(customManager.options.debug).toBe(true);
    });
  });
  
  describe('Step Execution Management', () => {
    it('should start step execution', () => {
      const step = { id: 'test-step', title: 'Test Step' };
      const executionId = stateManager.startStepExecution(step);
      
      expect(typeof executionId).toBe('string');
      expect(stateManager.state.currentExecution).toMatchObject({
        id: executionId,
        step: step,
        status: 'running',
        startTime: expect.any(Number),
        progress: 0
      });
    });
    
    it('should throw error when starting execution with invalid step', () => {
      expect(() => stateManager.startStepExecution(null)).toThrow('Cannot read properties of null');
    });
    
    it('should update execution progress', () => {
      const step = { id: 'test-step', title: 'Test Step' };
      const executionId = stateManager.startStepExecution(step);
      
      stateManager.updateExecutionProgress(executionId, 50);
      
      expect(stateManager.state.currentExecution.progress).toBe(50);
    });
    
    it('should not update progress for invalid execution', () => {
      // 静默失败，不抛出错误
      expect(() => stateManager.updateExecutionProgress('invalid-id', 50)).not.toThrow();
    });
    
    it('should complete step execution', () => {
      const step = { id: 'test-step', title: 'Test Step' };
      const executionId = stateManager.startStepExecution(step);
      
      stateManager.completeStepExecution(executionId);
      
      expect(stateManager.state.currentExecution).toBeNull();
      expect(stateManager.state.executionHistory).toHaveLength(1);
      expect(stateManager.state.executionHistory[0].status).toBe('completed');
      expect(stateManager.state.executionHistory[0].step.id).toBe('test-step');
    });
    
    it('should fail step execution', () => {
      const step = { id: 'test-step', title: 'Test Step' };
      const executionId = stateManager.startStepExecution(step);
      const error = new Error('Test error');
      
      stateManager.failStepExecution(executionId, error);
      
      expect(stateManager.state.currentExecution).toBeNull();
      expect(stateManager.state.executionHistory).toHaveLength(1);
      expect(stateManager.state.executionHistory[0].status).toBe('failed');
      expect(stateManager.state.errorHistory).toHaveLength(1);
      expect(stateManager.state.errorHistory[0].error.message).toBe('Test error');
    });
    
    it('should throw error when completing non-existent execution', () => {
      expect(() => stateManager.completeStepExecution('invalid-id')).toThrow('No active execution found');
    });
    
    it('should throw error when failing non-existent execution', () => {
      expect(() => stateManager.failStepExecution('invalid-id', new Error())).toThrow('No active execution found');
    });
  });
  
  describe('Execution History Management', () => {
    it('should respect max execution history size', () => {
      stateManager.options.maxStateHistory = 2;
      
      const step1 = { id: 'step1' };
      const step2 = { id: 'step2' };
      const step3 = { id: 'step3' };
      
      const executionId1 = stateManager.startStepExecution(step1);
      stateManager.completeStepExecution(executionId1);
      
      const executionId2 = stateManager.startStepExecution(step2);
      stateManager.completeStepExecution(executionId2);
      
      const executionId3 = stateManager.startStepExecution(step3);
      stateManager.completeStepExecution(executionId3);
      
      expect(stateManager.state.executionHistory).toHaveLength(2);
      expect(stateManager.state.executionHistory[0].step.id).toBe('step3');
      expect(stateManager.state.executionHistory[1].step.id).toBe('step2');
    });
  });
  
  describe('Pause and Resume Execution', () => {
    it('should pause step execution', () => {
      const step = { id: 'test-step' };
      const executionId = stateManager.startStepExecution(step);
      
      stateManager.pauseStepExecution(executionId);
      
      expect(stateManager.state.currentExecution.status).toBe('paused');
    });
    
    it('should resume paused execution', () => {
      const step = { id: 'test-step' };
      const executionId = stateManager.startStepExecution(step);
      
      stateManager.pauseStepExecution(executionId);
      stateManager.resumeStepExecution(executionId);
      
      expect(stateManager.state.currentExecution.status).toBe('running');
    });
    
    it('should not throw error when pausing non-existent execution', () => {
      // 静默失败，不抛出错误
      expect(() => stateManager.pauseStepExecution('invalid-id')).not.toThrow();
    });
    
    it('should not throw error when resuming non-existent execution', () => {
      // 静默失败，不抛出错误
      expect(() => stateManager.resumeStepExecution('invalid-id')).not.toThrow();
    });
  });
  
  describe('Performance Metrics', () => {
    it('should update performance metrics on successful execution', () => {
      const step = { id: 'test-step' };
      const executionId = stateManager.startStepExecution(step);
      stateManager.completeStepExecution(executionId);
      
      expect(stateManager.state.performanceMetrics.totalExecutions).toBe(1);
      expect(stateManager.state.performanceMetrics.successfulExecutions).toBe(1);
      expect(stateManager.state.performanceMetrics.failedExecutions).toBe(0);
    });
    
    it('should update performance metrics on failed execution', () => {
      const step = { id: 'test-step' };
      const executionId = stateManager.startStepExecution(step);
      stateManager.failStepExecution(executionId, new Error('Test error'));
      
      expect(stateManager.state.performanceMetrics.totalExecutions).toBe(1);
      expect(stateManager.state.performanceMetrics.successfulExecutions).toBe(0);
      expect(stateManager.state.performanceMetrics.failedExecutions).toBe(1);
    });
  });
  
  describe('Execution Statistics', () => {
    it('should track execution statistics per step', () => {
      const step1 = { id: 'step1' };
      const step2 = { id: 'step2' };
      
      const executionId1 = stateManager.startStepExecution(step1);
      stateManager.completeStepExecution(executionId1);
      
      const executionId2 = stateManager.startStepExecution(step2);
      stateManager.completeStepExecution(executionId2);
      
      const executionId3 = stateManager.startStepExecution(step1);
      stateManager.completeStepExecution(executionId3);
      
      expect(stateManager.state.executionStats.size).toBe(2);
      expect(stateManager.state.executionStats.get('step1').totalExecutions).toBe(2);
      expect(stateManager.state.executionStats.get('step2').totalExecutions).toBe(1);
    });
  });
  
  describe('State Reset', () => {
    it('should reset state manager', () => {
      const step = { id: 'step1' };
      const executionId = stateManager.startStepExecution(step);
      stateManager.completeStepExecution(executionId);
      
      // 重置状态管理器
      stateManager.reset();
      
      expect(stateManager.state.currentExecution).toBeNull();
      expect(stateManager.state.executionHistory).toHaveLength(0);
      expect(stateManager.state.executionStats.size).toBe(0);
      expect(stateManager.state.errorHistory).toHaveLength(0);
      expect(stateManager.state.performanceMetrics.totalExecutions).toBe(0);
    });
  });
});