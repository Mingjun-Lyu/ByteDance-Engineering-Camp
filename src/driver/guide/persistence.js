/**
 * 引导状态持久化和恢复功能
 */

import guideRegistry from './guideRegistry';

/**
 * 状态持久化管理器
 */
class PersistenceManager {
  constructor() {
    this.storageKey = 'guide_persistence';
    this.autoSave = true;
    this.autoSaveInterval = 5000; // 5秒自动保存
    this.autoSaveTimer = null;
    this.setupAutoSave();
  }

  /**
   * 设置自动保存
   */
  setupAutoSave() {
    if (this.autoSave) {
      this.autoSaveTimer = setInterval(() => {
        this.saveAllStates();
      }, this.autoSaveInterval);

      // 页面卸载前保存状态
      window.addEventListener('beforeunload', () => {
        this.saveAllStates();
      });
    }
  }

  /**
   * 保存引导状态
   */
  saveGuideState(guideId) {
    try {
      const state = guideRegistry.getGuideState(guideId);
      const config = guideRegistry.getGuideConfig(guideId);
      
      // 准备保存的数据
      const saveData = {
        guideId,
        version: config.version,
        status: state.status,
        currentStepIndex: state.currentStepIndex,
        completedSteps: Array.from(state.completedSteps),
        startTime: state.startTime,
        endTime: state.endTime,
        userInteractions: state.userInteractions.slice(-100), // 保存最近的100条交互
        metadata: state.metadata,
        lastSaved: Date.now()
      };

      // 获取现有数据
      const existingData = this.loadAllStates();
      
      // 更新数据
      existingData[guideId] = saveData;
      
      // 保存到存储
      localStorage.setItem(this.storageKey, JSON.stringify(existingData));
      
      console.log(`引导状态已保存: ${guideId}`);
      
      return true;
    } catch (error) {
      console.error(`保存引导状态失败: ${guideId}`, error);
      return false;
    }
  }

  /**
   * 加载引导状态
   */
  loadGuideState(guideId) {
    try {
      const allData = this.loadAllStates();
      const savedData = allData[guideId];
      
      if (!savedData) {
        return null;
      }

      // 验证数据完整性
      if (!this.validateSavedData(savedData)) {
        console.warn(`引导状态数据不完整或已损坏: ${guideId}`);
        this.clearGuideState(guideId);
        return null;
      }

      // 检查版本兼容性
      const config = guideRegistry.getGuideConfig(guideId);
      if (savedData.version !== config.version) {
        console.warn(`引导版本不匹配: ${guideId} (保存: ${savedData.version}, 当前: ${config.version})`);
        
        // 可以在这里实现版本迁移逻辑
        if (!this.migrateState(savedData, config.version)) {
          console.warn(`状态迁移失败，清除状态: ${guideId}`);
          this.clearGuideState(guideId);
          return null;
        }
      }

      return savedData;
    } catch (error) {
      console.error(`加载引导状态失败: ${guideId}`, error);
      return null;
    }
  }

  /**
   * 恢复引导状态
   */
  restoreGuideState(guideId) {
    const savedData = this.loadGuideState(guideId);
    
    if (!savedData) {
      return false;
    }

    try {
      // 恢复状态到注册表
      guideRegistry.updateGuideState(guideId, {
        status: savedData.status,
        currentStepIndex: savedData.currentStepIndex,
        completedSteps: new Set(savedData.completedSteps),
        startTime: savedData.startTime,
        endTime: savedData.endTime,
        userInteractions: savedData.userInteractions || [],
        metadata: savedData.metadata || {}
      });

      console.log(`引导状态已恢复: ${guideId}`);
      
      return true;
    } catch (error) {
      console.error(`恢复引导状态失败: ${guideId}`, error);
      return false;
    }
  }

  /**
   * 清除引导状态
   */
  clearGuideState(guideId) {
    try {
      const allData = this.loadAllStates();
      delete allData[guideId];
      
      localStorage.setItem(this.storageKey, JSON.stringify(allData));
      
      console.log(`引导状态已清除: ${guideId}`);
      
      return true;
    } catch (error) {
      console.error(`清除引导状态失败: ${guideId}`, error);
      return false;
    }
  }

  /**
   * 保存所有引导状态
   */
  saveAllStates() {
    try {
      const allInstances = guideRegistry.getAllInstances();
      const saveData = {};
      
      allInstances.forEach(({ guideId, state }) => {
        if (state.status !== 'idle') {
          const config = guideRegistry.getGuideConfig(guideId);
          
          saveData[guideId] = {
            guideId,
            version: config.version,
            status: state.status,
            currentStepIndex: state.currentStepIndex,
            completedSteps: Array.from(state.completedSteps),
            startTime: state.startTime,
            endTime: state.endTime,
            userInteractions: state.userInteractions.slice(-100),
            metadata: state.metadata,
            lastSaved: Date.now()
          };
        }
      });

      localStorage.setItem(this.storageKey, JSON.stringify(saveData));
      
      console.log(`所有引导状态已保存 (${Object.keys(saveData).length} 个引导)`);
      
      return true;
    } catch (error) {
      console.error('保存所有引导状态失败:', error);
      return false;
    }
  }

  /**
   * 加载所有引导状态
   */
  loadAllStates() {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      return savedData ? JSON.parse(savedData) : {};
    } catch (error) {
      console.error('加载所有引导状态失败:', error);
      return {};
    }
  }

  /**
   * 恢复所有引导状态
   */
  restoreAllStates() {
    try {
      const allData = this.loadAllStates();
      const results = [];
      
      Object.keys(allData).forEach(guideId => {
        try {
          const success = this.restoreGuideState(guideId);
          results.push({
            guideId,
            success,
            restored: success ? allData[guideId] : null
          });
        } catch (error) {
          results.push({
            guideId,
            success: false,
            error: error.message
          });
        }
      });
      
      console.log(`引导状态恢复完成: ${results.filter(r => r.success).length}/${results.length} 成功`);
      
      return results;
    } catch (error) {
      console.error('恢复所有引导状态失败:', error);
      return [];
    }
  }

  /**
   * 验证保存的数据
   */
  validateSavedData(data) {
    const requiredFields = ['guideId', 'version', 'status', 'currentStepIndex'];
    
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null) {
        return false;
      }
    }
    
    // 验证状态值
    const validStatuses = ['idle', 'running', 'paused', 'completed', 'stopped'];
    if (!validStatuses.includes(data.status)) {
      return false;
    }
    
    // 验证步骤索引
    if (typeof data.currentStepIndex !== 'number' || data.currentStepIndex < -1) {
      return false;
    }
    
    return true;
  }

  /**
   * 状态迁移（版本升级时使用）
   */
  migrateState(data, targetVersion) {
    // 这里可以实现版本迁移逻辑
    // 例如：从1.0.0迁移到1.1.0
    
    console.log(`状态迁移: ${data.guideId} (${data.version} -> ${targetVersion})`);
    
    // 简单的版本迁移示例
    if (data.version === '1.0.0' && targetVersion === '1.1.0') {
      // 添加新字段或修改现有字段
      data.metadata = data.metadata || {};
      data.metadata.migrated = true;
      data.version = targetVersion;
      
      return true;
    }
    
    // 如果不支持迁移，返回false
    return false;
  }

  /**
   * 导出引导状态
   */
  exportGuideState(guideId) {
    const data = this.loadGuideState(guideId);
    
    if (!data) {
      return null;
    }

    return {
      guideId: data.guideId,
      exportTime: Date.now(),
      data: data
    };
  }

  /**
   * 导入引导状态
   */
  importGuideState(importData) {
    try {
      if (!importData || !importData.guideId || !importData.data) {
        throw new Error('导入数据格式不正确');
      }

      const { guideId, data } = importData;
      
      // 验证导入数据
      if (!this.validateSavedData(data)) {
        throw new Error('导入数据验证失败');
      }

      // 获取现有数据
      const allData = this.loadAllStates();
      
      // 更新数据
      allData[guideId] = data;
      
      // 保存到存储
      localStorage.setItem(this.storageKey, JSON.stringify(allData));
      
      console.log(`引导状态已导入: ${guideId}`);
      
      return true;
    } catch (error) {
      console.error(`导入引导状态失败:`, error);
      return false;
    }
  }

  /**
   * 获取状态统计
   */
  getStateStatistics() {
    const allData = this.loadAllStates();
    const guideIds = Object.keys(allData);
    
    const statistics = {
      totalSaved: guideIds.length,
      byStatus: {},
      byGuide: {},
      storageSize: JSON.stringify(allData).length
    };
    
    guideIds.forEach(guideId => {
      const data = allData[guideId];
      
      // 按状态统计
      statistics.byStatus[data.status] = (statistics.byStatus[data.status] || 0) + 1;
      
      // 按引导统计
      statistics.byGuide[guideId] = {
        status: data.status,
        currentStep: data.currentStepIndex,
        completedSteps: data.completedSteps ? data.completedSteps.length : 0,
        lastSaved: data.lastSaved
      };
    });
    
    return statistics;
  }

  /**
   * 清理过期状态
   */
  cleanupExpiredStates(expiryDays = 30) {
    try {
      const allData = this.loadAllStates();
      const expiryTime = Date.now() - (expiryDays * 24 * 60 * 60 * 1000);
      const cleanedGuides = [];
      
      Object.keys(allData).forEach(guideId => {
        const data = allData[guideId];
        
        // 清理完成或停止的引导，且超过过期时间
        if ((data.status === 'completed' || data.status === 'stopped') && 
            data.lastSaved < expiryTime) {
          delete allData[guideId];
          cleanedGuides.push(guideId);
        }
      });
      
      if (cleanedGuides.length > 0) {
        localStorage.setItem(this.storageKey, JSON.stringify(allData));
        console.log(`清理过期状态: ${cleanedGuides.length} 个引导`);
      }
      
      return cleanedGuides;
    } catch (error) {
      console.error('清理过期状态失败:', error);
      return [];
    }
  }

  /**
   * 设置自动保存选项
   */
  setAutoSave(enabled, interval = 5000) {
    this.autoSave = enabled;
    this.autoSaveInterval = interval;
    
    // 清除现有定时器
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    
    // 重新设置自动保存
    if (enabled) {
      this.setupAutoSave();
    }
  }

  /**
   * 销毁持久化管理器
   */
  destroy() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    
    console.log('持久化管理器已销毁');
  }
}

// 创建单例实例
const persistenceManager = new PersistenceManager();

export default persistenceManager;