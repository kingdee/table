/*
 * @Author: wqhui
 * @Date: 2022-03-14 11:21:12
 * @Description: 不同情况的渲染模板，比如IE下的
 */
import React, { useEffect, useRef, ReactNode } from 'react'
import ReactDom from 'react-dom'
import cx from 'classnames'
import { ArtColumn } from '../interfaces'
import { HtmlTable } from './html-table'
import { Classes } from './styles'
import { composeRowPropsGetter, getScrollbarSize } from './utils'
import { BaseTableProps } from './table'
import { RenderInfo } from './interfaces'
import { getTreeDepth, isStickyUIDegrade } from '../utils'
import TableHeader from './header'
import { TableDOMHelper } from './helpers/TableDOMUtils'

const TEMPLATES = new Map()

interface RowDetailOptions {
  row: any
  rowIndex: number
  renderDetail?(row: any, rowIndex: number): ReactNode
  domHelper:TableDOMHelper
}

function renderTableHeaderInIE (info: RenderInfo, props: BaseTableProps, extra?: { stickyRightOffset?:number}) {
  const { stickyTop, hasHeader } = props

  const { flat, nested, visible, hasLockColumn } = info
  const { left, right } = flat
  const { left: leftNested, right: rightNested, full } = nested

  const rowCount = getTreeDepth(full) + 1

  const fixedRightTableStyle = {
    right: extra?.stickyRightOffset || 0
  }

  return (
    <div className={cx(Classes.tableHeader)}>
      <div
        className={cx(Classes.tableHeaderMain, 'no-scrollbar')}
        style={{
          top: stickyTop === 0 ? undefined : stickyTop,
          display: hasHeader ? undefined : 'none'
        }}
      >
        <TableHeader info={info} theaderPosition={hasLockColumn ? 'center' : undefined}/>
        <div className={Classes.verticalScrollPlaceholder} style={ typeof extra?.stickyRightOffset === 'number' ? { width: extra?.stickyRightOffset} : undefined}></div>
      </div>
      {
        left.length > 0
          ? (
            <div className={Classes.fixedLeft} >
              <TableHeader
                info={
                  {
                    ...info,
                    flat: {
                      center: left,
                      full: left,
                      left: [],
                      right: []
                    },
                    nested: {
                      center: leftNested,
                      full: leftNested,
                      left: [],
                      right: []
                    },
                    visible: visible.slice(0, left.length),
                    horizontalRenderRange: {
                      leftIndex: 0,
                      leftBlank: 0,
                      rightIndex: left.length, // leftIndex + centerCount + right.length 计算得出
                      rightBlank: 0
                    }
                  }
                }
                theaderPosition="left"
                rowCount={rowCount}
              />
            </div>
          )
          : null
      }
      {
        right.length > 0
          ? (
            <div className={Classes.fixedRight} style={fixedRightTableStyle}>
              <TableHeader
                info={
                  {
                    ...info,
                    flat: {
                      center: right,
                      full: right,
                      left: [],
                      right: []
                    },
                    nested: {
                      center: rightNested,
                      full: rightNested,
                      left: [],
                      right: []
                    },
                    visible: visible.slice(visible.length - right.length),
                    horizontalRenderRange: {
                      leftIndex: 0,
                      leftBlank: 0,
                      rightIndex: right.length, // leftIndex + centerCount + right.length 计算得出
                      rightBlank: 0
                    }
                  }
                }
                theaderPosition={'right'}
                rowCount={rowCount}
              />

            </div>
          )
          : null
      }
    </div>
  )
}

function renderTableBodyInIE (info: RenderInfo, props: BaseTableProps, extra?: { rowProps : React.HTMLAttributes<HTMLTableRowElement>}) {
  const { dataSource, getRowProps, primaryKey } = props

  const { topIndex, bottomBlank, topBlank, bottomIndex } = info.verticalRenderRange
  const { flat, visible, hasLockColumn } = info
  const { left, right } = flat
  const verticalRenderInfo = {
    first: 0,
    offset: topIndex,
    limit: bottomIndex,
    last: dataSource.length - 1
  }

  const commonProps = {
    getRowProps: composeRowPropsGetter(getRowProps, extra.rowProps),
    primaryKey: primaryKey,
    data: dataSource.slice(topIndex, bottomIndex)
  }

  return (
    <div className={cx(Classes.tableBody, Classes.horizontalScrollContainer)}>
      <div className={Classes.virtual} tabIndex={-1}>
        {topBlank > 0 && (
          <div key="top-blank" className={cx(Classes.virtualBlank, 'top')} style={{ height: topBlank }} />
        )}
        <HtmlTable
          tbodyHtmlTag="tbody"
          {...commonProps}
          tbodyPosition={hasLockColumn ? 'center' : undefined}
          horizontalRenderInfo={info}
          verticalRenderInfo={verticalRenderInfo}
        />
        {bottomBlank > 0 && (
          <div key="bottom-blank" className={cx(Classes.virtualBlank, 'bottom')} style={{ height: bottomBlank }} />
        )}
      </div>
      {
        left.length > 0
          ? (
            <div className={Classes.fixedLeft} >
              {topBlank > 0 && (
                <div key="top-blank" className={cx(Classes.virtualBlank, 'top')} style={{ height: topBlank }} />
              )}
              <HtmlTable
                tbodyHtmlTag="tbody"
                {...commonProps}
                tbodyPosition="left"
                horizontalRenderInfo={{
                  ...info,
                  flat: {
                    center: left,
                    full: left,
                    left: [] as ArtColumn[],
                    right: [] as ArtColumn[]
                  },
                  visible: visible.slice(0, left.length)
                }}
                verticalRenderInfo={verticalRenderInfo}
              />
              {bottomBlank > 0 && (
                <div key="bottom-blank" className={cx(Classes.virtualBlank, 'bottom')} style={{ height: bottomBlank }} />
              )}
            </div>
          )
          : null
      }
      {
        right.length > 0
          ? (
            <div className={Classes.fixedRight}>
              {topBlank > 0 && (
                <div key="top-blank" className={cx(Classes.virtualBlank, 'top')} style={{ height: topBlank }} />
              )}
              <HtmlTable
                tbodyHtmlTag="tbody"
                {...commonProps}
                tbodyPosition="right"
                horizontalRenderInfo={{
                  ...info,
                  flat: {
                    center: right,
                    full: right,
                    left: [] as ArtColumn[],
                    right: [] as ArtColumn[]
                  },
                  visible: visible.slice(visible.length - right.length)
                }}
                verticalRenderInfo={verticalRenderInfo}
              />
              {bottomBlank > 0 && (
                <div key="bottom-blank" className={cx(Classes.virtualBlank, 'bottom')} style={{ height: bottomBlank }} />
              )}
            </div>
          )
          : null
      }
      <div className={Classes.rowDetailContainer}/>
    </div>
  )
}

function renderTableFooterInIE (info: RenderInfo, props: BaseTableProps, extra?: { rowProps : React.HTMLAttributes<HTMLTableRowElement>, stickyRightOffset?:number}) {
  const { footerDataSource = [], getRowProps, primaryKey, stickyBottom } = props
  const _getRowProps = composeRowPropsGetter(getRowProps, extra.rowProps)

  const { flat, visible, hasLockColumn } = info
  const { left, right } = flat
  const verticalRenderInfo = {
    offset: 0,
    first: 0,
    last: footerDataSource.length - 1,
    limit: Infinity
  }
  const commonProps = {
    data: footerDataSource,
    getRowProps: _getRowProps,
    primaryKey: primaryKey,
    verticalRenderInfo: verticalRenderInfo
  }

  const fixedRightTableStyle = {
    right: extra?.stickyRightOffset || 0
  }

  return (
    <div
      className={cx(Classes.tableFooter)}
      style={{ bottom: stickyBottom === 0 ? undefined : stickyBottom }}
    >
      <div className={cx(Classes.tableFooterMain, Classes.horizontalScrollContainer)}>
        <HtmlTable
          tbodyHtmlTag="tfoot"
          {...commonProps}
          tbodyPosition={hasLockColumn ? 'center' : undefined }
          horizontalRenderInfo={info}
        />
        {
          footerDataSource.length > 0
            ? <div
              className={Classes.verticalScrollPlaceholder}
              style={typeof extra?.stickyRightOffset === 'number' ? { width: extra?.stickyRightOffset, visibility: 'initial' } : undefined}>
            </div>
            : null
        }
      </div>
      {
        left.length > 0
          ? <div className={Classes.fixedLeft} >
            <HtmlTable
              tbodyHtmlTag="tfoot"
              {...commonProps}
              tbodyPosition="left"
              horizontalRenderInfo={{
                ...info,
                flat: {
                  center: left,
                  full: left,
                  left: [] as ArtColumn[],
                  right: [] as ArtColumn[]
                },
                visible: visible.slice(0, left.length)
              }}
            />
          </div>
          : null
      }
      {
        right.length > 0
          ? <div className={Classes.fixedRight} style={fixedRightTableStyle}>
            <HtmlTable
              tbodyHtmlTag="tfoot"
              {...commonProps}
              tbodyPosition="right"
              horizontalRenderInfo={{
                ...info,
                flat: {
                  center: right,
                  full: right,
                  left: [] as ArtColumn[],
                  right: [] as ArtColumn[]
                },
                visible: visible.slice(visible.length - right.length)
              }}
            />
          </div>
          : null
      }
    </div>
  )
}

function renderRowDetailInIE (params:RowDetailOptions) {
  const { domHelper } = params
  if (!domHelper) return
  const artTable = domHelper.artTable
  const rowDetailContainer = artTable && artTable.querySelector(`.${Classes.rowDetailContainer}`)

  return ReactDom.createPortal(<RowDetail {...params}/>, rowDetailContainer)
}

function RowDetail (props:RowDetailOptions) {
  const detailRef = useRef(null)
  const { row, rowIndex, domHelper, renderDetail } = props
  const artTable = domHelper.artTable
  useEffect(() => {
    const selector = (position) => {
      return `.${position} .${Classes.tableRow}[data-rowindex="${rowIndex}"]`
    }
    const itemRect = detailRef.current && detailRef.current.getBoundingClientRect()
    const targetRow = artTable.querySelector<HTMLDivElement>(selector(Classes.tableBody))
    const targetRowLeft = artTable.querySelector<HTMLDivElement>(selector(Classes.fixedLeft))
    const targetRowRight = artTable.querySelector<HTMLDivElement>(selector(Classes.fixedRight))

    if (itemRect.height) {
      targetRow && (targetRow.style.height = itemRect.height + 'px')
      targetRowLeft && (targetRowLeft.style.height = itemRect.height + 'px')
      targetRowRight && (targetRowRight.style.height = itemRect.height + 'px')
    }
  }, [])

  useEffect(() => {
  const updateTransform = () => {
    const offsetTop = domHelper.getRowTop(rowIndex) || 0
    if (detailRef.current) {
      detailRef.current.style.transform = `translateY(${offsetTop + 'px'})`
    }
  }
  // 使用requestAnimationFrame确保在下一个渲染帧执行
  const rafId = window.requestAnimationFrame(() => {
    window.requestAnimationFrame(updateTransform) // 双重RAF确保IE渲染完成
  })

  return () => cancelAnimationFrame(rafId)
})

  return (
    <div ref = {detailRef} className={Classes.rowDetailItem}>
      {renderDetail(row, rowIndex)}
    </div>
  )
}

if (isStickyUIDegrade()) {
  TEMPLATES.set('header', renderTableHeaderInIE)
  TEMPLATES.set('body', renderTableBodyInIE)
  TEMPLATES.set('footer', renderTableFooterInIE)
  TEMPLATES.set('rowDetail', renderRowDetailInIE)
}

export default function getTableHeaderRenderTemplate (type: string) {
  return TEMPLATES.get(type)
}
