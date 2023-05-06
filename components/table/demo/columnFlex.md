---
title: 列宽充满
order: 303
---
当需要一个或多个列来填充表格中的整个可用空间时，可以配置`column.features.flex`属性，设置了该属性的列将会按照弹性值的比例平分表格的剩余空间。

> 注意：当同时设置了`columnResize`且该列宽被拖拽过大小时，该列的`flex`属性将不再生效


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
    { code: 'order', name: '单据号', width: 200, },
    { code: 'from', name: '来户', width: 200, features: { flex: 1, minWidth: 200, maxWidth: 300 } },
    { code: 'to', name: '往户', width: 200, features: { flex: 2 } },
    { code: 'amount', name: '应付金额', width: 100, align: 'right' },
    { code: 'balance', name: '应收余额', width: 100, align: 'right' }
  ]

  const [columnSize, setColumnSize] = React.useState({})

    const pipeline = useTablePipeline()
    .input({ dataSource: dataSource, columns: columns })
    .primaryKey('id')
    .use(features.columnResize(
      {
        columnSize,
        onChangeSize: (columnSize) => {
          setColumnSize(columnSize)
       }
      }
    ))

  return (
      <Table {...pipeline.getProps()} className="aaa" style={{ height: 200 }} />
  )
}
```
