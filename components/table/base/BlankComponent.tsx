import React, { useState, useImperativeHandle, forwardRef, memo } from 'react'
import cx from 'classnames'
import { Classes } from './styles'

interface BlankProps {
  height: number
  className?: string
}

export interface BlankRef {
  updateHeight: (newHeight: number) => void
}
const TopBlankComponent = forwardRef<BlankRef, BlankProps>(({ height: initialHeight }, ref) => {
  const [height, setHeight] = useState(initialHeight)
  useImperativeHandle(ref, () => ({
    updateHeight: (newHeight: number) => {
      if (height !== newHeight) {
        setHeight(newHeight)
      }
    }
  }), [height])

  return <div style={{ height }} />
})

TopBlankComponent.displayName = 'TopBlank'

const BottomBlankComponent = forwardRef<BlankRef, BlankProps>(({ height: initialHeight, className }, ref) => {
  const [height, setHeight] = useState(initialHeight)
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
      className={cx(Classes.virtualBlank, 'bottom', className)}
      style={{ height }}
    />
  )
})

BottomBlankComponent.displayName = 'BottomBlank'

// 使用 memo 优化，只有当 height 或 className 改变时才重新渲染
export const TopBlank = memo(TopBlankComponent, (prevProps, nextProps) => {
  return prevProps.height === nextProps.height && prevProps.className === nextProps.className
})

export const BottomBlank = memo(BottomBlankComponent, (prevProps, nextProps) => {
  return prevProps.height === nextProps.height && prevProps.className === nextProps.className
})
