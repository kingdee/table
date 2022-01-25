import { act, renderHook } from '@testing-library/react-hooks'

import { useTablePipeline, TablePipeline } from '../../pipeline'
import { FILL_COLUMN_CODE, tableWidthKey } from '../features/autoFill'

describe('uesTablePipeline', () => {
  const { result } = renderHook(() => useTablePipeline({ primaryKey: 'test' }))
  it('uesTablePipeline', () => {
    expect(result.current.ctx.primaryKey).toBe('test')
  })
})

describe('TablePipeline', () => {
  const ctx = {
    test: 'test'
  }
  const { result } = renderHook(() => useTablePipeline(ctx))

  const { current: tablePipeline } = result

  it('constructor', () => {
    expect(tablePipeline.ctx.test).toBe(ctx.test)
    expect(tablePipeline.ctx.indents).toBe(TablePipeline.defaultIndents)
  })

  it('guid', () => {
    expect(tablePipeline.guid()).not.toBe(tablePipeline.guid())
  })

  it('appendRowPropsGetter', () => {
    const getRowMockProps = (row, rowIndex: number) => ({ style: {} })
    expect(tablePipeline.appendRowPropsGetter.bind(tablePipeline, getRowMockProps)).not.toThrow()
  })

  it('getDataSource, init', () => {
    const dataSource = tablePipeline.getDataSource()
    expect(dataSource).toBe(undefined)
  })

  it('getColumns, init', () => {
    const columns = tablePipeline.getColumns()
    expect(columns).toBe(undefined)
  })

  it('getStateAtKey, init', () => {
    expect(tablePipeline.getStateAtKey('a', 'a')).toBe('a')
  })

  it('setStateAtKey', () => {
    const { result } = renderHook(() => useTablePipeline(ctx))
    act(() => {
      result.current.setStateAtKey('test', 'test')
    })
    expect(result.current.getStateAtKey('test')).toBe('test')
  })

  it('ensurePrimaryKey, no primaryKey', () => {
    expect(tablePipeline.ensurePrimaryKey).toThrowError()
    expect(tablePipeline.ensurePrimaryKey.bind(tablePipeline, 'test')).toThrowError()
  })

  it('input', () => {
    const mockInput = {
      dataSource: [
        {
          test: 'test'
        }
      ],
      columns: [
        {
          code: 'test',
          name: 'test'
        }
      ]
    }
    const newTablePipeline = tablePipeline.input(mockInput)
    expect(newTablePipeline.getColumns()[0].code).toBe('test')
    expect(tablePipeline.getDataSource()).toBe(mockInput.dataSource)
    // repeat input
    expect(tablePipeline.input.bind(tablePipeline, mockInput)).toThrowError()
    // snapshot
    expect(tablePipeline.getDataSource('input')).toBe(mockInput.dataSource)
    expect(tablePipeline.getColumns('input')[0].code).toBe('test')
  })

  it('addTableProps', () => {
    const mockProps = {
      style: { color: '#000' }
    }
    tablePipeline.addTableProps(mockProps)
    expect(tablePipeline.getProps().getTableProps().style).toBe(mockProps.style)
  })

  it('dataSource', () => {
    const mockRows = [
      {
        test: 'test'
      }
    ]
    tablePipeline.dataSource(mockRows)
    expect(tablePipeline.getDataSource()).toBe(mockRows)
  })

  it('columns', () => {
    const mockColumns = [
      {
        code: 'test',
        name: 'test'
      }
    ]
    tablePipeline.columns(mockColumns)
    expect(tablePipeline.getColumns()).toBe(mockColumns)
  })

  it('primaryKey', () => {
    tablePipeline.primaryKey('test')
    expect(tablePipeline.ctx.primaryKey).toBe('test')
  })

  it('ensurePrimaryKey, has primaryKey', () => {
    expect(tablePipeline.ensurePrimaryKey()).toBe('test')
  })

  it('snapshot', () => {
    tablePipeline.snapshot('test')
    expect(tablePipeline.getColumns('test')).toEqual([
      {
        code: 'test',
        name: 'test'
      }
    ])
    expect(tablePipeline.getDataSource('test')).toEqual([
      {
        test: 'test'
      }
    ])
  })

  it('use', () => {
    const mockPipeline = (pipeline) => pipeline
    expect(tablePipeline.use(mockPipeline)).toBe(tablePipeline)
  })

  it('mapDataSource', () => {
    const mockDataSourceMapper = (data) => data.map(column => ({
      ...data,
      a: 'a'
    }))
    tablePipeline.mapDataSource(mockDataSourceMapper)
    expect(tablePipeline.getDataSource()[0].a).toBe('a')
  })

  it('mapColumns', () => {
    const mockColumnsMapper = (columns) => columns.map(column => ({
      ...column,
      width: 100
    }))
    tablePipeline.mapColumns(mockColumnsMapper)
    expect(tablePipeline.getColumns()[0].width).toBe(100)
  })

  it('getProps', () => {
    const { result } = renderHook(() => useTablePipeline(ctx))
    const mockProps = {
      style: { color: '#000' }
    }
    result.current.addTableProps(mockProps)
    result.current.primaryKey('test')
    const getRowMockProps = (row, rowIndex: number) => ({ style: {} })
    result.current.appendRowPropsGetter(getRowMockProps)

    const mockInput = {
      dataSource: [
        {
          test: 'test'
        }
      ],
      columns: [
        {
          code: 'test',
          name: 'test'
        }
      ]
    }
    result.current.input(mockInput)
    const props = result.current.getProps()
    expect(props.getTableProps()).toEqual(mockProps)
    expect(props.primaryKey).toBe('test')
    expect(props.getRowProps(null, 1)).toEqual({ style: {} })
    act(() => {
      props.setTableWidth(100)
    })
    expect(result.current.getStateAtKey(tableWidthKey)).toBe(100)
    act(() => {
      props.setTableWidth(200)
    })
    expect(result.current.getStateAtKey(tableWidthKey)).toBe(200)
  })
})
