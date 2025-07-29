import React, { useState, useImperativeHandle, forwardRef, memo, useEffect } from 'react'
import cx from 'classnames'
import { Classes } from './styles'

interface BlankProps {
  height: number
}

export interface BlankRef {
  updateHeight: (newHeight: number) => void
}
const TopBlankComponent = forwardRef<BlankRef, BlankProps>(({ height: heightFromProps }, ref) => {
  useEffect(() => {
    setHeight(heightFromProps)
  }, [heightFromProps])
  const [height, setHeight] = useState(heightFromProps)
  useImperativeHandle(ref, () => ({
    updateHeight: (newHeight: number) => {
      if (height !== newHeight) {
        setHeight(newHeight)
      }
    }
  }), [height])

  return (
    <div
      key="top-blank"
      className={cx(Classes.virtualBlank, 'bottom')}
      style={{ height }}
    />
  )
})

TopBlankComponent.displayName = 'TopBlank'

const BottomBlankComponent = forwardRef<BlankRef, BlankProps>(({ height: heightFromProps }, ref) => {
  const [height, setHeight] = useState(heightFromProps)
  useEffect(() => {
    setHeight(heightFromProps)
  }, [heightFromProps])
  useImperativeHandle(ref, () => ({
    updateHeight: (newHeight: number) => {
      if (height !== newHeight) {
        setHeight(newHeight)
      }
    }
  }), [height])

  if (height <= 0) {
    return null
  }

  return (
    <div
      key="bottom-blank"
      className={cx(Classes.virtualBlank, 'bottom')}
      style={{ height }}
    />
  )
})

BottomBlankComponent.displayName = 'BottomBlank'

// 使用 memo 优化，只有当 height 或 className 改变时才重新渲染
export const TopBlank = memo(TopBlankComponent, (prevProps, nextProps) => {
  return prevProps.height === nextProps.height
})

export const BottomBlank = memo(BottomBlankComponent, (prevProps, nextProps) => {
  return prevProps.height === nextProps.height
})
