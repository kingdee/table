import React from 'react'
import styled from 'styled-components'
import { fromEvent } from 'rxjs'
import * as op from 'rxjs/operators'
import { ArtColumn } from '../../interfaces'
import { mergeCellProps, collectNodes, makeRecursiveMapper, isGroupColumn } from '../../utils'
import { TablePipeline } from '../pipeline'
import { internals } from '../../internals'
import { Classes } from '../../base/styles'
import { swapRTLDirection } from '../../base/utils'

const TableHeaderCellResize = styled.div`
  position: absolute;
  top: 0;
  ${props => swapRTLDirection(props.direction, 'right')}: -5px;
  height: 100%;
  width: 10px;
  cursor: ew-resize;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index:1;

  &:after {
    content: "";
    position: absolute;
    display: block;
    ${props => swapRTLDirection(props.direction, 'left')}: calc(50% - 1px);
    width: 1px;
    height: calc(100% - 14px);
    top: 7px;
  }
`

const TableHeaderGroupCellResize = styled(props => <TableHeaderCellResize {...props}/>)`
  &:after {
    height: 100%;
    top: 0;
  }
`

interface ColumnSize {
  [key: string]: number
}

interface ChangedColumnSize {
  code: string
  width: number
}
export interface ColumnResizeOptions {
  columnSize?: ColumnSize
  /** 列的最小宽度，默认为 60 */
  minSize?: number
  /** 如果列宽数组中没有提供有效的宽度，fallbackSize 将作为该列的宽度，默认为 150 */
  fallbackSize?: number
  /** 列的最大宽度，默认为 1000 */
  maxSize?: number

  doubleClickCallback?(e: React.MouseEvent<HTMLSpanElement>, col: ArtColumn):void

  onChangeSize?(nextSize: ColumnSize): void
  afterChangeSize?(nextSize: ColumnSize, changedColumnSize: ChangedColumnSize[]): void
}

function clamp (min: number, x: number, max: number) {
  return Math.max(min, Math.min(max, x))
}

function disableSelect (event) {
  event.preventDefault()
}

const stateKey = 'columnResize'
export const COLUMN_SIZE_KEY = 'columnResize'
export const RESIZED_COLUMN_KEY = 'resizedColumn'
export const LAST_RESIZED_COLUMN_KEY = 'lastResizedColumn'

export function columnResize (opts: ColumnResizeOptions = {}) {
  const minSize = opts.minSize ?? 60
  const fallbackSize = opts.fallbackSize ?? 150
  const maxSize = opts.maxSize ?? 1000
  return function columnResizeFeature (pipeline: TablePipeline) {
    const columnSize: ColumnSize = opts.columnSize ?? pipeline.getStateAtKey(stateKey) ?? {}
    const leafColumns = collectNodes(pipeline.getColumns(), 'leaf-only')
    leafColumns.forEach(({ code, width }) => {
      if (columnSize[code] === undefined) {
        if (typeof width === 'number') {
          columnSize[code] = width
        } else {
          columnSize[code] = fallbackSize
        }
      }
    })

    // 实时存储一份最新的columnSize，与autoFill共用一份数据
    // 存在state里可能存到取不到最新的
    pipeline.setFeatureOptions(COLUMN_SIZE_KEY, columnSize)

    const onChangeSize = (nextColumnSize: ColumnSize) => {
      window.requestAnimationFrame(() => {
        pipeline.setStateAtKey(stateKey, nextColumnSize)
        opts?.onChangeSize?.(nextColumnSize)
      })
    }

    const handleDoubleClick = (e: React.MouseEvent<HTMLSpanElement>, col: ArtColumn) => {
      opts.doubleClickCallback?.(e, col)
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLSpanElement>, col: ArtColumn) => {
      window.addEventListener('selectstart', disableSelect)
      const changedColumnSize = {}
      const startX = e.clientX
      const { children, code, features = {} } = col
      const { minWidth, maxWidth } = features
      const realMinSize = typeof minWidth === 'number' ? minWidth : minSize
      const realMaxSize = typeof maxWidth === 'number' ? maxWidth : maxSize
      const columnSize = pipeline.getFeatureOptions(COLUMN_SIZE_KEY)
      let recordColumnSize = columnSize
      e.stopPropagation()
      const nextSize$ = fromEvent<MouseEvent>(window, 'mousemove').pipe(
        op.takeUntil(fromEvent(window, 'mouseup')),
        op.map((e) => {
          const movingX = e.clientX
          const nextColumnSize = { ...columnSize }
          const deltaSum = pipeline.ctx.direction === 'rtl'?  startX - movingX  : movingX - startX
          let deltaRemaining = deltaSum
          if (children?.length > 0) {
            const leafChildColumns = collectNodes(children, 'leaf-only')
            const childrenWidthSum = leafChildColumns.reduce((sum, { code }) => { return sum + columnSize[code] }, 0)
            leafChildColumns.forEach(({ code }, index) => {
              const startSize = columnSize[code]
              const currentDeltaWidth = Math.round(deltaSum * startSize / childrenWidthSum)
              if (index < leafChildColumns.length - 1) {
                nextColumnSize[code] = clamp(realMinSize, startSize + currentDeltaWidth, realMaxSize)
                changedColumnSize[code] = nextColumnSize[code]
                deltaRemaining -= currentDeltaWidth
              } else {
                nextColumnSize[code] = clamp(realMinSize, startSize + deltaRemaining, realMaxSize)
                changedColumnSize[code] = nextColumnSize[code]
              }
            })
          } else {
            const startSize = columnSize[code]
            nextColumnSize[code] = clamp(realMinSize, startSize + deltaSum, realMaxSize)
            changedColumnSize[code] = nextColumnSize[code]
          }
          recordColumnSize = nextColumnSize
          return nextColumnSize
        })
      )

      nextSize$.subscribe({
        next: nextColumnSize => {
          onChangeSize(nextColumnSize)
          // 由于COLUMN_RESIZE_KEY记录的是全量的列宽，此处记录被改变过的列宽
          const resizedColumnSet = pipeline.getFeatureOptions(RESIZED_COLUMN_KEY) || new Set()
          Object.keys(changedColumnSize).forEach(code =>{
            resizedColumnSet.add(code, changedColumnSize[code])
          })
          pipeline.setFeatureOptions(RESIZED_COLUMN_KEY, resizedColumnSet)
          pipeline.setFeatureOptions(LAST_RESIZED_COLUMN_KEY, code)
        },
        complete () {
          const changedColumnSizes = Object.keys(changedColumnSize).map(code => {
            return { code, width: changedColumnSize[code] }
          })
          window.requestAnimationFrame(() => {
            opts?.afterChangeSize?.(recordColumnSize, changedColumnSizes)
          })
          window.removeEventListener('selectstart', disableSelect)
        }
      })
    }

    const isGroup = isGroupColumn(pipeline.getColumns())

    return pipeline.mapColumns(makeRecursiveMapper((col) => {
      const prevTitle = internals.safeRenderHeader(col)
      const { code, features, width } = col
      return {
        ...col,
        width: columnSize[code] ?? width,
        title: (
          <>
            {prevTitle}
            {features?.resizeable !== false && (
              isGroup
                ? <TableHeaderGroupCellResize direction={pipeline.ctx.direction}  className={Classes.tableHeaderCellResize} onDoubleClick={(e: React.MouseEvent<HTMLSpanElement>) => handleDoubleClick(e, col)} onMouseDown={(e: React.MouseEvent<HTMLSpanElement>) => handleMouseDown(e, col)}/>
                : <TableHeaderCellResize direction={pipeline.ctx.direction} className={Classes.tableHeaderCellResize} onDoubleClick={(e: React.MouseEvent<HTMLSpanElement>) => handleDoubleClick(e, col)} onMouseDown={(e: React.MouseEvent<HTMLSpanElement>) => handleMouseDown(e, col)}/>
            )}
          </>
        ),
        headerCellProps: mergeCellProps(col.headerCellProps, {
          className: 'resizeable'
        })
      }
    }))
  }
}
