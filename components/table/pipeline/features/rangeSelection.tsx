import React from 'react'
import { TablePipeline } from '../pipeline'
import { mergeCellProps, makeRecursiveMapper, isElementInEventPath, collectNodes } from '../../utils'
import { findByTree } from '../../utils/others'
import { CellProps, ArtColumn } from '../../interfaces'
import { fromEvent } from 'rxjs'
import { map, takeUntil } from 'rxjs/operators'
import { Classes } from '../../base/styles'
import cx from 'classnames'

export interface RangeSelectionFeatureOptions {
    /** 范围选中回调函数 */
    rangeSelectedChange?(params: any): void
    /** 是否阻止keydown的默认行为 */
    preventkDefaultOfKeyDownEvent?: boolean
}

interface DragCell {
    rowIndex : number,
    rowSpan: number,
    code: string,
    column: ArtColumn
}

interface RangeSelection {
    startRow: number,
    endRow: number,
    columns: ArtColumn[],
    startColumn: ArtColumn
}
export const rangeSelectionKey = 'rangeSelection'
export const lastClickCell = 'lastClickCell'

export function rangeSelection (opts:RangeSelectionFeatureOptions) {
  return function step (pipeline:TablePipeline) {
    const SCROLL_SIZE = 30
    const tableBody = pipeline.ref.current.domHelper && pipeline.ref.current.domHelper.tableBody
    if (!tableBody) {
      return pipeline
    }

    const columns = pipeline.getColumns()
    const rangeSelectedChange = (rangeSelection: RangeSelection) => {
      pipeline.setStateAtKey(rangeSelectionKey, rangeSelection)
      opts?.rangeSelectedChange ?.(rangeSelection)
    }
    // if (!pipeline.getFeatureOptions(rangeSelectionKey)) {
    //   pipeline.setFeatureOptions(rangeSelectionKey, {
    //     optionKey: rangeSelectionKey,
    //     rangeSelectedChange: rangeSelectedChange
    //   })
    // }

    const setRangeSelection = (startDragCell:DragCell, draggingCell:DragCell) => {
      if (!startDragCell || !draggingCell || isSameCell(startDragCell, draggingCell)) return
      const rangeColumns = getRangeColumns(startDragCell, draggingCell, columns)
      const isTopToBottom = startDragCell.rowIndex <= draggingCell.rowIndex
      const rangeSelection = {
        startRow: isTopToBottom ? startDragCell.rowIndex : startDragCell.rowIndex + startDragCell.rowSpan - 1,
        endRow: isTopToBottom ? draggingCell.rowIndex + draggingCell.rowSpan - 1 : draggingCell.rowIndex,
        columns: rangeColumns,
        startColumn: startDragCell.column
      }
      rangeSelectedChange(rangeSelection)
    }
    const shiftKeySelect = (event: React.MouseEvent<HTMLTableElement, MouseEvent>) => {
      const target = event.target
      const clickCell = getTargetCell(target, columns)
      if (clickCell) {
        if (event.shiftKey) {
          const _lastClickCell = pipeline.getStateAtKey(lastClickCell)
          if (_lastClickCell) {
            setRangeSelection(_lastClickCell, clickCell)
          } else {
            // 第一次进来就按住shift键，这时候要记住点击的单元格
            pipeline.setStateAtKey(lastClickCell, clickCell)
          }
        } else {
          pipeline.setStateAtKey(lastClickCell, clickCell)
          rangeSelectedChange(null)
        }
      }
    }

    const onMouseDown = (mouseDownEvent: React.MouseEvent<HTMLTableElement, MouseEvent>) => {
      if (mouseDownEvent.button !== 0 || !isElementInEventPath(tableBody, mouseDownEvent.nativeEvent)) return
      // mouseDownEvent.preventDefault()
      // shift + 点击选中
      shiftKeySelect(mouseDownEvent)

      const target = mouseDownEvent.target
      const startDragCell = getTargetCell(target, columns)
      const mousemove$ = fromEvent<MouseEvent>(window, 'mousemove')
      const mouseup$ = fromEvent<MouseEvent>(window, 'mouseup')
      const tableBodyClientRect = tableBody.getBoundingClientRect()

      const updateScrollPosition = (client) => {
        const { clientX, clientY } = client

        const { left, top, height, width } = tableBodyClientRect

        if (clientX + SCROLL_SIZE >= left + width) {
          pipeline.ref.current.domHelper.virtual.scrollLeft += SCROLL_SIZE
        }
        if (clientX - SCROLL_SIZE <= left) {
          pipeline.ref.current.domHelper.virtual.scrollLeft -= SCROLL_SIZE
        }
        if (clientY + SCROLL_SIZE >= top + height) {
          pipeline.ref.current.domHelper.tableBody.scrollTop += SCROLL_SIZE
        }
        if (clientY + SCROLL_SIZE <= top) {
          pipeline.ref.current.domHelper.tableBody.scrollTop -= SCROLL_SIZE
        }
      }

      const rangeSelected$ = mousemove$.pipe(
        map((mouseMoveEvent:MouseEvent) => {
          const target = mouseMoveEvent.target || mouseMoveEvent.srcElement
          const draggingCell = getTargetCell(target, columns)
          const client = {
            clientX: mouseMoveEvent.clientX,
            clientY: mouseMoveEvent.clientY
          }
          updateScrollPosition(client)

          return {
            startDragCell: startDragCell,
            draggingCell: draggingCell
          }
        }),
        takeUntil(mouseup$)
      )

      rangeSelected$.subscribe(({ startDragCell, draggingCell }) => {
        setRangeSelection(startDragCell, draggingCell)
      })
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLTableElement>) => {
      if (!isElementInEventPath(tableBody, e.nativeEvent)) return
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        const rowLen = pipeline.getDataSource().length
        if (columns.length && rowLen) {
          opts.preventkDefaultOfKeyDownEvent !== false && e.preventDefault()
          rangeSelectedChange({
            startRow: 0,
            endRow: rowLen - 1,
            columns,
            startColumn: columns[0]
          })
        }
      }
    }

    pipeline.addTableProps({ onMouseDown, onKeyDown, tabIndex: -1 }) // todo: 后面可以把mousedown放到一个流里面

    return pipeline.mapColumns(makeRecursiveMapper((col) => {
      const rangeSelection = pipeline.getStateAtKey(rangeSelectionKey)
      if (!rangeSelection || rangeSelection.columns.findIndex(selectedCol => selectedCol.code === col.code) === -1) return col

      const prevGetCellProps = col.getCellProps
      return {
        ...col,
        getCellProps (value: any, record: any, rowIndex: number): CellProps {
          const prevCellProps = prevGetCellProps?.(value, record, rowIndex)
          const { startRow, endRow, columns } = rangeSelection

          const startIndex = startRow < endRow ? startRow : endRow
          const endIndex = startRow < endRow ? endRow : startRow
          const startCol = columns[0]
          const endCol = columns[columns.length - 1]

          const match = rowIndex >= startIndex && rowIndex <= endIndex
          const className = cx(
            {
              [Classes.tableCellRangeSelected]: match,
              [Classes.tableCellRangeTop]: rowIndex === startIndex,
              [Classes.tableCellRangeLeft]: col.code === startCol.code && match,
              [Classes.tableCellRangeBottom]: rowIndex === endIndex,
              [Classes.tableCellRangeRight]: col.code === endCol.code && match
            }
          )
          return mergeCellProps(prevCellProps, {
            className: className
          })
        }
      }
    }))
  }
}

function getTargetCell (target, columns:ArtColumn[]) :DragCell {
  while (target) {
    if (target.getAttribute('data-role') === 'table-cell') {
      const columnCode = target.getAttribute('data-code')
      const column = findByTree(columns, (item, index) => item.code === columnCode)
      if (!column) return null
      return {
        rowIndex: parseInt(target.getAttribute('data-rowindex')),
        rowSpan: parseInt(target.getAttribute('rowspan') || 1),
        code: columnCode,
        column: column
      }
    }
    target = target.parentElement
  }
  return null
}

function isSameCell (cell1, cell2) {
  return cell1.rowIndex === cell2.rowIndex && cell1.code === cell2.code
}

function getRangeColumns (startCell:DragCell, endCell:DragCell, columns:ArtColumn[]) {
  const flatColumns = collectNodes(columns, 'leaf-only')
  const startIndex = flatColumns.findIndex((col) => col.code === startCell.code)
  const endIndex = flatColumns.findIndex((col) => col.code === endCell.code)
  if (startIndex < endIndex) {
    return flatColumns.slice(startIndex, endIndex + 1)
  } else {
    return flatColumns.slice(endIndex, startIndex + 1)
  }
}
