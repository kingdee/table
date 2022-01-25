import SpanManager from '../SpanManager'

const NAME = 'SpanManager'

describe(`${NAME}`, () => {
  const spanManager = new SpanManager()
  it('add span info', () => {
    // 第一行，第一列，仅融合自身列，向下融合两行
    spanManager.add(0, 0, 1, 2)
  })

  it('test skip', () => {
    // 第二行，第一列跳过渲染
    expect(spanManager.testSkip(1, 0)).toBe(true)

    // 第四行，第一列不跳过渲染
    expect(spanManager.testSkip(3, 0)).toBe(false)
  })

  it('strip upwards span info', () => {
    spanManager.stripUpwards(0)
  })
})
