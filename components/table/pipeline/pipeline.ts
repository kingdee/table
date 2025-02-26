import { useState, useRef } from 'react'
import { TableProps, PrimaryKey } from '../base'
import { ArtColumn, TableTransform, Transform } from '../interfaces'
import { mergeCellProps } from '../utils'
import { autoFillTableWidth, tableWidthKey } from './features/autoFill'
import { createFeatureApi } from './features/featureApi/utils'

type RowPropsGetter = TableProps['getRowProps']

interface PipelineSnapshot {
  dataSource: any[]
  columns: ArtColumn[]
  rowPropsGetters: RowPropsGetter[]
}

export interface TablePipelineIndentsConfig {
  iconIndent: number
  iconWidth: 16
  iconGap: number
  indentSize: number
}

export interface TablePipelineCtx {
  primaryKey?: PrimaryKey
  components: { [name: string]: any }
  indents: TablePipelineIndentsConfig

  [key: string]: any
}

/**
 * 表格数据处理流水线。TablePipeline 提供了表格数据处理过程中的一些上下方与工具方法，包括……
 *
 * 1. ctx：上下文环境对象，step（流水线上的一步）可以对 ctx 中的字段进行读写。
 * ctx 中部分字段名称有特定的含义（例如 primaryKey 表示行的主键），使用自定义的上下文信息时注意避开这些名称。
 *
 * 2. rowPropsGetters：getRowProps 回调队列，step 可以通过 pipeline.appendRowPropsGetter 向队列中追加回调函数，
 *   在调用 pipeline.props() 队列中的所有函数会组合形成最终的 getRowProps
 *
 * 3. 当前流水线的状态，包括 dataSource, columns, rowPropsGetters 三个部分
 *
 * 4. snapshots，调用 pipeline.snapshot(name) 可以记录当前的状态，后续可以通过 name 来读取保存的状态
 * */
export class TablePipeline {
  ref?: React.MutableRefObject<any>

  private readonly _snapshots: { [key: string]: PipelineSnapshot } = {}

  private readonly _rowPropsGetters: Array<RowPropsGetter> = []

  private _tableProps: React.HTMLAttributes<HTMLTableElement> = {}

  private _dataSource: any[]

  private _isSameInputDataSource: boolean

  private _columns: any[]

  private _footerDataSource?: any[]

  static defaultIndents: TablePipelineIndentsConfig = {
    iconIndent: -8,
    iconWidth: 16,
    iconGap: 0,
    indentSize: 16
  }

  readonly ctx: TablePipelineCtx = {
    components: {},
    indents: TablePipeline.defaultIndents
  }

  private readonly state: any

  private readonly setState: (fn: (prevState: any) => any, stateKey: string, partialState: any, extraInfo?: any) => any

  constructor ({
    state,
    setState,
    ctx,
    ref
  }: {
    state: any
    setState: TablePipeline['setState']
    ctx: Partial<TablePipelineCtx>
    ref?: React.MutableRefObject<any>
  }) {
    this.state = state
    this.setState = setState
    this.ref = ref
    Object.assign(this.ctx, ctx)
  }

  // Generate a pseudo-GUID by concatenating random hexadecimal.
  guid () {
    function S4 () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    }
    return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
  }

  appendRowPropsGetter (getter: RowPropsGetter) {
    this._rowPropsGetters.push(getter)
    return this
  }

  addTableProps (props:React.HTMLAttributes<HTMLTableElement>) {
    this._tableProps = mergeCellProps(this._tableProps as any, props as any) as any
  }

  getDataSource (name?: string) {
    if (name == null) {
      return this._dataSource
    } else {
      return this._snapshots[name].dataSource
    }
  }

  isSameInputDataSource () {
    return this._isSameInputDataSource
  }

  getColumns (name?: string) {
    if (name == null) {
      return this._columns
    } else {
      return this._snapshots[name].columns
    }
  }

  getFooterDataSource () {
    return this._footerDataSource
  }

  getStateAtKey<T = any> (stateKey: string, defaultValue?: T): T {
    return this.state[stateKey] ?? defaultValue
  }

  /** 将 stateKey 对应的状态设置为 partialState  */
  setStateAtKey (stateKey: string, partialState: any, extraInfo?: any) {
    this.setState((prev: any) => ({ ...prev, [stateKey]: partialState }), stateKey, partialState, extraInfo)
  }

  /** 确保 primaryKey 已被设置，并返回 primaryKey  */
  ensurePrimaryKey (hint?: string): PrimaryKey {
    if (this.ctx.primaryKey == null) {
      throw new Error(hint ? `使用 ${hint} 之前必须先设置 primaryKey` : '必须先设置 primaryKey')
    }
    return this.ctx.primaryKey
  }

  /** 设置流水线的输入数据 */
  input (input: { dataSource: any[]; columns: ArtColumn[] }) {
    if (this._dataSource != null || this._columns != null) {
      throw new Error('input 不能调用两次')
    }
    // 在 pipeline 中识别本次更新是否有数据变化
    this._isSameInputDataSource = input.dataSource === this.ref.current._lastInputDataSource

    this._dataSource = input.dataSource

    this.ref.current._lastInputDataSource = input.dataSource
    this.ref.current.lastPipeline = this

    this._columns = input.columns.map(col => ({ ...col, key: this.guid() }))

    this.snapshot('input')
    return this
  }

  /** 设置 dataSource */
  dataSource (rows: any[]) {
    this._dataSource = rows
    return this
  }

  /** 设置 columns */
  columns (cols: ArtColumn[]) {
    this._columns = cols
    return this
  }

  /** 设置主键 */
  primaryKey (key: PrimaryKey) {
    this.ctx.primaryKey = key
    return this
  }

  /** 设置页脚数据 */
  footerDataSource (rows: any[]) {
    this._footerDataSource = rows
    return this
  }

  /** 保存快照 */
  snapshot (name: string) {
    this._snapshots[name] = {
      dataSource: this._dataSource,
      columns: this._columns,
      rowPropsGetters: this._rowPropsGetters.slice()
    }
    return this
  }

  /** @deprecated
   *  应用一个 kd-table Table transform */
  useTransform (transform: TableTransform) {
    const next = transform({
      dataSource: this.getDataSource(),
      columns: this.getColumns()
    })
    return this.dataSource(next.dataSource).columns(next.columns)
  }

  /** 使用 pipeline 功能拓展 */
  use (step: (pipeline: this) => this) {
    return step(this)
  }

  /** 转换 dataSource */
  mapDataSource (mapper: Transform<any[]>) {
    return this.dataSource(mapper(this.getDataSource()))
  }

  /** 转换 columns */
  mapColumns (mapper: Transform<ArtColumn[]>) {
    return this.columns(mapper(this.getColumns()))
  }

  /** 获取featureOptions 内容 */
  getFeatureOptions (optionKey:string) {
    return this.ref.current.featureOptions?.[optionKey]
  }

  /** 设置pipelineOptions 内容 */
  setFeatureOptions (optionKey:string, value:any) {
    this.ref.current.featureOptions[optionKey] = value
  }

  /** 获取 BaseTable 的 props，结果中包含 dataSource/columns/primaryKey/getRowProps 四个字段 */
  getProps (this: TablePipeline) {
    this.use(autoFillTableWidth())
    const result: TableProps = {
      dataSource: this._dataSource,
      columns: this._columns
    }
    if (this.ctx.primaryKey) {
      result.primaryKey = this.ctx.primaryKey
    }

    if (this._footerDataSource) {
      result.footerDataSource = this._footerDataSource
    }

    if (this._rowPropsGetters.length > 0) {
      result.getRowProps = (row, rowIndex) => {
        return this._rowPropsGetters.reduce<any>((res, get) => {
          return mergeCellProps(res, get(row, rowIndex) as any)
        }, {})
      }
    }

    result.getTableProps = () => this._tableProps
    result.setTableWidth = (tableWidth: number) => {
      const preTableWidth = this.getStateAtKey(tableWidthKey)
      if (preTableWidth !== tableWidth) {
        tableWidth && this.setStateAtKey(tableWidthKey, tableWidth)
      }
    }
    result.setTableDomHelper = (domHelper) => {
      this.ref.current.domHelper = domHelper
    }

    result.setRowHeightManager = (rowHeightManager) => {
      this.ref.current.rowHeightManager = rowHeightManager
    }

    return result
  }

  getFeatureApi(featureName: string){
    return this.ref.current.featureApi?.[featureName]
  }
  addFeatureApi(featureName:string){
    if(!this.getFeatureApi(featureName)){
      this.ref.current.featureApi[featureName] = createFeatureApi(featureName, this)
    }
    return this.ref.current.featureApi[featureName]
  }

  getLastPipeline(){
    return this.ref.current.lastPipeline
  }
}

export function useTablePipeline (ctx?: Partial<TablePipelineCtx>) {
  const [state, setState] = useState<any>({})
  const ref = useRef<any>({ featureOptions: {}, featureApi:{} })
  return new TablePipeline({ state, setState, ctx, ref })
}