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
    column: ArtColumn,
    isInFooter:boolean
}

interface FooterRowRange{
  startRow: number,
  endRow: number,
}

interface RangeSelection {
    startRow: number,
    endRow: number,
    columns: ArtColumn[],
    startColumn: ArtColumn,
    footerRowRange: FooterRowRange | null
}
export const rangeSelectionKey = 'rangeSelection'
export const lastClickCellKey = 'lastClickCell'

export function rangeSelection (opts:RangeSelectionFeatureOptions) {
  return function step (pipeline:TablePipeline) {
    const SCROLL_SIZE = 30
    const tableBody = pipeline.ref.current.domHelper && pipeline.ref.current.domHelper.tableBody
    const tableFooter = pipeline.ref.current.domHelper && pipeline.ref.current.domHelper.tableFooter
    if (!tableBody) {
      return pipeline
    }

    const columns = pipeline.getColumns()
    const dataSource = pipeline.getDataSource()
    const rangeSelectedChange = (rangeSelection: RangeSelection) => {
      pipeline.setStateAtKey(rangeSelectionKey, rangeSelection)
      opts?.rangeSelectedChange ?.(rangeSelection)
    }

    const setRangeSelection = (startDragCell:DragCell, draggingCell:DragCell) => {
      if (!startDragCell || !draggingCell) return
      const rangeColumns = getRangeColumns(startDragCell, draggingCell, columns)
      const { startRow, endRow, footerRowRange } = getRangeSelectionRowInfo(startDragCell, draggingCell, dataSource)
      const rangeSelection = {
        startRow,
        endRow,
        columns: rangeColumns,
        startColumn: startDragCell.column,
        footerRowRange
      }
      rangeSelectedChange(rangeSelection)
    }
    const shiftKeySelect = (event: React.MouseEvent<HTMLTableElement, MouseEvent>) => {
      const target = event.target
      const clickCell = getTargetCell(target, columns)
      if (clickCell) {
        if (event.shiftKey) {
          const _lastClickCell = pipeline.getStateAtKey(lastClickCellKey)
          if (_lastClickCell) {
            setRangeSelection(_lastClickCell, clickCell)
          } else {
            // 第一次进来就按住shift键，这时候要记住点击的单元格
            pipeline.setStateAtKey(lastClickCellKey, clickCell)
          }
        } else {
          pipeline.setStateAtKey(lastClickCellKey, clickCell)
          setRangeSelection(clickCell, clickCell)
        }
      }
    }

    const onMouseDown = (mouseDownEvent: React.MouseEvent<HTMLTableElement, MouseEvent>) => {
      if (mouseDownEvent.button !== 0 || !(isElementInEventPath(tableBody, mouseDownEvent.nativeEvent) || isElementInEventPath(tableFooter, mouseDownEvent.nativeEvent))) return
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
      if (!(isElementInEventPath(tableBody, e.nativeEvent) || isElementInEventPath(tableFooter, e.nativeEvent))) return

      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        const rowLen = pipeline.getDataSource().length
        const footerDataSource = pipeline.getFooterDataSource() || []
        // 焦点位于可编辑的单元格内不做全选
        if (columns.length && rowLen && !getElementEditable(e.target)) {
          opts.preventkDefaultOfKeyDownEvent !== false && e.preventDefault()
          rangeSelectedChange({
            startRow: 0,
            endRow: rowLen - 1,
            columns: collectNodes(columns, 'leaf-only'),
            startColumn: columns[0],
            footerRowRange: footerDataSource.length > 0 ? { startRow: 0, endRow: footerDataSource.length - 1 } : null
          })
        }
      }
    }

    pipeline.addTableProps({ onMouseDown, onKeyDown, tabIndex: -1, className: cx([Classes.rangeSelection]) }) // todo: 后面可以把mousedown放到一个流里面

    return pipeline.mapColumns(makeRecursiveMapper((col) => {
      const rangeSelection = pipeline.getStateAtKey(rangeSelectionKey)
      if (!rangeSelection || rangeSelection.columns.findIndex(selectedCol => selectedCol.code === col.code) === -1) return col

      const prevGetCellProps = col.getCellProps
      return {
        ...col,
        getCellProps (value: any, record: any, rowIndex: number): CellProps {
          const prevCellProps = prevGetCellProps?.(value, record, rowIndex)
          const isInFooter = record[pipeline.getFeatureOptions('footerRowMetaKey')]
          const { startRow, endRow, columns, footerRowRange } = rangeSelection

          const { startRowIndex, endRowIndex } = getRowIndex(startRow, endRow)
          const { startRowIndex: footerStartRowIndex, endRowIndex: footerEndRowIndex } = getFooterRowIndex(footerRowRange)
          const startCol = columns[0]
          const endCol = columns[columns.length - 1]

          const bodyMatch = !isInFooter && rowIndex >= startRowIndex && rowIndex <= endRowIndex
          const footerMatch = isInFooter && footerRowRange && rowIndex >= footerStartRowIndex && rowIndex <= footerEndRowIndex
          const match = footerMatch || bodyMatch
          const matchSingleCell = match && isCellRangeSingleCell(rangeSelection)
          // 单个范围选中单元格不显示样式
          const showCellRangeStyle = match && !matchSingleCell
          const className = cx(
            {
              [Classes.tableCellRangeSingleCell]: matchSingleCell,
              [Classes.tableCellRangeSelected]: showCellRangeStyle,
              [Classes.tableCellRangeTop]: showCellRangeStyle && (isInFooter ? (startRowIndex !== -1 ? false : rowIndex === footerStartRowIndex) : rowIndex === startRowIndex),
              [Classes.tableCellRangeLeft]: showCellRangeStyle && col.code === startCol.code,
              [Classes.tableCellRangeBottom]: showCellRangeStyle && (isInFooter ? rowIndex === footerEndRowIndex : (footerRowRange ? false : rowIndex === endRowIndex)),
              [Classes.tableCellRangeRight]: showCellRangeStyle && col.code === endCol.code
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
        column: column,
        isInFooter: isEleInFooter(target)
      }
    }
    target = target.parentElement
  }
  return null
}

function isSameCell (cell1:DragCell, cell2:DragCell) {
  return cell1.rowIndex === cell2.rowIndex && cell1.code === cell2.code && cell1.isInFooter === cell2.isInFooter
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

function getRangeSelectionRowInfo (startCell:DragCell, endCell:DragCell, dataSource:any[]) {
  let footerRowRange = null
  let startRow = -1
  let endRow = -1
  const { startRow: _startRow, endRow: _endRow } = getCellRangeRow(startCell, endCell)
  // 两个单元格都在表体
  if (!startCell.isInFooter && !endCell.isInFooter) {
    startRow = _startRow
    endRow = _endRow
  } else if (startCell.isInFooter && endCell.isInFooter) { // 两个单元格都在表底
    footerRowRange = {
      startRow: _startRow,
      endRow: _endRow
    }
  } else {
    // 一个单元格在表体，一个在表底
    if (startCell.isInFooter) {
      startRow = dataSource.length - 1
      endRow = endCell.rowIndex
      footerRowRange = {
        startRow: startCell.rowIndex,
        endRow: 0
      }
    } else {
      startRow = startCell.rowIndex
      endRow = dataSource.length - 1
      footerRowRange = {
        startRow: 0,
        endRow: endCell.rowIndex
      }
    }
  }

  return {
    startRow,
    endRow,
    footerRowRange
  }
}

function getCellRangeRow (startCell:DragCell, endCell:DragCell) {
  if (isSameCell(startCell, endCell)) {
    return { startRow: startCell.rowIndex, endRow: startCell.rowIndex }
  }
  const isTopToBottom = startCell.rowIndex <= endCell.rowIndex
  const startRow = isTopToBottom ? startCell.rowIndex : startCell.rowIndex + startCell.rowSpan - 1
  const endRow = isTopToBottom ? endCell.rowIndex + endCell.rowSpan - 1 : endCell.rowIndex
  return { startRow, endRow }
}

function isCellRangeSingleCell (rangeSelection:RangeSelection) {
  const { startRow, endRow, columns, footerRowRange } = rangeSelection
  const isBodySingleCell = !footerRowRange && startRow === endRow && columns.length === 1
  const isFooterSingleCell = startRow === -1 && footerRowRange.startRow === footerRowRange.endRow && columns.length === 1

  return isBodySingleCell || isFooterSingleCell
}

function getRowIndex (startRow:number, endRow:number) {
  const isReverse = startRow > endRow
  const startRowIndex = isReverse ? endRow : startRow
  const endRowIndex = isReverse ? startRow : endRow
  return { startRowIndex, endRowIndex }
}

function getFooterRowIndex (footerRowRange:FooterRowRange) {
  if (footerRowRange) {
    return getRowIndex(footerRowRange.startRow, footerRowRange.endRow)
  }
  return { startRowIndex: -1, endRowIndex: -1 }
}

function getElementEditable (target) {
  if (!target) return
  if (['input', 'textarea'].includes(target.tagName.toLowerCase())) {
    if (target.type === 'checkbox') return
    return !target.disabled && !target.readOnly
  }
}
