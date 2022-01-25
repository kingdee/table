import { TablePipeline } from '../pipeline'
import { makeRecursiveMapper, mergeCellProps, collectNodes } from '../../utils'
import { ArtColumn, CellProps } from '../../interfaces'
import { FILL_COLUMN_CODE } from './autoFill'

const stateKey = 'columnDrag'

export interface ColumnDragOptions {
  onColumnDragStopped?: (columnMoved: boolean, columns: ArtColumn[]) => void
}

function sortColumns (cloumns: any[], sort: any) {
  const res = new Array(cloumns.length)
  while (cloumns.length) {
    const cloumn = cloumns.pop()
    res[sort[cloumn.code]] = cloumn
  }
  return res
}

export function columnDrag (opts: ColumnDragOptions = {}) {
  return (pipeline: TablePipeline) => {
    const { cloumnsSortData, cloumnsTranslateData } = pipeline.getStateAtKey(stateKey, {} as any)
    let columns = pipeline.getColumns()
    if (cloumnsSortData) {
      columns = sortColumns(columns, cloumnsSortData)
    }

    pipeline.columns(columns.filter(column => column))

    return pipeline.mapColumns(
      makeRecursiveMapper((col) => {
        const style: any = cloumnsTranslateData ? {
          transition: '.3s',
          transform: `translate3d(${cloumnsTranslateData[col.code]}px, 0px, 0px)`
        } : {}
        const prevGetCellProps = col.getCellProps
        // !col.code: 选择列 col.lock: 固定列 不允许拖拽
        if (col.lock || !col.code) return col
        return {
          ...col,
          getCellProps (value: any, record: any, rowIndex: number): CellProps {
            const prevCellProps = prevGetCellProps?.(value, record, rowIndex)
            return mergeCellProps(prevCellProps, {
              style: style as any
            })
          },
          headerCellProps: mergeCellProps(col.headerCellProps, {
            onMouseDown: (e) => {
              if (e.button !== 0) {
                return
              }
              // const cx = e.clientX
              // const width = col.width
              // const a = startIndex
              // const b = endIndex
              // const newColumnDragData = [...columnDragData]
              // let newColumn = [...columns]
              // let newStartIndex = startIndex
              // let endIdx = endIndex
              let columnMoved = false
              let columns = pipeline.getColumns()
              let { cloumnsSortData, cloumnsTranslateData } = pipeline.getStateAtKey(stateKey, {} as any)
              if (cloumnsSortData) {
                columns = sortColumns(columns, cloumnsSortData)
              } else {
                cloumnsSortData = {}
                columns.forEach((item, index) => {
                  cloumnsSortData[item.code] = index
                })
              }

              let currentTarget = e.currentTarget as HTMLElement
              const rect = (e.currentTarget as HTMLElement).parentElement.getClientRects()[0]
              const startX = rect.left
              let moveData = []
              function handleMouseMove (e) {
                if (e.clientX - startX < 20) {
                  return
                } else {
                  e.stopPropagation()
                }
                document.body.style.userSelect = 'none'
                currentTarget.style.cursor = 'move'
                // 计算平移位置
                let replaceIndex = 0
                let totalWitdth = columns[replaceIndex].width
                while (totalWitdth < e.clientX - startX && replaceIndex < columns.length - 1) {
                  replaceIndex++
                  totalWitdth += columns[replaceIndex].width
                }
                // 重置位置信息
                cloumnsTranslateData = {}
                columns.forEach((item) => {
                  cloumnsTranslateData[item.code] = 0
                })
                // 循环计算每一个的位置
                // if (startIndex !== replaceIndex) {
                //   const optionColumn = columns[startIndex]
                //   const move = startIndex > replaceIndex ? 1 : -1
                //   let index = Math.min(startIndex, replaceIndex)
                //   while (index < Math.max(startIndex, replaceIndex)) {
                //     const code = columns[index].code
                //     cloumnsTranslateData[code] += move * optionColumn.width
                //     cloumnsTranslateData[optionColumn.code] -= move * optionColumn.width
                //     index += move
                //   }
                // }

                // const opColumn = columns[startIndex]
                // let index = Math.min(startIndex, replaceIndex)
                // while (index <= Math.max(startIndex, replaceIndex)) {
                //   const code = columns[index].code
                //   if (index !== startIndex && index !== replaceIndex) {
                //     cloumnsTranslateData[code] += opColumn.width * (index > startIndex ? -1 : 1)
                //     cloumnsTranslateData[opColumn.code] += columns[index].width * (index < startIndex ? -1 : 1)
                //   }
                //   index++
                // }

                // 需要取最新startIndex, 不能直接用makeRecursiveMapper提供的startIndex（因为map时还没添加选择列、充满列等后面use添加的列）
                let startIndex
                const leafColumns = collectNodes(collectNodes(columns, 'leaf-only'))
                leafColumns.forEach((column, index) => {
                  if (column.code === col.code) {
                    startIndex = index
                  }
                })
                const optionColumn = columns[startIndex]
                let index = replaceIndex
                if (startIndex > replaceIndex) { // 左移
                  while (index < startIndex) {
                    const code = columns[index].code
                    if (code && code !== FILL_COLUMN_CODE && !columns[index].lock) {
                      cloumnsTranslateData[code] += optionColumn.width
                      cloumnsTranslateData[optionColumn.code] -= columns[index].width
                      columnMoved = true
                    }
                    index++
                  }
                } else if (startIndex < replaceIndex) { // 右移
                  while (startIndex < index) {
                    const code = columns[index].code
                    if (code && code !== FILL_COLUMN_CODE && !columns[index].lock) {
                      cloumnsTranslateData[code] -= optionColumn.width
                      cloumnsTranslateData[optionColumn.code] += columns[index].width
                      columnMoved = true
                    }
                    index--
                  }
                } else { // 不动或者移动回原位

                }

                window.requestAnimationFrame(() => {
                  pipeline.setStateAtKey(stateKey, {
                    cloumnsSortData,
                    cloumnsTranslateData
                  })
                  moveData = [startIndex, replaceIndex]
                })
              }
              function handleMouseUp (e) {
                e.stopPropagation()
                document.body.removeEventListener('mousemove', handleMouseMove)
                document.body.removeEventListener('mouseup', handleMouseUp)
                window.requestAnimationFrame(() => {
                  const [startIndex, replaceIndex] = moveData
                  const optionColumn = columns[startIndex]
                  // const move = startIndex > replaceIndex ? 1 : -1
                  // let index = Math.min(startIndex, replaceIndex)
                  // while (index < Math.max(startIndex, replaceIndex) && index > 0) {
                  //   const code = columns[index].code
                  //   cloumnsSortData[optionColumn.code] -= move
                  //   cloumnsSortData[code] += move
                  //   index += move
                  // }
                  let index = replaceIndex
                  if (startIndex > replaceIndex) { // 左移
                    while (index < startIndex) {
                      const code = columns[index].code
                      if (code && code !== FILL_COLUMN_CODE && !columns[index].lock) {
                        cloumnsSortData[code] += 1
                        cloumnsSortData[optionColumn.code] -= 1
                        columnMoved = true
                      }
                      index++
                    }
                  } else if (startIndex < replaceIndex) { // 右移
                    while (index > startIndex) {
                      const code = columns[index].code
                      if (code && code !== FILL_COLUMN_CODE && !columns[index].lock) {
                        cloumnsSortData[code] -= 1
                        cloumnsSortData[optionColumn.code] += 1
                        columnMoved = true
                      }
                      index--
                    }
                  }
                  const { onColumnDragStopped } = opts
                  // 拖拽结束返回列顺序
                  if (onColumnDragStopped) {
                    const newColumns = sortColumns(columns, cloumnsSortData).filter(({ code }) => code !== FILL_COLUMN_CODE)
                    // TODO drag需要在resize之后use,否则这里返回的列对应的宽度不是拖拽后的
                    onColumnDragStopped(columnMoved, newColumns)
                  }
                  pipeline.setStateAtKey(stateKey, {
                    cloumnsSortData,
                    cloumnsTranslateData: null
                  })
                })
                document.body.style.userSelect = ''
                currentTarget.style.opacity = ''
                currentTarget.style.cursor = ''
                currentTarget = null
              }
              document.body.addEventListener('mousemove', handleMouseMove)
              document.body.addEventListener('mouseup', handleMouseUp)
              document.body.onselectstart = function () {
                return false
              }
            },
            style
          })
        }
      })
    )
  }
}
