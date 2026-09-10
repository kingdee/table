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

/** 通过 cell render 的 onChange 触发 Shift（clickArea 默认 'checkbox'） */
function triggerShiftViaCell (pipeline: any, rowIndex: number) {
  const checkboxColumn = pipeline.getColumns()[0]
  const row = pipeline.getDataSource()[rowIndex]
  const cellElement = checkboxColumn.render(null, row, rowIndex)
  const onChange = cellElement.props.onChange
  act(() => { onChange({ nativeEvent: { shiftKey: true } }) })
}

describe('multiSelect + sort — Shift 懒计算修复（仅 onCheckboxChange）', () => {
  afterEach(() => {
    sortAscOpts.onChangeSorts.mockClear()
  })

  // 用例 1：sort 后 Shift 选中返回排序后顺序的连续区间
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

    // batchKeys = 排序后顺序 ['2','3','1']
    expect(onChangeMock).toHaveBeenCalledWith(
      ['2', '3', '1'], '1', ['2', '3', '1'], 'check'
    )
  })

  // 用例 2：-1 守卫
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

  // 用例 3：全选不受懒计算影响，仍读 step 期缓存
  it('全选仍使用 step 期缓存（顺序=原始，成员=全部）', () => {
    const onChangeMock = jest.fn()
    const pipeline = buildPipeline({ value: [], onChange: onChangeMock })

    const checkboxColumn = pipeline.getColumns()[0]
    const onChange = (checkboxColumn.title as any).props.onChange
    act(() => { onChange({}) })

    // allEnableKeys 在 step 期用 collectNodes 收集 = ['1','2','3']（排序前顺序）
    const [, , allKeys] = onChangeMock.mock.calls[0]
    expect(allKeys).toEqual(['1', '2', '3'])
    // 成员正确（与排序后一致，顺序为原始）
    expect(allKeys).toEqual(expect.arrayContaining(['1', '2', '3']))
  })

  // 用例 4：batchKeys 无重复
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
    expect(batchKeys).toEqual([...new Set(batchKeys)])
  })
})

describe('multiSelect — getEnableKeys 兜底回退（仅 Shift 路径）', () => {
  // 用例 5：fullRowsSet 丢失 → getEnableKeys 结果为空 → 回退 step 期缓存
  it('fullRowsSet 丢失时回退到 step 期缓存', () => {
    const onChangeMock = jest.fn()
    const pipeline = buildPipeline({
      value: [],
      lastKey: '2',
      onChange: onChangeMock
      // clickArea 默认 'checkbox'，通过 cell render 触发
    })

    // 破坏 fullRowsSet → getEnableKeys 懒算结果为空 → 回退缓存
    pipeline.ref.current.featureOptions = pipeline.ref.current.featureOptions || {}
    delete pipeline.ref.current.featureOptions['fullRowsSetKey']

    // 通过 cell render 触发 Shift（不经过 rowPropsGetter，避免它也因 fullRowsSet 丢失而跳过）
    triggerShiftViaCell(pipeline, 2) // index=2 → id='1'

    // 回退到 step 期缓存 allEnableKeys = ['1','2','3']（排序前顺序）
    // indexOf('2')=1, indexOf('1')=0 → batchKeys = ['1','2']
    const [, , batchKeys] = onChangeMock.mock.calls[0]
    expect(batchKeys.length).toBeGreaterThan(0)
    expect(batchKeys).toEqual(expect.arrayContaining(['1', '2']))
  })

  // 用例 6：getDataSource() 异常 → catch 回退
  it('getDataSource() 返回 null 时 catch 回退到 step 期缓存', () => {
    const onChangeMock = jest.fn()
    const pipeline = buildPipeline({
      value: [],
      lastKey: '2',
      onChange: onChangeMock
    })

    // 保存行引用后破坏数据源
    const savedRow = pipeline.getDataSource()[2] // id='1'
    pipeline.dataSource(null as any)

    // 通过 cell render 触发 Shift（使用保存的行引用）
    const checkboxColumn = pipeline.getColumns()[0]
    const cellElement = checkboxColumn.render(null, savedRow, 2)
    const onChange = cellElement.props.onChange
    act(() => { onChange({ nativeEvent: { shiftKey: true } }) })

    // forEach on null 抛异常 → catch → 回退缓存
    const [, , batchKeys] = onChangeMock.mock.calls[0]
    expect(batchKeys.length).toBeGreaterThan(0)
    expect(batchKeys).toEqual(expect.arrayContaining(['1', '2']))
  })
})

describe('multiSelect — fullRowsSet 过滤后注入行（Shift 路径）', () => {
  // 用例 7：后注入行不被收进 Shift 区间
  it('后注入行（模拟明细行/分组头）不被收进 Shift 区间', () => {
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

    const props = pipeline.getProps()
    const terminalData = pipeline.getDataSource()
    const rowProps = props.getRowProps!(terminalData[2], 2)
    act(() => { rowProps!.onClick!({ shiftKey: true } as any) })

    // getEnableKeys() 应过滤掉 '1_detail' → ['1','2']
    expect(onChangeMock).toHaveBeenCalledWith(['1', '2'], '2', ['1', '2'], 'check')
    const [, , shiftBatchKeys] = onChangeMock.mock.calls[0]
    expect(shiftBatchKeys).not.toContain('1_detail')
  })
})

describe('multiSelect — treeMode 模拟（终态行残留 children，Shift 路径）', () => {
  // 用例 8：展开树 — 直接 forEach 不递归 children → 无重复 key
  it('展开树：Shift 区间无重复 key', () => {
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

    // 模拟 treeMode 展平 P1 后的终态：父行残留 children，子行也在数组中
    const treeMeta = Symbol('treeMeta')
    const p1 = pipeline.getDataSource()[0]
    const c1 = { ...p1.children[0], [treeMeta]: { depth: 1, isLeaf: true } }
    const c2 = { ...p1.children[1], [treeMeta]: { depth: 1, isLeaf: true } }
    const p1Flat = { ...p1, [treeMeta]: { depth: 0, isLeaf: false } }
    const p2 = { ...pipeline.getDataSource()[1], [treeMeta]: { depth: 0, isLeaf: true } }
    pipeline.dataSource([p1Flat, c1, c2, p2])

    const props = pipeline.getProps()
    const terminalData = pipeline.getDataSource()
    const rowProps = props.getRowProps!(terminalData[3], 3)
    act(() => { rowProps!.onClick!({ shiftKey: true } as any) })

    const [, , batchKeys] = onChangeMock.mock.calls[0]
    expect(batchKeys).toEqual([...new Set(batchKeys)]) // 无重复
    expect(batchKeys).toEqual(['1', '1-1', '1-2', '2'])
  })

  // 用例 9：折叠树 — 直接 forEach 不递归 children → 不含不可见子节点
  it('折叠树：不可见子节点不混入 Shift 区间', () => {
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

    // 模拟 treeMode 折叠 P1：终态只有 P1（含 children）和 P2
    const treeMeta = Symbol('treeMeta')
    const p1 = pipeline.getDataSource()[0]
    const p1Flat = { ...p1, [treeMeta]: { depth: 0, isLeaf: false, expanded: false } }
    const p2 = { ...pipeline.getDataSource()[1], [treeMeta]: { depth: 0, isLeaf: true } }
    pipeline.dataSource([p1Flat, p2])

    const props = pipeline.getProps()
    const terminalData = pipeline.getDataSource()
    const rowProps = props.getRowProps!(terminalData[1], 1)
    act(() => { rowProps!.onClick!({ shiftKey: true } as any) })

    // getEnableKeys 直接 forEach → ['1','2']，不含折叠的 '1-1'、'1-2'
    const [, , batchKeys] = onChangeMock.mock.calls[0]
    expect(batchKeys).toEqual(['1', '2'])
    expect(batchKeys).not.toContain('1-1')
    expect(batchKeys).not.toContain('1-2')
  })
})
