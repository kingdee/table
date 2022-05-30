---
title: 虚拟列表
order: 33
---

数据量较大时，表格会自动开启虚拟滚动。你也可以通过表格的 [useVirtual](#虚拟滚动) 属性来调整虚拟滚动功能

> 注意设置表格的高度或最大高度（宽度同理），并设置 style.overflow = 'auto'

<br/>



```jsx 
function () {

  const data = React.useMemo(() => (
    Array.from(Array(100000)).map((item, index) => (
      {
        "id": index, 
        "No":index,
        "order":"AP-202009-0000"+index,"from":"陕西环宇科技","to":"深圳环球科技","amount":"26,800.00","balance":"5,200.00"
      }
    ))
  ), [])

  const baseColumns = [  
    { code: 'order', name: '单据号', width: 200 },
    { code: 'from', name: '来户', width: 200 },
    { code: 'to', name: '往户', width: 200 },
    { code: 'amount', name: '应付金额', width: 100, align: 'right' },
    { code: 'balance', name: '应收余额', width: 100, align: 'right' }
  ]
  const columns = React.useMemo(() => (
    Array.from(Array(10)).reduce((acc, cur, index) => (
      acc.concat(baseColumns.map(item=>{
        return {...item, name: item.name + index}
      }))
    ),[{ code: 'No', name: '序号', width: 60, align: 'center', lock: true }])
  ),[])

  return (
      <Table
      style={{ height: 600, width: 800, overflow: 'auto' }}
      isLoading={false}
      dataSource={data}
      columns={columns}
      virtualDebugLabel={'virtual-test'}
      />
  )
}
```
