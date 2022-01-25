---
title: 列分组
order: 401
---
在 `columns.children=[...]` 中添加子节点，`<Table />` 会绘制相应的嵌套表头结构。
```jsx
;() => {
  const occupations = ['UED', '客服', '产品', '运营', '前端', '数据']
  const dataSource = occupations.map((occupation) => ({
    occupation,
    hc_2014: 104,
    hc_2015: 168,
    hc_lfl: 50,
    age_2014: 30,
    age_2015: 32,
    age_lfl: 15,
    rate_2014_0: 0.3,
    rate_2014_1: 0.3,
    rate_2015_0: 0.45,
    rate_2015_1: 0.45,
    rate2_2014: 0.33,
    rate2_2015: 0.48,
  }))
  const col = proto.array({
    align: 'center',
    width: 80,
    headerCellProps: { style: { textAlign: 'center', padding: 0 } },
  })
  const columns = col([
    { lock: true, code: 'occupation', name: '职务', width: 120 },
    {
      name: '人数',
      code: 'personTotal',
      children: col([
        { code: 'hc_2014', name: '2014年' },
        { code: 'hc_2015', name: '2015年' },
        { code: 'hc_lfl', name: '同比增长' },
      ]),
    },
    {
      name: '年龄',
      code: 'age',
      children: col([
        { code: 'age_2014', name: '2014年' },
        { code: 'age_2015', name: '2015年' },
        { code: 'age_lfl', name: '同比增长' },
      ]),
    },
    {
      name: '占比',
      code: 'percent',
      children: col([
        { code: 'rate_2014_0', name: '2014年' },
        { code: 'rate_2015_0', name: '2015年' },
      ]),
    },
    {
      name: '占比2',
      code: 'percent_02',
      children: col([
        { code: 'rate_2014_1', name: '2014年' },
        { code: 'rate_2015_1', name: '2015年' }
      ])
    }
  ])
  const pipeline = useTablePipeline({})
    .input({ dataSource: dataSource, columns: columns })
    // .use(features.columnRangeHover())
    .use(features.columnResize())

  return <Table className="bordered" {...pipeline.getProps()} />
}
```
