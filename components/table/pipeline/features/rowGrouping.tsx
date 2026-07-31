import cx from 'classnames'
import React from 'react'
import { ExpansionCell, icons, InlineFlexCell } from '../../common-views'
import { ArtColumn } from '../../interfaces'
import { internals } from '../../internals'
import { collectNodes, mergeCellProps } from '../../utils'
import { TablePipeline } from '../pipeline'
import { Classes } from '../../base'

// ==================== 类型定义 ====================

export interface GroupInfo {
  /** 是否启用分组 */
  grouped: boolean
  /** 分组头定义数组 */
  groupHeaders: GroupHeader[]
}

export interface GroupHeader {
  /** 分组层级，从1开始 */
  level: number
  /** 分组字段标识 */
  fieldKey: string
  /** 分组显示名称 */
  displayName: string
  /** 子分组（嵌套分组） */
  children?: GroupHeader[]
  /** 是否折叠 */
  collapsed: boolean
  /** 该分组包含的数据行索引 */
  rowIndexes: number[]
  /** 分组汇总值，key 为字段标识，value 为汇总结果 */
  subtotals: Record<string, string | number>
}

export interface GroupRowMeta {
  /** 是否为分组头行 */
  isGroupHeader: true
  /** 分组层级 */
  level: number
  /** 分组显示名称 */
  displayName: string
  /** 分组字段标识 */
  fieldKey: string
  /** 是否可展开（有子行或子分组） */
  expandable: boolean
  /** 是否展开 */
  expanded: boolean
  /** 分组汇总值 */
  subtotals: Record<string, string | number>
  /** 分组唯一标识 */
  groupKey: string
}

export interface RowGroupingFeatureOptions {
  /** 分组信息（来自后端） */
  groupInfo: GroupInfo

  /** 受控用法：当前展开的分组 keys */
  openKeys?: string[]

  /** 受控用法：展开 keys 改变的回调 */
  onChangeOpenKeys?(nextKeys: string[], key: string, action: 'expand' | 'collapse'): void

  /** 非受控用法：默认展开的分组 keys（不传则使用后端 collapsed 字段） */
  defaultOpenKeys?: string[]

  /** 是否对触发展开/收拢的 click 事件调用 event.stopPropagation() */
  stopClickEventPropagation?: boolean

  /** 分组行样式类名 */
  groupRowClassName?: string | ((groupHeader: GroupHeader, level: number) => string)

  /** 自定义分组行渲染 */
  renderGroupRow?: (groupHeader: GroupHeader, expandIcon: React.ReactNode) => React.ReactNode

  /** 自定义汇总值渲染 */
  renderSubtotal?: (value: string | number, fieldKey: string, groupHeader: GroupHeader) => React.ReactNode
}

// ==================== Symbol & 工具函数 ====================

export const groupMetaSymbol = Symbol('group-row-meta')

/** 判断某行是否为分组行 */
export function isGroupRow(row: any): boolean {
  return row?.[groupMetaSymbol]?.isGroupHeader === true
}

/** 获取分组行元信息，非分组行返回 null */
export function getGroupRowMeta(row: any): GroupRowMeta | null {
  const meta = row?.[groupMetaSymbol]
  if (meta?.isGroupHeader) {
    return meta as GroupRowMeta
  }
  return null
}

// ==================== 内部辅助函数 ====================

/** 根据后端 collapsed 字段计算默认展开 keys */
function getDefaultOpenKeysFromGroupInfo(groupInfo: GroupInfo): string[] {
  const keys: string[] = []
  function walk(headers: GroupHeader[], parentKey: string) {
    headers.forEach((header, index) => {
      const groupKey = generateGroupKey(header, index, parentKey)
      if (!header.collapsed) {
        keys.push(groupKey)
      }
      if (header.children) {
        walk(header.children, groupKey + '/')
      }
    })
  }
  walk(groupInfo.groupHeaders, '')
  return keys
}

/** 生成分组的唯一 key */
function generateGroupKey(header: GroupHeader, index: number, parentKey: string): string {
  return `${parentKey}${header.fieldKey}_${header.displayName}_${index}`
}

/** 构建分组行与数据行的混合列表 */
function buildGroupedDataSource(
  groupHeaders: GroupHeader[],
  rows: any[],
  openKeySet: Set<string>,
  parentKey: string,
  primaryKey: string | ((record: any) => string)
): any[] {
  const result: any[] = []

  groupHeaders.forEach((header, index) => {
    const groupKey = generateGroupKey(header, index, parentKey)
    const expanded = openKeySet.has(groupKey)

    // 插入分组头行，确保分组行具有 primaryKey 字段
    const groupRow: any = {
      [groupMetaSymbol]: {
        isGroupHeader: true,
        level: header.level,
        displayName: header.displayName,
        fieldKey: header.fieldKey,
        expandable: (header.rowIndexes?.length > 0) || (header.children?.length > 0),
        expanded,
        subtotals: header.subtotals ?? {},
        groupKey
      } as GroupRowMeta,
      __group_key__: groupKey
    }
    // 将 groupKey 设置到 primaryKey 对应的字段，确保 React key 唯一
    if (typeof primaryKey === 'string') {
      groupRow[primaryKey] = groupKey
    }
    result.push(groupRow)

    // 展开时插入子内容
    if (expanded) {
      // 先递归处理子分组
      if (header.children?.length > 0) {
        const childRows = buildGroupedDataSource(header.children, rows, openKeySet, groupKey + '/', primaryKey)
        result.push(...childRows)
      }
      // 再插入该分组直属的数据行
      if (header.rowIndexes?.length > 0) {
        header.rowIndexes.forEach((rowIdx) => {
          if (rows[rowIdx] != null) {
            result.push(rows[rowIdx])
          }
        })
      }
    }
  })

  return result
}

// ==================== Feature 主函数 ====================

export function rowGrouping(opts: RowGroupingFeatureOptions) {
  return (pipeline: TablePipeline) => {
    const stateKey = 'rowGrouping'
    const { groupInfo } = opts

    // 未启用分组，直接返回
    if (!groupInfo?.grouped || !groupInfo.groupHeaders?.length) {
      return pipeline
    }

    const primaryKey = pipeline.ensurePrimaryKey('rowGrouping')
    const indents = pipeline.ctx.indents

    // 计算展开状态
    const defaultOpenKeys = getDefaultOpenKeysFromGroupInfo(groupInfo)
    const openKeys: string[] =
      opts.openKeys ??
      pipeline.getStateAtKey(stateKey) ??
      opts.defaultOpenKeys ??
      defaultOpenKeys
    const openKeySet = new Set(openKeys)

    const onChangeOpenKeys = (nextKeys: string[], key: string, action: 'expand' | 'collapse') => {
      opts.onChangeOpenKeys?.(nextKeys, key, action)
      pipeline.setStateAtKey(stateKey, nextKeys, { key, action })
    }

    const toggle = (groupKey: string) => {
      const expanded = openKeySet.has(groupKey)
      if (expanded) {
        onChangeOpenKeys(
          openKeys.filter((k) => k !== groupKey),
          groupKey,
          'collapse'
        )
      } else {
        onChangeOpenKeys([...openKeys, groupKey], groupKey, 'expand')
      }
    }

    return pipeline
      .mapDataSource(processDataSource)
      .mapColumns(processColumns)
      .appendRowPropsGetter(groupRowPropsGetter)

    // ---------- 数据源处理 ----------
    function processDataSource(input: any[]): any[] {
      return buildGroupedDataSource(groupInfo.groupHeaders, input, openKeySet, '', primaryKey)
    }

    // ---------- 列配置处理 ----------
    function processColumns(columns: ArtColumn[]): ArtColumn[] {
      if (columns.length === 0) {
        return columns
      }

      const columnFlatCount = collectNodes(columns, 'leaf-only').length
      const [firstCol, ...others] = columns

      // 找到有汇总值的列索引
      const subtotalColIndexMap = new Map<string, number>()
      const flatCols = collectNodes(columns, 'leaf-only')
      flatCols.forEach((col, idx) => {
        if (col.code) {
          subtotalColIndexMap.set(col.code, idx)
        }
      })

      // 找到第一个汇总列的索引，分组行名称从 col 0 跨到该列之前
      function getFirstSubtotalColIndex(meta: GroupRowMeta): number {
        const entries = Object.keys(meta.subtotals)
        let minIdx = columnFlatCount
        for (const key of entries) {
          const idx = subtotalColIndexMap.get(key)
          if (idx != null && idx < minIdx) {
            minIdx = idx
          }
        }
        return minIdx
      }

      const render = (value: any, row: any, rowIndex: number) => {
        const meta = getGroupRowMeta(row)

        // 非分组行：使用原始渲染
        if (!meta) {
          return internals.safeRender(firstCol, row, rowIndex)
        }

        // 分组行渲染
        const { expanded, expandable, level, groupKey } = meta
        const expandCls = expanded ? Classes.expanded : Classes.collapsed

        const expandIcon = expandable
          ? (
            <icons.GroupExpand
              className={cx('expansion-icon', expandCls)}
              style={{
                cursor: 'pointer',
                marginRight: 8,
                width: 14,
                height: 14,
                fill: '#666',
                transition: 'transform 200ms',
                transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)'
              }}
            />
          )
          : null

        // 自定义渲染
        if (opts.renderGroupRow) {
          return opts.renderGroupRow(
            { ...meta, subtotals: meta.subtotals } as any as GroupHeader,
            expandIcon
          )
        }

        // 默认渲染：展开图标 + 显示名称（仅文本区域带背景色，滚动时只有文本覆盖汇总值时才遮挡）
        const groupBgColor = meta.level === 1 ? '#F7F8FA' : '#F1F4F6'
        return (
          <ExpansionCell
            className={cx('expansion-cell', expandCls)}
            style={{
              paddingRight: 8,
              backgroundColor: groupBgColor
            }}
          >
            {expandIcon}
            <span style={{ color: '#212121', fontSize: 12, fontWeight: 600 }}>{meta.displayName}</span>
          </ExpansionCell>
        )
      }

      const getCellProps = (value: any, row: any, rowIndex: number) => {
        const meta = getGroupRowMeta(row)
        if (!meta) {
          return firstCol.getCellProps?.(value, row, rowIndex)
        }

        const { expandable, groupKey } = meta

        let onClick: any
        if (expandable) {
          onClick = (e: React.MouseEvent) => {
            if (opts.stopClickEventPropagation) {
              e.stopPropagation()
            }
            toggle(groupKey)
          }
        }

        const prevProps = firstCol.getCellProps?.(value, row, rowIndex)
        const indentPadding = meta.level === 1 ? 12 : 12 + (meta.level - 1) * 24
        return mergeCellProps(prevProps, {
          onClick,
          style: {
            cursor: expandable ? 'pointer' : undefined,
            userSelect: 'none',
            textAlign: 'left',
            padding: `0 0 0 ${indentPadding}px`,
            position: 'sticky',
            left: 0,
            zIndex: 1,
            whiteSpace: 'nowrap',
            background: 'transparent'
          }
        })
      }

      const getSpanRect = (value: any, row: any, rowIndex: number) => {
        const meta = getGroupRowMeta(row)
        if (meta) {
          // 分组名称跨列：从第 0 列跨到第一个有汇总值的列之前
          // 如果没有汇总值，跨全部列
          const firstSubIdx = getFirstSubtotalColIndex(meta)
          return { top: rowIndex, bottom: rowIndex + 1, left: 0, right: firstSubIdx }
        }
        return firstCol.getSpanRect?.(value, row, rowIndex)
      }

      // 处理其他列：分组行中显示汇总值或合并到相邻区域
      // 为每个 others 中的列建立与 flatCols 的索引映射
      const processedOthers = others.map((col, othersIdx) => {
        const colCode = col.code
        // 在 flat 结构中该列的实际索引（others 从第二列开始）
        const actualColIdx = othersIdx + 1

        const originalRender = col.render
        const newRender = (value: any, row: any, rowIndex: number) => {
          const meta = getGroupRowMeta(row)
          if (meta) {
            if (colCode && meta.subtotals[colCode] != null) {
              const subtotalValue = meta.subtotals[colCode]
              if (opts.renderSubtotal) {
                return opts.renderSubtotal(subtotalValue, colCode, meta as any)
              }
              return <span style={{ color: '#1E293B', fontWeight: 600, fontSize: 12 }}>{subtotalValue}</span>
            }
            return null
          }
          if (originalRender) {
            return originalRender(value, row, rowIndex)
          }
          return value
        }

        const newGetCellProps = (value: any, row: any, rowIndex: number) => {
          const meta = getGroupRowMeta(row)
          if (meta) {
            const { expandable, groupKey } = meta
            let onClick: any
            if (expandable) {
              onClick = (e: React.MouseEvent) => {
                if (opts.stopClickEventPropagation) {
                  e.stopPropagation()
                }
                toggle(groupKey)
              }
            }
            return {
              onClick,
              style: {
                cursor: expandable ? 'pointer' : undefined,
                userSelect: 'none' as const,
                textAlign: col.align || 'right',
                padding: '0 12px'
              }
            }
          }
          return col.getCellProps?.(value, row, rowIndex)
        }

        const newGetSpanRect = (value: any, row: any, rowIndex: number) => {
          const meta = getGroupRowMeta(row)
          if (meta) {
            const firstSubIdx = getFirstSubtotalColIndex(meta)
            // 该列在第一个汇总列之前，已被第一列的跨列合并覆盖，跳过渲染
            if (actualColIdx < firstSubIdx) {
              return { top: rowIndex, bottom: rowIndex + 1, left: 0, right: firstSubIdx }
            }
            // 有汇总值的列：只占自身这一列，不向右继续跨列，保证汇总值跟随该列滚动、对齐
            if (colCode && meta.subtotals[colCode] != null) {
              return { top: rowIndex, bottom: rowIndex + 1, left: actualColIdx, right: actualColIdx + 1 }
            }
            // 其余列（无汇总值，且在第一个汇总列之后）：正常占位，不显示内容
            return { top: rowIndex, bottom: rowIndex + 1, left: actualColIdx, right: actualColIdx + 1 }
          }
          return col.getSpanRect?.(value, row, rowIndex)
        }

        return {
          ...col,
          render: newRender,
          getCellProps: newGetCellProps,
          getSpanRect: newGetSpanRect
        }
      })

      return [
        {
          ...firstCol,
          render,
          getCellProps,
          getSpanRect
        },
        ...processedOthers
      ]
    }

    // ---------- 行 Props ----------
    function groupRowPropsGetter(row: any) {
      const meta = getGroupRowMeta(row)
      if (!meta) {
        return undefined
      }

      let className: string
      if (typeof opts.groupRowClassName === 'function') {
        className = opts.groupRowClassName(meta as any, meta.level)
      } else if (typeof opts.groupRowClassName === 'string') {
        className = opts.groupRowClassName
      } else {
        className = ''
      }

      return {
        className: cx('kd-table-group-row', `kd-table-group-level-${meta.level}`, className),
        'data-group-key': meta.groupKey,
        style: {
          '--bgcolor': meta.level === 1 ? '#F7F8FA' : '#F1F4F6',
          '--hover-bgcolor': meta.level === 1 ? '#EFF1F4' : '#E9ECF0',
          '--row-height': '40px'
        } as React.CSSProperties
      }
    }
  }
}
