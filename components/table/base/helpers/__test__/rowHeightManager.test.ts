import { getFullRenderRange, makeRowHeightManager } from '../rowHeightManager'

const NAME = 'rowHeightManager'

describe(`${NAME}`, () => {
  it('getFullRenderRange', () => {
    const mockRowCount = 5
    expect(getFullRenderRange(mockRowCount).bottomIndex).toBe(mockRowCount)
  })
})

describe(`${NAME} makeRowHeightManager`, () => {
  let rowHeightManager = makeRowHeightManager(10, 40)
  beforeEach(() => {
    rowHeightManager = makeRowHeightManager(10, 40)
  })

  afterAll(() => {
    rowHeightManager = null
  })

  it('has 10 rows, maxRenderHeight=-200 and getRenderRange ', () => {
    rowHeightManager.getRenderRange(0, -200, 10)
  })

  it('has 10 rows, maxRenderHeight=-200, offset=100 and getRenderRange ', () => {
    rowHeightManager.getRenderRange(100, -200, 10)
  })

  it('has 10 rows,participate rowCount greater than 10 and getRenderRange ', () => {
    rowHeightManager.getRenderRange(0, 0, 11)
  })

  it('has 10 rows , add 1 row and getRenderRange ', () => {
    rowHeightManager.updateRow(10, 0, 40)
    rowHeightManager.getRenderRange(0, 200, 10)
  })
})
