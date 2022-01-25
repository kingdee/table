import React, { useEffect, useState, useCallback, useRef, cloneElement } from 'react'
import ReactDOM from 'react-dom'
import { tuple } from '../_utils/type'
import debounce from 'lodash/debounce'
import classNames from 'classnames'
import devWarning from '../_utils/devwarning'
import { useResizeObserver } from '../_utils/hooks'

export const Placements = tuple(
  'top',
  'left',
  'right',
  'bottom',
  'topLeft',
  'topRight',
  'bottomLeft',
  'bottomRight',
  'leftTop',
  'leftBottom',
  'rightTop',
  'rightBottom',
)
export type PlacementType = typeof Placements[number]

export const Triggers = tuple('hover', 'focus', 'click', 'contextMenu')

export type TriggerType = typeof Triggers[number]

type Position = {
  x: number
  y: number
  top: number
  left: number
  right: number
  bottom: number
  height: number
  width: number
}

type Align = {
  top: number
  left: number
}

type NormalProps = {
  [key: string]: any
}

export interface PopperProps {
  gap?: number
  arrow?: boolean
  visible?: boolean
  prefixCls?: string
  arrowSize?: number
  disabled?: boolean
  arrowOffset?: number
  scrollHidden?: boolean
  mouseEnterDelay?: number
  mouseLeaveDelay?: number
  defaultVisible?: boolean
  popperClassName?: string
  placement?: PlacementType
  locatorClassName?: string
  popperStyle?: React.CSSProperties
  trigger?: TriggerType | Array<TriggerType>
  onTrigger?: (trigger: TriggerType) => void
  onVisibleChange?: (visible: boolean) => void
  getTriggerElement?: (locatorNode: HTMLElement) => HTMLElement
  getPopupContainer?: (locatorNode: HTMLElement) => HTMLElement
}

const getOffsetPos: (el: Element) => { top: number; left: number } = (el: HTMLElement) => {
  const elPos = { top: el.offsetTop, left: el.offsetLeft }
  if (el.offsetParent) {
    const parentPos = getOffsetPos(el.offsetParent)
    elPos.top += parentPos.top
    elPos.left += parentPos.left
  }
  return elPos
}

const getScrollDist: (el: Element) => { top: number; left: number } = (el: HTMLElement) => {
  const elScroll = { top: el.scrollTop, left: el.scrollLeft }
  if (el.parentElement && el.parentElement !== document.body) {
    const parentScroll = getScrollDist(el.parentElement)
    elScroll.top += parentScroll.top
    elScroll.left += parentScroll.left
  }
  return elScroll
}

function usePopper(locatorElement: React.ReactElement, popperElement: React.ReactElement, props: PopperProps) {
  const {
    prefixCls,
    onTrigger,
    popperStyle,
    arrow = false,
    onVisibleChange,
    popperClassName,
    arrowOffset = 12,
    arrowSize = 4.25,
    locatorClassName,
    disabled = false,
    trigger = 'click',
    placement = 'top',
    gap: defalutGap = 4,
    scrollHidden = false,
    mouseEnterDelay = 0.1,
    mouseLeaveDelay = 0.1,
    defaultVisible = false,
    getTriggerElement = (locatorNode) => locatorNode,
    getPopupContainer = () => document.body,
  } = props

  const arrowWidth = Math.sqrt(2 * Math.pow(arrowSize, 2))

  const componentName = prefixCls?.split('-')[1] || ''

  devWarning(
    Placements.indexOf(placement) === -1,
    componentName,
    `cannot found ${componentName} placement '${placement}'`,
  )

  const isWrongTrigger = Array.isArray(trigger)
    ? trigger.some((v) => !Triggers.includes(v))
    : Triggers.indexOf(trigger) === -1
  devWarning(isWrongTrigger, componentName, `cannot found ${componentName} trigger '${trigger}'`)

  const locatorEl = useRef<HTMLElement>()
  const popperEl = useRef<HTMLElement>()
  const locatorRef = (locatorElement as any).ref || locatorEl
  const popperRef = (popperElement as any).ref || popperEl

  const container = getPopupContainer(locatorRef.current)

  Promise.resolve().then(() => {
    const triggerNode = getTriggerElement(locatorRef.current)
    const container = getPopupContainer(locatorRef.current)
    devWarning(
      !triggerNode,
      componentName,
      'getTriggerElement() must return a HTMLElement, but now it does not return anything',
    )
    devWarning(
      !container,
      componentName,
      'getPopupContainer() must return a HTMLElement, but now it does not return anything',
    )
  })

  const initPos = { top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0, height: 0, width: 0 }

  const initAlign = { top: 0, left: 0 }

  const gap = defalutGap + (arrow ? 10 : 0)

  const [mousePos, setMousePos] = useState<Position>(initPos)
  const [arrowPos, setArrowPos] = useState<Align>(initAlign)

  const [exist, setExist] = useState(!!props.visible || defaultVisible)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(!!props.visible)
  }, [props.visible])

  const [evType, setEvType] = useState<string>('')
  const [canAlign, setCanAlign] = useState(!!props.visible || defaultVisible)
  const [align, setAlign] = useState<Align>(initAlign)

  const [currentPlacement, setCurrentPlacement] = useState<string>(placement)

  const alignPopper = useCallback(() => {
    if (locatorRef?.current && popperRef?.current && evType) {
      const { width: popperWidth, height: popperHeight } = popperRef.current.getBoundingClientRect()
      const { top, bottom, left, right, height, width } = locatorRef.current.getBoundingClientRect()

      const { top: containerTop, left: containerLeft } = getOffsetPos(container)
      const { top: locatorTop, left: locatorLeft } = getOffsetPos(locatorRef.current)
      const { top: scrollTop, left: scrollLeft } = getScrollDist(locatorRef.current)

      const locatorPos = {
        width,
        height,
        y: locatorTop - containerTop - scrollTop,
        x: locatorLeft - containerLeft - scrollLeft,
        top: locatorTop - containerTop - scrollTop,
        left: locatorLeft - containerLeft - scrollLeft,
        right: locatorLeft + width - containerLeft - scrollLeft,
        bottom: locatorTop + height - containerTop - scrollTop,
      }

      const currentPos = evType === 'contextmenu' ? mousePos : locatorPos

      let currentPlacement: string = placement

      if (top - gap - popperHeight < 0) {
        currentPlacement = currentPlacement.replace('top', 'bottom')
      }
      if (bottom + gap + popperHeight > document.body.clientHeight) {
        currentPlacement = currentPlacement.replace('bottom', 'top')
      }
      if (left + popperWidth > document.body.clientWidth) {
        currentPlacement = currentPlacement.replace('Left', 'Right')
      }
      if (right - popperWidth < 0) {
        currentPlacement = currentPlacement.replace('Right', 'Left')
      }
      if (top + popperHeight > document.body.clientHeight) {
        currentPlacement = currentPlacement.replace('Top', 'Bottom')
      }
      if (bottom - popperHeight < 0) {
        currentPlacement = currentPlacement.replace('Bottom', 'Top')
      }
      if (left - gap - popperWidth < 0) {
        currentPlacement = currentPlacement.replace('left', 'right')
      }
      if (right + gap + popperWidth > document.body.clientWidth) {
        currentPlacement = currentPlacement.replace('right', 'left')
      }

      const leftLeft = currentPos.left - popperWidth - gap
      const topTop = currentPos.top - gap - popperHeight
      const bottomTop = currentPos.top + currentPos.height + gap
      const rightLeft = currentPos.left + currentPos.width - popperWidth
      const centerLeft = currentPos.left + (currentPos.width - popperWidth) / 2
      const centerTop = currentPos.top - (popperHeight - currentPos.height) / 2
      const topBottom = currentPos.bottom - popperHeight
      const leftRight = currentPos.right + gap

      const mapAlign: { [key: string]: Align } = {
        topLeft: { left: currentPos.left, top: topTop },
        top: { left: centerLeft, top: topTop },
        topRight: { left: rightLeft, top: topTop },
        bottomLeft: { left: currentPos.left, top: bottomTop },
        bottom: { left: centerLeft, top: bottomTop },
        bottomRight: { left: rightLeft, top: bottomTop },
        leftTop: { left: leftLeft, top: currentPos.top },
        left: { left: leftLeft, top: centerTop },
        leftBottom: { left: leftLeft, top: topBottom },
        rightTop: { left: leftRight, top: currentPos.top },
        right: { left: leftRight, top: centerTop },
        rightBottom: { left: leftRight, top: topBottom },
      }

      const alignPos = mapAlign[currentPlacement]
      const arrowPos = { top: 0, left: 0 }

      if (/left/.test(currentPlacement) || /right/.test(currentPlacement)) {
        if (/Top/.test(currentPlacement)) {
          arrowPos.top = arrowOffset
        } else if (/Bottom/.test(currentPlacement)) {
          arrowPos.top = popperHeight - arrowOffset - 2 * arrowSize
        } else {
          arrowPos.top = (popperHeight - arrowWidth) / 2
        }

        if (top <= 0) {
          alignPos.top = locatorPos.top
          arrowPos.top = arrowOffset
        } else if (bottom - height / 4 >= document.body.clientHeight) {
          alignPos.top = locatorPos.bottom - popperHeight
          arrowPos.top = popperHeight - arrowOffset - 2 * arrowSize
        } else {
          const scrollTop = alignPos.top - window.pageYOffset
          const scrollBottom = alignPos.top + popperHeight - 5 - window.pageYOffset
          if (scrollTop < 0) {
            alignPos.top -= scrollTop
            arrowPos.top += scrollTop
          }
          if (scrollBottom > document.body.clientHeight) {
            alignPos.top += document.body.clientHeight - scrollBottom
            arrowPos.top += scrollBottom - document.body.clientHeight
          }
        }
      }

      if (/top/.test(currentPlacement) || /bottom/.test(currentPlacement)) {
        if (/Left/.test(currentPlacement)) {
          arrowPos.left = arrowOffset
        } else if (/Right/.test(currentPlacement)) {
          arrowPos.left = popperWidth - arrowOffset - 2 * arrowSize
        } else {
          arrowPos.left = (popperWidth - arrowWidth) / 2
        }
      }

      setAlign(alignPos)
      setArrowPos(arrowPos)
      setCurrentPlacement(currentPlacement)
    }
  }, [locatorRef, popperRef, container, evType, mousePos, placement, gap, arrowOffset, arrowSize, arrowWidth])

  useEffect(() => {
    if (canAlign) {
      alignPopper()
      setCanAlign(false)
      props.visible === undefined && setVisible(true)
      onVisibleChange && onVisibleChange(true)
    }
  }, [alignPopper, canAlign, onVisibleChange, props])

  const arrowStyle = {
    '--arrowSize': arrowSize + 'px',
    '--arrowTop': arrowPos.top + 'px',
    '--arrowLeft': arrowPos.left + 'px',
    '--arrowOffset': arrowSize / -1.2 + 'px',
  }

  const popperContainerStyle = {
    position: 'absolute',
    ...popperStyle,
    ...align,
    ...(arrow ? arrowStyle : {}),
  }

  const locatorProps: NormalProps = {
    disabled,
    ref: locatorRef,
    style: locatorElement.props.style,
    className: classNames(locatorClassName, locatorElement.props.className),
  }

  const popperProps: NormalProps = {
    ref: popperRef,
    style: popperContainerStyle,
    className: classNames(prefixCls, popperClassName, currentPlacement, {
      arrow,
      hidden: !visible,
      [`${currentPlacement}-active`]: visible,
    }),
  }

  const popperNode = popperRef.current
  const locatorNode = locatorRef.current
  useResizeObserver(popperNode, alignPopper)
  useResizeObserver(locatorNode, alignPopper)

  useEffect(() => {
    if (exist && visible) {
      let mouseleaveTimer: number
      const handleHidePopper = (e: MouseEvent) => {
        mouseleaveTimer && clearTimeout(mouseleaveTimer)
        const triggerNode = getTriggerElement(locatorRef.current)
        const triggerRect = triggerNode.getBoundingClientRect()
        const popperRect = popperRef.current.getBoundingClientRect()
        const left = /left/.test(currentPlacement) ? popperRect.right : triggerRect.left
        const right = /right/.test(currentPlacement) ? popperRect.left : triggerRect.right
        const top = /top/.test(currentPlacement) ? popperRect.bottom : triggerRect.top
        const bottom = /bottom/.test(currentPlacement) ? popperRect.top : triggerRect.bottom
        const { clientX: X, clientY: Y } = e
        const inTriggerRect = X > left - 2 && X < right + 2 && Y > top - 2 && Y < bottom + 2
        const inPopperRect = X > popperRect.left && X < popperRect.right && Y > popperRect.top && Y < popperRect.bottom
        const ableArea = evType === 'click' || evType === 'contextmenu' ? inPopperRect : inTriggerRect || inPopperRect

        const hidePopper = () => {
          setEvType('')
          props.visible === undefined && setVisible(false)
          onVisibleChange && onVisibleChange(false)
        }

        if (ableArea) {
          evType === 'focus' && triggerNode.focus()
        } else {
          evType === 'mouseenter'
            ? (mouseleaveTimer = window.setTimeout(hidePopper, mouseLeaveDelay * 1000))
            : hidePopper()
        }
      }

      const debounceHidePopper = debounce(handleHidePopper, 10)

      if (evType === 'mouseenter') {
        document.addEventListener('mousemove', debounceHidePopper)
      } else {
        document.addEventListener('click', handleHidePopper)
      }

      return () => {
        if (evType === 'mouseenter') {
          document.removeEventListener('mousemove', debounceHidePopper)
        } else {
          document.removeEventListener('click', handleHidePopper)
        }
      }
    }
  }, [
    props,
    exist,
    evType,
    trigger,
    visible,
    popperRef,
    locatorRef,
    mouseLeaveDelay,
    onVisibleChange,
    currentPlacement,
    getTriggerElement,
  ])

  useEffect(() => {
    if (visible) {
      const scrollAlign = debounce(() => {
        if (scrollHidden) {
          props.visible === undefined && setVisible(false)
          onVisibleChange && onVisibleChange(false)
        }
        alignPopper()
      }, 10)
      window.addEventListener('resize', alignPopper)
      document.addEventListener('scroll', scrollAlign, true)

      locatorNode?.addEventListener('DOMSubtreeModified', alignPopper)
      exist && popperNode?.addEventListener('DOMSubtreeModified', alignPopper)

      return () => {
        window.removeEventListener('resize', alignPopper)
        document.removeEventListener('scroll', scrollAlign, true)

        locatorNode?.removeEventListener('DOMSubtreeModified', alignPopper)
        exist && popperNode?.removeEventListener('DOMSubtreeModified', alignPopper)
      }
    }
  }, [alignPopper, exist, onVisibleChange, popperNode, props.visible, scrollHidden, locatorNode, visible])

  React.useEffect(() => {
    const triggerNode = getTriggerElement(locatorRef.current)
    if (triggerNode) {
      let mouseenterTimer: number
      const clearMouseLeave = () => clearTimeout(mouseenterTimer)
      const addAction = (action: string) => {
        if (action === 'hover') {
          triggerNode.addEventListener('mouseenter', handleShowPopper)
          triggerNode.addEventListener('mouseleave', clearMouseLeave)
        } else {
          triggerNode.addEventListener(action.toLowerCase(), handleShowPopper)
        }
      }
      const removeAction = (action: string) => {
        if (action === 'hover') {
          triggerNode.removeEventListener('mouseenter', handleShowPopper)
          triggerNode.removeEventListener('mouseleave', clearMouseLeave)
        } else {
          triggerNode.removeEventListener(action.toLowerCase(), handleShowPopper)
        }
      }
      const handleShowPopper = (e: MouseEvent) => {
        e.preventDefault()
        const evType = e.type
        if (evType === 'contextmenu') {
          const currentMousePos = {
            ...mousePos,
            ...{ x: e.pageX, y: e.pageY, left: e.pageX, top: e.pageY, right: e.pageX, bottom: e.pageY },
          }
          setMousePos(currentMousePos)
        }
        const showPopper = (evType: string) => {
          if (!disabled) {
            !exist && setExist(true)
            setEvType(evType)
            if (onTrigger) {
              const mapTrigger: NormalProps = {
                mouseenter: 'hover',
                click: 'click',
                focus: 'focus',
                contextmenu: 'contextMenu',
              }
              onTrigger(mapTrigger[evType])
            }
            if (!visible || evType === 'contextmenu') {
              setCanAlign(true)
            }
          }
        }
        if (evType === 'mouseenter') {
          mouseenterTimer = window.setTimeout(() => showPopper(evType), mouseEnterDelay * 1000)
        } else {
          showPopper(evType)
        }
      }

      Array.isArray(trigger) ? trigger.forEach((action: string) => addAction(action)) : addAction(trigger as string)

      return () => {
        Array.isArray(trigger)
          ? trigger.forEach((action: string) => removeAction(action))
          : removeAction(trigger as string)
      }
    }
  }, [disabled, exist, getTriggerElement, locatorRef, mouseEnterDelay, mousePos, onTrigger, trigger, visible])

  const Locate = cloneElement(locatorElement, locatorProps)

  const Popper = <div {...popperProps}>{popperElement}</div>

  return (
    <>
      {Locate}
      {exist && container && ReactDOM.createPortal(Popper, container)}
    </>
  )
}

export default usePopper
