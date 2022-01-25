import React from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import { mount } from 'enzyme'
import { multiSelect } from '../multiSelect'
import { useTablePipeline } from '../../pipeline'

const NAME = 'multiSelect'
const MockCheckbox = ({ indeterminate, ...props }) => <input type='checkbox' className='checkbox' {...props} />
const ROWS = [{ id: '1' }]
const INPUT_DATA = {
  columns: [],
  dataSource: ROWS
}

describe(`${NAME}`, () => {
  it('not set Checkbox', () => {
    const { result } = renderHook(() => useTablePipeline())
    const _multiSelect = () => multiSelect()(result.current)
    expect(_multiSelect).toThrowError(/Checkbox/)
  })

  it('set require props,test checkboxColumn render, cell change and select all event', () => {
    const { result } = renderHook(() => useTablePipeline({
      components: {
        Checkbox: MockCheckbox
      }
    }).input(INPUT_DATA)
      .primaryKey('id'))
    multiSelect({
      stopClickEventPropagation: true // 阻止冒泡
    })(result.current)
    expect(result.current.getColumns().length).toBeGreaterThan(0)

    const checkboxColumn = result.current.getColumns()[0]
    const wrapper = mount(checkboxColumn.render({}, { id: '1' }, 0))

    // 测试复选框行点击onChange
    act(() => {
      wrapper.find(MockCheckbox).at(0).simulate('change', { target: {}, nativeEvent: { stopPropagation: jest.fn() } })
    })

   expect(result.current.getStateAtKey('multiSelect')).toMatchObject({"lastKey": "1", "value": ["1"]})
  

    const titleWrapper = mount(checkboxColumn.title)
    // 测试选择列表头全选
    act(() => {
      titleWrapper.find(MockCheckbox).at(0).simulate('change')
    })
  })

  it('set clickArea=cell, test getCellProps and cell click', () => {
    const { result } = renderHook(() => useTablePipeline({
      components: {
        Checkbox: MockCheckbox
      }
    }).input(INPUT_DATA)
      .primaryKey('id'))

   multiSelect({
      clickArea: 'cell'
    })(result.current)

    const checkboxColumn = result.current.getColumns()[0]
    // 测试getCellProps
    const cellProps = checkboxColumn.getCellProps('', ROWS[0], 0)
    if (typeof cellProps.onClick === 'function') {
      act(() => {
        const mockEvent = {}
        cellProps.onClick(mockEvent)
      })
      expect(result.current.getStateAtKey('multiSelect')).toMatchObject({"lastKey": "1", "value": ["1"]})
    }
  })

  it('set clickArea=row, test appendRowPropsGetter fn', () => {
    const { result } = renderHook(() => useTablePipeline({
      components: {
        Checkbox: MockCheckbox
      }
    }).input(INPUT_DATA)
      .primaryKey('id'))
    const pipeline = multiSelect({
      lastKey:'1',//受控用法
      clickArea: 'row'
    })(result.current)
    // 调用 appendRowPropsGetter 设置的函数
    const props = pipeline.getProps()
    const rowProps = props.getRowProps(ROWS[0], 0)
    if (rowProps.onClick) {
      act(() => {
        const mockEvent = { shiftKey: true }
        rowProps.onClick(mockEvent as any)
      })
      expect(result.current.getStateAtKey('multiSelect')).toMatchObject({"lastKey": "1", "value": ["1"]})
    }
  })
})
