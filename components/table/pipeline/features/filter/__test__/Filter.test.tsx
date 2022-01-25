import React from 'react'
import { mount } from 'enzyme'

import { Classes } from '../../../../base/styles'
import Filter from '../Filter'
import DefaultFilterContent from '../DefaultFilterContent'

const NAME = 'Filter'
const setFilter = jest.fn()
const setFilterModel = jest.fn()

describe(`${NAME}`, () => {
  it('render and test event', () => {
    const wrapper = mount(
      <Filter
        setFilter={setFilter}
        setFilterModel={setFilterModel}
        filterModel={{
          filter: []
        }}
        stopClickEventPropagation
        isFilterActive
      />
    )

    wrapper.find(`.${Classes.filterIcon}`).at(0).simulate('click')
    wrapper.find('div').at(0).simulate('mousedown')

    expect(wrapper.find(DefaultFilterContent).length).toBe(1)

    wrapper.unmount()
  })
})
