import collectNodes from '../collectNodes'

const COLUMNS : any[] = [
  { code: 'occupation', name: '职务', width: 120, align: 'center' },
  {
    name: '人数',
    width: 240,
    align: 'center',
    code: 'personTotal',
    children: [
      { code: 'hc_2014', name: '2014年', width: 80, align: 'center' },
      { code: 'hc_2015', name: '2015年', width: 80, align: 'center' },
      { code: 'hc_lfl', name: '同比增长', width: 80, align: 'center' }
    ]
  },
  {
    name: '年龄',
    code: 'age',
    width: 240,
    align: 'center',
    children: [
      { code: 'age_2014', name: '2014年', width: 80, align: 'center' },
      { code: 'age_2015', name: '2015年', width: 80, align: 'center' },
      { code: 'age_lfl', name: '同比增长', width: 80, align: 'center' }
    ]
  },
  {
    name: '占比',
    code: 'percent',
    width: 160,
    align: 'center',
    children: [
      { code: 'rate_2014_0', name: '2014年', width: 80, align: 'center' },
      { code: 'rate_2015_0', name: '2015年', width: 80, align: 'center' }
    ]
  },
  {
    name: '占比2',
    code: 'percent_02',
    children: [
      { code: 'rate_2014_1', name: '2014年', width: 80, align: 'center' },
      { code: 'rate_2015_1', name: '2015年', width: 80, align: 'center' }
    ]
  }
]

const NAME = 'collectNodes'

describe(`${NAME}`, () => {
  it('collect node for null ', () => {
    expect(collectNodes(null).length).toBe(0)
  })
  it('collect all nodes ', () => {
    // 收集全部节点，先自身节点，后children节点
    expect(collectNodes(COLUMNS).length).toBe(15)
  })
  it('collect leaf-only nodes ', () => {
    // 只收集子节点
    expect(collectNodes(COLUMNS, 'leaf-only').length).toBe(11)
  })
  it('collect children nodes ', () => {
    // 收集全部节点，先children节点，后自身节点
    expect(collectNodes(COLUMNS, 'post').length).toBe(15)
  })
})
