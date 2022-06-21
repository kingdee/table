import { rowDetail, RowDetailFeatureOptions } from '../rowDetail'
import { useTablePipeline } from '../../pipeline'
import { ArtColumn } from '../../../interfaces'
import { mount } from 'enzyme'
import { renderHook } from '@testing-library/react-hooks'
import { act } from 'react-dom/test-utils'

const dataSource = [
  { id: '1', prov: '湖北省', confirm: 54406, cure: 4793, dead: 1457, t: '2020-02-15 19:52:02' },
  { id: '2', prov: '广东省', confirm: 1294, cure: 409, dead: 2, t: '2020-02-15 19:52:02' },
  { id: '3', prov: '河南省', confirm: 1212, cure: 390, dead: 13, t: '2020-02-15 19:52:02' },
  { id: '4', prov: '浙江省', confirm: 1162, cure: 428, dead: 0, t: '2020-02-15 19:52:02' },
  { id: '5', prov: '湖南省', confirm: 1001, cure: 417, dead: 2, t: '2020-02-15 19:52:02' }
]

const columns: ArtColumn[] = [
  { code: 'prov', name: '省份', width: 150, features: { sortable: true, filterable: true } },
  { code: 'confirm', name: '确诊', width: 100, align: 'right', features: { sortable: true, filterable: true } },
  { code: 'cure', name: '治愈', width: 100, align: 'right', features: { sortable: true, filterable: true } },
  { code: 'dead', name: '死亡', width: 100, align: 'right', features: { sortable: true, filterable: true } },
  { code: 't', name: '更新时间', width: 180, features: { sortable: true, filterable: true } }
]

describe('rowDetail 单元测试', () => {
  const opt: RowDetailFeatureOptions = {
    defaultOpenKeys: ['2'],
    clickArea: 'content',
    hasDetail: (row) => {
      return ['1', '2', '3'].includes(row.id)
    },
    renderDetail: jest.fn(),
    onChangeOpenKeys: jest.fn()
  }
  it('初始化', () => {
    const { result } = renderHook(() => useTablePipeline({ primaryKey: 'id' }).input({ dataSource: dataSource, columns: columns }))
    const { current: tablePipeline } = result
    const newPipeline = rowDetail(opt)(tablePipeline)
    // 默认有1行展开，所以有6行
    expect(newPipeline.getDataSource().length).toBe(6)
  })
  it('primaryKey不传', () => {
    const { result } = renderHook(() => useTablePipeline().input({ dataSource: dataSource, columns: columns }))
    const { current: tablePipeline } = result

    expect(() => rowDetail(opt)(tablePipeline)).toThrow(Error)
  })
  it('模拟行点击事件', () => {
    const { result } = renderHook(() => useTablePipeline({ primaryKey: 'id' }).input({ dataSource: dataSource, columns: columns }))
    const { current: tablePipeline } = result
    const newPipeline = rowDetail(opt)(tablePipeline)

    const newDataSource = newPipeline.getDataSource()
    const col = newPipeline.getColumns()
    const wrapper = mount(col[0].render('1', newDataSource[0], 0))
    const div = wrapper.find('div').at(0)

    expect(opt.onChangeOpenKeys).toHaveBeenCalledTimes(0)
    act(() => {
      div.simulate('click')
    })

    expect(opt.onChangeOpenKeys).toHaveBeenCalledTimes(1)

    // 点击没有展开行的行，不会触发onChange回调
    const wrapper1 = mount(col[0].render('4', newDataSource[4], 4))
    const div1 = wrapper1.find('div').at(0)

    act(() => {
      div1.simulate('click')
    })

    expect(opt.onChangeOpenKeys).toHaveBeenCalledTimes(1)
  })
  it('设置指定列展开', () => {
    const { result } = renderHook(() => useTablePipeline({ primaryKey: 'id' }).input({ dataSource: dataSource, columns: columns }))
    const { current: tablePipeline } = result
    opt.expandColumnCode = 'confirm'
    const newPipeline = rowDetail(opt)(tablePipeline)

    const col = newPipeline.getColumns()
    const wrapper = mount(col[1].render('1', newPipeline.getDataSource()[0], 0))
    // 不知道为啥是两个
    expect(wrapper.find('.expansion-cell').length).toBe(2)

    col[0].render('1', newPipeline.getDataSource()[2], 2)
    expect(opt.renderDetail).toBeCalled()

    const spanRect = col[0].getSpanRect('1', newPipeline.getDataSource()[2], 2)
    expect(spanRect).toEqual({ top: 2, bottom: 3, left: 0, right: 5 })
    delete opt.expandColumnCode
  })

  it('getCellProps 和getSpanRect', () => {
    const { result } = renderHook(() => useTablePipeline({ primaryKey: 'id' }).input({ dataSource: dataSource, columns: columns }))
    const { current: tablePipeline } = result
    opt.clickArea = 'cell'
    const newPipeline = rowDetail(opt)(tablePipeline)
    const cols = newPipeline.getColumns()
    const cellProps = cols[0].getCellProps('1', newPipeline.getDataSource()[0], 0)
    expect(cellProps.style).toEqual({ cursor: 'pointer' })

    cellProps.onClick()
    expect(opt.onChangeOpenKeys).toBeCalled()

    // detail 总是成一行
    const spanRect = cols[0].getSpanRect('1', newPipeline.getDataSource()[2], 2)
    expect(spanRect).toEqual({ top: 2, bottom: 3, left: 0, right: 5 })
  })
})
