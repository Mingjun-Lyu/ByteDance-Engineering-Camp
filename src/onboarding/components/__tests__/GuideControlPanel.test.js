import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GuideControlPanel from '../GuideControlPanel';

describe('GuideControlPanel Component', () => {
  const mockCallbacks = {
    onStart: jest.fn(),
    onPause: jest.fn(),
    onResume: jest.fn(),
    onNext: jest.fn(),
    onPrevious: jest.fn(),
    onRestart: jest.fn(),
    onClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('不渲染当 isActive 为 false', () => {
    render(
      <GuideControlPanel
        currentStep={1}
        totalSteps={5}
        isActive={false}
        {...mockCallbacks}
      />
    );

    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  test('正确渲染控制面板', () => {
    render(
      <GuideControlPanel
        currentStep={1}
        totalSteps={5}
        isActive={true}
        {...mockCallbacks}
      />
    );

    expect(screen.getByRole('complementary')).toBeInTheDocument();
    expect(screen.getByText('引导控制')).toBeInTheDocument();
    expect(screen.getByText('步骤 1 / 5')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  test('显示开始按钮当步骤为0', () => {
    render(
      <GuideControlPanel
        currentStep={0}
        totalSteps={5}
        isActive={true}
        {...mockCallbacks}
      />
    );

    expect(screen.getByText('开始引导')).toBeInTheDocument();
    expect(screen.queryByText('暂停')).not.toBeInTheDocument();
    expect(screen.queryByText('继续')).not.toBeInTheDocument();
  });

  test('显示暂停按钮当引导进行中', () => {
    render(
      <GuideControlPanel
        currentStep={1}
        totalSteps={5}
        isActive={true}
        isPaused={false}
        {...mockCallbacks}
      />
    );

    expect(screen.getByText('暂停')).toBeInTheDocument();
    expect(screen.queryByText('继续')).not.toBeInTheDocument();
  });

  test('显示继续按钮当引导暂停', () => {
    render(
      <GuideControlPanel
        currentStep={1}
        totalSteps={5}
        isActive={true}
        isPaused={true}
        {...mockCallbacks}
      />
    );

    expect(screen.getByText('继续')).toBeInTheDocument();
    expect(screen.queryByText('暂停')).not.toBeInTheDocument();
  });

  test('点击开始按钮调用 onStart', () => {
    render(
      <GuideControlPanel
        currentStep={0}
        totalSteps={5}
        isActive={true}
        {...mockCallbacks}
      />
    );

    const startButton = screen.getByText('开始引导');
    fireEvent.click(startButton);

    expect(mockCallbacks.onStart).toHaveBeenCalledTimes(1);
  });

  test('点击暂停按钮调用 onPause', () => {
    render(
      <GuideControlPanel
        currentStep={1}
        totalSteps={5}
        isActive={true}
        isPaused={false}
        {...mockCallbacks}
      />
    );

    const pauseButton = screen.getByText('暂停');
    fireEvent.click(pauseButton);

    expect(mockCallbacks.onPause).toHaveBeenCalledTimes(1);
  });

  test('点击继续按钮调用 onResume', () => {
    render(
      <GuideControlPanel
        currentStep={1}
        totalSteps={5}
        isActive={true}
        isPaused={true}
        {...mockCallbacks}
      />
    );

    const resumeButton = screen.getByText('继续');
    fireEvent.click(resumeButton);

    expect(mockCallbacks.onResume).toHaveBeenCalledTimes(1);
  });

  test('点击下一步按钮调用 onNext', () => {
    render(
      <GuideControlPanel
        currentStep={1}
        totalSteps={5}
        isActive={true}
        {...mockCallbacks}
      />
    );

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(mockCallbacks.onNext).toHaveBeenCalledTimes(1);
  });

  test('点击上一步按钮调用 onPrevious', () => {
    render(
      <GuideControlPanel
        currentStep={2}
        totalSteps={5}
        isActive={true}
        {...mockCallbacks}
      />
    );

    const previousButton = screen.getByText('上一步');
    fireEvent.click(previousButton);

    expect(mockCallbacks.onPrevious).toHaveBeenCalledTimes(1);
  });

  test('上一步按钮在第一步时禁用', () => {
    render(
      <GuideControlPanel
        currentStep={1}
        totalSteps={5}
        isActive={true}
        {...mockCallbacks}
      />
    );

    const previousButton = screen.getByText('上一步');
    expect(previousButton).toBeDisabled();
  });

  test('下一步按钮在最后一步时显示完成', () => {
    render(
      <GuideControlPanel
        currentStep={5}
        totalSteps={5}
        isActive={true}
        {...mockCallbacks}
      />
    );

    expect(screen.getByText('完成')).toBeInTheDocument();
    expect(screen.queryByText('下一步')).not.toBeInTheDocument();
  });

  test('下一步按钮在最后一步时禁用', () => {
    render(
      <GuideControlPanel
        currentStep={5}
        totalSteps={5}
        isActive={true}
        {...mockCallbacks}
      />
    );

    const finishButton = screen.getByText('完成');
    expect(finishButton).toBeDisabled();
  });

  test('点击重新开始按钮调用 onRestart', () => {
    render(
      <GuideControlPanel
        currentStep={1}
        totalSteps={5}
        isActive={true}
        {...mockCallbacks}
      />
    );

    const restartButton = screen.getByText('重新开始');
    fireEvent.click(restartButton);

    expect(mockCallbacks.onRestart).toHaveBeenCalledTimes(1);
  });

  test('点击结束按钮调用 onClose', () => {
    render(
      <GuideControlPanel
        currentStep={1}
        totalSteps={5}
        isActive={true}
        {...mockCallbacks}
      />
    );

    const closeButton = screen.getByText('结束');
    fireEvent.click(closeButton);

    expect(mockCallbacks.onClose).toHaveBeenCalledTimes(1);
  });

  test('点击关闭按钮调用 onClose', () => {
    render(
      <GuideControlPanel
        currentStep={1}
        totalSteps={5}
        isActive={true}
        {...mockCallbacks}
      />
    );

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(mockCallbacks.onClose).toHaveBeenCalledTimes(1);
  });

  test('支持紧凑模式', () => {
    render(
      <GuideControlPanel
        currentStep={1}
        totalSteps={5}
        isActive={true}
        compact={true}
        {...mockCallbacks}
      />
    );

    const panel = screen.getByRole('complementary');
    expect(panel).toHaveClass('guide-control-panel--compact');
    
    // 应该显示切换按钮
    const toggleButton = screen.getByLabelText('展开控制面板');
    expect(toggleButton).toBeInTheDocument();
  });

  test('紧凑模式下切换展开/收起', () => {
    render(
      <GuideControlPanel
        currentStep={1}
        totalSteps={5}
        isActive={true}
        compact={true}
        {...mockCallbacks}
      />
    );

    // 初始状态应该是收起的 - 检查内容区域没有expanded类
    const contentElement = document.querySelector('.guide-control-content');
    expect(contentElement).not.toHaveClass('guide-control-content--expanded');
    
    // 点击切换按钮展开
    const toggleButton = screen.getByLabelText('展开控制面板');
    fireEvent.click(toggleButton);
    
    // 应该显示内容 - 检查内容区域有expanded类
    expect(contentElement).toHaveClass('guide-control-content--expanded');
    expect(screen.getByLabelText('收起控制面板')).toBeInTheDocument();
    
    // 再次点击收起
    fireEvent.click(screen.getByLabelText('收起控制面板'));
    expect(contentElement).not.toHaveClass('guide-control-content--expanded');
  });

  test('隐藏进度条当 showProgress 为 false', () => {
    render(
      <GuideControlPanel
        currentStep={1}
        totalSteps={5}
        isActive={true}
        showProgress={false}
        {...mockCallbacks}
      />
    );

    expect(screen.queryByText('步骤 1 / 5')).not.toBeInTheDocument();
    expect(screen.queryByText('20%')).not.toBeInTheDocument();
  });

  test('隐藏步骤信息当 showStepInfo 为 false', () => {
    render(
      <GuideControlPanel
        currentStep={1}
        totalSteps={5}
        isActive={true}
        showStepInfo={false}
        {...mockCallbacks}
      />
    );

    expect(screen.queryByText('当前步骤: 1')).not.toBeInTheDocument();
  });

  test('支持自定义位置', () => {
    render(
      <GuideControlPanel
        currentStep={1}
        totalSteps={5}
        isActive={true}
        position="top-left"
        {...mockCallbacks}
      />
    );

    const panel = screen.getByRole('complementary');
    expect(panel).toHaveClass('guide-control-panel--top-left');
  });

  test('显示状态指示器', () => {
    render(
      <GuideControlPanel
        currentStep={1}
        totalSteps={5}
        isActive={true}
        isPaused={false}
        {...mockCallbacks}
      />
    );

    expect(screen.getByText('进行中')).toBeInTheDocument();
  });

  test('显示暂停状态指示器', () => {
    render(
      <GuideControlPanel
        currentStep={1}
        totalSteps={5}
        isActive={true}
        isPaused={true}
        {...mockCallbacks}
      />
    );

    expect(screen.getByText('已暂停')).toBeInTheDocument();
  });

  test('无障碍支持', () => {
    render(
      <GuideControlPanel
        currentStep={1}
        totalSteps={5}
        isActive={true}
        {...mockCallbacks}
      />
    );

    const panel = screen.getByRole('complementary');
    expect(panel).toHaveAttribute('aria-label', '引导控制面板');
    
    expect(screen.getByLabelText('暂停引导')).toBeInTheDocument();
    expect(screen.getByLabelText('上一步')).toBeInTheDocument();
    expect(screen.getByLabelText('下一步')).toBeInTheDocument();
    expect(screen.getByLabelText('重新开始引导')).toBeInTheDocument();
    expect(screen.getByLabelText('结束引导')).toBeInTheDocument();
  });

  test('支持自定义类名', () => {
    render(
      <GuideControlPanel
        currentStep={1}
        totalSteps={5}
        isActive={true}
        className="custom-class"
        {...mockCallbacks}
      />
    );

    const panel = screen.getByRole('complementary');
    expect(panel).toHaveClass('custom-class');
  });
});