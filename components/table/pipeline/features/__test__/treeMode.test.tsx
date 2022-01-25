import { treeMode } from '../treeMode'
import { useTablePipeline } from '../../pipeline'
import { ArtColumn } from '../../../interfaces'
import { mount } from 'enzyme'
import { renderHook } from '@testing-library/react-hooks'

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

describe('treeMode 单元测试', () => {
  const opts:any = {
    openKeys: ['4', '4-2'],
    clickArea: 'content',
    onChangeOpenKeys: jest.fn()
  }
  let newPipeline = null

  beforeEach(() => {
    const { result } = renderHook(() => useTablePipeline({ primaryKey: 'id' }).input({ dataSource: dataSource, columns: columns }))
    const { current: tablePipeline } = result
    newPipeline = treeMode(opts)(tablePipeline)
  })
  afterEach(() => {
    newPipeline = null
    opts.onChangeOpenKeys.mockClear()
  })

  it('初始化展示', () => {
    // 5 + 3 + 2
    expect(newPipeline.getDataSource().length).toBe(10)
  })

  it('展开图标单元格渲染', () => {
    const col = newPipeline.getColumns()
    const wrapper = mount(col[0].render('一级标题', newPipeline.getDataSource()[0], 0))

    expect(wrapper.find('CaretRightIcon').length).toBe(1)
    const div = wrapper.find('div').at(0)
    div.simulate('click')
    expect(opts.onChangeOpenKeys).toHaveBeenCalled()
    expect(opts.onChangeOpenKeys).toBeCalledWith(['4', '4-2', '1'], '1', 'expand')

    opts.onChangeOpenKeys.mockClear()
    // 展开列点击
    const expandColWrapper = mount(col[0].render('一级标题', newPipeline.getDataSource()[3], 3))
    const div1 = expandColWrapper.find('div').at(0)
    div1.simulate('click')
    expect(opts.onChangeOpenKeys).toBeCalledWith(['4-2'], '4', 'collapse')

    // 叶子节点渲染
    const leafWrapper = mount(col[0].render('一级标题', newPipeline.getDataSource()[9], 9))
    expect(leafWrapper.find('.expansion-cell.leaf').length).toBe(2)
  })
  it('getCellProps', () => {
    const col = newPipeline.getColumns()
    // clickArea: 'content' 取默认的cellProps
    expect(col[0].getCellProps()).toEqual({ style: { background: 'red' } })
  })
  it('clickArea 为cell', () => {
    const { result } = renderHook(() => useTablePipeline({ primaryKey: 'id' }).input({ dataSource: dataSource, columns: columns }))
    const { current: tablePipeline } = result
    opts.clickArea = 'cell'

    const newPipeline = treeMode(opts)(tablePipeline)
    const col = newPipeline.getColumns()
    const cellProps = col[0].getCellProps('一级标题', newPipeline.getDataSource()[0], 0)
    expect(cellProps.style).toEqual({ background: 'red', cursor: 'pointer' })

    cellProps.onClick()
    expect(opts.onChangeOpenKeys).toHaveBeenCalled()

    // 叶子节点cellProps
    const leafCellProps = col[0].getCellProps('一级标题', newPipeline.getDataSource()[9], 9)
    expect(leafCellProps.style).toEqual({ background: 'red' })
  })
})
