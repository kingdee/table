import { TablePipeline } from "../pipeline";
import React, { CSSProperties, ReactNode, useEffect } from 'react'
import { ArtColumn } from '../../interfaces'
import styled from 'styled-components'
import { internals } from '../../internals'
import { isLeafNode, makeRecursiveMapper } from '../../utils'
import cx from 'classnames'
import { Classes } from '../../base/styles'
export interface colGroupExtendOption {
  onChangeExtendStatus?({ }: any, { }: any): void,
  extendStatus?: {},
  extendIcon?: ReactNode | ((extendStatus: boolean) => ReactNode)
}

interface ExpandProps {
  style?: CSSProperties
  className?: string
  size?: number
  isExtend?: boolean
}
const ExtendIconStyle = styled.span`
  font-size:12px;
  margin-left:4px;
`
const stateKey = 'colExtend'
const ExpandIcon = ({ style, className, size, isExtend }: ExpandProps) => {
  return (
    isExtend ?
      <svg className={className} width={size} height={size} style={style} viewBox="96 96 896 896">
        <path d="M678.347087 178.347087C690.550972 166.143203 690.550972 146.356797 678.347087 134.152913C666.143203 121.949029 646.356797 121.949029 634.152913 134.152913L290.402913 477.902913C278.199029 490.106797 278.199029 509.893203 290.402913 522.097087L634.152913 865.847087C646.356797 878.050972 666.143203 878.050972 678.347087 865.847087C690.550972 853.643203 690.550972 833.856797 678.347087 821.652913L356.694175 500L678.347087 178.347087z"></path>
      </svg> : <svg className={className} width={size} height={size} style={style} viewBox="96 96 896 896">
        <path d="M321.652913 178.347087C309.449029 166.143203 309.449029 146.356797 321.652913 134.152913C333.856797 121.949029 353.643203 121.949029 365.847088 134.152913L709.597087 477.902913C721.800972 490.106797 721.800972 509.893203 709.597087 522.097087L365.847088 865.847087C353.643203 878.050972 333.856797 878.050972 321.652913 865.847087C309.449029 853.643203 309.449029 833.856797 321.652913 821.652913L643.305825 500L321.652913 178.347087z"></path>
      </svg>
  )
}

export const colGroupExtendable = (opts: colGroupExtendOption = {}) => (pipeline: TablePipeline) => {
  const columns = pipeline.getColumns()
  const curState = opts.extendStatus ?? pipeline.getStateAtKey(stateKey) ?? {}
  const processColumns = (columns: ArtColumn[]) => {
    // 当组合列可伸缩，且处于收缩状态时，只渲染一个子列，其他不渲染
    const toggle = (col) => {
      // 对应的 col 进行状态切换
      const changedValue = { [col.code]: !curState[col.code] }
      curState[col.code] = !curState[col.code]
      pipeline.setStateAtKey(stateKey, { ...curState })
      opts?.onChangeExtendStatus && opts.onChangeExtendStatus(curState, changedValue)
    }
    const addIcon = (col: ArtColumn) => {
      const result = { ...col }
      const curColState = curState[col.code]
      const displaycolExtendIcon: ReactNode = typeof opts.extendIcon === 'function' ? opts.extendIcon(curColState) : opts.extendIcon
      const addIconNode = (
        <>
          {internals.safeRenderHeader({ ...col })}
          <ExtendIconStyle
            onClick={() => { toggle(col) }}
          >
            {
              displaycolExtendIcon || <ExpandIcon
                style={{ userSelect: 'none', marginLeft: 2, flexShrink: 0, cursor: "pointer", verticalAlign: 'middle' }}
                className={cx({
                  [Classes.tableExtendIcon]: true,
                })}
                size={14}
                isExtend={curColState}
              />
            }
          </ExtendIconStyle>
        </>
      )
      result.title = addIconNode
      return result
    }
    return makeRecursiveMapper((col: ArtColumn) => {
      const { showExtendIcon } = col?.features || {}
      if (showExtendIcon === true && col.children?.length > 1) {
        col = addIcon(col)
        curState[col.code] === false && col.children.splice(1, col.children.length)
      }
      return col
    })(columns)
  }
  pipeline.columns(processColumns(columns))
  return pipeline
}
