import React,{ReactNode} from 'react'
import cx from 'classnames'

import { ArtColumn, Filters, FilterPanel, FilterItem } from '../../interfaces'
import { internals } from '../../internals'
import { isLeafNode, mergeCellProps, collectNodes } from '../../utils'
import { TablePipeline } from '../pipeline'
import { Filter, DEFAULT_FILTER_OPTIONS } from './filter'
import { Classes } from '../../base/styles'

export interface FilterFeatureOptions {
  /** (非受控用法) 默认的过滤字段列表 */
  defaultFilters?: Filters

  /** (受控用法) 过滤字段列表 */
  filters?: Filters

  /** 更新过滤字段列表的回调函数 */
  onChangeFilters?(nextFilters: Filters, currentFilter:FilterItem): void
  /** 是否保持 dataSource 不变 */
  keepDataSource?: boolean

  /** 过滤模式。单列过滤 single，多列过滤 multiple，默认为多选 */
  mode?: 'single' | 'multiple'

  /**过滤图标 */
  filterIcon?:ReactNode

  /** 是否对触发弹出过滤面板 的 click 事件调用 event.stopPropagation() */
  stopClickEventPropagation?: boolean
}

const stateKey = 'filter'

export function filter(opts: FilterFeatureOptions = {}) {
  return function step(pipeline: TablePipeline) {
    const dataSource = pipeline.getDataSource()
    const columns = pipeline.getColumns()

    const {
      filters,
      defaultFilters,
      onChangeFilters,
      keepDataSource,
      mode,
      filterIcon,
      stopClickEventPropagation
    } = opts

    let inputFilters = filters ?? pipeline.getStateAtKey(stateKey) ?? defaultFilters ?? []
    inputFilters = mode === 'single' ? inputFilters.slice(0, 1) : inputFilters
    const inputFiltersMap = new Map(inputFilters.map((filterItem) => [filterItem.code, { ...filterItem }]))

    function processColumns(columns: ArtColumn[]) {
      return columns.map(dfs)

      function dfs(col: ArtColumn): ArtColumn {
        const result = { ...col }

        const filterable = col.code && col.features?.filterable
        const filterActive = filterable && inputFiltersMap?.get(col.code)?.filter?.length > 0

        if (filterable) {

          const handleFilterChanged = function (filterItem?: FilterItem) {
            let nextFiltersMap = new Map(inputFiltersMap)
            const currentFilter = { code: col.code, ...filterItem }
            if (filterItem == null) {
              nextFiltersMap.delete(col.code)
            } else {
              if (mode === 'single') {
                nextFiltersMap.clear()
              }
              nextFiltersMap.set(col.code, currentFilter)
            }
            const nextFilters = Array.from(nextFiltersMap.values())
            onChangeFilters?.(nextFilters, currentFilter)
            pipeline.setStateAtKey(stateKey, nextFilters)
          }

          const setFilter = (filter?: any[], filterCondition?:string) => {
            handleFilterChanged(!filter ? undefined : { code: col.code, filter, filterCondition })
          }

          const filterPanel: FilterPanel = col.features?.filterPanel

          result.title = [
            ...([].concat(result.title ?? [internals.safeRenderHeader({ ...col, title: null })])),
            (
              <Filter
                key="filter"
                FilterPanelContent={filterPanel}
                filterIcon={filterIcon}
                filterModel={inputFiltersMap.get(col.code)}
                setFilterModel={handleFilterChanged}
                setFilter={setFilter}
                isFilterActive={filterActive}
                className={cx({
                  [Classes.tableFilterTrigger]: true,
                  active: filterActive
                })}
                stopClickEventPropagation={stopClickEventPropagation}
              />
            )
          ]
          // result.headerCellProps = mergeCellProps(col.headerCellProps, {
          //   style: {
          //     paddingRight: '18px'
          //   }
          // })
        }

        if (!isLeafNode(col)) {
          result.children = col.children.map(dfs)
        }

        return result
      }
    }

    function processDataSource(dataSource: any[]) {
      let filtersKeys = []
      inputFiltersMap.forEach((value, key) => {
        filtersKeys.push(key)
      })

      if (keepDataSource || filtersKeys.length <= 0) {
        return dataSource
      }

      const columns = pipeline.getColumns()
      const columnsMap = new Map(
        collectNodes(columns, 'leaf-only')
          .filter((col) => col.features?.filterable !== false && col.features?.filterable != null)
          .map((col) => [col.code, col])
      )

      const defaultFilterOptionsMap = new Map(DEFAULT_FILTER_OPTIONS.map(item => [item.key, { ...item }]))

      function isMatchedFilterCondition(record) {
        return !filtersKeys.some(key => {
          const filterItem = inputFiltersMap.get(key)
          const filterable = columnsMap.get(key)?.features?.filterable
          let comparisonFn
          if(typeof filterable === 'function'){
            comparisonFn = filterable
          }else if(defaultFilterOptionsMap.get(filterItem.filterCondition)){
            comparisonFn = defaultFilterOptionsMap.get(filterItem.filterCondition).filter
          }else{
            console.warn(`列[${key}]未配置筛选函数，请设置 column.features.filterable 来作为该列的筛选函数, 目前使用默认包含筛选函数`)
            comparisonFn = defaultFilterOptionsMap.get('contain').filter
          }
          return !comparisonFn(filterItem.filter)(record[key])//不符合过滤条件,退出循环
        })
      }

      return dataSource.reduce((pre, record) => {
        if (isMatchedFilterCondition(record)) {
          return pre.concat([record])
        }
        return pre
      }, [])
    }

    pipeline.dataSource(processDataSource(dataSource))
    pipeline.columns(processColumns(columns))
    return pipeline
  }
}


