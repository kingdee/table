---
title: 范围选中
order: 302
---
长按单元格，然后拖动会有一个范围选中的效果，可以通过rangeSelectedChange回调拿到范围选中的结果。

支持单个单元格光标框选文字，框选范围超过单个单元格则显示范围选中效果。

支持shift + 鼠标点击 框选范围，shift + 鼠标拖动可以实现浏览器原生选中。

用法:
pipeline.use(features.rangeSelection())

```jsx
() => {
  const defaultDataSource = [
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


  const [dataSource,setDataSource] = React.useState(defaultDataSource)
  
  const handleClick = ()=>{
    setDataSource(dataSource.slice(0,dataSource.length-1))
  }
    const pipeline = useTablePipeline()
    .input({ dataSource: dataSource, columns: columns })
    .primaryKey('id')
    .use(features.rangeSelection({
      rangeSelectedChange:function(cellRanges){
        console.log('cellRanges',cellRanges)
      } // 范围选中回调
    }))
    

  return (
    <Table {...pipeline.getProps()} />
     
  )
}
```
