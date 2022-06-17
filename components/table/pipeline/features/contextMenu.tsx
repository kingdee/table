import React, { useRef, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import cx from 'classnames'
import { ContextMenuStyleWrap } from '../../common-views'
import { copyDataToClipboard, executeOnTempElement, console, getEventPath, isElementInEventPath, getTargetEleInEventPath } from '../../utils'
import { findByTree } from '../../utils/others'
import { TablePipeline } from '../pipeline'
import { internals } from '../../internals'
import { Classes, MenuClasses } from '../../base/styles'

const stateKey = 'contextMenu'

interface ContextMenuItem {
  name: string
  action: () => {}
  disabled?: boolean
}

interface positionForMenuParams {
  offsetX?: number
  offsetY?: number
}

export interface ContextMenuFeatureOptions {
  /** 获得自定义菜单 */
  getContextMenuItems?: (params: any) => ContextMenuItem[],
  /** 弹出框的父容器 */
  popupParent?: HTMLElement
}

export function contextMenu (opts: ContextMenuFeatureOptions = {}) {
  return function step (pipeline: TablePipeline) {
    const popupParent = opts.popupParent || document.body
    const menuHelper = new MenuHelper()

    const addPopup = (menu) => {
      const ePopupDiv = document.createElement('div')
      ePopupDiv.setAttribute('class', 'kd-table-popup')
      popupParent.appendChild(ePopupDiv)

      let popupHidden = false
      const eventList = ['mousedown', 'contextmenu']

      const hidePopup = (event?: MouseEvent) => {
        if (
          isEventFromCurrentPopup(event, ePopupDiv) ||
          popupHidden
        ) {
          return
        }
        popupHidden = true
        popupParent.removeChild(ePopupDiv)
        eventList.forEach(eventType => {
          window.removeEventListener(eventType, hidePopup, true)
        })
      }

      ReactDOM.render(menu, ePopupDiv, () => {
        setTimeout(() => {
          eventList.forEach(eventType => {
            window.addEventListener(eventType, hidePopup, true)
          })
        }, 0)
      })

      return hidePopup
    }

    const onContextMenu = (e: React.MouseEvent<HTMLTableElement, MouseEvent>) => {
      if (suppressShowContextMenu(e)) {
        return
      }
      e.preventDefault()
      showContextMenu(e)
    }

    pipeline.addTableProps({ onContextMenu })

    const getContextMenuOptions = (record, column, value, event) => {
      const defaultMenuOptions = []
      if (column) {
        defaultMenuOptions.push(getCopyItem(value))
      }
      if (opts.getContextMenuItems) {
        const params = {
          record,
          column,
          value,
          event
        }
        return opts.getContextMenuItems(params)
      }
      return defaultMenuOptions
    }

    const hideContextMenu = () => {
      menuHelper.destroy()
    }

    const getPopupParent = () => popupParent

    const showContextMenu = (e: React.MouseEvent<HTMLTableElement, MouseEvent>) => {
      const path = getEventPath(e)
      const cellEle = getCellEleInEventPath(path)
      let code
      let rowIndex
      let isInFooter
      if (cellEle) {
        code = cellEle.getAttribute('data-code')
        rowIndex = cellEle.getAttribute('data-rowindex')
        isInFooter = isElementInsideTheFooter(cellEle)
      } else {
        const rowEle = getRowEleInEventPath(path)
        rowIndex = rowEle?.getAttribute('data-rowindex')
        isInFooter = isElementInsideTheFooter(rowEle)
      }

      const dataSource = isInFooter ? (pipeline.getFooterDataSource() || []) : pipeline.getDataSource()
      const record = dataSource[rowIndex]
      const column = code !== undefined && findByTree(pipeline.getColumns(), item => item.code === code)
      const value = column && record && internals.safeGetValue(column, record, rowIndex)

      const options = getContextMenuOptions(record, column, value, e)
      if (options.length === 0) {
        console.warn('context menu options is empty')
        return
      }
      const position = positionForMenu(e, popupParent)
      const menu = <Menu options={options} hideContextMenu={hideContextMenu} position={position} getPopupParent={getPopupParent} />
      const _hidePopup = addPopup(menu)
      menuHelper.init(_hidePopup)
    }

    return pipeline
  }
}

function getMenuItemKey ({ name, index }) {
  if (name) {
    let _key = 0
    name = name + ''
    for (let i = 0; i < name.length; i++) {
      _key += name.charCodeAt(name[i])
    }
    return `${_key}_${index}`
  }

  return index
}

function Menu (props) {
  const { options = [], hideContextMenu, position, getPopupParent } = props
  const menuRef = useRef<HTMLElement>()

  useEffect(() => {
    if (menuRef.current) {
      const popupParent = getPopupParent()
      const { x, y } = position
      const { x: _x, y: _y } = keepWithinBounds(popupParent, menuRef.current, x, y)

      menuRef.current.style.left = _x + 'px'
      menuRef.current.style.top = _y + 'px'
    }
  }, [position])

  return <ContextMenuStyleWrap className={MenuClasses.menu} ref={menuRef} style={{ left: position.x, top: position.y }}>
    <div className={MenuClasses.menuList}>
      {options.map((item, index) => <MenuItem key={item.key ? item.key : getMenuItemKey({ name: item.name, index })} name={item.name} action={item.action} disabled={item.disabled} hideContextMenu={hideContextMenu} />)}
    </div>
  </ContextMenuStyleWrap>
}

function MenuItem (props) {
  const { name, action, disabled, hideContextMenu } = props

  const itemRef = useRef()

  const handleClick = () => {
    if (disabled) {
      return
    }
    hideContextMenu()
    typeof action === 'function' && action()
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (disabled) {
      return
    }
    const itemDom = itemRef.current as HTMLElement
    if (itemDom) {
      itemDom.classList.add(MenuClasses.menuOptionActive)
    }
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (disabled) {
      return
    }
    const itemDom = itemRef.current as HTMLElement
    if (itemDom) {
      setTimeout(() => {
        itemDom.classList.remove(MenuClasses.menuOptionActive)
      }, 10)
    }
  }

  return <div className={cx(MenuClasses.menuOption, { [MenuClasses.menuOptionDisable]: disabled })} ref={itemRef} onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
    <span className={MenuClasses.menuOptionText}>{name}</span>
  </div>
}

class MenuHelper {
  hidePopup: () => void

  constructor () {
  }

  init = (hidePopup) => {
    this.hidePopup = hidePopup
  }

  destroy = () => {
    this.hidePopup && this.hidePopup()
    this.hidePopup = null
  }
}

/** 是否点击是外部 start */

function isEventFromCurrentPopup (event?: MouseEvent, ele?: HTMLElement) {
  if (!event || !ele) {
    return false
  }

  if (isElementInEventPath(ele, event)) {
    return true
  }

  return false
}

/** 是否点击是外部 end */

/** 计算位置 start */
function calculatePointerRelative (event: React.MouseEvent<HTMLTableElement, MouseEvent>, popupParent: HTMLElement) {
  const parentRect = popupParent.getBoundingClientRect()
  const documentRect = document.documentElement.getBoundingClientRect()

  return {
    x: event.clientX - (popupParent === document.body ? documentRect.left : parentRect.left),
    y: event.clientY - (popupParent === document.body ? documentRect.top : parentRect.top)
  }
}

function positionForMenu (event: React.MouseEvent<HTMLTableElement, MouseEvent>, popupParent: HTMLElement, params?: positionForMenuParams) {
  let { x, y } = calculatePointerRelative(event, popupParent)
  if (params) {
    const { offsetX, offsetY } = params
    if (offsetX) {
      x -= offsetX
    }
    if (offsetY) {
      y -= offsetY
    }
  }
  return { x, y }
}

function keepWithinBounds (popupParent: HTMLElement, ePopup: HTMLElement, x: number, y: number) {
  const parentRect = popupParent.getBoundingClientRect()
  const docElement = document.documentElement
  const documentRect = docElement.getBoundingClientRect()
  const ePopupRect = ePopup.getBoundingClientRect()
  let parentWidth = parentRect.width
  let parentHeight = parentRect.height
  if (popupParent === document.body) {
    parentWidth = documentRect.width
    parentWidth -= Math.abs(documentRect.left - parentRect.left)
    parentHeight = documentRect.height + docElement.scrollTop
    parentHeight -= Math.abs(documentRect.top - parentRect.top)
  }
  if (x) {
    const minWidth = Math.min(ePopupRect.width, 120)
    ePopup.style.minWidth = minWidth + 'px'
    const maxX = parentWidth - minWidth
    x = Math.min(Math.max(x, 0), Math.abs(maxX)) // 目前位置，最大支持的位置
  }

  if (y) {
    const minHeight = Math.min(ePopupRect.height, 180)
    const maxY = parentHeight - minHeight
    y = Math.min(Math.max(y, 0), Math.abs(maxY)) // 目前位置，最大支持的位置
  }

  return { x, y }
}

/** 计算位置 end */

/** 获得点击的元素 start */

function getCellEleInEventPath (path: Array<HTMLElement>) {
  return getTargetEleInEventPath(path, ele => ele && ele.getAttribute('data-role') === 'table-cell')
}

function getRowEleInEventPath (path: Array<HTMLElement>) {
  return getTargetEleInEventPath(path, ele => ele && ele.getAttribute('data-role') === 'table-row')
}

/** 获得点击的元素 end */

function isElementInsideTheFooter (ele: HTMLElement): boolean {
  let pointer = ele
  while (pointer) {
    if (pointer.tagName === 'TFOOT') {
      return true
    }
    if (pointer.tagName === 'TABLE' || pointer.tagName === 'TBODY') {
      return false
    }
    pointer = pointer.parentElement
  }
  return false
}

// 禁止弹出右键菜单
function suppressShowContextMenu (e: React.MouseEvent<HTMLTableElement, MouseEvent>) {
  const path = getEventPath(e.nativeEvent)
  let pointIndex = 0
  while (pointIndex < path.length) {
    const ele = path[pointIndex]
    if (ele.classList.contains(Classes.tableBody) || ele.classList.contains(Classes.tableFooter)) {
      return false
    }
    pointIndex++
  }
  return true
}

// 默认选项
function getCopyItem (v) {
  return {
    name: '复制',
    action: () => {
      executeOnTempElement(copyDataToClipboard(v))
    }
  }
}
