import React from 'react'
import ResizeObserver from 'resize-observer-polyfill'

const useResizeObserver = (callbck: Function, [element]: Array<HTMLElement>) => {
  React.useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      callbck()
    })

    resizeObserver.observe(element)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])
}

export default useResizeObserver
