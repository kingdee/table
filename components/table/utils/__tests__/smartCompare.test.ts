import smartCompare from '../smartCompare'

describe('smallCompare 单元测试', () => {
  it('某个比较值为空', () => {
    expect(smartCompare(undefined, 1)).toBe(1)
    expect(smartCompare(1, null)).toBe(-1)
  })
  it('数值比较', () => {
    expect(smartCompare(1, 3)).toBe(-2)
    expect(smartCompare(3, 1)).toBe(2)
  })
  it('字符串比较', () => {
    expect(smartCompare('aa', 'bb')).toBe(-1)
    expect(smartCompare('aa', 'aa')).toBe(0)
    expect(smartCompare('a', 'aa')).toBe(-1)
    expect(smartCompare('bb', 'aa')).toBe(1)
  })
  it('数组比较', () => {
    expect(smartCompare([1, 2], [1, 2, 3])).toBe(-1)
    expect(smartCompare([1, 2], [1, 3])).toBe(-1)
    expect(smartCompare([2, 1], [1, 2])).toBe(1)
  })
  it('其他类型', () => {
    expect(smartCompare({}, {})).toBe(0)
  })
})