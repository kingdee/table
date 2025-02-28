import cx from 'classnames'
import React, { CSSProperties, ReactNode } from 'react'
import { ArtColumn } from '../interfaces'
import { internals } from '../internals'
import { Colgroup } from './colgroup'
import SpanManager from './helpers/SpanManager'
import { RenderInfo } from './interfaces'
import { Classes } from './styles'
import { BaseTableProps } from './table'

export interface HtmlTableProps extends Required<Pick<BaseTableProps, 'getRowProps' | 'primaryKey'>> {
  tbodyHtmlTag: 'tbody' | 'tfoot'
  data: any[]
  stickyRightOffset?:number

  horizontalRenderInfo: Pick<
    RenderInfo,
    'flat' | 'visible' | 'horizontalRenderRange' | 'stickyLeftMap' | 'stickyRightMap' | 'direction'
  >

  verticalRenderInfo: {
    offset: number
    first: number
    last: number
    limit: number
  }

  tbodyPosition ?: 'left' | 'center' | 'right'
}

export function HtmlTable ({
  tbodyHtmlTag,
  getRowProps,
  primaryKey,
  stickyRightOffset,
  data,
  verticalRenderInfo: verInfo,
  horizontalRenderInfo: hozInfo,
  tbodyPosition
}: HtmlTableProps) {
  const { flat, horizontalRenderRange: hoz, direction } = hozInfo

  const spanManager = new SpanManager()
  const fullFlatCount = flat.full.length
  const leftFlatCount = flat.left.length
  const rightFlatCount = flat.right.length

  return (
    <table>
      <Colgroup descriptors={hozInfo.visible} />
      {React.createElement(tbodyHtmlTag, null, data.map(renderRow))}
    </table>
  )

  function renderRow (record: any, i: number) {
    const rowIndex = verInfo.offset + i
    spanManager.stripUpwards(rowIndex)

    const rowProps = getRowProps(record, rowIndex)
    const rowClass = cx(
      Classes.tableRow,
      {
        [Classes.first]: rowIndex === verInfo.first,
        [Classes.last]: rowIndex === verInfo.last,
        [Classes.even]: rowIndex % 2 === 0,
        [Classes.odd]: rowIndex % 2 === 1
      },
      rowProps?.className
    )

    const visibleColumnDescriptor = hozInfo.visible.concat()

    // 左中右区域渲染，存在融合单元格时需要适配rowspan属性
    // 如果固定的列均存在融合单元格，需空白一列做占位,否则融合的单元格不会渲染，导致显示异常
    // 这里无法区分是否存在融合列，默认左右固定区域均添加占位空白列
    if (['left', 'right'].indexOf(tbodyPosition) > -1) {
      visibleColumnDescriptor.push({ type: 'blank', blankSide: 'left', width: 0, isPlacehoder: true })
    }

    return (
      <tr
        {...rowProps}
        className={rowClass}
        key={rowProps?.['data-row-detail-key'] ? rowProps['data-row-detail-key'] : internals.safeGetRowKey(primaryKey, record, rowIndex)}
        data-rowindex={rowIndex}
        data-role={'table-row'}
      >
        {visibleColumnDescriptor.map((descriptor) => {
          if (descriptor.type === 'blank') {
            return (
              <td
                key={descriptor.blankSide}
                style={{ visibility: descriptor.isPlacehoder ? 'hidden' : undefined }}
              />
            )
          }
          return renderBodyCell(record, rowIndex, descriptor.col, descriptor.colIndex)
        })}
      </tr>
    )
  }

  function renderBodyCell (record: any, rowIndex: number, column: ArtColumn, colIndex: number) {
    if (spanManager.testSkip(rowIndex, colIndex)) {
      return null
    }

    const value = internals.safeGetValue(column, record, rowIndex)
    const cellProps = column.getCellProps?.(value, record, rowIndex) ?? {}

    let cellContent: ReactNode = value
    if (column.render) {
      cellContent = column.render(value, record, rowIndex)
    }

    let colSpan = 1
    let rowSpan = 1
    if (column.getSpanRect) {
      const spanRect = column.getSpanRect(value, record, rowIndex)
      colSpan = spanRect == null ? 1 : spanRect.right - colIndex
      rowSpan = spanRect == null ? 1 : spanRect.bottom - rowIndex
    } else {
      if (cellProps.colSpan != null) {
        colSpan = cellProps.colSpan
      }
      if (cellProps.rowSpan != null) {
        rowSpan = cellProps.rowSpan
      }
    }

    const hasSpan = colSpan > 1 || rowSpan > 1
    if (hasSpan) {
      spanManager.add(rowIndex, colIndex, colSpan, rowSpan)
    }

    // rowSpan/colSpan 不能过大，避免 rowSpan/colSpan 影响因虚拟滚动而未渲染的单元格
    rowSpan = Math.min(rowSpan, verInfo.limit - rowIndex)
    colSpan = Math.min(colSpan, hozInfo.visible.length - colIndex)

    // todo: 右侧有列固定的情况下colSpan计算不对，这里先限制一下
    rowSpan = Math.max(rowSpan, 1)
    colSpan = Math.max(colSpan, 1)

    const positionStyle: CSSProperties = {}

    if (colIndex < leftFlatCount) {
      positionStyle.position = 'sticky'
      positionStyle.left = hozInfo.stickyLeftMap.get(colIndex)
      if(direction === 'rtl'){
        positionStyle.right = hozInfo.stickyLeftMap.get(colIndex)
      }else{
        positionStyle.left = hozInfo.stickyLeftMap.get(colIndex)
      }
     
    } else if (colIndex >= fullFlatCount - rightFlatCount) {
      positionStyle.position = 'sticky'
      if(direction === 'rtl'){
        positionStyle.left = hozInfo.stickyRightMap.get(colIndex) + (typeof stickyRightOffset === 'number' ? stickyRightOffset : 0)
      }else{
        positionStyle.right = hozInfo.stickyRightMap.get(colIndex) + (typeof stickyRightOffset === 'number' ? stickyRightOffset : 0)
      }
    }

    return React.createElement(
      'td',
      {
        key: colIndex,
        ...cellProps,
        className: cx(Classes.tableCell, cellProps.className, {
          // class
          [Classes.first]: colIndex === 0,
          [Classes.last]: colIndex + colSpan === fullFlatCount,
          [Classes.lockLeft]: colIndex < leftFlatCount || tbodyPosition === 'left',
          [Classes.lockRight]: colIndex >= fullFlatCount - rightFlatCount,
          [Classes.rowSpan]: rowSpan > 1
        }),
        ...(hasSpan ? { colSpan, rowSpan } : null),
        style: {
          textAlign: column.align,
          verticalAlign: column.verticalAlign ?? 'middle',
          ...cellProps.style,
          ...positionStyle
        },
        'data-role': 'table-cell',
        'data-rowindex': rowIndex,
        'data-code': column.code,
      },
      tbodyPosition === 'center' && positionStyle.position === 'sticky' ? null : cellContent
    )
  }
}
