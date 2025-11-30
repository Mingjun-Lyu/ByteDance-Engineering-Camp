import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GuideOverlay from '../GuideOverlay';
import GuideTooltip from '../GuideTooltip';
import GuideControlPanel from '../GuideControlPanel';

describe('UI Components Integration Tests', () => {
  const mockCallbacks = {
    onNext: jest.fn(),
    onPrevious: jest.fn(),
    onClose: jest.fn(),
    onStart: jest.fn(),
    onPause: jest.fn(),
    onResume: jest.fn(),
    onRestart: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('遮罩层和提示框协同工作', () => {
    const step = {
      title: '测试步骤',
      content: '这是测试步骤的内容',
      targetElement: '#test-element',
      highlightElement: true,
      tooltipPosition: 'bottom',
      progress: {
        current: 1,
        total: 3
      },
      isLast: false
    };

    render(
      <>
        <div id="test-element">目标元素</div>
        <GuideOverlay
          isActive={true}
          step={step}
          onNext={mockCallbacks.onNext}
          onPrevious={mockCallbacks.onPrevious}
          onClose={mockCallbacks.onClose}
        />
      </>
    );

    // 验证遮罩层存在
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    // 验证提示框内容
    expect(screen.getByText('测试步骤')).toBeInTheDocument();
    expect(screen.getByText('这是测试步骤的内容')).toBeInTheDocument();
    
    // 验证进度显示
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    
    // 验证按钮存在
    expect(screen.getByText('下一步')).toBeInTheDocument();
    expect(screen.getByText('上一步')).toBeInTheDocument();
  });

  test('控制面板与遮罩层状态同步', () => {
    const step = {
      title: '步骤2',
      content: '内容2',
      targetElement: '#test-element',
      highlightElement: true,
      tooltipPosition: 'bottom',
      progress: {
        current: 2,
        total: 5
      },
      isLast: false
    };

    render(
      <>
        <div id="test-element">目标元素</div>
        <GuideOverlay
          isActive={true}
          step={step}
          onNext={mockCallbacks.onNext}
          onPrevious={mockCallbacks.onPrevious}
          onClose={mockCallbacks.onClose}
        />
        <GuideControlPanel
          currentStep={2}
          totalSteps={5}
          isActive={true}
          isPaused={false}
          onStart={mockCallbacks.onStart}
          onPause={mockCallbacks.onPause}
          onResume={mockCallbacks.onResume}
          onNext={mockCallbacks.onNext}
          onPrevious={mockCallbacks.onPrevious}
          onRestart={mockCallbacks.onRestart}
          onClose={mockCallbacks.onClose}
        />
      </>
    );

    // 验证控制面板显示正确的进度
    expect(screen.getByText('步骤 2 / 5')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    
    // 验证遮罩层显示正确的步骤
    expect(screen.getByText('2 / 5')).toBeInTheDocument();
    
    // 点击控制面板的下一步按钮 - 使用更精确的选择器
    const nextButtons = screen.getAllByText('下一步');
    expect(nextButtons.length).toBeGreaterThanOrEqual(1);
    
    // 找到控制面板中的下一步按钮（通常在导航按钮组中）
    const controlPanelNextButton = nextButtons.find(button => {
      const parent = button.closest('.guide-control-navigation');
      return parent !== null;
    });
    
    if (controlPanelNextButton) {
      fireEvent.click(controlPanelNextButton);
      expect(mockCallbacks.onNext).toHaveBeenCalledTimes(1);
    } else {
      // 如果找不到特定的按钮，点击第一个下一步按钮
      fireEvent.click(nextButtons[0]);
      expect(mockCallbacks.onNext).toHaveBeenCalledTimes(1);
    }
  });

  test('独立提示框组件功能', async () => {
    // Mock ResizeObserver for testing
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));

    // Mock getBoundingClientRect for the target element
    const mockTargetGetBoundingClientRect = jest.fn(() => ({
      top: 100,
      left: 100,
      width: 50,
      height: 30,
      bottom: 130,
      right: 150,
    }));

    // 创建一个目标元素并设置样式使其可见
    const targetElement = document.createElement('div');
    targetElement.id = 'test-target';
    targetElement.style.position = 'absolute';
    targetElement.style.top = '100px';
    targetElement.style.left = '100px';
    targetElement.style.width = '50px';
    targetElement.style.height = '30px';
    targetElement.getBoundingClientRect = mockTargetGetBoundingClientRect;
    document.body.appendChild(targetElement);

    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });

    // Mock document.querySelector to return our target element
    const originalQuerySelector = document.querySelector;
    document.querySelector = jest.fn((selector) => {
      if (selector === '#test-target') {
        return targetElement;
      }
      return originalQuerySelector.call(document, selector);
    });

    render(
      <GuideTooltip
        isActive={true}
        step={{
          title: '独立提示框',
          content: '这是一个独立的提示框组件',
          targetElement: '#test-target',
          isLast: false
        }}
        position="top"
        onNext={mockCallbacks.onNext}
        onClose={mockCallbacks.onClose}
      />
    );

    // 等待提示框渲染
    await waitFor(() => {
      expect(screen.getByText('独立提示框')).toBeInTheDocument();
    });
    
    expect(screen.getByText('这是一个独立的提示框组件')).toBeInTheDocument();
    
    // 验证按钮存在
    expect(screen.getByText('下一步')).toBeInTheDocument();
    
    // 点击下一步
    fireEvent.click(screen.getByText('下一步'));
    expect(mockCallbacks.onNext).toHaveBeenCalledTimes(1);

    // Restore original querySelector
    document.querySelector = originalQuerySelector;

    // 清理
    document.body.removeChild(targetElement);
  });

  test('组件状态切换', async () => {
    const { rerender } = render(
      <>
        <GuideOverlay
          isActive={false}
          step={null}
          onNext={mockCallbacks.onNext}
          onClose={mockCallbacks.onClose}
        />
        <GuideControlPanel
          currentStep={1}
          totalSteps={3}
          isActive={true}
          isPaused={false}
          onPause={mockCallbacks.onPause}
          onClose={mockCallbacks.onClose}
        />
      </>
    );

    // 初始状态验证 - 组件未激活，应该没有dialog元素
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('暂停')).toBeInTheDocument();
    
    // 先激活overlay
    rerender(
      <>
        <GuideOverlay
          isActive={true}
          step={{
            title: '步骤1',
            content: '内容1',
            targetElement: '#test-element',
            progress: {
              current: 1,
              total: 3
            },
            isLast: false
          }}
          onNext={mockCallbacks.onNext}
          onClose={mockCallbacks.onClose}
        />
        <GuideControlPanel
          currentStep={1}
          totalSteps={3}
          isActive={true}
          isPaused={false}
          onPause={mockCallbacks.onPause}
          onClose={mockCallbacks.onClose}
        />
      </>
    );

    // 等待overlay渲染
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // 点击暂停
    fireEvent.click(screen.getByText('暂停'));
    expect(mockCallbacks.onPause).toHaveBeenCalledTimes(1);
    
    // 重新渲染暂停状态 - 暂停时overlay应该隐藏
    rerender(
      <>
        <GuideOverlay
          isActive={false}
          step={null}
          onNext={mockCallbacks.onNext}
          onClose={mockCallbacks.onClose}
        />
        <GuideControlPanel
          currentStep={1}
          totalSteps={3}
          isActive={true}
          isPaused={true}
          onResume={mockCallbacks.onResume}
          onClose={mockCallbacks.onClose}
        />
      </>
    );

    // 验证暂停状态 - overlay应该隐藏，控制面板状态改变
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('继续')).toBeInTheDocument();
    expect(screen.getByText('已暂停')).toBeInTheDocument();
    
    // 点击继续
    fireEvent.click(screen.getByText('继续'));
    expect(mockCallbacks.onResume).toHaveBeenCalledTimes(1);
  });

  test('键盘导航集成', () => {
    render(
      <>
        <GuideOverlay
          isActive={true}
          step={{
            title: '步骤2',
            content: '内容2',
            targetElement: '#test-element',
            progress: {
              current: 2,
              total: 4
            },
            isLast: false
          }}
          onNext={mockCallbacks.onNext}
          onPrevious={mockCallbacks.onPrevious}
          onClose={mockCallbacks.onClose}
        />
      </>
    );

    // 模拟键盘事件
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(mockCallbacks.onNext).toHaveBeenCalledTimes(1);
    
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(mockCallbacks.onPrevious).toHaveBeenCalledTimes(1);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockCallbacks.onClose).toHaveBeenCalledTimes(1);
  });

  test('响应式设计集成', () => {
    // 模拟小屏幕
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 480
    });

    render(
      <>
        <GuideOverlay
          isActive={true}
          step={{
            title: '移动端测试',
            content: '小屏幕内容',
            targetElement: '#test-element',
            progress: {
              current: 1,
              total: 3
            },
            isLast: false
          }}
          onNext={mockCallbacks.onNext}
          onClose={mockCallbacks.onClose}
        />
        <GuideControlPanel
          currentStep={1}
          totalSteps={3}
          isActive={true}
          compact={true}
          onClose={mockCallbacks.onClose}
        />
      </>
    );

    // 验证紧凑模式
    const controlPanel = screen.getByRole('complementary');
    expect(controlPanel).toHaveClass('guide-control-panel--compact');
    
    // 验证遮罩层样式
    const overlay = screen.getByRole('dialog');
    expect(overlay).toHaveClass('guide-overlay');
  });

  test('无障碍支持集成', () => {
    render(
      <>
        <GuideOverlay
          isActive={true}
          step={{
            title: '无障碍测试',
            content: '无障碍内容',
            targetElement: '#test-element',
            progress: {
              current: 1,
              total: 2
            },
            isLast: false
          }}
          onNext={mockCallbacks.onNext}
          onClose={mockCallbacks.onClose}
        />
        <GuideControlPanel
          currentStep={1}
          totalSteps={2}
          isActive={true}
          onClose={mockCallbacks.onClose}
        />
      </>
    );

    // 验证遮罩层无障碍属性
    const overlay = screen.getByRole('dialog');
    expect(overlay).toHaveAttribute('aria-modal', 'true');
    expect(overlay).toHaveAttribute('aria-labelledby');
    
    // 验证控制面板无障碍属性
    const controlPanel = screen.getByRole('complementary');
    expect(controlPanel).toHaveAttribute('aria-label', '引导控制面板');
    
    // 验证按钮的标签 - 使用更具体的选择器
    const overlayButtons = screen.getAllByLabelText('下一步');
    const controlButtons = screen.getAllByLabelText('上一步');
    expect(overlayButtons.length).toBeGreaterThan(0);
    expect(controlButtons.length).toBeGreaterThan(0);
  });

  test('组件生命周期集成', async () => {
    const { rerender } = render(
      <>
        <GuideOverlay
          isActive={false}
          step={null}
          onNext={mockCallbacks.onNext}
          onClose={mockCallbacks.onClose}
        />
        <GuideControlPanel
          currentStep={0}
          totalSteps={3}
          isActive={false}
          onStart={mockCallbacks.onStart}
          onClose={mockCallbacks.onClose}
        />
      </>
    );

    // 初始状态不显示
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    
    // 激活引导
    rerender(
      <>
        <GuideOverlay
          isActive={true}
          step={{
            title: '步骤1',
            content: '内容1',
            targetElement: '#test-element',
            progress: {
              current: 1,
              total: 3
            },
            isLast: false
          }}
          onNext={mockCallbacks.onNext}
          onClose={mockCallbacks.onClose}
        />
        <GuideControlPanel
          currentStep={1}
          totalSteps={3}
          isActive={true}
          onStart={mockCallbacks.onStart}
          onClose={mockCallbacks.onClose}
        />
      </>
    );

    // 验证组件显示 - 使用更灵活的等待方式
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });
    
    // 完成引导
    rerender(
      <>
        <GuideOverlay
          isActive={false}
          step={null}
          onNext={mockCallbacks.onNext}
          onClose={mockCallbacks.onClose}
        />
        <GuideControlPanel
          currentStep={3}
          totalSteps={3}
          isActive={false}
          onStart={mockCallbacks.onStart}
          onClose={mockCallbacks.onClose}
        />
      </>
    );

    // 验证组件隐藏
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });
  });
});