import styled, { css,  createGlobalStyle } from 'styled-components'
import { swapRTLDirection } from './utils'
export const LOCK_SHADOW_PADDING = 20

const prefix = 'kd-'

export const Classes = {
  /** BaseTable 表格组件的外层包裹 div */
  artTableWrapper: `${prefix}table-wrapper`,
  artTableBordered: `${prefix}table-bordered`,

  artTable: `${prefix}table`,
  tableHeaderMain: `${prefix}table-header-main`,
  tableHeader: `${prefix}table-header`,
  tableBody: `${prefix}table-body`,
  virtual: `${prefix}virtual`,
  tableFooter: `${prefix}table-footer`,
  tableFooterMain: `${prefix}table-footer-main`,

  /** 表格行 */
  tableRow: `${prefix}table-row`,
  /** 表头行 */
  tableHeaderRow: `${prefix}table-header-row`,
  /** 单元格 */
  tableCell: `${prefix}table-cell`,
  tableExtendCell: `${prefix}table-extend-cell`,
  /** 表头的单元格 */
  tableHeaderCell: `${prefix}table-header-cell`,
  tableHeaderCellContent: `${prefix}table-header-cell-content`,
  tableHeaderCellResize: `${prefix}table-header-cell-resize`,
  virtualBlank: `${prefix}virtual-blank`,

  stickyScroll: `${prefix}sticky-scroll`,
  stickyScrollItem: `${prefix}sticky-scroll-item`,
  horizontalScrollContainer: `${prefix}horizontal-scroll-container`,
  verticalScrollPlaceholder: `${prefix}vertical-scroll-placeholder`,
  horizontalStickyScrollContainer: `${prefix}horizontal-sticky-scroll-container`,
  horizontalScrollLeftSpacer: `${prefix}horizontal-scroll-left-spacer`,
  horizontalScrollRightSpacer: `${prefix}horizontal-scroll-right-spacer`,

  lockShadowMask: `${prefix}lock-shadow-mask`,
  lockShadow: `${prefix}lock-shadow`,
  leftLockShadow: `${prefix}left-lock-shadow`,
  rightLockShadow: `${prefix}right-lock-shadow`,

  /** 数据为空时表格内容的外层 div */
  emptyWrapper: `${prefix}empty-wrapper`,

  loadingWrapper: `${prefix}loading-wrapper`,
  loadingContentWrapper: `${prefix}loading-content-wrapper`,
  loadingIndicatorWrapper: `${prefix}loading-indicator-wrapper`,
  loadingIndicator: `${prefix}loading-indicator`,

  tableHeaderCellLine: `${prefix}table-header-cell-line`,

  tableFilterTrigger:`${prefix}filter-trigger`,
  tableSortIcon:`${prefix}sort-icon`,
  tableExtendIcon:`${prefix}extend-icon`,

  button: `${prefix}btn`,
  buttonPrimary: `${prefix}btn-primary`,
  filterIcon: `${prefix}filter-icon`,

  rangeSelection: `${prefix}range-selection`,
  tableCellRangeSingleCell: `${prefix}table-cell-range-single-cell`,
  tableCellRangeSelected: `${prefix}table-cell-range-selected`,
  tableCellRangeTop: `${prefix}table-cell-range-top`,
  tableCellRangeLeft: `${prefix}table-cell-range-left`,
  tableCellRangeBottom: `${prefix}table-cell-range-bottom`,
  tableCellRangeRight: `${prefix}table-cell-range-right`,

  fixedLeft: `${prefix}fixed-left`,
  fixedRight: `${prefix}fixed-right`,

  rowDetailContainer: `${prefix}row-detail-container`,
  rowDetailItem: `${prefix}row-detail-item`,

  emptyColCell: `${prefix}empty-col-cell`,

  first: `${prefix}first`,
  last: `${prefix}last`,
  even: `${prefix}even`,
  odd: `${prefix}odd`,

  lockLeft: `${prefix}lock-left`,
  lockRight: `${prefix}lock-right`,
  rowSpan: `${prefix}row-span`,
  leaf: `${prefix}leaf`,

  expanded: `${prefix}expanded`,
  collapsed: `${prefix}collapsed`,

  popup: `${prefix}popup`,
  popupHeader: `${prefix}popup-header`,
  popupBody: `${prefix}popup-body`,

  rowDragging: `${prefix}row-dragging`,

  rowDragStart: `${prefix}row-drag-start`,
  rowDragEnd: `${prefix}row-drag-end`,
  rowDragEndParent:`${prefix}row-drag-end-parent`,
  rowDragEndToTop: `${prefix}row-drag-end-to-top`,
  rowDragEndToBottom: `${prefix}row-drag-end-to-bottom`,
  rowDragEndInto:`${prefix}row-drag-end-into`,
  rowDragElement: `${prefix}row-drag-element`,
  rowDragElementIcon: `${prefix}row-drag-element-icon`,
  rowDragElementLabel: `${prefix}row-drag-element-label`,
  rowDragLine: `${prefix}row-drag-line`,
  rowDragNoData: `${prefix}row-drag-no-data`,
  treeTableRowDragLine:`${prefix}tree-table-row-drag-line`,
  iconNotAllowed: `${prefix}icon-not-allowed`,
  iconMove:`${prefix}icon-move`,
  rowDragCell: `${prefix}row-drag-cell`

} as const

export const MenuClasses = {
  menu: `${prefix}table-menu`,
  menuList: `${prefix}table-menu-list`,
  menuOption: `${prefix}table-menu-option`,
  menuOptionActive: `${prefix}table-menu-option-active`,
  menuOptionDisable: `${prefix}table-menu-option-disable`,
  menuOptionText: `${prefix}table-menu-option-text`,
}


const Z = {
  lock: 5,
  header: 15,
  footer: 10,
  lockShadow: 20,
  rowDetail: 25,
  scrollItem: 30,
  loadingIndicator: 40
} as const

export type BaseTableCSSVariables = Partial<{
  /** 表格一行的高度，注意该属性将被作为 CSS variable，不能使用数字作为简写 */
  '--row-height': string
  /** 表格的字体颜色 */
  '--color': string
  /** 表格背景颜色 */
  '--bgcolor': string
  /** 鼠标悬停时的背景色 */
  '--hover-bgcolor': string
  /** 单元格高亮时的背景色 */
  '--highlight-bgcolor': string
  /** 主题色 */
  '--primary-color':string

  /** 主题色浅色1，浅色选中、悬浮 */
  '--primary-color-level1': string
  /** 主题色浅色2，深色选中、悬浮 */
  '--primary-color-level2': string
  /**图标默认颜色 */
  '--icon-color':string
  /**边框颜色 */
  '--strong-border-color': string

  /** 表头中一行的高度，注意该属性将被作为 CSS variable，不能使用数字作为简写 */
  '--header-row-height': string
  /** 表头中的字体颜色 */
  '--header-color': string
  /** 表头的背景色 */
  '--header-bgcolor': string
  /** 表头上鼠标悬停时的背景色 */
  '--header-hover-bgcolor': string
  /** 表头上单元格高亮时的背景色 */
  '--header-highlight-bgcolor': string

  /** 单元格 padding */
  '--cell-padding': string
  /** 字体大小 */
  '--font-size': string
  /** 表格内字体的行高 */
  '--line-height': string
  /** 锁列阴影，默认为 rgba(152, 152, 152, 0.5) 0 0 6px 2px */
  '--lock-shadow': string

  /** 单元格的边框颜色 */
  '--border-color': string
  /** 单元格边框，默认为 1px solid #dfe3e8 */
  '--cell-border': string
  /** 单元格上下边框，默认为 none ，默认值为 1px solid #dfe3e8 */
  '--cell-border-horizontal': string
  /** 单元格左右边框，默认为 #dfe3e8 */
  '--cell-border-vertical': string
  /** 表头单元格边框，默认为 1px solid #dfe3e8 */
  '--header-cell-border': string
  /** 表头单元格上下边框，默认为 none ，默认值为 1px solid #dfe3e8 */
  '--header-cell-border-horizontal': string
  /** 表头单元格左右边框，默认为 1px solid #dfe3e8 */
  '--header-cell-border-vertical': string
}>

export const GlobalStyle = createGlobalStyle<{ direction: string }>`
  .${Classes.rowDragElement}{
    position: absolute;
    top:0;
    ${props => swapRTLDirection(props.direction, 'left')}:0;
    z-index: 9999;
    pointer-events:none;
    user-select: none;

    display:flex;
    opacity: 0.9;
    align-items:center;
    min-width:80px;
    padding: 0px 8px;
    border: 1px solid #d9d9d9;
    box-shadow: 0px 6px 16px 3px rgba(0,0,0,0.08);
    border-radius: 2px;
    background: #fff;
    max-height:48px;

    .${Classes.rowDragElementLabel}{
      font-size:12px;
      overflow:hidden;
      text-overflow: ellipsis;
      white-space:nowrap;
    }
    
  }

  .${Classes.rowDragLine}{
    position: absolute;
    top:0;
    ${props => swapRTLDirection(props.direction, 'left')}:0;
    z-index: 9998;
    pointer-events:none;
    user-select: none;
    height: 2px;
    background: var(--primary-color);
  }
  .${Classes.treeTableRowDragLine}:before{
    content: " ";
    position: absolute;
    width: 8px;
    height: 8px;
    top:-4px;
    border: 2px solid var(--primary-color);
    border-radius: 50%;
    background:#fff;
  }
`

const outerBorderStyleMixin = css`
  border-top: 1px solid #cccccc;
  border-right: 1px solid #cccccc;
  border-bottom: 1px solid #cccccc;
  border-left: 1px solid #cccccc;

  td.${Classes.first},
  th.${Classes.first} {
    border-${props => props.direction === 'rtl' ? 'right' : 'left'}: none;
  }
  td.${Classes.last},
  th.${Classes.last} {
    border-${props => props.direction === 'rtl' ? 'left' : 'right'}: none;
  }

  thead tr.${Classes.first} th,
  tbody tr.${Classes.first} td {
    border-top: none;
  }
  &.has-footer tfoot tr.${Classes.last} td {
    border-bottom: none;
  }
  &:not(.has-footer) tbody tr.${Classes.last} td {
    border-bottom: none;
  }
  td.${Classes.rowSpan}:not(.${Classes.first}){
    border-${props => props.direction === 'rtl' ? 'right' : 'left'}: var(---cell-border-vertical);
  }
  td.${Classes.rowSpan}:not(.${Classes.last}){
    border-${props => props.direction === 'rtl' ? 'left' : 'right'}: var(---cell-border-vertical);
  }
`


export const defaultCSSVariables = {
  '--row-height': '48px',
  '--color': '#333',
  '--bgcolor': 'white',
  '--hover-bgcolor': 'var(--hover-color, #f5f5f5)',
  '--highlight-bgcolor': '#eee',
  '--primary-color': '#5582F3',
  '--primary-color-level1': 'rgb(242, 248, 255)',
  '--primary-color-level2': 'rgb(135, 173, 255)',
  '--icon-color': '#666666',
  '--strong-border-color': '#d9d9d9',

  '--header-row-height': '32px',
  '--header-color': '#333',
  '--header-bgcolor': '#f4f4f4',
  '--header-hover-bgcolor': '#ddd',
  '--header-highlight-bgcolor': '#e4e8ed',

  '--cell-padding': '8px 12px',
  '--font-size': '12px',
  '--line-height': '1.28571',
  '--lock-shadow': 'rgba(152, 152, 152, 0.5) 0 0 6px 2px',

  '--border-color': '#dfe3e8',
  '--cell-border': '1px solid #dfe3e8',
  '--cell-border-horizontal': '1px solid #dfe3e8',
  '---cell-border-vertical': '1px solid #dfe3e8',
  '--header-cell-border': '1px solid #dfe3e8',
  '--cell-border-vertical': '1px solid #dfe3e8',
  '--header-cell-border-horizontal': '1px solid #dfe3e8',
  '--header-cell-border-vertical': '1px solid #dfe3e8'
}

export const variableConst = getCssVariableText(defaultCSSVariables)

const notBorderedStyleMixin = css`
  --cell-border-vertical: none;
  --header-cell-border-vertical: none;
`
const borderedStyleMixin = css`
  //th隐藏列宽拖拽的背景色，使用th的右边框代替
  .${Classes.tableHeaderCellResize}::after{
    background-color: inherit;
  }
`

export const StyledArtTableWrapper = styled.div`
  :root {
    ${variableConst}
  }
  ${variableConst}

  box-sizing: border-box;
  * {
    box-sizing: border-box;
  }
  cursor: default;
  color: var(--color);
  font-size: var(--font-size);
  line-height: var(--line-height);
  position: relative;

  // 表格外边框由 art-table-wrapper 提供，而不是由单元格提供
  &.use-outer-border {
    ${outerBorderStyleMixin};
  }

  // 表格不启用边框线，隐藏th、td的单元格左右边框线
  &:not(.${Classes.artTableBordered}) {
    ${notBorderedStyleMixin}
  }
  &.${Classes.artTableBordered}{
    ${borderedStyleMixin}
  }

  .no-scrollbar {
    ::-webkit-scrollbar {
      display: none;
    }
  }

  .${Classes.artTable} {
    overflow: auto;
    flex-shrink: 1;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  .${Classes.tableHeader} {
    overflow: hidden;
    background: var(--header-bgcolor);
    display: flex;
    flex-shrink: 0;
    border-bottom: var(--header-cell-border-horizontal);
  }

  .${Classes.tableHeaderCellContent} {
    display: flex;
    // justify-content: flex-start;
    align-items: center;
    height: inherit;
  }

  .${Classes.virtual} {
     overflow-x:auto;
     flex-shrink: 0;
     flex-grow: 0;
     scrollbar-width: none; // 兼容火狐
     & {
       ::-webkit-scrollbar {
         display:none;
       }
     }
   }

  .${Classes.tableFooter} {
    display: flex;
    flex: none;
  }
  .${Classes.tableBody}{
    flex-grow:1;
  }
  .${Classes.tableBody}, .${Classes.tableFooter} {
    background: var(--bgcolor);
    overflow: auto;
    overflow-x: hidden;
    overflow-anchor: none;
    position:relative;
    &.empty {
      position: relative;
    }
  }

  .${Classes.tableRow} {
    position: relative;
  }
  .${Classes.tableBody}, .${Classes.tableFooter}  {
    .${Classes.tableCellRangeSelected}{
      background-color: #e6effb !important;
    }
    .${Classes.tableCellRangeTop}{
      border-top: 1px solid #0E5FD8 !important;
    }
    .${Classes.tableCellRangeLeft}{
      border-${props => swapRTLDirection(props.direction, 'left')}: 1px solid #0E5FD8 !important;
    }
    .${Classes.tableCellRangeBottom}{
      border-bottom: 1px solid #0E5FD8 !important;
    }
    .${Classes.tableCellRangeRight}{
      border-${props => swapRTLDirection(props.direction, 'right')}: 1px solid #0E5FD8 !important;
    }
  }

  .${Classes.rangeSelection} {
    user-select:none;
  }

  .${Classes.rowDragging} {
    user-select:none;
    // .${Classes.tableBody} .${Classes.tableRow} >td{
    //     cursor:move;
    // }

    // .${Classes.tableFooter} .${Classes.tableRow} >td{
    //     cursor:no-drop;
    // }
    
  }

  .${Classes.rowDragStart}{
    opacity: 0.5;
  }
  .${Classes.rowDragNoData}{
    border: 1px solid var(--primary-color)
  }

  .${Classes.rowDragEndParent} td{
    border-top: 1px solid var(--primary-color) !important;
    border-bottom: 1px solid var(--primary-color) !important;
    
  }
  .${Classes.rowDragEndParent} td:first-child{
    border-${props => swapRTLDirection(props.direction, 'left')}: 1px solid var(--primary-color) !important;
    
  }
  .${Classes.rowDragEndParent} td:last-child{
    border-${props => swapRTLDirection(props.direction, 'right')}: 1px solid var(--primary-color) !important;
    
  }


  // .${Classes.rowDragEndToTop} td{
  //   border-top: 1px solid var(--primary-color) !important;
  // }

  .${Classes.rowDragEndInto} td{
    border-top: 1px solid var(--primary-color) !important;
    border-bottom: 1px solid var(--primary-color) !important;
  }

  .${Classes.rowDragEndInto} td:first-child{
    border-${props => swapRTLDirection(props.direction, 'left')}: 1px solid var(--primary-color) !important;
  }

  .${Classes.rowDragEndInto} td:last-child{
    border-${props => swapRTLDirection(props.direction, 'right')}: 1px solid var(--primary-color) !important;
  }

  // .${Classes.rowDragEndToBottom} td{
  //   border-bottom: 1px solid var(--primary-color) !important;
  // }

  .${Classes.rowDragCell} {
    cursor:pointer;
  }


  &.sticky-header .${Classes.tableHeader} {
    position: sticky;
    top: 0;
    z-index: ${Z.header};
  }

  &.sticky-footer .${Classes.tableFooter} {
    position: sticky;
    bottom: 0;
    z-index: ${Z.footer};
  }

  table {
    width: 0;
    table-layout: fixed;
    border-collapse: separate;
    border-spacing: 0;
    display: table;
    margin: 0;
    padding: 0;
    flex-shrink: 0;
    flex-grow: 0;
    position:relative;
  }

  // 在 tr 上设置 .no-hover 可以禁用鼠标悬停效果
  tr:not(.no-hover):hover > td {
    background: var(--hover-bgcolor);
  }
  // 使用 js 添加悬浮效果
  tr:not(.no-hover).row-hover > td {
    background: var(--hover-bgcolor);
  }
  // 在 tr 设置 highlight 可以为底下的 td 设置为高亮色
  // 而设置 .no-highlight 的话则可以禁用高亮效果；
  tr:not(.no-highlight).highlight > td {
    background: var(--highlight-bgcolor);
  }

  th {
    font-weight: normal;
    text-align: ${props => swapRTLDirection(props.direction, 'left')};
    padding: var(--cell-padding);
    height: var(--header-row-height);
    color: var(--header-color);
    background: var(--header-bgcolor);
    border:1px solid transparent;
    border-${props => swapRTLDirection(props.direction, 'right')}: var(--header-cell-border-vertical);
    border-bottom: var(--header-cell-border-horizontal);
    position: relative;
  }

  th.resizeable{
    border-${props => swapRTLDirection(props.direction, 'right')}: var(--header-cell-border-vertical)
  }

  th.${Classes.leaf} {
    border-${props => swapRTLDirection(props.direction, 'right')}: var(--header-cell-border-vertical);
    border-bottom: none;
  }

  tr.${Classes.first} th {
    border-top: var(--header-cell-border-horizontal);
  }
  th.${Classes.first} {
    border-${props => swapRTLDirection(props.direction, 'left')}: var(--header-cell-border-vertical);
  }

  td {
    padding: var(--cell-padding);
    background: var(--bgcolor);
    height: var(--row-height);
    border:1px solid transparent;
    border-${props => swapRTLDirection(props.direction, 'right')}: var(--cell-border-vertical);
    border-bottom: var(--cell-border-horizontal);
    word-break: break-all;
  }
  td.${Classes.first} {
    border-${props => swapRTLDirection(props.direction, 'left')}: var(--cell-border-vertical);
  }
  tr.${Classes.first} td {
    border-top: var(--cell-border-horizontal);
  }
  &.has-header tbody tr.${Classes.first} td {
    border-top: none;
  }
  &.has-footer tbody tr.${Classes.last} td {
    border-bottom: none;
  }

  .${Classes.lockLeft},
  .${Classes.lockRight} {
    z-index: ${Z.lock};
  }

  //#region 锁列阴影
  .${Classes.lockShadowMask} {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: ${Z.lockShadow};
    pointer-events: none;
    overflow: hidden;

    .${Classes.lockShadow} {
      height: 100%;
    }

    .${Classes.leftLockShadow} {
      margin-${props => swapRTLDirection(props.direction, 'right')}: ${LOCK_SHADOW_PADDING}px;
     
      box-shadow: none;

      &.show-shadow {
        box-shadow: var(--lock-shadow);
        border-${props => swapRTLDirection(props.direction, 'right')}: var(--cell-border-vertical);
      }
    }

    .${Classes.rightLockShadow} {
      margin-${props => swapRTLDirection(props.direction, 'left')}: ${LOCK_SHADOW_PADDING}px;
      box-shadow: none;

      &.show-shadow {
        box-shadow: var(--lock-shadow);
        border-${props => swapRTLDirection(props.direction, 'left')}: var(--cell-border-vertical);
      }
    }
  }
  //#endregion

  //#region 空表格展现
  .${Classes.emptyWrapper} {
    pointer-events: none;
    color: #99a3b3;
    font-size: 12px;
    text-align: center;
    position: absolute;
    ${props => swapRTLDirection(props.direction, 'left')}: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .empty-image {
      width: 50px;
      height: 50px;
    }

    .empty-tips {
      margin-top: 16px;
      line-height: 1.5;
    }
  }
  //#endregion

  //#region sticky兼容
  &.sticky-polyfill-wrapper{
    //锁定列兼容 仅在锁定列的情况下生效
    .${Classes.virtual} {
      overflow-x: hidden;
    }
    .${Classes.tableBody}, .${Classes.tableFooter} {
      position:relative;
    }
    .${Classes.tableHeaderMain} {
      overflow: hidden;
      display: flex;
    }
    .${Classes.tableHeader} {
      position: relative;
    }

    .${Classes.tableFooterMain} {
      display: flex;
      overflow: auto;
      overflow-x: hidden;
      overflow-anchor: none;
    }

    .${Classes.fixedLeft}, .${Classes.fixedRight}{
      position: absolute;
      z-index: ${Z.lock};
      top: 0;
    }
    .${Classes.fixedLeft}{
      ${props => swapRTLDirection(props.direction, 'left')}:0;
    }
    .${Classes.fixedRight}{
      rig${props => swapRTLDirection(props.direction, 'right')}ht:0;
    }

    .${Classes.rowDetailContainer}{
      .${Classes.rowDetailItem}{
        position: absolute;
        top: 0;
        width: 100%;
        z-index: ${Z.rowDetail};
      }
    }

    tr:not(.no-hover).row-hover > td {
      background: var(--hover-bgcolor);
    }
  }
  //#endregion sticky兼容

  //#region 粘性滚动条
  .${Classes.horizontalStickyScrollContainer}{
    display:flex;
    background: var(--bgcolor);
  }
  .${Classes.horizontalScrollLeftSpacer}{
    height: 1px;
    flex-shrink: 0;
    border-top: 1px solid var(--border-color);
  }

  .${Classes.horizontalScrollRightSpacer}{
    height: 1px;
    flex-shrink: 0;
    border-top: 1px solid var(--border-color);
  }
  .${Classes.stickyScroll} {
    overflow-y: hidden;
    overflow-x: auto;
    z-index: ${Z.scrollItem};
    flex-shrink: 1;
    flex-grow: 0;
    border-top: 1px solid var(--border-color);
  }

  .${Classes.stickyScrollItem} {
    // 必须有高度才能出现滚动条
    height: 1px;
    visibility: hidden;
  }
  //#endregion

  //#region 加载样式
  .${Classes.loadingWrapper} {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;

    .${Classes.loadingContentWrapper} {
      filter: none;
      width: 100%;
      height: 100%;
      overflow: hidden;//列全部固定时，存在双横向滚动条
      display: flex;
      position: relative;
      flex-direction: column;
    }

    .${Classes.loadingIndicatorWrapper} {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      pointer-events: none;
    }

    .${Classes.loadingIndicator} {
      position: sticky;
      z-index: ${Z.loadingIndicator};
      transform: translateY(-50%);
    }
  }
  //#endregion

  //#region 表格过滤
  .${Classes.tableFilterTrigger} {
    color:var(--icon-color);
    &.active{
      color:var(--primary-color);
    }
    padding: 6px 4px;
    &:hover{
      background-color: #e5e5e5;
    }
    &:focus {
      outline: none
    }
  }
  //#endregion

  //#region 表格排序
  .${Classes.tableSortIcon} {
    color:var(--icon-color);
    &.active{
      color:var(--primary-color);
    }
  }
  .${Classes.tableExtendIcon} {
    color:var(--icon-color);
    &.active{
      color:var(--primary-color);
    }
  }
  //#endregion

  //#region 滚动条占位
  .${Classes.verticalScrollPlaceholder} {
    // visibility: hidden;
    background: var(--header-bgcolor);
    position:sticky;
    z-index:5;
    ${props => swapRTLDirection(props.direction, 'right')}:0px;
    flex-shrink: 0;
  }
  .${Classes.tableFooter} .${Classes.verticalScrollPlaceholder} {
    border-top: var(--cell-border-horizontal);
  }
  //#endregion

  //#region 拖拽列宽大小
  .${Classes.tableHeaderCellResize}::after{
    background-color: var(--border-color);
  }
  //解决部分浏览器(chrome109)最后一个单元格的列宽拖拽区域绝对定位超出表格，导致表格竖分割线无法对齐
  .${Classes.tableHeaderRow} th.${Classes.last} .${Classes.tableHeaderCellResize}{
    ${props => swapRTLDirection(props.direction, 'right')}: 0;
    width: 5px;
    &::after{
      ${props => swapRTLDirection(props.direction, 'left')}: 4px;
    }
  }
`
export const ButtonCSS = css`
  ${variableConst}
  .${Classes.button}{
    color: var(--color);
    background:#ffffff;
    border:1px solid var(--strong-border-color);
    border-radius: 2px;
    cursor: pointer;
    &:hover{
      color: var(--primary-color);
      border:1px solid var(--primary-color);
    }
  }
  .${Classes.buttonPrimary} {
    color:#ffffff;
    background-color: var(--primary-color);
    border:none;
    &:hover{
      color:#ffffff;
      background-color: var(--primary-color-level2);
      border:none;
    }
  }
`
interface VariableObj {
  [key:string]: string|number
}
function getCssVariableText(obj: VariableObj){
  return Object.keys(obj).reduce((acc,key)=>{
    acc += `${key}:${obj[key]};`
    return acc
  },'')
}
