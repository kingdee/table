import { renderHook, act } from '@testing-library/react-hooks'

import { useOnClickOutside, usePrevious, useMergedState, useResizeObserver } from '../hooks'

import { mount } from 'enzyme'

import React, { createRef } from 'react'

describe('hooks 单元测试', () => {
  it('useOnClickOutside', () => {
    const events: any = {}
    document.addEventListener = jest.fn((event, cb) => {
      events[event] = cb
    })

    const divRef = createRef<HTMLDivElement>()
    const Component = React.forwardRef<HTMLDivElement>((props, ref) => {
      return <div ref={ref} />
    })
    const instance = mount(<Component ref={divRef} />)
    const mockhandle = jest.fn((e: any) => null)
    renderHook(() => useOnClickOutside([divRef], mockhandle))
    // div的不能冒泡到document,触发不了回调
    // const div = instance.find('div')
    // div.simulate('mousedown')
    events.mousedown({ target: divRef.current })
    expect(mockhandle).not.toBeCalled()
    events.mousedown({ target: null })
    expect(mockhandle).toBeCalled()
  })

  it('usePrevious', () => {
    const { result, rerender } = renderHook((value) => usePrevious(value), {
      initialProps: 'test1'
    })

    // 返回先前的值
    rerender('test2')
    expect(result.current).toBe('test1')

    rerender('test3')
    expect(result.current).toBe('test2')
  })

  it('useMergedState', () => {
    const defaultStateValue:string = 'defaultStateValue'
    const options = {
      defaultValue: 'value',
      value: 'value1',
      onChange: jest.fn(),
      postState: jest.fn(() => { return 'value2' })
    }
    const { result } = renderHook(() => useMergedState(defaultStateValue, options))

    expect(result.current[0]).toBe('value2')
    expect(options.postState).toBeCalled()

    const newValue = 'newValue'
    const triggerChange = result.current[1]
    act(() => {
      triggerChange(newValue)
      // rerender()
    })

    expect(options.onChange).toBeCalled()
  })

  it('useResizeObserver', () => {
    const element = document.createElement('div')
    element.style.width = '500px'
    element.style.height = '300px'
    const mockhandle = jest.fn((e: any) => null)
    const { result, rerender } = renderHook(({ element, handler }) => useResizeObserver(element, handler), {
      initialProps: {
        element: element,
        handler: mockhandle
      }
    })

    expect(mockhandle).not.toBeCalled()

    element.style.width = '400px'
    act(() => {
      // const element1 = document.createElement('div')
      rerender({ element: element, handler: mockhandle })
    })

    // todo: ResizeObserver 大小变化监听不到
    // expect(mockhandle).toBeCalled()
  })
})
