import cx from 'classnames'
import React from 'react'
import { ExpansionCell, icons, InlineFlexCell } from '../../common-views'
import { ArtColumn } from '../../interfaces'
import { internals } from '../../internals'
import { isLeafNode as standardIsLeafNode, mergeCellProps } from '../../utils'
import { TablePipeline } from '../pipeline'
import { Classes } from '../../base/styles'

export const treeMetaSymbol = Symbol('treeMetaSymbol')
export const treeModeOptionsKey = 'treeModeOptions'

interface ExpandIconProps extends React.DOMAttributes<Element> {
  expanded: boolean
  style: React.CSSProperties
}

export interface TreeModeFeatureOptions {
  /** 非受控用法：默认展开的 keys */
  defaultOpenKeys?: string[]

  /** 受控用法：当前展开的 keys */
  openKeys?: string[]

  /** 受控用法：展开 keys 改变的回调 */
  onChangeOpenKeys?(nextKeys: string[], key: string, action: 'expand' | 'collapse'): void

  /** 自定义叶子节点的判定逻辑 */
  isLeafNode?(node: any, nodeMeta: { depth: number; expanded: boolean; rowKey: string }): boolean

  /** 展开折叠图标 */
  icon?(props: ExpandIconProps): JSX.Element

  /** icon 的缩进值。一般为负数，此时 icon 将向左偏移，默认从 pipeline.ctx.indents 中获取 */
  iconIndent?: number

  /** icon 与右侧文本的距离，默认从 pipeline.ctx.indents 中获取 */
  iconGap?: number

  /** 每一级缩进产生的距离，默认从 pipeline.ctx.indents 中获取 */
  indentSize?: number

  /** 点击事件的响应区域 */
  clickArea?: 'cell' | 'content' | 'icon'

  /** 是否对触发展开/收拢的 click 事件调用 event.stopPropagation() */
  stopClickEventPropagation?: boolean

  /** 指定表格每一行元信息的记录字段 */
  treeMetaKey?: string | symbol

  /** 指定展开列 */
  expandColCode?: string
}

export function treeMode (opts: TreeModeFeatureOptions = {}) {
  return function treeModeStep (pipeline: TablePipeline) {
    const stateKey = 'treeMode'
    const ctx = pipeline.ctx

    const primaryKey = pipeline.ensurePrimaryKey('treeMode')

    const openKeys: string[] = opts.openKeys ?? pipeline.getStateAtKey(stateKey) ?? opts.defaultOpenKeys ?? []
    const curSort = pipeline.getStateAtKey('sort')
    const openKeySet = new Set(openKeys)
    const onChangeOpenKeys: TreeModeFeatureOptions['onChangeOpenKeys'] = (nextKeys: string[], key, action) => {
      opts.onChangeOpenKeys?.(nextKeys, key, action)
      pipeline.setStateAtKey(stateKey, nextKeys, { key, action })
    }

    const toggle = (rowKey: string) => {
      const expanded = openKeySet.has(rowKey)
      if (expanded) {
        onChangeOpenKeys(
          openKeys.filter((key) => key !== rowKey),
          rowKey,
          'collapse'
        )
      } else {
        onChangeOpenKeys([...openKeys, rowKey], rowKey, 'expand')
      }
    }
    const isLeafNode = opts.isLeafNode ?? standardIsLeafNode
    const clickArea = opts.clickArea ?? 'cell'
    const treeMetaKey = opts.treeMetaKey ?? treeMetaSymbol
    const stopClickEventPropagation = Boolean(opts.stopClickEventPropagation)

    // indents
    const iconWidth = ctx.indents.iconWidth
    const iconIndent = opts.iconIndent ?? ctx.indents.iconIndent
    const iconGap = opts.iconGap ?? ctx.indents.iconGap
    const indentSize = opts.indentSize ?? ctx.indents.indentSize

    pipeline.setFeatureOptions(treeModeOptionsKey,{
      iconWidth,
      iconIndent,
      iconGap,
      indentSize,
      treeMetaKey,
      isExpanded: (rowKey) => {
        return openKeySet.has(rowKey)
      },
      onExpand: (rowKey) => {
        onChangeOpenKeys([...openKeys, rowKey], rowKey, 'expand')
      },
      onCollapse: (rowKey) => {
        onChangeOpenKeys(openKeys.filter((key) => key !== rowKey),rowKey,'collapse')
      }
    })

    const Icon = opts.icon

    return pipeline.mapDataSource(processDataSource).mapColumns(processColumns)

    function processDataSource (input: any[]) {
        if(pipeline.isSameInputDataSource() && openKeys === pipeline.getFeatureOptions('lastOpenKeys') && curSort === pipeline.getFeatureOptions('lastSort')){
          return pipeline.getFeatureOptions('lastTreeMode');
        }
        pipeline.setFeatureOptions('lastOpenKeys', openKeys)
        pipeline.setFeatureOptions('lastSort', curSort)
        const result: any[] = []
        dfs(input, 0)
      function dfs (nodes: any[], depth: number, parentNode = null) {
        if (nodes == null) {
          return
        }
        for (const node of nodes) {
          const rowKey = internals.safeGetRowKey(primaryKey, node, -1)
          const parentRowKey = parentNode ? internals.safeGetRowKey(primaryKey, parentNode, -1) : null
          const expanded = openKeySet.has(rowKey)

          const isLeaf = isLeafNode(node, { depth, expanded, rowKey })
          const treeMeta = { depth, isLeaf, expanded, rowKey, parentRowKey }
          result.push({ [treeMetaKey]: treeMeta, ...node })

          if (!isLeaf && expanded) {
            dfs(node.children, depth + 1, node)
          }
        }
      }
      pipeline.setFeatureOptions('lastTreeMode', result);
      return result
    }

    function processColumns (columns: ArtColumn[]) {
      if (columns.length === 0) {
        return columns
      }

      let expandColIndex = columns.findIndex(({ code }) => code && opts.expandColCode === code)
      expandColIndex = expandColIndex === -1 ? 0 : expandColIndex
      const expandCol = columns[expandColIndex]

      const render = (value: any, record: any, recordIndex: number) => {
        const content = internals.safeRender(expandCol, record, recordIndex)
        if (record[treeMetaKey] == null) {
          // 没有 treeMeta 信息的话，就返回原先的渲染结果
          return content
        }

        const { rowKey, depth, isLeaf, expanded } = record[treeMetaKey]

        const indent = iconIndent + depth * indentSize

        if (isLeaf) {
          return (
            <InlineFlexCell className={cx('expansion-cell', Classes.leaf)}>
              <span style={{ marginLeft: indent + iconWidth + iconGap }}>{content}</span>
            </InlineFlexCell>
          )
        }

        const onClick = (e: React.MouseEvent) => {
          if (stopClickEventPropagation) {
            e.stopPropagation()
          }
          toggle(rowKey)
        }

        const expandCls = expanded ? Classes.expanded : Classes.collapsed
        return (
          <ExpansionCell
            className={cx('expansion-cell', expandCls)}
            style={{
              cursor: clickArea === 'content' ? 'pointer' : undefined
            }}
            onClick={clickArea === 'content' ? onClick : undefined}
          >
            {Icon
              ? <Icon
                expanded={expanded}
                style={{
                  cursor: clickArea === 'icon' ? 'pointer' : undefined,
                  marginLeft: indent,
                  marginRight: iconGap,
                  width: iconWidth
                }}
                onClick={clickArea === 'icon' ? onClick : undefined}
              />
              : <icons.CaretRight
                className={cx('expansion-icon', expandCls)}
                style={{
                  cursor: clickArea === 'icon' ? 'pointer' : undefined,
                  marginLeft: indent,
                  marginRight: iconGap
                }}
                onClick={clickArea === 'icon' ? onClick : undefined}
              />}
            {content}
          </ExpansionCell>
        )
      }

      const getCellProps = (value: any, record: any, rowIndex: number) => {
        const prevProps = internals.safeGetCellProps(expandCol, record, rowIndex)
        if (record[treeMetaKey] == null || clickArea !== 'cell') {
          // 没有 treeMeta 信息的话，就返回原先的 cellProps
          return mergeCellProps(prevProps, {className: Classes.tableExtendCell})
        }

        const { isLeaf, rowKey } = record[treeMetaKey]
        if (isLeaf) {
          return mergeCellProps(prevProps, {className: Classes.tableExtendCell})
        }

        return mergeCellProps(prevProps, {
          onClick (e) {
            if (stopClickEventPropagation) {
              e.stopPropagation()
            }
            toggle(rowKey)
          },
          style: { cursor: 'pointer' },
          className: Classes.tableExtendCell
        })
      }

      columns[expandColIndex] = {
        ...expandCol,
        title: (
          <span style={{ marginLeft: iconIndent + iconWidth + iconGap, display: 'flex' }}>{internals.safeRenderHeader(expandCol)}</span>
        ),
        render,
        getCellProps: getCellProps
      }

      return [...columns]
    }
  }
}
