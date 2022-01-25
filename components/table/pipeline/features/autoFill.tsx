import { getLeftNestedLockCount } from '../../base/calculations'
import { isLeafNode, makeRecursiveMapper } from '../../utils'
import { TablePipeline } from '../pipeline'

export const FILL_COLUMN_CODE = '$_fill_column_&'

export const tableWidthKey = 'tableWidth'

const fillColumnWidthKey = 'fillColumnWidth'

export const autoFillTableWidth = () => (pipeline: TablePipeline) => {
  const width = pipeline.getStateAtKey(fillColumnWidthKey, 0)
  const columns = pipeline.getColumns()
  const fillColumns = columns.find(col => col.code === FILL_COLUMN_CODE)
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
      }
    }
    columns.splice(spliceIndex, 0, fillColumns)
  }
  pipeline.columns(columns)
  setAutoFillWidth(pipeline)
  return pipeline
}

const setAutoFillWidth = (pipeline: TablePipeline) => {
  const tableWidth = pipeline.getStateAtKey(tableWidthKey)
  if (!tableWidth) return
  let columnWidthSum = 0
  pipeline.mapColumns(makeRecursiveMapper((col) => {
    const { width, code } = col
    if (isLeafNode(col) && code !== FILL_COLUMN_CODE) {
      const resizeColumn = pipeline.getStateAtKey('columnResize')
      columnWidthSum += (resizeColumn && resizeColumn[code]) || width
    }
    return col
  }))
  let fillColumnWidth = Math.floor(tableWidth - columnWidthSum)
  fillColumnWidth = fillColumnWidth > 0 ? fillColumnWidth : 0
  const preWidth = pipeline.getStateAtKey(fillColumnWidthKey, 0)
  if (preWidth !== fillColumnWidth) {
    pipeline.setStateAtKey('fillColumnWidth', fillColumnWidth)
  }
}
