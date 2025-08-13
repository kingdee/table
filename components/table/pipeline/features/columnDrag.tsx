import { TablePipeline } from '../pipeline'
import { makeRecursiveMapper, mergeCellProps, collectNodes, isLeafNode, isSelectColumn } from '../../utils'
import { ArtColumn, CellProps } from '../../interfaces'
import { FILL_COLUMN_CODE } from './autoFill'
import { getEventCoordinates, hasMovedEnough, addPointerEventListeners, removePointerEventListeners } from './utils/touchEventUtils'

const stateKey = 'columnDrag'
const SCROLL_SIZE = 30

function disableSelect(event) {
  event.preventDefault()
}
export interface ColumnDragOptions {
  onColumnDragStopped?: (columnMoved: boolean, columns: ArtColumn[]) => void,
  onColumnDragStart?: (startColumn: ArtColumn) => void
}

function sortColumns(columns: any[], sort: any) {
  const res = new Array(columns.length)
  const lastColumns = [...columns]
  while (columns.length) {
    const cloumn = columns.pop()
    res[sort[cloumn.code]] = cloumn
  }
  if (res.filter(Boolean).length !== lastColumns.length) {
    return lastColumns
  }
  return res
}

function stopClickPropagation(e) {
  e.stopPropagation()
}

export function columnDrag(opts: ColumnDragOptions = {}) {
  return (pipeline: TablePipeline) => {
    const { cloumnsTranslateData } = pipeline.getStateAtKey(stateKey, {} as any)
    const columns = pipeline.getColumns()
    const tableBody = pipeline.ref.current.domHelper && pipeline.ref.current.domHelper.tableBody
    // if (cloumnsSortData) {
    //   columns = sortColumns(columns, cloumnsSortData)
    // }

    pipeline.columns(columns.filter(column => column))

    return pipeline.mapColumns(
      makeRecursiveMapper((col, recursiveFlatMapInfo) => {
        const { path, isLeaf } = recursiveFlatMapInfo
        const style: any = cloumnsTranslateData ? {
          transition: '.3s',
          transform: `translate3d(${cloumnsTranslateData[col.code]}px, 0px, 0px)`
        } : {}
        const prevGetCellProps = col.getCellProps
        // !col.code: 选择列 col.lock: 固定列 不允许拖拽
        if (col.lock || !col.code) return col
        return {
          ...col,
          getCellProps(value: any, record: any, rowIndex: number): CellProps {
            const prevCellProps = prevGetCellProps?.(value, record, rowIndex)
            return mergeCellProps(prevCellProps, {
              style: style as any
            })
          },
          headerCellProps: mergeCellProps(col.headerCellProps, {
            // 通用的拖拽处理逻辑
            ...((isLeaf && path.length === 1) ? {
              onMouseDown: (e: React.MouseEvent<HTMLElement>) => {
                if (e.button !== 0 || !e.currentTarget.contains(e.target as HTMLElement)) {
                  return
                }
                handlePointerDown(e.nativeEvent, false, e.currentTarget as HTMLElement)
              },
              onTouchStart: (e: React.TouchEvent<HTMLElement>) => {
                // 阻止触摸事件的默认行为
                if (e.cancelable) {
                  e.preventDefault()
                }
                handlePointerDown(e.nativeEvent, true, e.currentTarget as HTMLElement)
              },
              style:style
            } : {})
          })
        }
        // 统一的拖拽处理函数
        function handlePointerDown(startEvent: MouseEvent | TouchEvent, isTouch: boolean, currentTarget: HTMLElement) {
          window.addEventListener('selectstart', disableSelect)
          let columnMoved = false
          const columns = pipeline.getColumns()
          let { cloumnsTranslateData } = pipeline.getStateAtKey(stateKey, {} as any)
          const cloumnsSortData = {}
          columns.forEach((item, index) => {
            cloumnsSortData[item.code] = index
          })

          const rect = currentTarget.parentElement?.getClientRects()[0]
          if (!rect) return
          const startX = rect.left
          const startCoordinates = getEventCoordinates(startEvent)
          const mouseDownClientX = startCoordinates.clientX
          const mouseDownClientY = startCoordinates.clientY
          let moveData = []

          const allColumns = collectNodes(columns)
          const tableBodyClientRect = tableBody.getBoundingClientRect()
          const startScrollLeft = pipeline.ref.current.domHelper.virtual.scrollLeft

          const updateScrollPosition = (client: { clientX: number; clientY: number }) => {
            const { clientX } = client
            const { left, width } = tableBodyClientRect
            if (clientX + SCROLL_SIZE >= left + width) {
              pipeline.ref.current.domHelper.virtual.scrollLeft += SCROLL_SIZE
            }
            if (clientX - SCROLL_SIZE <= left) {
              pipeline.ref.current.domHelper.virtual.scrollLeft -= SCROLL_SIZE
            }
          }

          function handlePointerMove(e: MouseEvent | TouchEvent) {
            // 触摸事件需要阻止默认行为，防止页面滚动
            if (isTouch && e.cancelable) {
              e.preventDefault()
            }
            const coordinates = getEventCoordinates(e)
            const client = {
              clientX: coordinates.clientX,
              clientY: coordinates.clientY
            }
            const scrollDistance = pipeline.ref.current.domHelper.virtual.scrollLeft - startScrollLeft
            const leftPosition = startX - scrollDistance // 表头最左边起点
            updateScrollPosition(client)
            if (coordinates.clientX - leftPosition < 20) {
              return
            } else {
              e.stopPropagation()
            }
            document.body.style.userSelect = 'none'
            currentTarget.style.cursor = 'move'

            // 重置位置信息
            cloumnsTranslateData = {}
            allColumns.forEach((item) => {
              cloumnsTranslateData[item.code] = 0
            })

            // 计算平移位置
            let replaceIndex = 0

            let totalWitdth = getColumnWidth(columns[replaceIndex])
            while (totalWitdth < coordinates.clientX - leftPosition && replaceIndex < columns.length - 1) {
              replaceIndex++
              totalWitdth += getColumnWidth(columns[replaceIndex])
            }

            // 需要取最新startIndex, 不能直接用makeRecursiveMapper提供的startIndex（因为map时还没添加选择列、充满列等后面use添加的列）
            let startIndex
            columns.forEach((column, index) => {
              if (column.code === col.code) {
                startIndex = index
              }
            })

            const optionColumn = columns[startIndex]
            let index = replaceIndex
            if (startIndex > replaceIndex) { // 左移
              while (index < startIndex) {
                const { code, lock, width, children } = columns[index]
                if (enableMove({ code, lock })) {
                  cloumnsTranslateData[code] += optionColumn.width
                  if (isLeafNode(columns[index])) {
                    cloumnsTranslateData[optionColumn.code] -= width
                  } else {
                    cloumnsTranslateData[optionColumn.code] -= getColumnWidth(columns[index])
                    moveAllChildren(children, cloumnsTranslateData, optionColumn.width)
                  }
                  columnMoved = true
                }
                index++
              }
            } else if (startIndex < replaceIndex) { // 右移
              while (startIndex < index) {
                const { code, lock, width, children } = columns[index]
                if (enableMove({ code, lock })) {
                  cloumnsTranslateData[code] -= optionColumn.width
                  if (isLeafNode(columns[index])) {
                    cloumnsTranslateData[optionColumn.code] += width
                  } else {
                    cloumnsTranslateData[optionColumn.code] += getColumnWidth(columns[index])
                    moveAllChildren(children, cloumnsTranslateData, optionColumn.width, true)
                  }
                  columnMoved = true
                }
                index--
              }
            }

            window.requestAnimationFrame(() => {
              pipeline.setStateAtKey(stateKey, {
                cloumnsTranslateData
              })
              moveData = [startIndex, replaceIndex]
            })
          }

          function handlePointerUp(e: MouseEvent | TouchEvent) {
            removePointerEventListeners(document.body, {
              onPointerMove: handlePointerMove,
              onPointerUp: handlePointerUp
            }, isTouch)
            window.removeEventListener('selectstart', disableSelect)

            const endCoordinates = getEventCoordinates(e)
            if (hasMovedEnough(mouseDownClientX, mouseDownClientY, endCoordinates.clientX, endCoordinates.clientY)) {
              e.stopPropagation() // 存在移动就阻止冒泡
              currentTarget.addEventListener('click', stopClickPropagation) // 阻止列头点击事件，防止拖动后触发列头过滤事件
            }
            window.requestAnimationFrame(() => {
              // 取消阻止列头点击事件
              currentTarget.removeEventListener('click', stopClickPropagation)
              currentTarget = null

              const [startIndex, replaceIndex] = moveData
              const optionColumn = columns[startIndex]
              let index = replaceIndex
              if (startIndex > replaceIndex) { // 左移
                while (index < startIndex) {
                  const { code, lock } = columns[index]
                  if (enableMove({ code, lock })) {
                    cloumnsSortData[code] += 1
                    cloumnsSortData[optionColumn.code] -= 1
                    columnMoved = true
                  }
                  index++
                }
              } else if (startIndex < replaceIndex) { // 右移
                while (index > startIndex) {
                  const { code, lock } = columns[index]
                  if (enableMove({ code, lock })) {
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
                const isRowDragColumn = (code: string) => {
                  const rowDragColumnKey = pipeline.getFeatureOptions('rowDragColumnKey')
                  return code === rowDragColumnKey
                }
                const newColumns = sortColumns(columns, cloumnsSortData).filter((column) => column.code !== FILL_COLUMN_CODE && !isRowDragColumn(column.code) && !isSelectColumn(column))
                // TODO drag需要在resize之后use,否则这里返回的列对应的宽度不是拖拽后的
                onColumnDragStopped(columnMoved, newColumns)
              }
              pipeline.setStateAtKey(stateKey, {
                cloumnsTranslateData: null
              })
            })
            document.body.style.userSelect = ''
            currentTarget.style.opacity = ''
            currentTarget.style.cursor = ''
          }

          const { onColumnDragStart } = opts
          onColumnDragStart && onColumnDragStart(col)

          addPointerEventListeners(document.body, {
            onPointerMove: handlePointerMove,
            onPointerUp: handlePointerUp
          }, isTouch)
        }
      })
    )
  }
}

function enableMove({ lock, code }) {
  return code && code !== FILL_COLUMN_CODE && !lock
}

function getColumnWidth(col: ArtColumn): number {
  if (col.children) {
    return col.children.reduce((acc, col) => {
      return acc + getColumnWidth(col)
    }, 0)
  }
  return col.width
}

function moveAllChildren(cols: ArtColumn[], cloumnsTranslateData, width: number, isMinus?: boolean) {
  cols.forEach(col => {
    const { code, children } = col
    const movedWidth = cloumnsTranslateData[code] ?? 0
    cloumnsTranslateData[code] = movedWidth + (isMinus ? -width : width)
    if (!isLeafNode(col)) {
      moveAllChildren(children, cloumnsTranslateData, width)
    }
  })
}

function _isMoveWhenClicking(mouseDownClientX: number, mouseDownClientY: number, mouseUpClientX: number, mouseUpClientY: number): boolean {
  const xDiff = mouseUpClientX - mouseDownClientX
  const yDiff = mouseUpClientY - mouseDownClientY
  // 鼠标点按和松开的偏移量大于5px，认为存在移动
  if (Math.sqrt(xDiff * xDiff + yDiff * yDiff) > 5) {
    return true
  }
  return false
}
