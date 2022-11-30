import React, { CSSProperties, ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import { Classes } from '../../../base/styles'

import { FilterPanel as FilterPanelType, DefaultFilterPanelProps, CustomeFilterPanelProps } from '../../../interfaces'
import FilterPanel from './FilterPanel'
import DefaultFilterContent from './DefaultFilterContent'
import DefaultFilterIcon from './DefaultFilterIcon'

import { calculatePopupRelative } from '../../../utils'
import { addResizeObserver } from '../../../base/utils'
import cx from 'classnames'

const HEADER_ICON_OFFSET_Y = 8 + 1 // padding-top + border
const HEADER_ICON_OFFSET_X = 16 + 1 // padding-left+ border

interface FilterProps{
  style?: CSSProperties
  className?: string
  size?: number
  isFilterActive:boolean,
  FilterPanelContent?: FilterPanelType
  filterIcon?:ReactNode
  setFilterModel: DefaultFilterPanelProps['setFilterModel']
  filterModel: DefaultFilterPanelProps['filterModel']
  setFilter: CustomeFilterPanelProps['setFilter']
  onClick?: (e: React.MouseEvent) => any
  stopClickEventPropagation?: boolean
}

const FilterIconSpanStyle = styled.span`
  // position: absolute;
  // right: 4px;
  // cursor: pointer;
  // transform: translateY(-50%);
  // top: 50%;
  // height: 12px; 
`

function Panel ({ ele, filterIcon, hidePanel, renderPanelContent }) {
  const filterPanelRef = React.useRef(null)
  const [position, setPosition] = React.useState(calculatePopupRelative(ele, document.body, { x: HEADER_ICON_OFFSET_X, y: HEADER_ICON_OFFSET_Y }))
  const style = {
    position: 'absolute',
    zIndex: 1050
  }

  const handleFilterPanelResize = (resize) => {
    setPosition(calculatePopupRelative(ele, document.body, { x: HEADER_ICON_OFFSET_X, y: HEADER_ICON_OFFSET_Y }))
  }

  useEffect(() => {
    const resizeObserver = addResizeObserver(filterPanelRef.current.children[0], handleFilterPanelResize)
    return () => {
      resizeObserver && resizeObserver.disconnect()
    }
  }, [])

  return (
    <div ref = {filterPanelRef}>
      <FilterPanel
        style={style}
        onClose={hidePanel}
        position={position}
        filterIcon={filterIcon}
      >
        {renderPanelContent()}
      </FilterPanel>
    </div>
  )
}

function Filter ({ size = 12, style, className, FilterPanelContent, filterIcon, setFilter, setFilterModel, filterModel, isFilterActive, stopClickEventPropagation }: FilterProps) {
  const [showPanel, setShowPanel] = React.useState(false)
  const iconRef = React.useRef(null)

  const hidePanel = () => setShowPanel(false)

  const renderPanelContent = () => {
    if (FilterPanelContent) {
      return <FilterPanelContent
        setFilter={setFilter}
        filterModel={filterModel}
        isFilterActive={isFilterActive}
        hidePanel={hidePanel}
      />
    } else {
      return <DefaultFilterContent
        setFilterModel={setFilterModel}
        filterModel={filterModel}
        isFilterActive={isFilterActive}
        hidePanel={hidePanel}
      />
    }
  }

  const handleIconClick = (e) => {
    // 只有当icon区域点击会触发面板展开
    // 防止 createPortal 区域的点击触发该事件
    if (!e.currentTarget.contains(e.target as HTMLElement)) {
      return
    }
    if (stopClickEventPropagation) {
      e.stopPropagation()
    }
    setShowPanel(true)
  }
  const iconClassName = cx({
    [className]: true,
    'filter-panel-open': showPanel
  })

  return (
    <FilterIconSpanStyle
      style={style}
      className={iconClassName}
      onClick={handleIconClick}
    >
      <span ref={iconRef} className={Classes.filterIcon}>
        {
          filterIcon || <DefaultFilterIcon width={size} height={size} />
        }
      </span>
      {showPanel &&
      createPortal(
        <Panel
          ele ={iconRef.current}
          filterIcon ={filterIcon}
          hidePanel = {hidePanel}
          renderPanelContent ={renderPanelContent}

        />,
        document.body)}
    </FilterIconSpanStyle>
  )
}

export default Filter
