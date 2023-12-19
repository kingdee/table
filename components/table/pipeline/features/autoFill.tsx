import { getLeftNestedLockCount } from '../../base/calculations'
import { isLeafNode, makeRecursiveMapper } from '../../utils'
import { TablePipeline } from '../pipeline'
import { Classes } from '../../base/styles'
import { COLUMN_SIZE_KEY, LAST_RESIZED_COLUMN_KEY, RESIZED_COLUMN_KEY } from './columnResizeWidth'
import { ArtColumn } from '../../interfaces'

export const FILL_COLUMN_CODE = '$_fill_column_&'

export const tableWidthKey = 'tableWidth'

const FLEX_COLUMN_COUNT = Symbol('flexCount')

export const autoFillTableWidth = () => (pipeline: TablePipeline) => {
  const flexColumnResult = findFlexColumns(pipeline)
  const flexCount = flexColumnResult.get(FLEX_COLUMN_COUNT)

  if (flexCount) { // 设置了flex宽度，flex列平分剩余宽度
    const remainingWidth = getTableRemainingWidth(pipeline) || 0
    if (remainingWidth > 0) {
      // 保存剩余的flex总和和剩余宽度总和宽度
      let residualFlexCount = flexCount
      let residualFlexWidth = remainingWidth
      const columnSize = pipeline.getFeatureOptions(COLUMN_SIZE_KEY)
      const enableColumnResizeWidthFeature = !!columnSize
      pipeline.mapColumns(
        makeRecursiveMapper((col, recursiveFlatMapInfo) => {
          const { isLeaf } = recursiveFlatMapInfo
          if (isLeaf && isValidFlexColumn(col, pipeline)) {
            const { code, features = {} } = col
            const { flex, minWidth = 0, maxWidth = Number.MAX_SAFE_INTEGER } = features
            const usedRemainingWidth = Math.floor(remainingWidth * flex / flexCount)
            const preColWidth = col.width
            // 如果当前已经是最后一个flex列，将剩余的宽度添加到该列，其他计算相应的列
            col.width = clamp(minWidth, preColWidth + (residualFlexCount === flex ? residualFlexWidth : usedRemainingWidth), maxWidth)
            residualFlexCount -= flex
            residualFlexWidth -= (col.width - preColWidth)
            if (enableColumnResizeWidthFeature) {
              columnSize[code] = col.width
            }
          }
          return col
        })
      )
      enableColumnResizeWidthFeature && pipeline.setFeatureOptions(COLUMN_SIZE_KEY, columnSize)
    }
  } else { // 未设置了flex宽度，创建占位列
    const columns = pipeline.getColumns()
    const fillColumns = columns.find(col => col.code === FILL_COLUMN_CODE)
    const width = getTableRemainingWidth(pipeline) || 0
    if (fillColumns) {
      fillColumns.width = width
    } else {
      const rightNestedLockCount = getLeftNestedLockCount(columns.slice().reverse())
      const spliceIndex = columns.length - rightNestedLockCount
      const fillColumns = {
        name: '',
        code: FILL_COLUMN_CODE,
        width: width,
        features: {
          resizeable: false
        },
        getCellProps: (value: any, record: any, rowIndex: number) => {
          return {
            className: Classes.emptyColCell
          }
        }
      }
      columns.splice(spliceIndex || columns.length, 0, fillColumns)
    }
    pipeline.columns(columns)
  }

  return pipeline

  function findFlexColumns (pipeline: TablePipeline) {
    const result = new Map([[FLEX_COLUMN_COUNT, 0]])
    dfs(pipeline.getColumns(), result)
    return result
    function dfs (columns: ArtColumn[], result: Map<any, any>) {
      columns.forEach(col => {
        if (isLeafNode(col)) {
          if (isValidFlexColumn(col, pipeline)) {
            result.set(FLEX_COLUMN_COUNT, result.get(FLEX_COLUMN_COUNT) + col.features.flex)
          }
        } else {
          dfs(col.children, result)
        }
      })
    }
  }
}

function getColumnWidthSum (pipeline: TablePipeline) {
  return dfs(pipeline.getColumns())
  function dfs (columns: ArtColumn[]) {
    return columns.reduce((acc, col) => {
      const { width, code } = col
      if (isLeafNode(col) && code !== FILL_COLUMN_CODE) {
        const resizeColumn = pipeline.getFeatureOptions(COLUMN_SIZE_KEY)
        return acc + ((resizeColumn && resizeColumn[code]) || width)
      } else {
        return acc + dfs(col.children)
      }
    }, 0)
  }
}

function getTableRemainingWidth (pipeline: TablePipeline) {
  const tableWidth = pipeline.ref.current.domHelper?.tableBody?.clientWidth || pipeline.getStateAtKey(tableWidthKey)
  if (!tableWidth) return
  const remainingWidth = Math.floor(tableWidth - getColumnWidthSum(pipeline))
  return remainingWidth > 0 ? remainingWidth : 0
}

function isAfterLastResizeCol (column: ArtColumn, pipeline: TablePipeline) {
  const lastResizedColumnCode = pipeline.getFeatureOptions(LAST_RESIZED_COLUMN_KEY)
  if (lastResizedColumnCode === undefined) return true
  const lastResizedColumnIndex = pipeline.getColumns().findIndex(col => col.code === lastResizedColumnCode)
  const colIndex = pipeline.getColumns().findIndex(col => col.code === column.code)
  return colIndex > lastResizedColumnIndex
}

function isValidFlexColumn (col: ArtColumn, pipeline: TablePipeline) {
  const resizeColumn = pipeline.getFeatureOptions(RESIZED_COLUMN_KEY)
  // 拖拽列自动禁止flex
  if (resizeColumn?.has(col.code)) {
    return false
  }
  const flex = col.features?.flex
  return typeof flex === 'number' && flex > 0 && isAfterLastResizeCol(col, pipeline)
}

function clamp (min: number, x: number, max: number) {
  return Math.max(min, Math.min(max, x))
}
