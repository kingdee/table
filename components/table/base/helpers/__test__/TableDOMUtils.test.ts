import { Classes } from '../../styles'
import { TableDOMHelper } from '../TableDOMUtils'

const NAME = 'TableDOMUtils'

describe(`${NAME}`, () => {
  let tableDOMHelper
  let container
  beforeAll(() => {
    container = document.createElement('div')
    container.innerHTML = `<div class='${Classes.artTableWrapper}'>
          <div class='${Classes.loadingWrapper}'>
              <div class='${Classes.loadingIndicatorWrapper}'>
                <div class='${Classes.loadingIndicator}'></div>
              </div>     
              <div class='${Classes.loadingContentWrapper}'>
                <div class='${Classes.artTable}'>
                  <div class='${Classes.tableHeader}'>
                    
                  </div>
                  <div class='${Classes.tableBody}'>
                    <div class='${Classes.virtual}'>
                      <div class='${Classes.virtualBlank} top'></div>
                      <table></table>
                      <div class='${Classes.virtualBlank} bottom'></div>
                    </div>                   
                  </div>
                  <div class='${Classes.tableFooter}'>
                  </div>
                  <div class='${Classes.lockShadowMask}'>
                    <div class='${Classes.leftLockShadow}'></div>
                  </div>
                  <div class='${Classes.lockShadowMask}'>
                    <div class='${Classes.rightLockShadow}'></div>
                  </div>
                </div>
                <div class='${Classes.stickyScroll}'>
                  <div class='${Classes.stickyScrollItem}'></div>
                </div>
              </div>    
          </div>        
      </div>`
    tableDOMHelper = new TableDOMHelper(container.querySelector(`.${Classes.artTableWrapper}`))
  })

  afterAll(() => {
    container = null
    tableDOMHelper = null
  })

  it('getVirtualTop', () => {
    expect(tableDOMHelper.getVirtualTop()).not.toBeNull()
  })

  it('getTableRows', () => {
    expect(tableDOMHelper.getTableRows().length).toBe(0)
  })

  it('getLeftLockShadow', () => {
    expect(tableDOMHelper.getLeftLockShadow()).not.toBeNull()
  })

  it('getRightLockShadow', () => {
    expect(tableDOMHelper.getRightLockShadow()).not.toBeNull()
  })

  it('getLoadingIndicator', () => {
    expect(tableDOMHelper.getLoadingIndicator()).not.toBeNull()
  })
})
