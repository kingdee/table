import React, { ReactNode } from 'react'
import { toArray } from '../react-children'

describe('react-children 单元测试', () => {
  it('toArray', () => {
    const node:ReactNode = <div>sss</div>
    const nodeArr = toArray(node)
    expect(nodeArr).toEqual([node])
  })
})
