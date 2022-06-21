import { treeSelect } from '../treeSelect'
import { useTablePipeline } from '../../pipeline'
import { ArtColumn } from '../../../interfaces'
import { mount } from 'enzyme'
import { renderHook } from '@testing-library/react-hooks'
import React from 'react'

function makeChildren (prefix) {
  return [
    {
      id: `${prefix}-1`,
      title: '二级标题',
      dept: '应用部',
      dest: '云南大理',
      guide: 'Douglas Lee',
      children: [
        { id: `${prefix}-1-1`, title: '三级标题', dept: '平台大前端-UED', dest: '云南大理', guide: 'Douglas Lee' },
        { id: `${prefix}-1-2`, title: '三级标题', dept: '平台大前端-前端', dest: '云南大理', guide: 'Douglas Lee' }
      ]
    },
    {
      id: `${prefix}-2`,
      title: '二级标题',
      dept: '应用部',
      dest: '云南大理',
      guide: 'Douglas Lee',
      children: [
        { id: `${prefix}-2-1`, title: '三级标题', dept: '平台大前端-UED', dest: '云南大理', guide: 'Douglas Lee' },
        { id: `${prefix}-2-2`, title: '三级标题', dept: '平台大前端-前端', dest: '云南大理', guide: 'Douglas Lee' }
      ]
    },
    { id: `${prefix}-3`, title: '二级标题', dept: '应用部', dest: '云南大理', guide: 'Douglas Lee' }
  ]
}

function Checkbox ({ checked, indeterminate, disabled, onChange }) {
  return (
    <div>
      <input type='checkbox' className='checkbox' disabled={disabled} checked={checked} onChange={onChange} />
    </div>
  )
}

const dataSource = [
  {
    id: '1',
    title: '一级标题',
    dept: '云苍穹-前端',
    dest: 'South Maddison',
    guide: 'Don Moreno',
    children: makeChildren('1')
  },
  {
    id: '2',
    title: '一级标题',
    dept: '云苍穹-模型',
    dest: 'Emilhaven',
    guide: 'Douglas Richards',
    children: makeChildren('2')
  },
  {
    id: '3',
    title: '一级标题',
    dept: '云苍穹-基础',
    dest: '云南大理',
    guide: 'Douglas Lee',
    children: makeChildren('3')
  },
  {
    id: '4',
    title: '一级标题',
    dept: '云苍穹-体验',
    dest: '杭州千岛湖',
    guide: 'Eric Castillo',
    children: makeChildren('4')
  },
  { id: '5', title: '一级标题', dept: '云苍穹-运营', dest: 'East Karl', guide: 'Herbert Patton' }
]
const columns:ArtColumn[] = [
  { code: 'title', name: '标题', width: 200, getCellProps: () => { return { style: { background: 'red' } } } },
  { code: 'dept', name: '部门名称', width: 180 },
  { code: 'dest', name: '团建目的地', width: 160 },
  { code: 'guide', name: '当地导游', width: 160 }
]

describe('treeSelect 单元测试', () => {
  const opts:any = {
    tree: dataSource,
    openKeys: ['1', '3'],
    clickArea: 'row',
    highlightRowWhenSelected: true,
    isDisabled: (row) => {
      return row.id === '5'
    },
    onChange: jest.fn()
  }
  let newPipeline = null

  beforeEach(() => {
    const { result } = renderHook(() => useTablePipeline({ primaryKey: 'id', components: { Checkbox: Checkbox } }).input({ dataSource: dataSource, columns: columns }))
    const { current: tablePipeline } = result
    newPipeline = treeSelect(opts)(tablePipeline)
  })
  afterEach(() => {
    newPipeline = null
    opts.onChange.mockClear()
  })

  it('初始化展示', () => {
    expect(newPipeline.getDataSource().length).toBe(5)
    // 多了勾选列
    expect(newPipeline.getColumns().length).toBe(5)
  })
  it('不传CheckBox', () => {
    const { result } = renderHook(() => useTablePipeline({ primaryKey: 'id' }).input({ dataSource: dataSource, columns: columns }))
    const { current: tablePipeline } = result

    expect(() => treeSelect(opts)(tablePipeline)).toThrow(Error)
  })
  it('勾选列渲染', () => {
    const col = newPipeline.getColumns()
    const wrapper = mount(col[0].render('1', newPipeline.getDataSource()[0]))
    expect(wrapper.find('Checkbox').length).toBe(1)
  })
  it('clickArea 为row, getCellProps为空', () => {
    const col = newPipeline.getColumns()
    const cellProps = col[0].getCellProps('1', newPipeline.getDataSource()[0])
    expect(cellProps).toBe(undefined)
  })
  it('clickArea 为cell,getCellProps', () => {
    const { result } = renderHook(() => useTablePipeline({ primaryKey: 'id', components: { Checkbox: Checkbox } }).input({ dataSource: dataSource, columns: columns }))
    const { current: tablePipeline } = result
    opts.clickArea = 'cell'

    const newPipeline = treeSelect(opts)(tablePipeline)

    const col = newPipeline.getColumns()
    const cellProps = col[0].getCellProps('1', newPipeline.getDataSource()[0])
    expect(cellProps.style).toEqual({ cursor: 'pointer' })

    cellProps.onClick()
    expect(opts.onChange).toHaveBeenCalled()

    // 禁用节点的交互
    const disabledCellProps = col[0].getCellProps('1', newPipeline.getDataSource()[4])
    expect(disabledCellProps.style).toEqual({ cursor: 'not-allowed' })
    opts.clickArea = 'row'
  })
  it('appendRowPropsGetter', () => {
    const props = newPipeline.getProps()
    const rowProps = props.getRowProps(newPipeline.getDataSource()[0], 0)
    expect(rowProps.style).toEqual({ cursor: 'pointer' })
    rowProps.onClick()
    expect(opts.onChange).toHaveBeenCalled()
  })
})
