import { executeOnTempElement, copyDataToClipboard } from '../copyToClipboard'

const NAME = 'copyToClipboard'

describe(`${NAME}`, () => {
  const _execCommand = document.execCommand
  const mockExecCommand = jest.fn()
  beforeAll(() => {
    document.execCommand = mockExecCommand
  })
  afterAll(() => {
    document.execCommand = _execCommand
  })

  it('executeOnTempElement error', () => {
    executeOnTempElement(function () {
      throw new Error('test error')
    })
    expect(mockExecCommand).not.toHaveBeenCalled()
  })

  it('executeOnTempElement&copyDataToClipboard', () => {
    const mockCopyValue = 'test'
    executeOnTempElement(copyDataToClipboard(mockCopyValue))
    expect(mockExecCommand).toHaveBeenCalled()
  })
})
