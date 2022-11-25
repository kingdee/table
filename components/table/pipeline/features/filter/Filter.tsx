import React, { CSSProperties, ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import { Classes } from '../../../base/styles'

import { FilterPanel as FilterPanelType, DefaultFilterPanelProps, CustomeFilterPanelProps } from '../../../interfaces'
import FilterPanel from './FilterPanel'
import DefaultFilterContent from './DefaultFilterContent'

import { calculatePopupRelative } from '../../../utils'
import { addResizeObserver } from '../../../base/utils'
import cx from 'classnames'

const HEADER_ICON_OFFSET_Y = 6 + 1 // padding-top + border
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

  const handleMouseDown = (e) => {
    e.stopPropagation()// 阻止触发拖拽
  }

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
      ref={iconRef}
    >
      <span className={Classes.filterIcon} onClick={handleIconClick} onMouseDown={handleMouseDown}>
        {
          filterIcon || <svg
            width={size}
            height={size}
            viewBox="64 64 896 896"
            focusable="false"
            data-icon="filter"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M349 838c0 17.7 14.2 32 31.8 32h262.4c17.6 0 31.8-14.3
              31.8-32V642H349v196zm531.1-684H143.9c-24.5 0-39.8 26.7-27.5
              48l221.3 376h348.8l221.3-376c12.1-21.3-3.2-48-27.7-48z"
            ></path>
          </svg>
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
