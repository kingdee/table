import { Classes } from '../styles'

// 表格 DOM 结构
// div.art-table-wrapper
// └── div.art-loading-wrapper
//     ├── div.art-loading-indicator-wrapper
//     │   └── div.art-loading-indicator
//     │
//     └── div.art-loading-content-wrapper
//         ├── div.art-table
//         │   │
//         │   ├── div.art-table-header
//         │   │  └── table
//         │   │      ├── colgroup
//         │   │      └── thead  注意这里会出现自定义内容，可能存在嵌套表格
//         │   │
//         │   ├── div.art-table-body
//         │   │   ├── div.art-virtual-blank.top
//         │   │   ├── table
//         │   │   │   ├── colgroup
//         │   │   │   └── tbody 注意这里会出现自定义内容，可能存在嵌套表格
//         │   │   └── div.art-virtual-blank.bottom
//         │   │
//         │   ├── div.art-table-footer
//         │   │  └── table
//         │   │      ├── colgroup
//         │   │      └── tfoot  注意这里会出现自定义内容，可能存在嵌套表格
//         │   │
//         │   ├── div.art-lock-shadow-mask
//         │   │   └── div.art-left-lock-shadow
//         │   └── div.art-lock-shadow-mask
//         │       └── div.art-right-lock-shadow
//         │
//         └── div.art-sticky-scroll
//             └── div.art-sticky-scroll-item
//
// 在「可能存在嵌套表格」的情况下，我们可以采用以下的方式来避免「querySelector 不小心获取到了的嵌套表格上的元素」：
//  artTable.querySelector('.art-lock-shadow-mask .art-left-lock-shadow')

// 表格 DOM 结构辅助工具
export class TableDOMHelper {
  readonly artTableWrapper: HTMLDivElement

  readonly artTable: HTMLDivElement

  readonly tableHeader: HTMLDivElement

  readonly tableBody: HTMLDivElement

  readonly virtual: HTMLDivElement

  readonly tableElement: HTMLTableElement

  readonly tableFooter: HTMLDivElement

  readonly stickyScroll: HTMLDivElement

  readonly stickyScrollItem: HTMLDivElement

  readonly tableHeaderMain: HTMLDivElement

  readonly tableFooterMain: HTMLDivElement

  constructor (artTableWrapper: HTMLDivElement) {
    this.artTableWrapper = artTableWrapper
    this.artTable = artTableWrapper.querySelector<HTMLDivElement>(`.${Classes.artTable}`)
    this.tableHeader = this.artTable.querySelector(`.${Classes.tableHeader}`)
    this.tableHeaderMain = this.artTable.querySelector(`.${Classes.tableHeaderMain}`)
    this.tableBody = this.artTable.querySelector(`.${Classes.tableBody}`)
    this.virtual = this.artTable.querySelector(`.${Classes.virtual}`)
    this.tableElement = this.artTable.querySelector(`.${Classes.tableBody} table`)
    this.tableFooter = this.artTable.querySelector(`.${Classes.tableFooter}`)
    this.tableFooterMain = this.artTable.querySelector(`.${Classes.tableFooterMain}`)

    const stickyScrollSelector = `.${Classes.artTable} + .${Classes.horizontalStickyScrollContainer} .${Classes.stickyScroll}`
    const stickyScrolls = artTableWrapper.querySelectorAll<HTMLDivElement>(stickyScrollSelector)
    this.stickyScroll = stickyScrolls[stickyScrolls.length - 1] // 当嵌套多层表格时，需要查找最后一个，否则会查找到父表格内嵌套的子表格的
    this.stickyScrollItem = this.stickyScroll.querySelector(`.${Classes.stickyScrollItem}`)
  }

  getVirtualTop (): HTMLDivElement {
    return this.tableBody.querySelector<HTMLDivElement>(`.${Classes.virtualBlank}.top`)
  }

  getTableRows (): NodeListOf<HTMLTableRowElement> {
    const tbody = this.artTable.querySelector(`.${Classes.tableBody} .${Classes.virtual} table tbody`)
    return tbody.childNodes as NodeListOf<HTMLTableRowElement>
  }

  getTableBodyHtmlTable (): HTMLTableElement {
    return this.artTable.querySelector(`.${Classes.tableBody} .${Classes.virtual} table`)
  }

  getLeftLockShadow (): HTMLDivElement {
    const selector = `.${Classes.lockShadowMask} .${Classes.leftLockShadow}`
    const allLeftLockShadow = this.artTable.querySelectorAll<HTMLDivElement>(selector)
    return allLeftLockShadow[allLeftLockShadow.length - 1] // 当table-body、table-footer嵌套多层表格时，需要查找最后一个，否则会查找到嵌套表格的
  }

  getRightLockShadow (): HTMLDivElement {
    const selector = `.${Classes.lockShadowMask} .${Classes.rightLockShadow}`
    const allRightLockShadow = this.artTable.querySelectorAll<HTMLDivElement>(selector)
    return allRightLockShadow[allRightLockShadow.length - 1] // 当table-body、table-footer嵌套多层表格时，需要查找最后一个，否则会查找到嵌套表格的
  }

  getLoadingIndicator (): HTMLDivElement {
    return this.artTableWrapper.querySelector<HTMLDivElement>(`.${Classes.loadingIndicator}`)
  }

  getRowTop (rowIndex:number) {
    if (rowIndex === 0) return 0
    const selector = `.${Classes.tableBody} .${Classes.tableRow}[data-rowindex="${rowIndex}"]`
    const row = this.artTable.querySelector<HTMLDivElement>(selector)
    const rowOffsetTop = (row && row.offsetTop) || 0
    const tableOffsetTop = this.tableElement.offsetTop || 0
    return rowOffsetTop + tableOffsetTop
  }

  getRowNodeListByEvent = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) : HTMLElement[] => {
    let nodeList = null
    const rowIndex = e.currentTarget.dataset.rowindex
    if (rowIndex !== undefined) {
      const targetParent = this.tableBody.contains(e.currentTarget) ? this.tableBody : this.tableFooter
      nodeList = targetParent.querySelectorAll(`tr[data-rowindex="${rowIndex}"]`)
    }
    return nodeList
  }

  getInRangeRowByCellEvent = (e: React.MouseEvent<HTMLTableCellElement, MouseEvent>) => {
    const getParentNode = (ele, target) => {
      if (ele.parentNode.nodeName === target) {
        return ele.parentNode
      }
      return getParentNode(ele.parentNode, target)
    }
    e = e instanceof Array ? e[0] : e
    const curCell = e?.currentTarget
    const curRow = getParentNode(curCell, 'TR')
    const curRowSpan = parseInt(e.currentTarget.getAttribute('rowspan')) || 1
    const rows = getParentNode(curCell, 'TABLE')?.rows
    return  Array.from(rows).slice(curRow.rowIndex,curRow.rowIndex + curRowSpan)
  }
}
