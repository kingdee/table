/**
 * 快速滚动管理器
 * 抽取 BaseTable 中的快速滚动相关逻辑
 */

export interface FastScrollConfig {
  /** 预渲染缓冲区大小，用于快速滚动判断 */
  overscanSize?: number
  /** 快速滚动速度阈值 (像素/毫秒) */
  velocityThreshold?: number
  /** 快速滚动距离倍数阈值 */
  distanceMultiplier?: number
  /** 快速滚动结束等待时间 (毫秒) - 高速滚动 */
  fastScrollEndDelayHigh?: number
  /** 快速滚动结束等待时间 (毫秒) - 普通滚动 */
  fastScrollEndDelayNormal?: number
  /** 高速滚动速度阈值 (像素/毫秒) */
  highVelocityThreshold?: number
}

export interface FastScrollState {
  lastScrollTime: number
  scrollVelocity: number
  lastOffsetY: number
}

export interface ScrollEventData {
  offsetY: number
  maxRenderHeight: number
  maxRenderWidth: number
}

export interface VerticalRenderRange {
  topIndex: number
  bottomIndex: number
  topBlank: number
  bottomBlank: number
}

export interface FastScrollCallbacks {
  onFastScrollStart: (renderData: {
    offsetY: number
    maxRenderHeight: number
    maxRenderWidth: number
    verticalRenderRange: VerticalRenderRange
  }) => void
  onFastScrollEnd: (scrollData: ScrollEventData) => void
  getCurrentRenderRange: (offsetY: number, maxRenderHeight: number, dataLength: number) => VerticalRenderRange
}

export class FastScrollManager {
  // 快速滚动状态
  private state: FastScrollState = {
    lastScrollTime: 0,
    scrollVelocity: 0,
    lastOffsetY: 0
  }

  // 快速滚动标志 - 作为私有属性立即更新
  private isFastScrolling = false

  // 定时器句柄 - 作为私有属性管理
  private fastScrollEndTimer?: number

  // 配置参数
  private config: Required<FastScrollConfig>

  private callbacks: FastScrollCallbacks

  constructor (
    callbacks: FastScrollCallbacks,
    config: FastScrollConfig = {}
  ) {
    this.callbacks = callbacks

    // 合并默认配置
    this.config = {
      overscanSize: 100,
      velocityThreshold: 3,
      distanceMultiplier: 3,
      fastScrollEndDelayHigh: 200,
      fastScrollEndDelayNormal: 150,
      highVelocityThreshold: 5,
      ...config
    }
  }

  /**
   * 检测是否接近底部（剩余滚动距离少于两屏）
   */
  private isNearBottom (
    currentScrollTop: number,
    maxRenderHeight: number,
    totalScrollHeight: number
  ): boolean {
    const remainingScrollDistance = totalScrollHeight - currentScrollTop - maxRenderHeight
    return remainingScrollDistance < maxRenderHeight
  }

  /**
   * 处理滚动事件 - 检测和处理快速滚动
   */
  handleScrollEvent (
    sizeAndOffset: ScrollEventData,
    currentState: {
      offsetY: number
      maxRenderHeight: number
      maxRenderWidth: number
    },
    dataLength: number,
    totalScrollHeight: number
  ) {
    const currentTime = performance.now()
    const deltaY = Math.abs(sizeAndOffset.offsetY - this.state.lastOffsetY)
    const deltaTime = currentTime - this.state.lastScrollTime

    // 计算滚动速度 (像素/毫秒)
    this.state.scrollVelocity = deltaTime > 0 ? deltaY / deltaTime : 0

    // 检测是否接近底部
    const isNearBottom = this.isNearBottom(
      sizeAndOffset.offsetY,
      sizeAndOffset.maxRenderHeight,
      totalScrollHeight
    )

    // 如果正在快速滚动但接近底部，提前结束快速滚动
    if (this.isFastScrolling && isNearBottom) {
      this.endFastScrolling(sizeAndOffset)
      return // 让正常渲染逻辑接管
    }

    // 快速滚动判断条件：
    // 1. 滚动距离超过阈值 && 滚动速度超过阈值
    // 2. 当前未在快速滚动状态
    // 3. 未接近底部边界
    const isSignificantChange = deltaY > this.config.overscanSize * this.config.distanceMultiplier
    const isHighVelocity = this.state.scrollVelocity > this.config.velocityThreshold
    const shouldStartFastScroll = (isSignificantChange || isHighVelocity) &&
      !this.isFastScrolling &&
      !isNearBottom // 接近底部时不启动快速滚动

    if (shouldStartFastScroll) {
      this.startFastScrolling(currentState, dataLength)
    }

    // 重置快速滚动结束定时器
    if (this.isFastScrolling) {
      this.resetFastScrollEndTimer(sizeAndOffset)
    }

    // 更新记录
    this.state.lastOffsetY = sizeAndOffset.offsetY
    this.state.lastScrollTime = currentTime
  }

  /**
   * 开始快速滚动
   */
  private startFastScrolling (currentState: {
    offsetY: number
    maxRenderHeight: number
    maxRenderWidth: number
  }, dataLength: number) {
    this.isFastScrolling = true

    // 获取当前渲染范围作为缓存
    const currentVerticalRange = this.callbacks.getCurrentRenderRange(
      currentState.offsetY,
      currentState.maxRenderHeight,
      dataLength
    )

    // 通知外部开始快速滚动
    this.callbacks.onFastScrollStart({
      offsetY: currentState.offsetY,
      maxRenderHeight: currentState.maxRenderHeight,
      maxRenderWidth: currentState.maxRenderWidth,
      verticalRenderRange: currentVerticalRange
    })
  }

  /**
   * 重置快速滚动结束定时器
   */
  private resetFastScrollEndTimer (sizeAndOffset: ScrollEventData) {
    if (this.fastScrollEndTimer) {
      clearTimeout(this.fastScrollEndTimer)
    }

    const waitTime = this.state.scrollVelocity > this.config.highVelocityThreshold
      ? this.config.fastScrollEndDelayHigh
      : this.config.fastScrollEndDelayNormal
    this.fastScrollEndTimer = window.setTimeout(() => {
      this.endFastScrolling(sizeAndOffset)
    }, waitTime)
  }

  /**
   * 结束快速滚动
   */
  private endFastScrolling (sizeAndOffset: ScrollEventData) {
    this.isFastScrolling = false
    this.fastScrollEndTimer = undefined

    // 通知外部结束快速滚动
    this.callbacks.onFastScrollEnd(sizeAndOffset)
  }

  /**
   * 清理资源
   */
  cleanup (): void {
    if (this.fastScrollEndTimer) {
      clearTimeout(this.fastScrollEndTimer)
    }
  }

  /**
   * 获取当前是否处于快速滚动状态
   */
  getIsFastScrolling (): boolean {
    return this.isFastScrolling
  }

  /**
   * 获取当前滚动速度
   */
  getScrollVelocity (): number {
    return this.state.scrollVelocity
  }

  /**
   * 清理资源
   */
  destroy () {
    if (this.fastScrollEndTimer) {
      clearTimeout(this.fastScrollEndTimer)
      this.fastScrollEndTimer = undefined
    }
    this.isFastScrolling = false
  }

  /**
   * 获取当前配置
   */
  getConfig (): Readonly<Required<FastScrollConfig>> {
    return { ...this.config }
  }
}
