import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import GuideTooltip from '../GuideTooltip';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock document.querySelector
global.document.querySelector = jest.fn();

describe('GuideTooltip Component', () => {
  const mockStep = {
    title: '测试步骤标题',
    content: '这是测试步骤的内容',
    targetElement: '.test-element',
    isLast: false
  };

  const mockCallbacks = {
    onNext: jest.fn(),
    onPrevious: jest.fn(),
    onClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 100,
      height: 50,
      top: 100,
      left: 100,
      bottom: 150,
      right: 200
    }));

    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1024 });
    Object.defineProperty(window, 'innerHeight', { value: 768 });

    // Mock querySelector to return a dummy element
    global.document.querySelector.mockReturnValue({
      getBoundingClientRect: () => ({
        width: 100,
        height: 50,
        top: 100,
        left: 100,
        bottom: 150,
        right: 200
      })
    });
  });

  test('不渲染当 isActive 为 false', () => {
    render(
      <GuideTooltip
        step={mockStep}
        isActive={false}
        {...mockCallbacks}
      />
    );

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  test('不渲染当没有目标元素', () => {
    global.document.querySelector.mockReturnValue(null);
    
    render(
      <GuideTooltip
        step={mockStep}
        isActive={true}
        {...mockCallbacks}
      />
    );

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  test('正确渲染步骤内容', async () => {
    await act(async () => {
      render(
        <GuideTooltip
          step={mockStep}
          isActive={true}
          {...mockCallbacks}
        />
      );
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('测试步骤标题')).toBeInTheDocument();
    expect(screen.getByText('这是测试步骤的内容')).toBeInTheDocument();
  });

  test('最后一步显示完成按钮', async () => {
    const lastStep = { ...mockStep, isLast: true };
    
    await act(async () => {
      render(
        <GuideTooltip
          step={lastStep}
          isActive={true}
          {...mockCallbacks}
        />
      );
    });

    expect(screen.getByText('完成')).toBeInTheDocument();
    expect(screen.queryByText('下一步')).not.toBeInTheDocument();
  });

  test('点击下一步按钮调用 onNext', async () => {
    await act(async () => {
      render(
        <GuideTooltip
          step={mockStep}
          isActive={true}
          {...mockCallbacks}
        />
      );
    });

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(mockCallbacks.onNext).toHaveBeenCalledTimes(1);
  });

  test('点击上一步按钮调用 onPrevious', async () => {
    await act(async () => {
      render(
        <GuideTooltip
          step={mockStep}
          isActive={true}
          {...mockCallbacks}
        />
      );
    });

    const previousButton = screen.getByText('上一步');
    fireEvent.click(previousButton);

    expect(mockCallbacks.onPrevious).toHaveBeenCalledTimes(1);
  });

  test('点击关闭按钮调用 onClose', async () => {
    await act(async () => {
      render(
        <GuideTooltip
          step={mockStep}
          isActive={true}
          {...mockCallbacks}
        />
      );
    });

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(mockCallbacks.onClose).toHaveBeenCalledTimes(1);
  });

  test('支持键盘导航', async () => {
    await act(async () => {
      render(
        <GuideTooltip
          step={mockStep}
          isActive={true}
          {...mockCallbacks}
        />
      );
    });

    // 测试 Escape 键
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockCallbacks.onClose).toHaveBeenCalledTimes(1);

    // 测试 Enter 键
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(mockCallbacks.onNext).toHaveBeenCalledTimes(1);

    // 测试右箭头键
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(mockCallbacks.onNext).toHaveBeenCalledTimes(2);

    // 测试左箭头键
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(mockCallbacks.onPrevious).toHaveBeenCalledTimes(1);
  });

  test('支持自定义位置', async () => {
    await act(async () => {
      render(
        <GuideTooltip
          step={mockStep}
          isActive={true}
          position="top"
          {...mockCallbacks}
        />
      );
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('guide-tooltip-simple--top');
  });

  test('支持自动位置调整', async () => {
    await act(async () => {
      render(
        <GuideTooltip
          step={mockStep}
          isActive={true}
          position="auto"
          {...mockCallbacks}
        />
      );
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
  });

  test('支持自定义类名', async () => {
    await act(async () => {
      render(
        <GuideTooltip
          step={mockStep}
          isActive={true}
          className="custom-class"
          {...mockCallbacks}
        />
      );
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('custom-class');
  });

  test('支持自定义偏移量', async () => {
    await act(async () => {
      render(
        <GuideTooltip
          step={mockStep}
          isActive={true}
          offset={20}
          {...mockCallbacks}
        />
      );
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
  });

  test('支持 React Node 内容', async () => {
    const stepWithNodeContent = {
      ...mockStep,
      content: <div data-testid="custom-content">自定义内容</div>
    };

    await act(async () => {
      render(
        <GuideTooltip
          step={stepWithNodeContent}
          isActive={true}
          {...mockCallbacks}
        />
      );
    });

    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
  });

  test('无障碍支持', async () => {
    await act(async () => {
      render(
        <GuideTooltip
          step={mockStep}
          isActive={true}
          {...mockCallbacks}
        />
      );
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveAttribute('aria-labelledby', 'guide-tooltip-title');
    expect(tooltip).toHaveAttribute('aria-describedby', 'guide-tooltip-content');
    
    expect(screen.getByLabelText('上一步')).toBeInTheDocument();
    expect(screen.getByLabelText('下一步')).toBeInTheDocument();
    expect(screen.getByLabelText('关闭引导')).toBeInTheDocument();
  });

  test('处理窗口大小变化', async () => {
    await act(async () => {
      render(
        <GuideTooltip
          step={mockStep}
          isActive={true}
          {...mockCallbacks}
        />
      );
    });

    // 模拟窗口大小变化
    Object.defineProperty(window, 'innerWidth', { value: 800 });
    Object.defineProperty(window, 'innerHeight', { value: 600 });
    
    fireEvent.resize(window);
    
    // 组件应该重新计算位置
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
  });

  test('处理滚动事件', async () => {
    await act(async () => {
      render(
        <GuideTooltip
          step={mockStep}
          isActive={true}
          {...mockCallbacks}
        />
      );
    });

    // 模拟滚动事件
    fireEvent.scroll(window);
    
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
  });
});