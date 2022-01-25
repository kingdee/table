import { getVisiblePartObservable, getVisiblePart } from '../visible-part'

const NAME = 'visible-part'

describe(`${NAME}`, () => {
  it('getVisiblePartObservable', () => {
    let container = document.createElement('div')
    container.setAttribute('id', 't1')
    container.style.cssText = 'width:100px;height:100px;overflow:auto;'
    let content = document.createElement('div')
    content.style.cssText = 'width:200px;height:200px;'
    container.appendChild(content)
    document.body.appendChild(container)

    // todo: rxjs test
    getVisiblePartObservable(content, container)
    const event = new window.Event('scroll', { cancelable: false })
    container.dispatchEvent(event)

    document.body.removeChild(container)
    container = content = null
  })

  it('getVisiblePart', () => {
    let container = document.createElement('div')
    document.body.appendChild(container)

    expect(getVisiblePart(container, window).offsetX).toBe(0)

    document.body.removeChild(container)
    container = null
  })
})
