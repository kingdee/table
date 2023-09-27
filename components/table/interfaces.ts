import React, { ReactNode } from 'react'

export type ArtColumnAlign = 'left' | 'center' | 'right'

export type ArtColumnVerticalAlign = 'top' | 'bottom' | 'middle'

export type CellProps = React.TdHTMLAttributes<HTMLTableCellElement>

export interface ArtColumnStaticPart {
  /** 列的名称 */
  name: string

  /** 列的唯一标识 */
  // key?: string

  /** 在数据中的字段 code */
  code?: string

  /** 列标题的展示名称；在页面中进行展示时，该字段将覆盖 name 字段 */
  title?: ReactNode[] | ReactNode

  /** 列的宽度，如果该列是锁定的，则宽度为必传项 */
  width?: number

  /** 单元格中的文本或内容的 对其方向 */
  align?: ArtColumnAlign

  /** 单元格中的文本或内容的 垂直水平轴对其方向 */
  verticalAlign?: ArtColumnVerticalAlign

  /** @deprecated 是否隐藏 */
  hidden?: boolean

  /** 是否锁列 */
  lock?: boolean

  /** 是否允许拖拽 */
  // dragable?: boolean

  /** 表头单元格的 props */
  headerCellProps?: CellProps

  /** 功能开关 */
  features?: { [key: string]: any },
}

export interface Features {

  /** 是否开启排序功能 */
  sortable?: boolean

  /** 是否开启过滤功能 */
  filterable?: boolean

  /** */


}

export interface ArtColumnDynamicPart {
  /** 自定义取数方法 */
  getValue?(row: any, rowIndex: number): any

  /** 自定义渲染方法 */
  render?(value: any, row: any, rowIndex: number): ReactNode

  /** 自定义的获取单元格 props 的方法 */
  getCellProps?(value: any, row: any, rowIndex: number): CellProps

  /** 自定义的获取单元格 SpanRect 方法 */
  getSpanRect?(value: any, row: any, rowIndex: number): SpanRect
}

export interface ArtColumn extends ArtColumnStaticPart, ArtColumnDynamicPart {
  /** 该列的子节点 */
  children?: ArtColumn[]
}

/** SpanRect 用于描述合并单元格的边界
 * 注意 top/left 为 inclusive，而 bottom/right 为 exclusive */
export interface SpanRect {
  top: number
  bottom: number
  left: number
  right: number
}

export interface AbstractTreeNode {
  children?: AbstractTreeNode[]
}

export type SortOrder = 'desc' | 'asc' | 'none'

export type SortItem = { code: string; order: SortOrder }

export interface FilterItem {
  filter:any[]
  code?:string,
  filterCondition?:string
}
export type Filters = FilterItem[]


export type Transform<T> = (input: T) => T

export type TableTransform = Transform<{
  columns: ArtColumn[]
  dataSource: any[]
}>

export interface HoverRange {
  start: number
  end: number
}

export interface ColumnResizeItem {
  width: number
  index: number
}

export interface FilterPanelProps  {
  isFilterActive:boolean
  hidePanel():void
}

export interface DefaultFilterPanelProps extends FilterPanelProps{
  setFilterModel(filterItem?: Pick<FilterItem, 'filter'| 'filterCondition'>): void
  filterModel: FilterItem
  localeText: {[key:string]: string}
}

export interface CustomeFilterPanelProps extends FilterPanelProps{
  setFilter(filter?: any[]):void
  filterModel:FilterItem
}




export type FilterPanel = React.ComponentType<DefaultFilterPanelProps|CustomeFilterPanelProps >
