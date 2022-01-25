import { isElementInEventPath, getTargetEleInEventPath, calculatePointerRelative, calculatePopupRelative, keepWithinBounds } from '../element'

const NAME = 'element'

describe(`${NAME}`, () => {
  it('isElementInEventPath', () => {
    // 未设置参数
    expect(isElementInEventPath()).toBe(false)

    let container = document.createElement('div')
    let ele = document.createElement('div')
    container.appendChild(ele)

    const event = document.createEvent('MouseEvent')
    event.initMouseEvent('contextMenu', true, true, window, 1, 800, 600, 290, 260, false, false, false, false, 0, null)

    // 不存在触发路径
    expect(isElementInEventPath(ele, Object.assign({ target: ele }, event))).toBe(true)

    // 正常设置 composedPath
    expect(isElementInEventPath(ele, Object.assign({ composedPath: () => [container, ele] }, event))).toBe(true)

    // 正常设置 path
    expect(isElementInEventPath(ele, Object.assign({ path: [container, ele] }, event))).toBe(true)

    // 正常设置 deepPath
    expect(isElementInEventPath(ele, Object.assign({ deepPath: () => [container, ele] }, event))).toBe(true)

    container.removeChild(ele)
    container = ele = null
  })

  it('getTargetEleInEventPath', () => {
    const mockId = 'test'
    let container = document.createElement('div')
    let ele = document.createElement('div')
    ele.setAttribute('id', mockId)

    expect(getTargetEleInEventPath([container, ele], function (ele) {
      return ele.getAttribute('id') === mockId
    })).toBe(ele)

    container = ele = null
  })

  it('calculatePointerRelative', () => {
    let ele = document.createElement('div')
    const event = document.createEvent('MouseEvent')
    const clientX = 290
    event.initMouseEvent('contextMenu', true, true, window, 1, 800, 600, clientX, 260, false, false, false, false, 0, null)

    let result = calculatePointerRelative(event, ele)
    expect(result.x).toBe(clientX)

    result = calculatePointerRelative(event, document.body)
    expect(result.x).toBe(clientX)

    ele = null
  })

  it('calculatePopupRelative', () => {
    let ele = document.createElement('div')

    let result = calculatePopupRelative(ele, document.body)
    expect(result.x).toBe(0)

    let container = document.createElement('div')
    result = calculatePopupRelative(ele, container, { x: 1, y: 1 })
    expect(result.x).toBe(-1)

    ele = container = null
  })

  it('keepWithinBounds', () => {
    let ele = document.createElement('div')
    keepWithinBounds(document.body, ele, 1, 1)// {x:0,y:0} getBoundingClientRect默认计算都是0，暂不处理

    ele = null
  })
})
