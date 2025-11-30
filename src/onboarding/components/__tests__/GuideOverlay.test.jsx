import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GuideOverlay from '../GuideOverlay';

// Mock ResizeObserver
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('GuideOverlay Component', () => {
  const mockStep = {
    title: '测试步骤标题',
    content: '这是测试步骤的内容',
    targetElement: '.test-element',
    highlightElement: true,
    progress: { current: 1, total: 5 },
    isLast: false
  };

  const mockCallbacks = {
    onNext: jest.fn(),
    onPrevious: jest.fn(),
    onSkip: jest.fn(),
    onClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('不渲染当 isActive 为 false', () => {
    render(
      <GuideOverlay
        step={mockStep}
        isActive={false}
        {...mockCallbacks}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('正确渲染步骤内容', () => {
    render(
      <GuideOverlay
        step={mockStep}
        isActive={true}
        {...mockCallbacks}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('测试步骤标题')).toBeInTheDocument();
    expect(screen.getByText('这是测试步骤的内容')).toBeInTheDocument();
    expect(screen.getByText('1 / 5')).toBeInTheDocument();
  });

  test('渲染进度条', () => {
    render(
      <GuideOverlay
        step={mockStep}
        isActive={true}
        showProgress={true}
        {...mockCallbacks}
      />
    );

    const progressBar = screen.getByText('1 / 5').closest('.guide-progress');
    expect(progressBar).toBeInTheDocument();
  });

  test('隐藏进度条当 showProgress 为 false', () => {
    render(
      <GuideOverlay
        step={mockStep}
        isActive={true}
        showProgress={false}
        {...mockCallbacks}
      />
    );

    expect(screen.queryByText('1 / 5')).not.toBeInTheDocument();
  });

  test('点击下一步按钮调用 onNext', () => {
    render(
      <GuideOverlay
        step={mockStep}
        isActive={true}
        {...mockCallbacks}
      />
    );

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(mockCallbacks.onNext).toHaveBeenCalledTimes(1);
  });

  test('最后一步显示完成按钮', () => {
    const lastStep = { ...mockStep, isLast: true };
    
    render(
      <GuideOverlay
        step={lastStep}
        isActive={true}
        {...mockCallbacks}
      />
    );

    expect(screen.getByText('完成')).toBeInTheDocument();
    expect(screen.queryByText('下一步')).not.toBeInTheDocument();
  });

  test('点击上一步按钮调用 onPrevious', () => {
    render(
      <GuideOverlay
        step={mockStep}
        isActive={true}
        {...mockCallbacks}
      />
    );

    const previousButton = screen.getByText('上一步');
    fireEvent.click(previousButton);

    expect(mockCallbacks.onPrevious).toHaveBeenCalledTimes(1);
  });

  test('点击跳过按钮调用 onSkip', () => {
    render(
      <GuideOverlay
        step={mockStep}
        isActive={true}
        {...mockCallbacks}
      />
    );

    const skipButton = screen.getByText('跳过');
    fireEvent.click(skipButton);

    expect(mockCallbacks.onSkip).toHaveBeenCalledTimes(1);
  });

  test('点击遮罩调用 onClose', () => {
    render(
      <GuideOverlay
        step={mockStep}
        isActive={true}
        {...mockCallbacks}
      />
    );

    const overlay = screen.getByRole('dialog');
    fireEvent.click(overlay);

    expect(mockCallbacks.onClose).toHaveBeenCalledTimes(1);
  });

  test('支持键盘导航', () => {
    render(
      <GuideOverlay
        step={mockStep}
        isActive={true}
        {...mockCallbacks}
      />
    );

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

  test('支持自定义类名', () => {
    render(
      <GuideOverlay
        step={{ ...mockStep, className: 'custom-class' }}
        isActive={true}
        {...mockCallbacks}
      />
    );

    const overlay = screen.getByRole('dialog');
    expect(overlay).toHaveClass('custom-class');
  });

  test('支持 React Node 内容', () => {
    const stepWithNodeContent = {
      ...mockStep,
      content: <div data-testid="custom-content">自定义内容</div>
    };

    render(
      <GuideOverlay
        step={stepWithNodeContent}
        isActive={true}
        {...mockCallbacks}
      />
    );

    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
  });

  test('无障碍支持', () => {
    render(
      <GuideOverlay
        step={mockStep}
        isActive={true}
        {...mockCallbacks}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'guide-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'guide-content');
    
    expect(screen.getByLabelText('上一步')).toBeInTheDocument();
    expect(screen.getByLabelText('下一步')).toBeInTheDocument();
    expect(screen.getByLabelText('跳过引导')).toBeInTheDocument();
  });
});