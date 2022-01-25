---
title: 数据为空
order: 201
---

```jsx
() => {
  const columns = [
    { code: 'No', name: '序号', width: 60, align: 'center' },
    { code: 'order', name: '单据号', width: 200 },
    { code: 'from', name: '来户', width: 200 },
    { code: 'to', name: '往户', width: 200 },
    { code: 'amount', name: '应付金额', width: 100, align: 'right' },
    { code: 'balance', name: '应收余额', width: 100, align: 'right' }
  ]
  return <Table dataSource={[]} columns={columns} />
}
```
