import { tips } from '../tips'
import { useTablePipeline } from '../../pipeline'
import { ArtColumn } from '../../../interfaces'
import { mount } from 'enzyme'
import { renderHook } from '@testing-library/react-hooks'
import React from 'react'

const dataSource = [
  { id: '1', prov: '湖北省', confirm: 54406, cure: 4793, dead: 1457, t: '2020-02-15 19:52:02' },
  { id: '2', prov: '广东省', confirm: 1294, cure: 409, dead: 2, t: '2020-02-15 19:52:02' },
  { id: '3', prov: '河南省', confirm: 1212, cure: 390, dead: 13, t: '2020-02-15 19:52:02' },
  { id: '4', prov: '浙江省', confirm: 1000, cure: 428, dead: 0, t: '2020-02-15 19:52:02' },
  { id: '5', prov: '湖南省', confirm: 1000, cure: 417, dead: 2, t: '2020-02-15 19:52:02' }
]

const columns:ArtColumn[] = [
  { code: 'prov', name: '省份', width: 150, features: { tips: '省份信息' } },
  { code: 'confirm', name: '确诊', width: 100, align: 'right', features: { tips: '确诊数量' } },
  { code: 'cure', name: '治愈', width: 100, align: 'right' },
  { code: 'dead', name: '死亡', width: 100, align: 'right' },
  { code: 't', name: '更新时间', width: 180 }
]

function Tooltip ({ title, children }) {
  return <div>{title}</div>
}

describe('tips 单元测试', () => {
  let newPipeline = null
  beforeEach(() => {
    const { result } = renderHook(() => useTablePipeline({ primaryKey: 'id', components: { Tooltip: Tooltip } }).input({ dataSource: dataSource, columns: columns }))
    const { current: tablePipeline } = result
    newPipeline = tips()(tablePipeline)
  })
  afterEach(() => {
    newPipeline = null
  })
  it('初始化时存在Tooltip组件', () => {
    const col = newPipeline.getColumns()
    const wrapper = mount(col[0].title)
    expect(wrapper.find('Tooltip').length).toBe(1)
  })
  it('不传Tooltip', () => {
    const { result } = renderHook(() => useTablePipeline({ primaryKey: 'id' }).input({ dataSource: dataSource, columns: columns }))
    const { current: tablePipeline } = result

    expect(() => tips()(tablePipeline)).toThrow(Error)
  })
})
