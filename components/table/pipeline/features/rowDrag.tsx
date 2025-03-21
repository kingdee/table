import React from 'react'
import ReactDOM from 'react-dom'
import { fromEvent } from 'rxjs'
import { map, takeUntil, filter } from 'rxjs/operators'

import { TablePipeline } from '../pipeline'
import { ArtColumn, CellProps, RowDragEvent, DragEvent, RowDropZoneParams } from '../../interfaces'
import cx from 'classnames'
import { Classes } from '../../base/styles'
import { FeatureName } from '../const'
import { internals } from '../../internals'

export interface RowDragFeatureOptions {
  /** 拖拽开始事件 */
  onDragStart?:(event:RowDragEvent) => void,

  /** 拖拽移动事件 */
  onDragMove?:(event:RowDragEvent) => void,

  /** 拖拽结束事件 */
  onDragEnd?:(event:RowDragEvent) => void,

  /** 拖拽离开事件 */
  onDragLeave?:(event:RowDragEvent) => void,

  /** 拖拽进入事件 */
  onDragEnter?:(event:RowDragEvent) => void,

  /** 判断一行是否要禁用拖拽 */
  isDisabled?:(row: any, rowIndex: number) => boolean,

  /** 拖拽时显示的文本 */
  rowDragText:(row:any, rowIndex: number) => string,

  /** 拖拽列定义 */
  rowDragColumn?: ArtColumn,

  /** 拖拽过程中是否禁止滚动条滚动 */
  suppressScrollMove?:boolean,

  /** 树型表格是否允许拖拽插入行 */
  allowDragIntoRow?: boolean,

  /** 公共参数，作为拖拽回调参数，可在此提供业务层取数接口 */
  commonParams?:any



}

export const ROW_DRAG_COLUMN_CODE = '$_row_drag_column_&'
export const rowDragKey = 'rowDragKey'
export const rowDragOptionsKey  = 'rowDragOptions'
const SCROLL_OFFSET = 30
const SCROLL_START_OFFSET = 20

const defaultRowDragColumn: ArtColumn = {
  name: '拖拽列',
  code: ROW_DRAG_COLUMN_CODE,
  lock: true,
  title: '',
  width: 40,
  align: 'center',
  getCellProps (value: any, row: any, rowIndex: number) : CellProps {
    return {
      className: cx(Classes.rowDragCell)
    }
  },
  render (value: any, row: any, rowIndex: number) {
    return (
      <svg
        viewBox='0 0 1024 1024'
        version='1.1'
        xmlns='http://www.w3.org/1999/xlink'
        data-icon='drag'
        width='16'
        height='16'
      >
        <path d='M298.688 192a64 64 0 1 0 128 0 64 64 0 0 0-128 0z m298.624 0a64 64 0 1 0 128 0 64 64 0 0 0-128 0zM298.688 512a64 64 0 1 0 128 0 64 64 0 0 0-128 0z m298.624 0a64 64 0 1 0 128 0 64 64 0 0 0-128 0z m-298.624 320a64 64 0 1 0 128 0 64 64 0 0 0-128 0z m298.624 0a64 64 0 1 0 128 0 64 64 0 0 0-128 0z' p-id='4278' />
      </svg>
    )
  }
}

export function rowDrag (opt:RowDragFeatureOptions) {
  return function rowDragStep (pipeline:TablePipeline) {
    const tableBody = pipeline.ref.current.domHelper && pipeline.ref.current.domHelper.tableBody
    const artTable = pipeline.ref.current.domHelper && pipeline.ref.current.domHelper.artTable
    const rowDragApi = pipeline.addFeatureApi(FeatureName.rowDrag)
    pipeline.setFeatureOptions(rowDragOptionsKey, opt)

    if (!tableBody) return pipeline

    const dataSource = pipeline.getDataSource()

    const getRowDragEvent = (dropTargetEvent, isFinished): RowDragEvent => {
      const { dragItem, x, y, dropZoneTarget, startDropZoneTagret, commonParams, startCommonParams, event, dropZoneTableParams } = dropTargetEvent
      const { getDataSource, getTreeModeOptions, getRowDragOptions } = dropZoneTableParams
      const dataSource = getDataSource()
      const treeModeOptions = getTreeModeOptions()
      const rowDragOptions = getRowDragOptions()

      const allowDragIntoRow = !!treeModeOptions && rowDragOptions?.allowDragIntoRow
      
      const isLeave = !isMouseOnDropTarget(event, dropZoneTarget)

      let overIndex = -1
      let direction = 'bottom'

      if (!isLeave && dataSource.length > 0) {
        const overDragItem = getDragRowItem(event.target, dropZoneTarget, dataSource)

        if (overDragItem) {
          const { rowIndex, cell } = overDragItem
          overIndex = rowIndex
          direction = getDirection(cell, event.clientY, allowDragIntoRow)
        }
      }

      if(overIndex === -1 && dataSource.length > 0 && dropZoneTarget.contains(event.target) ){
        overIndex = dataSource.length -1
        direction = 'bottom'
      }
      const overRow = overIndex >= 0 ? dataSource[overIndex] : null

      return {
        startRowIndex: dragItem.rowIndex,
        startRow: dragItem.row,
        endRowIndex: overIndex,
        endRow: overRow,
        startDropZoneTagret,
        startCommonParams,
        commonParams, 
        dropZoneTarget,
        event,
        dragPosition: direction,
        isFinished,
        x,
        y
      }
    }

    const onDragging = (event: DragEvent) => {
      const rowDragEvent = getRowDragEvent(event, false)
      opt?.onDragMove?.(rowDragEvent)
      pipeline.setStateAtKey(rowDragKey, rowDragEvent)
    }

    const onDragStop = (event: DragEvent) => {
      const rowDragEvent = getRowDragEvent(event, true)
      
      pipeline.setStateAtKey(rowDragKey, rowDragEvent)
      opt?.onDragEnd?.(rowDragEvent)
    }

    const onDragStart = (event: DragEvent) => {
      const rowDragEvent = getRowDragEvent(event, false)
      opt?.onDragStart?.(rowDragEvent)
    }

    const onDragLeave = (event: DragEvent) => {
      const rowDragEvent = getRowDragEvent(event, false)
      pipeline.setStateAtKey(rowDragKey, rowDragEvent)
      opt?.onDragLeave?.(rowDragEvent)
    }

    const onDragEnter = (event: DragEvent) => {
      const rowDragEvent = getRowDragEvent(event, false)
      pipeline.setStateAtKey(rowDragKey, rowDragEvent)
      opt?.onDragEnter?.(rowDragEvent)
    }

    const currentDropZone: RowDropZoneParams = {
      getContainer: () => {
        const lastPipeline = pipeline.getLastPipeline()
        return lastPipeline.ref.current.domHelper.tableBody
      },
      onDragEnter: onDragEnter,
      onDragLeave: onDragLeave,
      onDragging: onDragging,
      onDragStop: onDragStop,
      isTable: true,
      tableParams: {
        getDataSource: () => {
          const lastPipeline = pipeline.getLastPipeline()
          return lastPipeline.getDataSource()
        },
        getTreeModeOptions: () => {
          const lastPipeline = pipeline.getLastPipeline()
          return lastPipeline.getFeatureOptions('treeModeOptions')
        },
        getRowDragOptions:()=>{
          const lastPipeline = pipeline.getLastPipeline()
          return lastPipeline.getFeatureOptions('rowDragOptions')
        }
      }
    }

    const onMouseDown = (event: React.MouseEvent<HTMLTableElement, MouseEvent>) => {
      const mouseDownEvent = event.nativeEvent
      const startDataItem = getDragRowItem(mouseDownEvent.target, tableBody, dataSource)
      if (!startDataItem || startDataItem.code !== rowDragColumn.code) return

      if (opt?.isDisabled?.(startDataItem.row, startDataItem.rowIndex)) return

      let isValidDrag = false
      let isDragging = false
      let dragElement = null
      let dragLine = null
      let lastDropTarget = null
      let timeoutId = null
      let intervalId = null
      let expandRowTimeoutId = null
      let expandRowCallBackList = []

      const updateScrollPosition = (tableBody:Element, mouseMoveEvent: MouseEvent) => {
        if (opt?.suppressScrollMove) return

        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        if (intervalId) {
          clearInterval(intervalId)
        }

        if(!tableBody) return 

        const moveOffset = getScrollMoveOffset(tableBody, mouseMoveEvent)
        if (moveOffset === 0) {
          return
        }

        timeoutId = setTimeout(() => {
          intervalId = setInterval(() => {
            tableBody.scrollTop += moveOffset
          }, 50)
        }, 500)
      }

      const handleDragStart = (mouseDownEvent: MouseEvent) => {
        dragElement = createDragElement(mouseDownEvent, tableBody) // 创建拖拽悬浮框
        const isTreeTable = !!pipeline.getFeatureOptions('treeModeOptions')
        dragLine = createDragLine(isTreeTable) // 创建拖拽插入指示线
        const dragText = opt?.rowDragText ? opt?.rowDragText?.(startDataItem.row, startDataItem.rowIndex) : `第${startDataItem.rowIndex}行内容`
        setDragText(dragElement, dragText) // 设置悬浮框显示文本
        artTable.classList.add(cx(Classes.rowDragging))
        rowDragApi.setDragStatus('start')

        const dragEvent = createDropTargetEvent(currentDropZone, mouseDownEvent, startDataItem, currentDropZone)
        onDragStart(dragEvent)
      }

      const handleDragMove = (mouseMoveEvent: MouseEvent) => {
        const isRTL = pipeline.ctx.direction === 'rtl'
        positionDragElemment(dragElement, mouseMoveEvent, isRTL) // 更新拖拽悬浮框位置
        rowDragApi.setDragStatus('dragging')
        setDragElementIcon(dragElement, 'move')

        const rowDropZones = rowDragApi.getRowDropZone()
        const validDropZones = rowDropZones.concat(currentDropZone) // 可放置区域加上自身
        const dropTarget = validDropZones.find(zone => isMouseOnDropTarget(mouseMoveEvent, zone.getContainer())) || null

        updateScrollPosition(dropTarget?.getContainer(), mouseMoveEvent) // 拖拽到底时让滚动条可以滚动

        if (dropTarget !== lastDropTarget) {
          // 拖拽离开表格
          if (lastDropTarget !== null && dropTarget === null) {
            if (lastDropTarget.onDragLeave) {
              setDragElementIcon(dragElement, 'notAllowed')
              hiddenDragLine(dragLine)
              lastDropTarget.getContainer().classList.remove(Classes.rowDragNoData)
              const dragEvent = createDropTargetEvent(lastDropTarget, mouseMoveEvent, startDataItem, currentDropZone)
              lastDropTarget.onDragLeave(dragEvent)
            }
          }

          // 拖拽进入表格
          if (lastDropTarget === null && dropTarget !== null) {
            if (dropTarget.onDragEnter) {
              setDragElementIcon(dragElement, 'move')
              if (dropTarget.isTable) {
                showDragLine(dragLine)

                const { getTreeModeOptions } = dropTarget.tableParams
                const treeModeOptions = getTreeModeOptions()
                const isTreeTable = !!treeModeOptions
                // 判断拖拽进入的表格是否是树形表格，控制指示线样式
                if(isTreeTable){
                  dragLine.classList.add(Classes.treeTableRowDragLine)
                }else {
                  dragLine.classList.remove(Classes.treeTableRowDragLine)
                }
                
              }
              const dragEvent = createDropTargetEvent(dropTarget, mouseMoveEvent, startDataItem, currentDropZone)
              dropTarget.onDragEnter(dragEvent)
            }
          }

          lastDropTarget = dropTarget
        }
        if (dropTarget) {
          // 拖拽区域在表格中，更新拖拽插入指示线位置
          if (dropTarget.isTable) {
            positionDragLine({
              lineElement: dragLine,
              dragZone: dropTarget,
              event: mouseMoveEvent,
              isRTL
            })
            
          }

          // 树形表格悬停1s展开对应行节点
          if(dropTarget?.tableParams?.getTreeModeOptions()){
            if (expandRowTimeoutId) {
              clearTimeout(expandRowTimeoutId)
            }

            expandRowTimeoutId = setTimeout(() => {
              const treeModeOptions = dropTarget.tableParams.getTreeModeOptions()
              const { treeMetaKey, onExpand, isExpanded, onCollapse } = treeModeOptions
              // 鼠标悬停所在的拖拽行信息
              const dataSource = dropTarget.tableParams.getDataSource()
              const dragItem = getDragRowItem(mouseMoveEvent.target, dropTarget.getContainer(), dataSource)

              if (!dragItem) return

              const { row } = dragItem
              const { rowKey, isLeaf } = row[treeMetaKey]

              if(!isLeaf && !isExpanded(rowKey)){
                onExpand(rowKey)
                expandRowCallBackList.push(()=>onCollapse(rowKey))
              }
              
            }, 1000)
            

          }

          if (dropTarget.onDragging) {
            const dragEvent = createDropTargetEvent(dropTarget, mouseMoveEvent, startDataItem, currentDropZone)
            dropTarget.onDragging(dragEvent)
          }
        }
      }

      const handleDragStop = (mouseUpEvent: MouseEvent) => {
        if(!isValidDrag){
          return
        }
        removeElement(dragElement)
        removeElement(dragLine)
        artTable.classList.remove(cx(Classes.rowDragging))
        rowDragApi.setDragStatus('finished')
        clearTimeout(timeoutId)
        clearInterval(intervalId)
        clearTimeout(expandRowTimeoutId)

        const rowDropZones = rowDragApi.getRowDropZone()
        rowDropZones.forEach(dropzone=>{
          const container = dropzone.getContainer()
          container && container.classList.remove(Classes.rowDragNoData)
        })


        const validDropZones = rowDropZones.concat(currentDropZone)
        const dropTarget = validDropZones.find(zone => isMouseOnDropTarget(mouseUpEvent, zone.getContainer()))

        if (dropTarget && dropTarget.onDragStop) {
          const dragEvent = createDropTargetEvent(dropTarget, mouseUpEvent, startDataItem, currentDropZone)
          dropTarget.onDragStop(dragEvent)
        }

        while(expandRowCallBackList.length > 0) {
          const callback = expandRowCallBackList.pop()
          callback()
        }
      }

      const mousemove$ = fromEvent<MouseEvent>(window, 'mousemove')
      const mouseup$ = fromEvent<MouseEvent>(window, 'mouseup')

      const rowDragMove$ = mousemove$.pipe(
        filter((mouseMoveEvent: MouseEvent) => {
          const mouseMoveClientY = mouseMoveEvent.clientY
          const mouseDownClientY = mouseDownEvent.clientY
          // 上下移动偏移量大于5才是有效的拖拽
          if (Math.abs(mouseMoveClientY - mouseDownClientY) > 5) {
            isValidDrag = true
          }

          return isValidDrag
        }),
        map((mouseMoveEvent: MouseEvent) => {
          if (!isDragging) {
            isDragging = true
            handleDragStart(mouseDownEvent)
            handleDragMove(mouseDownEvent)
          }

          handleDragMove(mouseMoveEvent)
        }),
        takeUntil(mouseup$)
      )

      rowDragMove$.subscribe()

      const rowDragEnd$ = mouseup$.pipe(
        map((mouseUpEvent: MouseEvent) => {
          handleDragStop(mouseUpEvent)
        })
      ).subscribe({
        next: () => {
          rowDragEnd$.unsubscribe()
        }
      })
    }

    const rowDragColumn = opt?.rowDragColumn || defaultRowDragColumn
    pipeline.setFeatureOptions('rowDragColumnKey', rowDragColumn.code)

    rowDragApi.setRowDropZoneParams(currentDropZone)

    const nextColumns = pipeline.getColumns().slice()
    nextColumns.unshift(rowDragColumn)
    pipeline.columns(nextColumns)

    pipeline.addTableProps({ onMouseDown })
    pipeline.appendRowPropsGetter((row, rowIndex) => {
      const rowDragEvent = pipeline.getStateAtKey(rowDragKey) || {}
      const dragStatus = rowDragApi.getDragStatus()

      const { startRowIndex, endRowIndex, endRow, isFinished, dragPosition } = rowDragEvent

      const isFooterCell = row[pipeline.getFeatureOptions('footerRowMetaKey')]
      const treeModeOptions = pipeline.getFeatureOptions('treeModeOptions')
      const isTreeTable = !!treeModeOptions

      if (isFooterCell || isFinished || (!isTreeTable && rowIndex !== startRowIndex && rowIndex !== endRowIndex)) return

      let parentRowKeyIndex = -1
      if (isTreeTable && endRow) {
        const { treeMetaKey } = treeModeOptions
        const { parentRowKey } = endRow[treeMetaKey]
        const primaryKey = pipeline.ensurePrimaryKey('rowDrag')
        parentRowKeyIndex = pipeline.getDataSource().findIndex(row => internals.safeGetRowKey(primaryKey, row, -1) === parentRowKey)
      }

      const className = cx({
        [Classes.rowDragStart]: rowIndex === startRowIndex && dragStatus !== 'finished',
        [Classes.rowDragEnd]: rowIndex === endRowIndex,
        [Classes.rowDragEndParent]: isTreeTable && rowIndex === parentRowKeyIndex && dragPosition !== 'into' ,
        [Classes.rowDragEndInto]: rowIndex === endRowIndex && dragPosition === 'into',
        [Classes.rowDragEndToTop]: rowIndex === endRowIndex && dragPosition === 'top',
        [Classes.rowDragEndToBottom]: rowIndex === endRowIndex && dragPosition === 'bottom'
      })

      return { className }
    })

    return pipeline
  }
}

function getDragRowItem (target, tableBody, record) {
  while (target && tableBody.contains(target)) {
    if (target.getAttribute('data-role') === 'table-cell') {
      const code = target.getAttribute('data-code')
      const rowIndex = parseInt(target.getAttribute('data-rowindex'))
      const row = record[rowIndex]
      const isFooterCell = isEleInFooter(target)

      if (!row || isFooterCell) return null
      return {
        rowIndex,
        row,
        code,
        cell: target
      }
    }
    target = target.parentElement
  }
  return null
}

function findTargetRow (target, tableBody) {
  while (target && tableBody.contains(target)) {
    if (target.getAttribute('data-role') === 'table-row') {
      return target
    }
    target = target.parentElement
  }
  return null
}

function isEleInFooter (target) {
  while (target && !target.classList.contains(Classes.artTable)) {
    if (target.classList.contains(Classes.tableFooter)) {
      return true
    }
    target = target.parentElement
  }
  return false
}

function createDragElement (mouseDownEvent:MouseEvent, tableBody:Element) {
  const ELEMENT_TEMPLATE = (
    `<div class='${Classes.rowDragElement}'>
      <span class='${Classes.rowDragElementIcon}'></span>
      <div class='${Classes.rowDragElementLabel}'></div>
    </div>`
  )

  const element = document.createElement('div')
  element.innerHTML = ELEMENT_TEMPLATE
  const dragElement = element.firstChild as HTMLElement

  const targetRow = findTargetRow(mouseDownEvent.target, tableBody)
  if (targetRow) {
    const rect = targetRow.getBoundingClientRect()
    dragElement.style.height = rect.height + 'px'
  }
  const bodyRect = tableBody.getBoundingClientRect()
  dragElement.style.maxWidth = bodyRect.width + 'px'

  document.body.appendChild(dragElement)
  return dragElement
}

function createDragLine (isTreeTable) {
  const dragLine = document.createElement('div')
  dragLine.classList.add(Classes.rowDragLine)
  if (isTreeTable) {
    dragLine.classList.add(Classes.treeTableRowDragLine)
  }
  document.body.appendChild(dragLine)
  return dragLine
}

function positionDragLine ({ lineElement, dragZone, event, isRTL }) {
  const tableContainer = dragZone.getContainer()

  const { getDataSource, getTreeModeOptions, getRowDragOptions } = dragZone.tableParams
  const dataSource = getDataSource()
  const treeModeOptions = getTreeModeOptions()
  const rowDragOptions = getRowDragOptions() || {}
  const { allowDragIntoRow } = rowDragOptions

  const isTreeTable = !!treeModeOptions

  const bodyRect = tableContainer.getBoundingClientRect()
  const offsetParentSize = getElementRectWithOffset(document.body)

  if(dataSource.length === 0){
    tableContainer.classList.add(Classes.rowDragNoData)
    lineElement.style.display = 'none'
  }else {
    tableContainer.classList.remove(Classes.rowDragNoData)
    lineElement.style.display = 'block'
  }
  // 鼠标悬停所在的拖拽行信息
  const dragItem = getDragRowItem(event.target, tableContainer, dataSource)

  if (!dragItem) {
    if(dataSource.length > 0 && tableContainer.contains(event.target)){
      const rowIndex = dataSource.length -1
      const row = dataSource[rowIndex]
      const direction = 'bottom'
      const targetCell = isTreeTable ? tableContainer.querySelector(`tr[data-rowindex="${rowIndex}"] .${Classes.tableExtendCell}`) : tableContainer.querySelector(`tr[data-rowindex="${rowIndex}"] .${Classes.rowDragCell}`)
      if(!targetCell) return 
      const { top, left , width} = getLinePosition({ treeModeOptions, cell: targetCell,  row, direction, offsetParentSize, bodyRect, isRTL })
      lineElement.style.left = `${left}px`
      lineElement.style.top = `${top}px`
      lineElement.style.width = `${width}px`

    }

    return 
  }

  const { cell, rowIndex, row } = dragItem


  const allowDragInto = isTreeTable && allowDragIntoRow
  const direction = getDirection(cell, event.clientY, allowDragInto)

  const targetCell = isTreeTable ? tableContainer.querySelector(`tr[data-rowindex="${rowIndex}"] .${Classes.tableExtendCell}`) : cell
  if(!targetCell) return 
  const { top, left , width} = getLinePosition({ treeModeOptions, cell: targetCell,  row, direction, offsetParentSize, bodyRect, isRTL })

  lineElement.style.left = `${left}px`
  lineElement.style.top = `${top}px`
  lineElement.style.width = `${width}px`

  if (direction === 'into') {
    lineElement.style.display = 'none'
  } else {
    lineElement.style.display = 'block'
  }

  
}

function showDragLine (lineElement) {
  lineElement.style.display = 'block'
}

function hiddenDragLine (lineElement) {
  lineElement.style.display = 'none'
}

function positionDragElemment (element: HTMLElement, event: MouseEvent, isRTL: boolean) {
  if (!element) return
  const elementRect = element.getBoundingClientRect()
  const eleHeight = elementRect.height
  const browserWidth = document.body?.clientWidth ?? (window.innerHeight || document.documentElement?.clientWidth || 0)
  const browserHeight = document.body?.clientHeight ?? (window.innerHeight || document.documentElement?.clientHeight || 0)
  const offsetParentSize = getElementRectWithOffset(element.offsetParent)
  const { clientX, clientY } = event
  let top = clientY - offsetParentSize.top - eleHeight / 2
  let left = clientX - offsetParentSize.left
  let right = Math.max(browserWidth - clientX, 0)
  const windowScrollX = window.pageXOffset || window.scrollX
  const windowScrollY = window.pageYOffset || window.scrollY

  if (browserWidth > 0 && left + element.clientWidth > browserWidth + windowScrollX) {
    left = Math.max(browserWidth + windowScrollX - element.clientWidth, 0)
  }
  if (browserHeight > 0 && top + element.clientHeight > browserHeight + windowScrollY) {
    top = Math.max(browserHeight + windowScrollY - element.clientHeight, 0)
  }
  if (browserWidth > 0 && right + element.clientWidth > browserWidth + windowScrollX) {
    right = Math.max(browserWidth + windowScrollX - element.clientWidth, 0)
  }
  if (isRTL) {
    element.style.cssText += `;right: ${right}px; top: ${top}px;`
    return
  }
  element.style.left = `${left}px`
  element.style.top = `${top}px`
}

function getElementRectWithOffset (el) {
  const offsetElementRect = el.getBoundingClientRect()
  const { borderTopWidth, borderLeftWidth, borderRightWidth, borderBottomWidth } = _getElementSize(el)
  return {
    top: offsetElementRect.top + (borderTopWidth || 0),
    left: offsetElementRect.left + (borderLeftWidth || 0),
    right: offsetElementRect.right + (borderRightWidth || 0),
    bottom: offsetElementRect.bottom + (borderBottomWidth || 0)
  }
}

function _getElementSize (el) {
  const {
    height,
    width,
    borderTopWidth,
    borderRightWidth,
    borderBottomWidth,
    borderLeftWidth,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    boxSizing
  } = window.getComputedStyle(el)
  return {
    height: parseFloat(height || '0'),
    width: parseFloat(width || '0'),
    borderTopWidth: parseFloat(borderTopWidth || '0'),
    borderRightWidth: parseFloat(borderRightWidth || '0'),
    borderBottomWidth: parseFloat(borderBottomWidth || '0'),
    borderLeftWidth: parseFloat(borderLeftWidth || '0'),
    paddingTop: parseFloat(paddingTop || '0'),
    paddingRight: parseFloat(paddingRight || '0'),
    paddingBottom: parseFloat(paddingBottom || '0'),
    paddingLeft: parseFloat(paddingLeft || '0'),
    marginTop: parseFloat(marginTop || '0'),
    marginRight: parseFloat(marginRight || '0'),
    marginBottom: parseFloat(marginBottom || '0'),
    marginLeft: parseFloat(marginLeft || '0'),
    boxSizing
  }
}

function removeElement (element) {
  document.body.removeChild(element)
}

function setDragElementIcon (element, iconName) {
  const elementIcon = element.querySelector(`.${Classes.rowDragElementIcon}`)
  clearElementChildren(elementIcon)
  iconName = iconName || 'notAllowed'

  const iconElement = document.createElement('span')
  if (iconName === 'move') {
    iconElement.classList.add(Classes.iconMove)
  } else if (iconName === 'notAllowed') {
    iconElement.classList.add(Classes.iconNotAllowed)
  }
  elementIcon.appendChild(iconElement)
}

function clearElementChildren (element) {
  while (element && element.firstChild) {
    element.removeChild(element.firstChild)
  }
}

function getScrollMoveOffset (tableBody: Element, mouseMoveEvent: MouseEvent) {
  const clientY = mouseMoveEvent.clientY
  const tableBodyClientRect = tableBody.getBoundingClientRect()

  const { top, height } = tableBodyClientRect

  if (clientY >= top + height - SCROLL_START_OFFSET && clientY <= top + height) {
    return SCROLL_OFFSET
  }
  if (clientY >= top && clientY <= top + SCROLL_START_OFFSET) {
    return -SCROLL_OFFSET
  }
  return 0
}

function setDragText (element, dragText): void {
  const dragTextString = dragText.toString()
  const elementIcon = element.querySelector(`.${Classes.rowDragElementLabel}`)
  const stringNode = document.createTextNode(dragTextString)
  elementIcon.appendChild(stringNode)
}

function isMouseOnDropTarget (mouseEvent, target): boolean {
  return target.contains(mouseEvent.target)
}

function createDropTargetEvent (dropZone, event, dragItem, startDropZone): DragEvent {
  const dropZoneTarget = dropZone.getContainer()
  const startDropZoneTagret = startDropZone.getContainer()
  const rect = dropZoneTarget.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const startDropZoneOptions = startDropZone.tableParams.getRowDragOptions()
  const startCommonParams = startDropZoneOptions?.commonParams
  const targetEvent:DragEvent = {
    dragItem,
    startDropZoneTagret,
    startCommonParams,
    dropZoneTarget,
    event,
    x,
    y
  }
  if(dropZone.isTable){
    
    const dropZoneOptions = dropZone.tableParams.getRowDragOptions()
    const commonParams = dropZoneOptions?.commonParams
    targetEvent.dropZoneTableParams = dropZone.tableParams
    targetEvent.commonParams = commonParams
  }
  return targetEvent
}

function getDirection (cell, clientY, isTreeTable = false) : string {
  const { height, y } = cell.getBoundingClientRect()

  let direction = 'bottom'

  if (isTreeTable) {
    if (y + height / 4 > clientY) {
      direction = 'top'
    } else if (y + height * 3 / 4 > clientY) {
      direction = 'into'
    }
  } else if (y + height / 2 > clientY) {
    direction = 'top'
  }

  return direction
}

const getLinePosition = ({ treeModeOptions, cell,  row, direction, offsetParentSize, bodyRect, isRTL })=>{

  const isTreeTable = !!treeModeOptions

  if(isTreeTable){
    const {
      iconWidth,
      iconIndent,
      iconGap,
      indentSize,
      treeMetaKey
    } = treeModeOptions
    const { paddingLeft, paddingRight } = _getElementSize(cell)
    const expandCellRect = cell.getBoundingClientRect()
    const { rowKey, depth, isLeaf, expanded } = row[treeMetaKey]
    const addWidth = isLeaf ? iconWidth + iconGap : 0
    const indent = iconIndent + depth * indentSize + addWidth
    const { x, y, height } = expandCellRect
  
    const top = direction === 'bottom' ? y + height - offsetParentSize.top : y - offsetParentSize.top
    const offsetX = Math.max(x + paddingLeft + indent - bodyRect.x, 0)
    const left = bodyRect.x + offsetX - offsetParentSize.left
    const width = bodyRect.width - offsetX

    if (isRTL) {
      const expandCellOffsetRight = bodyRect.right - expandCellRect.right // 展示收起单元格相较于表格右边的距离
      const _left = bodyRect.x - offsetParentSize.left
      // 表格的宽度 - expandCellOffsetRight - 表格的paddingRight - 计算得出的缩进
      const _width = bodyRect.width - expandCellOffsetRight - paddingRight - indent
      return {
        top,
        left: _left,
        width: _width
      }
    }
    return {
      top,
      left,
      width
  
    }
  }


   // 根据鼠标悬停位置所在单元格和显示位置计算拖拽线的位置
   const rect = cell.getBoundingClientRect()
   const { y, height } = rect
   const top = direction === 'bottom' ? y + height - offsetParentSize.top : y - offsetParentSize.top
   const left = bodyRect.x - offsetParentSize.left
   const width = bodyRect.width

   return { top, left, width }

}
