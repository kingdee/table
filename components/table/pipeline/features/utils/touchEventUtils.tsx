// 统一获取事件坐标的函数
export function getEventCoordinates (event: MouseEvent | TouchEvent) {
  if ('touches' in event && event.touches.length > 0) {
    return {
      clientX: event.touches[0].clientX,
      clientY: event.touches[0].clientY
    }
  } else if ('changedTouches' in event && event.changedTouches.length > 0) {
    return {
      clientX: event.changedTouches[0].clientX,
      clientY: event.changedTouches[0].clientY
    }
  } else {
    return {
      clientX: (event as MouseEvent).clientX,
      clientY: (event as MouseEvent).clientY
    }
  }
}

// 获取事件目标元素
export function getEventTarget (event: MouseEvent | TouchEvent) {
  if ('touches' in event && event.touches.length > 0) {
    return document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY)
  }
  // 处理touchend事件，此时touches为空，需要使用changedTouches
  if ('changedTouches' in event && event.changedTouches.length > 0) {
    return document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY)
  }
  return event.target
}

// 判断是否为触摸事件
export function isTouchEvent (event: MouseEvent | TouchEvent): event is TouchEvent {
  return 'touches' in event
}

// 为元素添加统一的指针事件监听器
export function addPointerEventListeners (
  element: Element | Window | Document,
  handlers: {
    onPointerMove: (e: MouseEvent | TouchEvent) => void
    onPointerUp: (e: MouseEvent | TouchEvent) => void
  },
  isTouchStart: boolean
) {
  if (isTouchStart) {
    element.addEventListener('touchmove', handlers.onPointerMove as any, { passive: false })
    element.addEventListener('touchend', handlers.onPointerUp as any, { passive: false })
  } else {
    element.addEventListener('mousemove', handlers.onPointerMove as any)
    element.addEventListener('mouseup', handlers.onPointerUp as any)
  }
}

// 移除统一的指针事件监听器
export function removePointerEventListeners (
  element: Element | Window | Document,
  handlers: {
    onPointerMove: (e: MouseEvent | TouchEvent) => void
    onPointerUp: (e: MouseEvent | TouchEvent) => void
  },
  isTouchStart: boolean
) {
  if (isTouchStart) {
    element.removeEventListener('touchmove', handlers.onPointerMove as any)
    element.removeEventListener('touchend', handlers.onPointerUp as any)
  } else {
    element.removeEventListener('mousemove', handlers.onPointerMove as any)
    element.removeEventListener('mouseup', handlers.onPointerUp as any)
  }
}

// 检查是否移动了足够的距离（用于区分点击和拖拽）
export function hasMovedEnough (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  threshold = 5
): boolean {
  const xDiff = endX - startX
  const yDiff = endY - startY
  return Math.sqrt(xDiff * xDiff + yDiff * yDiff) > threshold
}
