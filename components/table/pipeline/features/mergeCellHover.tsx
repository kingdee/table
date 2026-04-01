import { isLeafNode, makeRecursiveMapper, mergeCellProps } from '../../utils'
import { TablePipeline } from '../pipeline'
export function mergeCellHover () {
  return (pipeline: TablePipeline) => {
    const onMouseEnter = (e: React.MouseEvent<HTMLTableCellElement, MouseEvent>) => {
      const InRangeRow = pipeline.ref.current.domHelper.getInRangeRowByCellEvent(e)
      InRangeRow.forEach((row: HTMLTableRowElement) => {
        row.classList.add('row-hover')
      })
    }
    const onMouseLeave = (e: React.MouseEvent<HTMLTableCellElement, MouseEvent>) => {
      const InRangeRow = pipeline.ref.current.domHelper.getInRangeRowByCellEvent(e)
      InRangeRow.forEach((row: HTMLTableRowElement) => {
        row.classList.remove('row-hover')
      })
    }
    const hoverHandlers = { onMouseEnter, onMouseLeave }

    return pipeline.mapColumns(
      makeRecursiveMapper((col) => {
        if (!isLeafNode(col)) {
          return col
        }
        const prevGetCellProps = col.getCellProps
        return {
          ...col,
          getCellProps (value: any, record: any, rowIndex: number) {
            // 大多数列没有自定义 getCellProps，直接返回静态 handlers 避免 mergeCellProps 开销
            if (!prevGetCellProps) return hoverHandlers
            const prevCellProps = prevGetCellProps(value, record, rowIndex)
            if (!prevCellProps) return hoverHandlers
            return mergeCellProps(prevCellProps, hoverHandlers)
          }
        }
      })
    )
  }
}
