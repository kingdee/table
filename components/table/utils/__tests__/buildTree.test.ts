import buildTree from '../buildTree'

const array = [
  { id: 'node-1', parent: 'root' },
  { id: 'node-2', parent: 'root' },
  { id: 'node-3', parent: 'node-2' },
  { id: 'node-4', parent: 'node-2' },
  { id: 'node-5', parent: 'node-4' }
]

const NAME = 'buildTree'

describe(`${NAME}`, () => {
  it('arry to tree', () => {
    const tree = buildTree('id', 'parent', array)
    expect(tree).toEqual([
      { id: 'node-1', parent: 'root' },
      {
        id: 'node-2',
        parent: 'root',
        children: [
          { id: 'node-3', parent: 'node-2' },
          {
            id: 'node-4',
            parent: 'node-2',
            children: [{ id: 'node-5', parent: 'node-4' }]
          }
        ]
      }
    ])
  })
})
