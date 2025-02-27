import React from 'react'
/** elementUtil html元素用的工具函数 */

// 获取面板相对屏幕的位置  panel - 面板 trigger - 触发器
// export function getPanelScreenByTrigger ({ panel, trigger, defaultAlign }) {
//   if (!panel || !trigger) return {}
//   // 触发器相对于浏览器的位置
//   const triggerScreen = trigger.getBoundingClientRect()
//   // 触发器下方剩余高度
//   const bottomHeight = window.innerHeight - triggerScreen.top - trigger.offsetHeight
//   // 触发器上方剩余高度
//   const topHeight = triggerScreen.top

//   // 默认优先显示在触发器的下方
//   let top = bottomHeight >= panel.offsetHeight || bottomHeight > topHeight
//     ? triggerScreen.top + trigger.offsetHeight // 显示在触发器下方
//     : triggerScreen.top - panel.offsetHeight // 显示在触发器下方
//   defaultAlign = defaultAlign || {}
//   if (defaultAlign.top) { // 优先显示在触发器的上方
//     top = topHeight >= panel.offsetHeight || topHeight > bottomHeight
//       ? triggerScreen.top - panel.offsetHeight
//       : triggerScreen.top + trigger.offsetHeight
//   }

//   // 浏览器右侧剩余宽度
//   const rightWidth = window.innerWidth - triggerScreen.left - trigger.offsetWidth
//   // 浏览器左侧剩余宽度
//   const leftWidth = triggerScreen.left

//   // 默认优先靠左显示
//   let left = rightWidth + trigger.offsetWidth >= panel.offsetWidth ||
//     rightWidth > leftWidth
//     ? triggerScreen.left
//     : triggerScreen.left + trigger.offsetWidth - panel.offsetWidth
//   if (defaultAlign.right) { // 优先靠右显示
//     left = leftWidth + trigger.offsetWidth > panel.offsetWidth ||
//       leftWidth > rightWidth
//       ? triggerScreen.left + trigger.offsetWidth - panel.offsetWidth
//       : triggerScreen.left
//   }

//   // 增加左右显示的标识
//   if (rightWidth >= panel.offsetWidth) {
//     panel.classList.add('j-left')
//   } else {
//     panel.classList.add('j-right')
//   }

//   const realHeight = bottomHeight > topHeight ? bottomHeight : topHeight
//   // 空间不足且显示在上方，top设0避免溢出
//   if (panel.offsetHeight > realHeight && topHeight > bottomHeight) {
//     top = 0
//   }
//   return { top, left, realHeight }
// }

export function getEventPath(event: MouseEvent | React.MouseEvent<HTMLTableElement, MouseEvent> | KeyboardEvent) {

  if ((event as any).deepPath) {
    // IE supports deep path
    return (event as any).deepPath()
  }
  else if ((event as any).path) {
    // Chrome supports path
    return (event as any).path
  }
  else if ((event as any).composedPath) {
    // Firefox supports composePath
    return (event as any).composedPath()
  }

  return createEventPath(event)
}

function createEventPath(event: MouseEvent | React.MouseEvent<HTMLTableElement, MouseEvent> | KeyboardEvent) {
  const res = []
  let pointer = event.target
  while (pointer) {
    res.push(pointer);
    pointer = (pointer as any).parentElement;
  }
  return res;
};

/**
 * 获取点击事件是否发生在元素内部
 * @param ele 
 * @param event 
 */
export function isElementInEventPath (ele?: HTMLElement, event?: MouseEvent | KeyboardEvent) {
  if (!ele || !event) {
    return false
  }
  const path = getEventPath(event)
  return path.indexOf(ele) >= 0
}

/**
 * 根据点击路径获取对应元素
 * @param path 
 * @param isTargetCb 
 */
export function getTargetEleInEventPath(path: Array<HTMLElement>, isTargetCb: (ele: HTMLElement) => boolean) {
  let target
  let l = 0
  while (!target && l < path.length) {
    const ele = path[l]
    if (isTargetCb(ele)) {
      target = ele
    }
    l++
  }
  return target
}

/**
 * 获得鼠标点击相对父面板位置
 * @param event 
 * @param popupParent 
 */
export function calculatePointerRelative(event: React.MouseEvent<HTMLTableElement, MouseEvent> | MouseEvent, popupParent: HTMLElement) {
  const parentRect = popupParent.getBoundingClientRect()
  const documentRect = document.documentElement.getBoundingClientRect()

  return {
    x: event.clientX - (popupParent === document.body ? documentRect.left : parentRect.left),
    y: event.clientY - (popupParent === document.body ? documentRect.top : parentRect.top)
  }
}

interface OffSet {
  x:number
  y:number
}

/**
 * 获取面板相对父面板位置
 * @param event 
 * @param popupParent 
 */
export function calculatePopupRelative(trigger: HTMLElement, popupParent: HTMLElement, offset?:OffSet, direction?: string){
  const triggerRect = trigger.getBoundingClientRect()
  const parent = popupParent === document.body ? document.documentElement : popupParent
  const parentRect = parent.getBoundingClientRect()
  const offsetX = offset ? offset.x : 0
  const offsetY = offset ? offset.y : 0

  return {
    x: triggerRect.left - parentRect.left + (direction === 'rtl' ? offsetX + triggerRect.width : -offsetX),
    y: triggerRect.top - parentRect.top - offsetY
  }
}

function getPerfectX({ x, maxX, width, isPerfectX }) {
  if (isPerfectX && Math.max(x, 0) > Math.abs(maxX)) {
    //看左侧空间是否足够
    let parentAvailableWidth = x
    if (width <= parentAvailableWidth) {
      return x - width //空间足够，往左侧偏移
    }
  }
  //目前位置，最大支持的位置
  return Math.min(Math.max(x, 0), Math.abs(maxX)) 
}

function getPerfectY({ y, maxY, height,scrollTop, isBody,isPerfectY }) {
  if (isPerfectY && Math.max(y, 0) > Math.abs(maxY)) {
    //看下上方空间是否足够
    let parentAvailableHeight = isBody ? y - scrollTop : y
    if (height <= parentAvailableHeight) {
      //上方空间足够，向上展示
      return y - height 
    }
  }
  //目前位置，最大支持的位置
  return Math.min(Math.max(y, 0), Math.abs(maxY)) 
}

export function keepWithinBounds(popupParent: HTMLElement, popup: HTMLElement, x: number, y: number, isPerfect?: Boolean){
  const parentRect = popupParent.getBoundingClientRect()
  const docElement = document.documentElement
  const docRect = docElement.getBoundingClientRect()
  const popupRect = popup.getBoundingClientRect()
  let parentAvailableWidth = parentRect.width
  let parentAvailableHeight = parentRect.height
  const isBody = popupParent === document.body
  if(isBody){
    //ducument的宽度减去 父元素到document边界的的宽度，就是剩余可显示的宽度
    parentAvailableWidth = docRect.width - Math.abs(docRect.left - parentRect.left)
    //ducument的高度加上滚动条的高度减去 父元素到document边界的的宽度，就是剩余可显示的高度
    parentAvailableHeight = docRect.height + docElement.scrollTop - Math.abs(docRect.top - parentRect.top)
  }

  if (x) {
    const width = popupRect.width
    const maxX = parentAvailableWidth - width
    x = getPerfectX({
      x, 
      maxX, 
      width,
      isPerfectX:isPerfect
    })
  }

  if (y) {
    const height = popupRect.height
    const maxY = parentAvailableHeight - height
    y = getPerfectY({
      y, 
      maxY, 
      height, 
      scrollTop: docElement.scrollTop, 
      isBody, 
      isPerfectY:isPerfect
    })
  }
  return {x, y}
}

export function hasScroll (ele: HTMLElement, isHorizontal = true) : boolean {
  return isHorizontal ? ele.scrollWidth > ele.clientWidth : ele.scrollHeight > ele.clientHeight
}

