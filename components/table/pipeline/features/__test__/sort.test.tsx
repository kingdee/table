import { sort } from '../sort'
import { useTablePipeline } from '../../pipeline'
import { ArtColumn } from '../../../interfaces'
import { mount } from 'enzyme'
import { renderHook } from '@testing-library/react-hooks'

const dataSource = [
  { id: '1', prov: '湖北省', confirm: 54406, cure: 4793, dead: 1457, t: '2020-02-15 19:52:02' },
  { id: '2', prov: '广东省', confirm: 1294, cure: 409, dead: 2, t: '2020-02-15 19:52:02' },
  { id: '3', prov: '河南省', confirm: 1212, cure: 390, dead: 13, t: '2020-02-15 19:52:02' },
  { id: '4', prov: '浙江省', confirm: 1000, cure: 428, dead: 0, t: '2020-02-15 19:52:02' },
  { id: '5', prov: '湖南省', confirm: 1000, cure: 417, dead: 2, t: '2020-02-15 19:52:02' }
]

const columns:ArtColumn[] = [
  { code: 'prov', name: '省份', width: 150, features: { sortable: true } },
  { code: 'confirm', name: '确诊', width: 100, align: 'right', features: { sortable: true } },
  { code: 'cure', name: '治愈', width: 100, align: 'right', features: { sortable: true } },
  { code: 'dead', name: '死亡', width: 100, align: 'right', features: { sortable: true } },
  { code: 't', name: '更新时间', width: 180, features: { sortable: true } }
]

describe('sort 单元测试', () => {
  const opts:any = {
    defaultSorts: [{ code: 'cure', order: 'asc' }],
    highlightColumnWhenActive: true,
    mode: 'single',
    keepDataSource: false,
    onChangeSorts: jest.fn()
  }
  let newPipeline = null
  beforeEach(() => {
    const { result } = renderHook(() => useTablePipeline({ primaryKey: 'id' }).input({ dataSource: dataSource, columns: columns }))
    const { current: tablePipeline } = result
    newPipeline = sort(opts)(tablePipeline)
  })
  afterEach(() => {
    newPipeline = null
    opts.onChangeSorts.mockClear()
  })

  it('初始化数据', () => {
    // 默认cure列升序排序
    expect(newPipeline.getDataSource()[0]).toEqual({ id: '3', prov: '河南省', confirm: 1212, cure: 390, dead: 13, t: '2020-02-15 19:52:02' })
  })
  it('列头单元格渲染', () => {
    const col = newPipeline.getColumns()
    const wrapper = mount(col[0].title)

    expect(wrapper.find('SortIcon').length).toBe(1)

    // 列头单元格
    const div = wrapper.find('div').at(0)
    div.simulate('click')
    expect(opts.onChangeSorts).toBeCalledWith([{ code: 'prov', order: 'desc' }], { code: 'prov', order: 'desc' })

    expect(1).toBe(1)
  })
  it('getCellProps', () => {
    const col = newPipeline.getColumns()

    const cellProps = col[2].getCellProps(4793, newPipeline.getDataSource()[0], 0)
    expect(cellProps.style).toEqual({ background: 'var(--highlight-bgcolor)' })
  })
  it('keepDataSource为true,数据不变', () => {
    const { result } = renderHook(() => useTablePipeline({ primaryKey: 'id' }).input({ dataSource: dataSource, columns: columns }))
    const { current: tablePipeline } = result
    opts.keepDataSource = true
    const newPipeline = sort(opts)(tablePipeline)
    expect(newPipeline.getDataSource()[0].id).toBe('1')

    opts.keepDataSource = false
  })
  it('多列排序', () => {
    const { result } = renderHook(() => useTablePipeline({ primaryKey: 'id' }).input({ dataSource: dataSource, columns: columns }))
    const { current: tablePipeline } = result
    opts.defaultSorts = [{ code: 'confirm', order: 'desc' }, { code: 'cure', order: 'asc' }]
    opts.mode = 'multiple'
    const newPipeline = sort(opts)(tablePipeline)
    // confirm 降序，cure升序
    expect(newPipeline.getDataSource()[3].confirm).toBe(1000)
    expect(newPipeline.getDataSource()[3].cure).toBe(417)

    expect(newPipeline.getDataSource()[4].confirm).toBe(1000)
    expect(newPipeline.getDataSource()[4].cure).toBe(428)

    const col = newPipeline.getColumns()
    const confirmWrapper = mount(col[1].title)
    // 列头单元格
    const div = confirmWrapper.find('div').at(0)
    div.simulate('click')
    // confirm 列初始是降序，点击后是升序
    // calls[0][1]表示第1次调用的第二个参数
    expect(opts.onChangeSorts.mock.calls[0][1]).toEqual({ code: 'confirm', order: 'asc' })

    opts.onChangeSorts.mockClear()

    const cureWrapper = mount(col[2].title)
    const div1 = cureWrapper.find('div').at(0)
    div1.simulate('click')
    // confirm 列初始是升序，点击后没有排序
    expect(opts.onChangeSorts.mock.calls[0][1]).toEqual({ code: 'cure', order: 'none' })
  })
})
