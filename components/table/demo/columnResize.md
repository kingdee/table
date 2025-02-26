---
title: 列宽拖拽
order: 301
---
表头右侧会出现可以拖动的竖线，用户可以拖拽来调整列宽

用法:
pipeline.use(features.columnResize())

```jsx
() => {
  const dataSource = [
    {id: "1", "No":1,"order":"AP-202009-00001","from":"陕西环宇科技","to":"深圳环球科技","amount":"26,800.00","balance":"5,200.00"},
    {id: "2", "No":2,"order":"AP-202009-00001","from":"陕西环宇科技","to":"深圳环球科技","amount":"236,800.00","balance":"1,500.00"},
    {id: "3", "No":3,"order":"AP-202009-00002","from":"陕西环宇科技","to":"深圳环球科技","amount":"246,800.00","balance":"5,300.00"},
    {id: "4", "No":4,"order":"AP-202009-00003","from":"陕西环宇科技","to":"深圳环球科技","amount":"216,800.00","balance":"5,400.00"},
    {id: "5", "No":5,"order":"AP-202009-00004","from":"陕西环宇科技","to":"深圳环球科技","amount":"236,800.00","balance":"1,500.00"}
  ]

  const columns = [
    { code: 'No', name: '序号', width: 60, align: 'center' },
    { code: 'order', name: '单据号', width: 200, features: { sortable: true, filterable: true }},
    { code: 'from', name: '来户', width: 200, features: { sortable: true, filterable: true } },
    { code: 'to', name: '往户', width: 200, features: { sortable: true, filterable: true } },
    { code: 'amount', name: '应付金额', width: 100, align: 'right', features: { sortable: true, filterable: true } },
    { code: 'balance', name: '应收余额', width: 100, align: 'right', features: { sortable: true, filterable: true } }
  ]

  const [selected, setSelected] = React.useState([])
  const [columnSize, setColumnSize] = React.useState({})
  const handleChange = (v) => {
    setSelected(v)
  }
  function SortIcon ({ size = 32, style, className, order }) {
    return (
      <svg
        style={style}
        className={className}
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
        width={size}
        height={size}
        viewBox="0 0 32 32"
        aria-hidden="true"
      >
        <path fill={order === 'asc' ? '#23A3FF' : '#bfbfbf'} transform="translate(0, 6)" d="M8 8L16 0 24 8z" />
        <path fill={order === 'desc' ? '#23A3FF' : '#bfbfbf'} transform="translate(0, -6)" d="M24 24L16 32 8 24z " />
      </svg>
    )
  }
    const pipeline = useTablePipeline({
      direction:'rtl'
    })
    .input({ dataSource: dataSource, columns: columns })
    .primaryKey('id')
    .use(features.columnResize(
      {
        maxSize: 200,
        columnSize,
        minSize: 100,
        onChangeSize: (e) => { setColumnSize(e) }
      }
    ))

  return (
      <Table {...pipeline.getProps()} className="aaa" style={{ height: 200 }} />
  )
}
```
