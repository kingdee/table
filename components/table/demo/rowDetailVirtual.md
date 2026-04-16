---
title: 行展开-虚拟滚动
order: 403
---

展开列设置在最后一列并冻结（lock），同时开启虚拟滚动。横向滚动时，展开列始终可见，detail 内容不会因水平虚拟化而消失。

```jsx
() => {
  const dataSource = React.useMemo(() =>
    Array.from({ length: 1000 }).map((_, i) => ({
      id: String(i),
      No: i + 1,
      order: `AP-202009-${String(i).padStart(5, '0')}`,
      from: '陕西环宇科技',
      to: '深圳环球科技',
      amount: (Math.random() * 300000).toFixed(2),
      balance: (Math.random() * 10000).toFixed(2),
      col1: `数据A-${i}`,
      col2: `数据B-${i}`,
      col3: `数据C-${i}`,
      col4: `数据D-${i}`,
      col5: `数据E-${i}`,
      col6: `数据F-${i}`,
    })),
  [])

  const columns = [
    // { code: 'No', name: '序号', width: 80, align: 'center', lock: true },
    { code: 'order', name: '单据号', width: 200 },
    { code: 'from', name: '来户', width: 200 },
    { code: 'to', name: '往户', width: 200 },
    { code: 'amount', name: '应付金额', width: 150, align: 'right' },
    { code: 'balance', name: '应收余额', width: 150, align: 'right' },
    { code: 'col1', name: '扩展列1', width: 150 },
    { code: 'col2', name: '扩展列2', width: 150 },
    { code: 'col3', name: '扩展列3', width: 150 },
    { code: 'col4', name: '扩展列4', width: 150 },
    { code: 'col5', name: '扩展列5', width: 150 },
    { code: 'col6', name: '扩展列6', width: 150 },
    { code: 'detail', name: '详情', width: 80, align: 'center', lock: true },
  ]

  const pipeline = useTablePipeline()
    .input({ dataSource, columns })
    .primaryKey('id')
    .use(
      features.rowDetail({
        defaultOpenKeys: ['1', '3'],
        expandColumnCode: 'detail',
        renderDetail(row) {
          return (
            <div style={{ margin: '8px 16px', textAlign: 'left' }}>
              <p>单据号：{row.order}</p>
              <p>应付金额：{row.amount}</p>
              <p>应收余额：{row.balance}</p>
            </div>
          )
        },
      }),
    )

  return (
    <Table
      {...pipeline.getProps()}
      useVirtual={true}
      style={{ height: 500, width: 800, overflow: 'auto' }}
    />
  )
}
```
