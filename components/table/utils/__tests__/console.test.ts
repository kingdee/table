import console from '../console'

const NAME = 'console'

describe(`${NAME}`, () => {
  const _log = window.console.log
  const _warn = window.console.warn
  const _error = window.console.error
  const _table = window.console.table
  const mockFn = jest.fn()
  beforeAll(() => {
    window.console = {
      ...window.console,
      log: mockFn,
      warn: mockFn,
      error: mockFn,
      table: mockFn
    }
  })
  afterAll(() => {
    window.console = {
      ...window.console,
      log: _log,
      warn: _warn,
      error: _error,
      table: _table
    }
  })
  it('test console.log,console.warn,console.error and console.table', () => {
    console.log('1')
    console.warn('2')
    console.error('3')
    console.table('4')
    expect(mockFn).toHaveBeenCalledTimes(4)
  })
})
