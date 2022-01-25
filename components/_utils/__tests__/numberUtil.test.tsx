import { toFixed, supplementZero, serialization, getMaxNumberByPrecision, isExp, exponentToFloat } from '../numberUtil'

describe('numberUtil 单元测试', () => {
  it('toFixed', () => {
    // 保留三位小数
    expect(toFixed('1234567', 3)).toBe('1234567.000')

    // 简写
    expect(toFixed('.11', 3)).toBe('0.110')

    // 负数
    expect(toFixed('-1234567.89', 5)).toBe('-1234567.89000')

    // 是否四舍五入
    expect(toFixed('123.456', 2, true)).toBe('123.46')
    expect(toFixed('123.456', 2, false)).toBe('123.45')
    expect(toFixed('0.0123456', 6, true)).toBe('0.012346')

    // 异常情况
    // 非法数字输入
    expect(() => { toFixed('aaa', 3) }).toThrow(Error)

    // 小数点过长
    expect(() => { toFixed('12345', 25) }).toThrow(RangeError)

    // 小数点非法
    expect(() => { toFixed('12345', -1) }).toThrow(RangeError)
  })
  it('supplementZero', () => {
    // 将已有数字前面补0
    expect(supplementZero('1', 4)).toBe('0001')

    expect(supplementZero('1234', 1)).toBe('1234')
  })
  it('serialization', () => {
    expect(serialization('123456aaa')).toBe('123456')

    expect(serialization('123aaa456')).toBe('123456')

    expect(serialization('-0123456aaa999')).toBe('-123456999')

    expect(serialization('1-1=0')).toBe('110')

    // 没有合法数字
    expect(serialization('aaaaaa')).toBe('')
  })
  it('getMaxNumberByPrecision', () => {
    expect(getMaxNumberByPrecision(5, 2)).toBe(99999.99)

    expect(getMaxNumberByPrecision(5, -2)).toBe(99999)

    expect(getMaxNumberByPrecision(100, 3)).toBe(1e+100)
  })
  it('isExp', () => {
    expect(isExp('1234567')).toBe(true)

    expect(isExp('-0.01')).toBe(true)

    expect(isExp('.99')).toBe(true)

    expect(isExp(-123.456)).toBe(true)

    expect(isExp('aaa')).toBe(false)
    expect(isExp('123aaa456')).toBe(false)
  })
  it('exponentToFloat', () => {
    expect(exponentToFloat(1e+5)).toBe('100000')

    expect(exponentToFloat(1e-5)).toBe('0.00001')

    expect(exponentToFloat(1.03e+7)).toBe('10300000')

    expect(exponentToFloat(123)).toBe('123')

    // 精度10位
    expect(exponentToFloat(1.3333333333333333333e+3)).toBe('1333.3333333333')

    // 非法数值,原值返回
    expect(exponentToFloat('aaa')).toBe('aaa')
  })
})
