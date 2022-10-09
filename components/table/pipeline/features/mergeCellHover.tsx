import { isLeafNode, makeRecursiveMapper, mergeCellProps } from '../../utils'
import { TablePipeline } from '../pipeline'
export function mergeCellHover() {
  return (pipeline: TablePipeline) => {
    return pipeline.mapColumns(
      makeRecursiveMapper((col) => {
        if (!isLeafNode(col)) {
          return col
        }
        const prevGetCellProps = col.getCellProps
        return {
          ...col,
          getCellProps(value: any, record: any, rowIndex: number) {
            const prevCellProps = prevGetCellProps?.(value, record, rowIndex)
            return mergeCellProps(prevCellProps, {
              onMouseEnter(e: React.MouseEvent<HTMLTableCellElement, MouseEvent>) {
                const InRangeRow = pipeline.ref.current.domHelper.getInRangeRowByCellEvent(e)
                InRangeRow.forEach((row: HTMLTableRowElement) => {
                  row.classList.add('row-hover')
                })
              },
              onMouseLeave(e) {
                const InRangeRow = pipeline.ref.current.domHelper.getInRangeRowByCellEvent(e)
                InRangeRow.forEach((row: HTMLTableRowElement) => {
                  row.classList.remove('row-hover')
                })
              },
            })
          },
        }
      }),
    )
  }
}
