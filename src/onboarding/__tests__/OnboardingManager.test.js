import { OnboardingManager } from '../core/OnboardingManager.js';
import { StorageManager } from '../storage/StorageManager.js';

/**
 * @jest-environment jsdom
 */

// Mock localStorage
const mockStorage = {
  data: new Map(),
  setItem(key, value) {
    this.data.set(key, value);
  },
  getItem(key) {
    return this.data.get(key) || null;
  },
  removeItem(key) {
    this.data.delete(key);
  }
};

// Mock window object for testing
global.window = {
  localStorage: mockStorage,
  sessionStorage: mockStorage
};

describe('OnboardingManager', () => {
  let manager;
  
  beforeEach(() => {
    // Clear storage before each test
    mockStorage.data.clear();
    manager = new OnboardingManager({
      debug: false,
      autoSave: false
    });
  });
  
  describe('Initialization', () => {
    test('should initialize with default state', () => {
      expect(manager).toBeDefined();
      expect(manager.getState().isActive).toBe(false);
      expect(manager.getState().currentGuide).toBeNull();
      expect(manager.getState().currentStep).toBeNull();
    });
    
    test('should accept custom options', () => {
      const customManager = new OnboardingManager({
        storageKey: 'custom_key',
        debug: true
      });
      
      expect(customManager.options.storageKey).toBe('custom_key');
      expect(customManager.options.debug).toBe(true);
    });
  });
  
  describe('Guide Registration', () => {
    test('should register guide successfully', () => {
      const guideConfig = {
        name: 'Test Guide',
        steps: [{ id: 'step1', title: 'Step 1' }]
      };
      
      manager.registerGuide('test-guide', guideConfig);
      const guide = manager.getGuide('test-guide');
      
      expect(guide).toBeDefined();
      expect(guide.id).toBe('test-guide');
      expect(guide.name).toBe('Test Guide');
    });
    
    test('should throw error for invalid guide registration', () => {
      expect(() => {
        manager.registerGuide('', {});
      }).toThrow();
      
      expect(() => {
        manager.registerGuide('test', null);
      }).toThrow();
    });
  });
  
  describe('Guide Lifecycle', () => {
    beforeEach(() => {
      manager.registerGuide('test-guide', {
        name: 'Test Guide',
        steps: [
          { id: 'step1', title: 'Step 1' },
          { id: 'step2', title: 'Step 2' }
        ]
      });
    });
    
    test('should start guide successfully', async () => {
      const result = await manager.startGuide('test-guide');
      
      expect(result).toBe(true);
      expect(manager.getState().isActive).toBe(true);
      expect(manager.getState().currentGuide).toBe('test-guide');
      expect(manager.getState().currentStep).toBe(0);
    });
    
    test('should not start non-existent guide', async () => {
      const result = await manager.startGuide('non-existent');
      
      expect(result).toBe(false);
      expect(manager.getState().isActive).toBe(false);
    });
    
    test('should complete steps and guide', async () => {
      await manager.startGuide('test-guide');
      
      // Complete first step
      await manager.completeStep();
      expect(manager.getState().currentStep).toBe(1);
      
      // Complete second step (final step)
      await manager.completeStep();
      expect(manager.getState().isActive).toBe(false);
      expect(manager.getState().completedGuides.has('test-guide')).toBe(true);
    });
    
    test('should skip guide', async () => {
      await manager.startGuide('test-guide');
      await manager.skipGuide('test-guide');
      
      expect(manager.getState().isActive).toBe(false);
      expect(manager.getState().skippedGuides.has('test-guide')).toBe(true);
    });
  });
  
  describe('Pause and Resume', () => {
    beforeEach(async () => {
      manager.registerGuide('test-guide', {
        name: 'Test Guide',
        steps: [{ id: 'step1', title: 'Step 1' }]
      });
      
      await manager.startGuide('test-guide');
    });
    
    test('should pause and resume guide', async () => {
      await manager.pauseGuide();
      expect(manager.getState().isPaused).toBe(true);
      
      await manager.resumeGuide();
      expect(manager.getState().isPaused).toBe(false);
    });
    
    test('should not pause inactive guide', async () => {
      await manager.completeGuide();
      await manager.pauseGuide();
      
      expect(manager.getState().isPaused).toBe(false);
    });
  });
  
  describe('State Persistence', () => {
    test('should save and load state', async () => {
      const managerWithAutoSave = new OnboardingManager({
        autoSave: true
      });
      
      managerWithAutoSave.registerGuide('test-guide', {
        name: 'Test Guide',
        steps: [{ id: 'step1', title: 'Step 1' }]
      });
      
      await managerWithAutoSave.startGuide('test-guide');
      await managerWithAutoSave.completeGuide();
      
      // Create new manager to test state loading
      const newManager = new OnboardingManager({
        autoSave: true
      });
      
      // State should be loaded from storage
      expect(newManager.getState().completedGuides.has('test-guide')).toBe(true);
    });
  });
});

describe('StorageManager', () => {
  let storageManager;
  
  beforeEach(() => {
    mockStorage.data.clear();
    storageManager = new StorageManager('test_key');
  });
  
  test('should save and load data', async () => {
    const testData = { key: 'value', number: 123 };
    
    await storageManager.save(testData);
    const loadedData = await storageManager.load();
    
    expect(loadedData).toEqual(testData);
  });
  
  test('should return null for non-existent data', async () => {
    const loadedData = await storageManager.load();
    expect(loadedData).toBeNull();
  });
  
  test('should clear data', async () => {
    await storageManager.save({ test: 'data' });
    await storageManager.clear();
    
    const loadedData = await storageManager.load();
    expect(loadedData).toBeNull();
  });
  
  test('should check storage availability', () => {
    expect(StorageManager.isAvailable()).toBe(true);
    expect(StorageManager.isAvailable('sessionStorage')).toBe(true);
  });
});