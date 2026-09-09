import React from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import { multiSelect } from '../multiSelect'
import { sort } from '../sort'
import { useTablePipeline } from '../../pipeline'
import { ArtColumn } from '../../../interfaces'

const MockCheckbox = ({ indeterminate, ...props }: any) => (
  <input type="checkbox" className="checkbox" {...props} />
)

// 数据: val 降序排列为 C(1), B(3), A(2) → 升序排列为 A(2), B(3), C(1)
const dataSource = [
  { id: '1', val: 'C' },
  { id: '2', val: 'A' },
  { id: '3', val: 'B' }
]

const columns: ArtColumn[] = [
  { code: 'val', name: 'Value', width: 100, features: { sortable: true } }
]

const sortAscOpts = {
  sorts: [{ code: 'val', order: 'asc' as const }],
  keepDataSource: false,
  onChangeSorts: jest.fn()
}

function buildPipeline (multiSelectOpts: any) {
  const { result } = renderHook(() =>
    useTablePipeline({ primaryKey: 'id', components: { Checkbox: MockCheckbox } })
      .input({ dataSource: dataSource, columns: columns })
  )
  const pipeline = result.current
  multiSelect(multiSelectOpts)(pipeline)
  sort(sortAscOpts)(pipeline)
  return pipeline
}

/** 直接从 checkboxColumn.title 元素的 props 上取 onChange 并调用，绕开 enzyme mount */
function triggerSelectAll (pipeline: any) {
  const checkboxColumn = pipeline.getColumns()[0]
  const onChange = (checkboxColumn.title as any).props.onChange
  act(() => { onChange({}) })
}

describe('multiSelect + sort — Shift 懒计算修复', () => {
  afterEach(() => {
    sortAscOpts.onChangeSorts.mockClear()
  })

  it('sort 后 Shift 选中返回排序后顺序的连续区间', () => {
    const onChangeMock = jest.fn()
    const pipeline = buildPipeline({
      value: [],
      lastKey: '2',
      clickArea: 'row',
      onChange: onChangeMock
    })

    const props = pipeline.getProps()
    const sortedData = pipeline.getDataSource()
    expect(sortedData.map((r: any) => r.id)).toEqual(['2', '3', '1'])

    const rowProps = props.getRowProps!(sortedData[2], 2)
    act(() => { rowProps!.onClick!({ shiftKey: true } as any) })

    expect(onChangeMock).toHaveBeenCalledWith(
      ['2', '3', '1'], '1', ['2', '3', '1'], 'check'
    )
  })

  it('lastKey 不在终态数据中时退化为单选（-1 守卫）', () => {
    const onChangeMock = jest.fn()
    const pipeline = buildPipeline({
      value: [],
      lastKey: 'nonexistent',
      clickArea: 'row',
      onChange: onChangeMock
    })

    const props = pipeline.getProps()
    const sortedData = pipeline.getDataSource()
    const rowProps = props.getRowProps!(sortedData[2], 2)
    act(() => { rowProps!.onClick!({ shiftKey: true } as any) })

    expect(onChangeMock).toHaveBeenCalledWith(['1'], '1', ['1'], 'check')
  })

  it('全选返回排序后顺序的全部 keys', () => {
    const onChangeMock = jest.fn()
    const pipeline = buildPipeline({ value: [], onChange: onChangeMock })
    triggerSelectAll(pipeline)
    expect(onChangeMock).toHaveBeenCalledWith(
      ['2', '3', '1'], '', ['2', '3', '1'], 'check-all'
    )
  })

  it('batchKeys 不含重复 key', () => {
    const onChangeMock = jest.fn()
    const pipeline = buildPipeline({
      value: [],
      lastKey: '2',
      clickArea: 'row',
      onChange: onChangeMock
    })
    const props = pipeline.getProps()
    const sortedData = pipeline.getDataSource()
    const rowProps = props.getRowProps!(sortedData[2], 2)
    act(() => { rowProps!.onClick!({ shiftKey: true } as any) })

    const [, , batchKeys] = onChangeMock.mock.calls[0]
    expect(batchKeys).toEqual([...new Set(batchKeys)]) // 无重复
  })
})

describe('multiSelect — fullRowsSet 过滤后注入行', () => {
  it('后注入行（模拟明细行/分组头）不被收进 Shift 区间和全选集合', () => {
    const onChangeMock = jest.fn()
    const { result } = renderHook(() =>
      useTablePipeline({ primaryKey: 'id', components: { Checkbox: MockCheckbox } })
        .input({
          dataSource: [{ id: '1', name: 'A' }, { id: '2', name: 'B' }],
          columns: [{ code: 'name', name: 'Name', width: 100 }]
        })
    )
    const pipeline = result.current

    multiSelect({
      value: [], lastKey: '1', clickArea: 'row', onChange: onChangeMock
    })(pipeline)

    const primaryKey = pipeline.ctx.primaryKey as string
    const detailRow = { ...pipeline.getDataSource()[0], [primaryKey]: '1_detail', __detail: true }
    pipeline.dataSource([pipeline.getDataSource()[0], detailRow, pipeline.getDataSource()[1]])

    expect(pipeline.getDataSource().map((r: any) => r[primaryKey])).toEqual(['1', '1_detail', '2'])

    // --- Shift ---
    const props = pipeline.getProps()
    const terminalData = pipeline.getDataSource()
    const rowProps = props.getRowProps!(terminalData[2], 2)
    act(() => { rowProps!.onClick!({ shiftKey: true } as any) })

    expect(onChangeMock).toHaveBeenCalledWith(['1', '2'], '2', ['1', '2'], 'check')
    const [, , shiftBatchKeys] = onChangeMock.mock.calls[0]
    expect(shiftBatchKeys).not.toContain('1_detail')

    // --- 全选 ---
    onChangeMock.mockClear()
    const { result: r2 } = renderHook(() =>
      useTablePipeline({ primaryKey: 'id', components: { Checkbox: MockCheckbox } })
        .input({
          dataSource: [{ id: '1', name: 'A' }, { id: '2', name: 'B' }],
          columns: [{ code: 'name', name: 'Name', width: 100 }]
        })
    )
    const pipeline2 = r2.current
    multiSelect({ value: [], onChange: onChangeMock })(pipeline2)
    const dr2 = { ...pipeline2.getDataSource()[0], [primaryKey]: '1_detail', __detail: true }
    pipeline2.dataSource([pipeline2.getDataSource()[0], dr2, pipeline2.getDataSource()[1]])
    triggerSelectAll(pipeline2)

    const [, , allKeys] = onChangeMock.mock.calls[0]
    expect(allKeys).toEqual(['1', '2'])
    expect(allKeys).not.toContain('1_detail')
  })
})

describe('multiSelect — treeMode 模拟（终态行残留 children）', () => {
  // treeMode.tsx:134 展平行 = { [treeMetaKey]: treeMeta, ...node }
  // ...node 把 children 原样保留。若用 collectNodes 遍历会重复收集子节点。
  // 修复：getEnableKeys 直接 forEach 终态数组，不递归 children。

  // 树结构: P1(children:[C1,C2]), P2
  // P1 展开时 treeMode 输出 = [P1(含children), C1, C2, P2]
  it('展开树：无重复 key，batchKeys 与全选均不含重复', () => {
    const onChangeMock = jest.fn()
    const { result } = renderHook(() =>
      useTablePipeline({ primaryKey: 'id', components: { Checkbox: MockCheckbox } })
        .input({
          dataSource: [
            { id: '1', name: 'P1', children: [{ id: '1-1', name: 'C1' }, { id: '1-2', name: 'C2' }] },
            { id: '2', name: 'P2' }
          ],
          columns: [{ code: 'name', name: 'Name', width: 100 }]
        })
    )
    const pipeline = result.current

    multiSelect({
      value: [], lastKey: '1', clickArea: 'row', onChange: onChangeMock
    })(pipeline)

    // 模拟 treeMode 展平 P1 后的终态数据：父行残留 children，子行也在数组中
    const treeMeta = Symbol('treeMeta')
    const p1 = pipeline.getDataSource()[0]
    const c1 = { ...p1.children[0], [treeMeta]: { depth: 1, isLeaf: true } }
    const c2 = { ...p1.children[1], [treeMeta]: { depth: 1, isLeaf: true } }
    const p1Flat = { ...p1, [treeMeta]: { depth: 0, isLeaf: false } } // children 仍在
    const p2 = { ...pipeline.getDataSource()[1], [treeMeta]: { depth: 0, isLeaf: true } }
    pipeline.dataSource([p1Flat, c1, c2, p2])

    // fullRowsSet 在 step 期用 collectNodes 收集了全树 = {1, 1-1, 1-2, 2}
    // getEnableKeys 直接 forEach 终态数组 → ['1','1-1','1-2','2']，无重复
    const props = pipeline.getProps()
    const terminalData = pipeline.getDataSource()
    // Shift 点击 P2（index=3），lastKey='1'
    const rowProps = props.getRowProps!(terminalData[3], 3)
    act(() => { rowProps!.onClick!({ shiftKey: true } as any) })

    const [, , batchKeys] = onChangeMock.mock.calls[0]
    // 无重复：每个 key 只出现一次
    expect(batchKeys).toEqual([...new Set(batchKeys)])
    // 区间 = 终态顺序 ['1','1-1','1-2','2']
    expect(batchKeys).toEqual(['1', '1-1', '1-2', '2'])

    // 全选也无重复
    onChangeMock.mockClear()
    triggerSelectAll(pipeline)
    const [, , allKeys] = onChangeMock.mock.calls[0]
    expect(allKeys).toEqual([...new Set(allKeys)])
    expect(allKeys).toEqual(['1', '1-1', '1-2', '2'])
  })

  // P1 折叠时 treeMode 输出 = [P1(含children), P2]
  // collectNodes 会递归 P1 残留的 children 收集不可见的 C1、C2
  // 修复：直接 forEach 不递归 → 只含 ['1','2']，不含折叠子节点
  it('折叠树：不可见子节点不混入 Shift 区间和全选', () => {
    const onChangeMock = jest.fn()
    const { result } = renderHook(() =>
      useTablePipeline({ primaryKey: 'id', components: { Checkbox: MockCheckbox } })
        .input({
          dataSource: [
            { id: '1', name: 'P1', children: [{ id: '1-1', name: 'C1' }, { id: '1-2', name: 'C2' }] },
            { id: '2', name: 'P2' }
          ],
          columns: [{ code: 'name', name: 'Name', width: 100 }]
        })
    )
    const pipeline = result.current

    multiSelect({
      value: [], lastKey: '1', clickArea: 'row', onChange: onChangeMock
    })(pipeline)

    // 模拟 treeMode 折叠 P1 后的终态数据：只有 P1（含 children）和 P2
    const treeMeta = Symbol('treeMeta')
    const p1 = pipeline.getDataSource()[0]
    const p1Flat = { ...p1, [treeMeta]: { depth: 0, isLeaf: false, expanded: false } }
    const p2 = { ...pipeline.getDataSource()[1], [treeMeta]: { depth: 0, isLeaf: true } }
    pipeline.dataSource([p1Flat, p2])

    // Shift 点击 P2，lastKey='1'
    const props = pipeline.getProps()
    const terminalData = pipeline.getDataSource()
    const rowProps = props.getRowProps!(terminalData[1], 1)
    act(() => { rowProps!.onClick!({ shiftKey: true } as any) })

    // getEnableKeys 直接 forEach → ['1','2']，不含折叠的 '1-1'、'1-2'
    const [, , batchKeys] = onChangeMock.mock.calls[0]
    expect(batchKeys).toEqual(['1', '2'])
    expect(batchKeys).not.toContain('1-1')
    expect(batchKeys).not.toContain('1-2')

    // 全选同样不含折叠子节点
    onChangeMock.mockClear()
    triggerSelectAll(pipeline)
    const [, , allKeys] = onChangeMock.mock.calls[0]
    expect(allKeys).toEqual(['1', '2'])
    expect(allKeys).not.toContain('1-1')
    expect(allKeys).not.toContain('1-2')
  })
})
