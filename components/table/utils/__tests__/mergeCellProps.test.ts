import mergeCellProps from '../mergeCellProps'

describe('mergeCellProps 单元测试', () => {
  it('普通属性合并', () => {
    const base = {
      name: 'base',
      style: {
        color: 'red',
        fontSize: '14px'
      }
    }

    const extra = {
      name: 'extra',
      style: {
        color: 'blue',
        background: 'red'
      }
    }

    const result = mergeCellProps(base, extra)
    expect(result).toEqual({
      name: 'extra',
      style: {
        color: 'blue',
        background: 'red',
        fontSize: '14px'
      }
    })
  })
  it('className 合并，会拼接一起', () => {
    const base = {
      className: 'base'
    }
    const extra = {
      className: 'extra'
    }
    expect(mergeCellProps(base, extra)).toEqual({ className: 'base extra' })
  })
  it('第一或者第二个对象为空', () => {
    const base:any = {
      name: 'base'
    }
    const extra:any = {
      name: 'extra'
    }
    expect(mergeCellProps(null, extra)).toEqual(extra)
    expect(mergeCellProps(base, null)).toEqual(base)
  })
  it('合并对象为函数',()=>{
    const baseFun = jest.fn()
    const extraFun = jest.fn()
    const base: any = {
      name: 'base',
      fun: baseFun
    }
    const extra: any = {
      nullValue: null,
      name: 'extra',
      fun: extraFun,
      fun1: jest.fn()
    }
    const result: any = mergeCellProps(base, extra)
    expect(result.name).toBe('extra')
    expect(result.fun1).toEqual(extra.fun1)

    result.fun()
    expect(baseFun).toHaveBeenCalled()
    expect(extraFun).toHaveBeenCalled()
  })
})