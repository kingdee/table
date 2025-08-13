import React from 'react'
import ReactDOM from 'react-dom'
import { fromEvent } from 'rxjs'
import { map, takeUntil, filter } from 'rxjs/operators'

import { TablePipeline } from '../pipeline'
import { ArtColumn, CellProps } from '../../interfaces'
import cx from 'classnames'
import { Classes } from '../../base/styles'
import { getEventCoordinates, getEventTarget, isTouchEvent, addPointerEventListeners, removePointerEventListeners, hasMovedEnough } from './utils/touchEventUtils'

interface RowDragEvent {
  startRowIndex: number,
  startRow: any, // 起始的拖拽行
  endRowIndex: number,
  endRow: any, // 结束的拖拽行
  isFinished: boolean, // 是否拖拽完成
  dragPosition: string // bottom | top 拖拽行基于目标行的位置

}

export interface RowDragFeatureOptions {

  /** 拖拽开始事件 */
  onDragStart?: (event: RowDragEvent) => void,

  /** 拖拽移动事件 */
  onDragMove?: (event: RowDragEvent) => void,

  /** 拖拽结束事件 */
  onDragEnd?: (event: RowDragEvent) => void,

  /** 判断一行是否要禁用拖拽 */
  isDisabled?: (row: any, rowIndex: number) => boolean,

  /** 拖拽列定义 */
  rowDragColumn?: ArtColumn,

  /** 行高 */
  rowHeight?: number,

  /** 拖拽过程中是否禁止滚动条滚动 */
  suppressScrollMove?: boolean

}

export const ROW_DRAG_COLUMN_CODE = '$_row_drag_column_&'
export const rowDragKey = 'rowDragKey'
const SCROLL_OFFSET = 30

const defaultRowDragColumn: ArtColumn = {
  name: '拖拽列',
  code: ROW_DRAG_COLUMN_CODE,
  lock: true,
  title: '',
  width: 40,
  align: 'center',
  getCellProps(value: any, row: any, rowIndex: number): CellProps {
    return {
      className: cx(Classes.rowDragCell)
    }
  },
  render(value: any, row: any, rowIndex: number) {
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

export function rowDrag(opt: RowDragFeatureOptions) {
  return function rowDragStep(pipeline: TablePipeline) {
    const tableBody = pipeline.ref.current.domHelper && pipeline.ref.current.domHelper.tableBody
    const artTable = pipeline.ref.current.domHelper && pipeline.ref.current.domHelper.artTable

    if (!tableBody) return pipeline

    const dataSource = pipeline.getDataSource()
    const rowHeight = opt?.rowHeight || 48

    const handleDragStrat = (event: RowDragEvent) => {
      // 开始拖拽
      artTable.classList.add(cx(Classes.rowDragging))
      opt?.onDragStart?.(event)
    }

    const handleDragMove = (event: RowDragEvent) => {
      opt?.onDragMove?.(event)

      pipeline.setStateAtKey(rowDragKey, event)
    }

    const handleDragEnd = (event: RowDragEvent, isValid: boolean) => {
      artTable.classList.remove(cx(Classes.rowDragging))
      pipeline.setStateAtKey(rowDragKey, event)
      // 超出拖拽范围不触发dragend事件
      if (isValid) {
        opt?.onDragEnd?.(event)
      }
    }

    const getDragEvent = (startRowInfo, endRowInfo, { isFinished, dragPosition = 'bottom' }) => {
      return {
        startRowIndex: startRowInfo.rowIndex,
        startRow: startRowInfo.row,
        endRowIndex: endRowInfo.rowIndex,
        endRow: endRowInfo.row,
        dragPosition,
        isFinished
      }
    }

    const updateScrollPosition = (moveEvent: MouseEvent | TouchEvent) => {
      if (opt?.suppressScrollMove) return
      const { clientY } = getEventCoordinates(moveEvent)
      const tableBodyClientRect = tableBody.getBoundingClientRect()

      const { top, height } = tableBodyClientRect

      if (clientY + SCROLL_OFFSET >= top + height) {
        pipeline.ref.current.domHelper.tableBody.scrollTop += SCROLL_OFFSET
      }
      if (clientY + SCROLL_OFFSET <= top) {
        pipeline.ref.current.domHelper.tableBody.scrollTop -= SCROLL_OFFSET
      }
    }

    const handlePointerDown = (downEvent: React.MouseEvent<HTMLTableElement, MouseEvent> | React.TouchEvent<HTMLTableElement>) => {
      const isTouchStart = isTouchEvent(downEvent.nativeEvent)
      const target = getEventTarget(downEvent.nativeEvent)
      const startRowInfo = getTargetRowInfo(target, tableBody, dataSource)
      let endRowInfo = startRowInfo

      if (!startRowInfo || startRowInfo.code !== rowDragColumn.code) return

      if (opt?.isDisabled?.(startRowInfo.row, startRowInfo.rowIndex)) return

      // 默认拖拽插入的位置是向下
      let dragPosition = 'bottom'
      let isOutOfRange = false
      let isValidDrag = false

      const dragStartEvent = getDragEvent(startRowInfo, endRowInfo, { isFinished: false, dragPosition: 'bottom' })
      handleDragStrat(dragStartEvent)
      const tableWidth = tableBody.clientWidth
      const startRowRects = startRowInfo.cell.getBoundingClientRect()
      // 光标位置距离初始拖拽行的偏移量
      const { clientX: downClientX, clientY: downClientY } = getEventCoordinates(downEvent.nativeEvent)
      const startOffset = downClientY - startRowRects.top
      const dragElement = createDragElement(startRowRects, tableWidth, rowHeight)
      // 可拖拽的范围
      let dragRange = getDragRange(tableBody, { startOffset, rowHeight })
      let pointerPosition = { x: downClientX, y: downClientY }

      const pointerMove$ = fromEvent<MouseEvent | TouchEvent>(window, isTouchStart ? 'touchmove' : 'mousemove', { passive: false }).pipe(
        map(event => {
          try {
            if (event.cancelable) {
              event.preventDefault()
            }
          } catch (error) {
            // 忽略passive event listener错误
            console.warn('preventDefault failed in passive touch event listener')
          }
          return event
        })
      )
      const pointerUp$ = fromEvent<MouseEvent | TouchEvent>(window, isTouchStart ? 'touchend' : 'mouseup', { passive: false })

      const scrollCallback = (event) => {
        // 在当前表格内滚动不处理
        if (event.target === tableBody) return

        dragRange = getDragRange(tableBody, { startOffset, rowHeight })

        const isOutOfRange = isOutOfDragRange(pointerPosition, dragRange)
        updateCurSorStyle(isOutOfRange)
      }
      document.addEventListener('scroll', scrollCallback, true)

      const rowDrag$ = pointerMove$.pipe(
        filter((moveEvent: MouseEvent | TouchEvent) => {
          const { clientY: moveClientY } = getEventCoordinates(moveEvent)
          // 上下移动偏移量大于5才是有效的拖拽
          if (Math.abs(moveClientY - downClientY) > 5) {
            isValidDrag = true
          }

          return isValidDrag
        }),
        map((moveEvent: MouseEvent | TouchEvent) => {
          const { clientX, clientY } = getEventCoordinates(moveEvent)
          const target = getEventTarget(moveEvent)
          const tagretRow = getTargetRowInfo(target, tableBody, dataSource)
          if (tagretRow) {
            endRowInfo = tagretRow
          }

          const targetRowRects = endRowInfo.cell.getBoundingClientRect()

          // 判断拖拽插入的位置，拖拽框上边框位于目标行之上则向上插入，否则向下插入
          const isMoveToTop = (clientY - startOffset) < targetRowRects.top

          dragPosition = isMoveToTop ? 'top' : 'bottom'
          isOutOfRange = isOutOfDragRange({ x: clientX, y: clientY }, dragRange)
          pointerPosition = { x: clientX, y: clientY }

          updateScrollPosition(moveEvent) // 拖拽到底时让滚动条可以滚动
          updateDragElementPosition(dragElement, dragRange, { x: clientX, y: clientY, startOffset })
          updateCurSorStyle(isOutOfRange)

          return { startRowInfo, endRowInfo, dragPosition }
        }),
        takeUntil(pointerUp$)
      )

      rowDrag$.subscribe({
        next: ({ startRowInfo, endRowInfo, dragPosition }) => {
          const dragMoveEvent = getDragEvent(startRowInfo, endRowInfo, { isFinished: false, dragPosition })
          handleDragMove(dragMoveEvent)
        },
        complete() {
          const dragEndEvent = getDragEvent(startRowInfo, endRowInfo, { isFinished: true, dragPosition })
          const isValid = isValidDrag && !isOutOfRange
          handleDragEnd(dragEndEvent, isValid)

          removeDragElement(dragElement)
          removeCurSorStyle()
          document.removeEventListener('scroll', scrollCallback, true)
        }
      })
    }

    const rowDragColumn = opt?.rowDragColumn || defaultRowDragColumn
    pipeline.setFeatureOptions('rowDragColumnKey', rowDragColumn.code)

    const nextColumns = pipeline.getColumns().slice()
    nextColumns.unshift(rowDragColumn)
    pipeline.columns(nextColumns)

    pipeline.addTableProps({ onMouseDown: handlePointerDown, onTouchStart: handlePointerDown })
    pipeline.appendRowPropsGetter((row, rowIndex) => {
      const rowDragEvent = pipeline.getStateAtKey(rowDragKey) || {}
      const { startRowIndex, endRowIndex, isFinished, dragPosition } = rowDragEvent

      const isFooterCell = row[pipeline.getFeatureOptions('footerRowMetaKey')]

      if (isFooterCell || isFinished || (rowIndex !== startRowIndex && rowIndex !== endRowIndex)) return

      const className = cx({
        [Classes.rowDragStart]: rowIndex === startRowIndex,
        [Classes.rowDragEnd]: rowIndex === endRowIndex,
        [Classes.rowDragEndToTop]: rowIndex === endRowIndex && dragPosition === 'top',
        [Classes.rowDragEndToBottom]: rowIndex === endRowIndex && dragPosition === 'bottom'
      })

      return { className }
    })

    return pipeline
  }
}

function getTargetRowInfo(target, tableBody, record) {
  // 处理触摸事件可能返回的null目标
  if (!target) return null

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

function isEleInFooter(target) {
  while (target && !target.classList.contains(Classes.artTable)) {
    if (target.classList.contains(Classes.tableFooter)) {
      return true
    }
    target = target.parentElement
  }
  return false
}

function createDragElement(rects, tableWidth, rowHeight) {
  const { x, y } = rects

  const dragMoveElement = document.createElement('div')
  dragMoveElement.className = cx(Classes.rowDragElement)
  dragMoveElement.style.cssText = `position:fixed;z-index:9999;left:${x}px;top:${y}px;pointer-events:none;width:${tableWidth}px;height:${rowHeight}px;background:var(--primary-color);opacity: 0.1;`

  document.body.appendChild(dragMoveElement)

  return dragMoveElement
}

function updateDragElementPosition(element, dragRange, { x, y, startOffset }) {
  const validPosition = getValidPosition({ x, y }, dragRange)
  element.style.top = (validPosition.y - startOffset) + 'px'

  return element
}

function removeDragElement(element) {
  document.body.removeChild(element)
}

function updateCurSorStyle(isOutOfRange) {
  if (isOutOfRange) {
    document.body.style.cursor = 'no-drop'
  } else {
    document.body.style.cursor = 'move'
  }
}

function removeCurSorStyle() {
  document.body.style.cursor = 'default'
}

function getDragRange(tableBody, { startOffset, rowHeight }) {
  const tableBodyClientRect = tableBody.getBoundingClientRect()
  const { height, width, top, left } = tableBodyClientRect
  return {
    minX: left,
    maxX: left + width,
    minY: top - rowHeight + startOffset,
    maxY: top + height + startOffset
  }
}

function getValidPosition(position, dragRange) {
  const { x, y } = position
  const { minX, maxX, minY, maxY } = dragRange

  const newX = x < minX ? minX : (x > maxX ? maxX : x)
  const newY = y < minY ? minY : (y > maxY ? maxY : y)
  return {
    x: newX,
    y: newY
  }
}

function isOutOfDragRange(position, dragRange) {
  const { x, y } = position
  const { minX, maxX, minY, maxY } = dragRange

  return x > maxX || x < minX || y > maxY || y < minY
}
