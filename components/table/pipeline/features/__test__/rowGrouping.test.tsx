import { rowGrouping } from '../rowGrouping'
import { useTablePipeline } from '../../pipeline'
import { ArtColumn } from '../../../interfaces'
import { mount } from 'enzyme'
import { renderHook } from '@testing-library/react-hooks'

const dataSource = [
  {
    id: 'alibaba',
    groupTitle: '阿里巴巴网络技术有限公司',
    children: [
      { id: '1-1', title: '二级标题', dept: '消费者事业部-淘宝-UED', dest: '云南大理', guide: 'Douglas Lee' },
      { id: '1-2', title: '二级标题', dept: '消费者事业部-淘宝-UED', dest: '云南大理', guide: 'Douglas Lee' }
    ]
  },
  {
    id: 'antfin',
    groupTitle: '蚂蚁金服有限公司',
    children: [
      { id: '2-1', title: '二级标题', dept: '消费者事业部-淘宝-UED', dest: '云南大理', guide: 'Douglas Lee' },
      { id: '2-2', title: '二级标题', dept: '消费者事业部-淘宝-UED', dest: '云南大理', guide: 'Douglas Lee' }
    ]
  },
  { id: 'other', groupTitle: 'group without children' }
]

const columns : ArtColumn[] = [
  { code: 'title', name: '标题', width: 200 },
  { code: 'dept', name: '部门名称', width: 180 },
  { code: 'dest', name: '团建目的地', width: 160 },
  { code: 'guide', name: '当地导游', width: 160 }
]

describe('rowGrouping 单元测试', () => {
  const opts = {
    defaultOpenAll: true,
    onChangeOpenKeys: jest.fn()
  }
  let newPipeline = null
  beforeEach(() => {
    const { result } = renderHook(() => useTablePipeline({ primaryKey: 'id' }).input({ dataSource: dataSource, columns: columns }))
    const { current: tablePipeline } = result
    newPipeline = rowGrouping(opts)(tablePipeline)
  })
  afterEach(() => {
    newPipeline = null
    opts.onChangeOpenKeys.mockClear()
  })
  it('初始化', () => {
    expect(newPipeline.getDataSource().length).toBe(7)
  })
  it('getCellProps', () => {
    const col = newPipeline.getColumns()
    const cellProps = col[0].getCellProps('阿里巴巴网络技术有限公司', newPipeline.getDataSource()[0], 0)
    expect(cellProps.style).toEqual({ cursor: 'pointer' })

    cellProps.onClick()
    expect(opts.onChangeOpenKeys).toBeCalled()

    // 不是分组行没有cellProps
    const cellProps1 = col[0].getCellProps('阿里巴巴网络技术有限公司', newPipeline.getDataSource()[1], 1)
    expect(cellProps1).toBe(undefined)
  })
  it('getSpanRect', () => {
    const col = newPipeline.getColumns()
    const spanRect = col[0].getSpanRect('阿里巴巴网络技术有限公司', newPipeline.getDataSource()[0], 0)
    expect(spanRect).toEqual({ top: 0, bottom: 1, left: 0, right: 5 })
  })
  it('单元格渲染', () => {
    const col = newPipeline.getColumns()
    const wrapper = mount(col[0].render('1', newPipeline.getDataSource()[0], 0))
    expect(wrapper.find('.expansion-cell').length).toBe(2)

    const wrapper1 = mount(col[0].render('1', newPipeline.getDataSource()[1], 1))
    expect(wrapper1.find('.expansion-cell').length).toBe(0)
  })

  it('appendRowPropsGetter', () => {
    const props = newPipeline.getProps()
    const rowProps = props.getRowProps(newPipeline.getDataSource()[0], 0)
    expect(rowProps.className).toBe('alternative')
  })
})
