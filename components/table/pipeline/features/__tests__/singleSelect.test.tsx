import { singleSelect } from '../singleSelect'
import { useTablePipeline } from '../../pipeline'
import { ArtColumn } from '../../../interfaces'
import { mount } from 'enzyme'
import { renderHook } from '@testing-library/react-hooks'
import React from 'react'

const dataSource = [
  { id: '1', name: '网络技术有限公司', amount: '600,000.00(CNY)', dept: '招商银行丨杭州分行', applier: 'James Collier' },
  { id: '2', name: '网络技术有限公司', amount: '600,000.00(CNY)', dept: '建设银行丨未来科技城', applier: 'Philip Burke' },
  { id: '3', name: '网络技术有限公司', amount: '600,000.00(CNY)', dept: '交通银行丨浙大路支行', applier: 'Wesley Cruz' },
  { id: '4', name: '网络技术有限公司', amount: '600,000.00(CNY)', dept: '招商银行丨庆春路支行', applier: 'Billy Horton' },
  { id: '5', name: '网络技术有限公司', amount: '600,000.00(CNY)', dept: '招商银行丨文一路分行', applier: 'Paul Tran' },
  { id: '6', name: '网络技术有限公司', amount: '600,000.00(CNY)', dept: '农业银行丨杭州分行', applier: 'Anna Poole' }
]

const columns:ArtColumn[] = [
  { code: 'name', width: 220, name: '公司名称' },
  { code: 'amount', width: 160, align: 'right', name: '金额' },
  { code: 'dept', width: 160, name: '金融机构' },
  { code: 'applier', width: 120, name: '申请人' }
]

function Radio ({ checked, disabled, onChange }) {
  return (
    <div>
      <input type='radio' disabled={disabled} checked={checked} onChange={onChange} />
    </div>
  )
}

describe('singleSelect 单元测试', () => {
  const opts:any = {
    value: '1',
    clickArea: 'cell',
    highlightRowWhenSelected: true,
    isDisabled: (row, rowIndex) => {
      return ['4', '5', '6'].includes(row.id)
    },
    onChange: jest.fn()
  }
  let newPipeline = null

  beforeEach(() => {
    const { result } = renderHook(() => useTablePipeline({ primaryKey: 'id', components: { Radio: Radio } }).input({ dataSource: dataSource, columns: columns }))
    const { current: tablePipeline } = result
    newPipeline = singleSelect(opts)(tablePipeline)
  })

  afterEach(() => {
    newPipeline = null
    opts.onChange.mockClear()
  })

  it('初始渲染', () => {
    const cols = newPipeline.getColumns()

    // 表格加上单选列所以有5列
    expect(cols.length).toBe(5)
  })

  it('getCellProps', () => {
    const col = newPipeline.getColumns()
    const cellProps = col[0].getCellProps('', newPipeline.getDataSource()[0], 0)
    expect(cellProps.style).toEqual({ cursor: 'pointer' })

    expect(opts.onChange).not.toHaveBeenCalled()
    cellProps.onClick()
    expect(opts.onChange).toHaveBeenCalled()
  })

  it('单元格渲染', () => {
    const col = newPipeline.getColumns()
    const wrapper = mount(col[0].render('', newPipeline.getDataSource()[0], 0))
    expect(wrapper.find('Radio').length).toBe(1)
  })
  it('触发区域为radio', () => {
    const { result } = renderHook(() => useTablePipeline({ primaryKey: 'id', components: { Radio: Radio } }).input({ dataSource: dataSource, columns: columns }))
    const { current: tablePipeline } = result
    opts.clickArea = 'radio'
    const newPipeline = singleSelect(opts)(tablePipeline)

    const col = newPipeline.getColumns()
    const wrapper = mount(col[0].render('', newPipeline.getDataSource()[0], 0))

    // Radio 触发onChange

    const input = wrapper.find('input')
    input.simulate('change')
    expect(opts.onChange).toHaveBeenCalled()

    opts.clickArea = 'cell'
  })

  it('appendRowPropsGetter', () => {
    const props = newPipeline.getProps()
    const rowProps = props.getRowProps(newPipeline.getDataSource()[0], 0)
    expect(rowProps.className).toBe('highlight')
    expect(rowProps.style).toEqual({})
  })

  it('触发区域为row', () => {
    const { result } = renderHook(() => useTablePipeline({ primaryKey: 'id', components: { Radio: Radio } }).input({ dataSource: dataSource, columns: columns }))
    const { current: tablePipeline } = result
    opts.clickArea = 'row'
    const newPipeline = singleSelect(opts)(tablePipeline)
    const props = newPipeline.getProps()
    const rowProps:any = props.getRowProps(newPipeline.getDataSource()[0], 0)
    expect(rowProps.style).toEqual({ cursor: 'pointer' })

    rowProps.onClick()
    expect(opts.onChange).toHaveBeenCalled()

    // disable的行没有样式
    const rowProps1 = props.getRowProps(newPipeline.getDataSource()[4], 4)
    expect(rowProps1.style).toEqual({})
  })
})
