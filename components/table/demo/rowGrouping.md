---
title: 分组行
order: 700
---

通过 `features.rowGrouping` 可以实现服务端下发的分组行功能，支持多级嵌套分组、分组汇总、展开/折叠交互。分组行不参与横向滚动，复制粘贴时自动跳过分组行。

```jsx
;() => {
  const dataSource = [
    { id: '1', No: 1, code: 'EL-001', name: '雷电3数据线 1.2m', qty: 1, price: '345.00', date: '2026-07-02 14:00:00', warehouse: '华南仓', supplier: '深圳雷电科技', spec: '1.2m/白色', unit: '条', taxRate: '13%', amount: '345.00', discount: '0.00', netAmount: '345.00', deliveryMethod: '快递', remark: '加急订单' },
    { id: '2', No: 2, code: 'EL-002', name: '雷电3数据线 1.2m', qty: 1, price: '345.00', date: '2026-07-02 14:00:00', warehouse: '华南仓', supplier: '深圳雷电科技', spec: '1.2m/黑色', unit: '条', taxRate: '13%', amount: '345.00', discount: '5.00', netAmount: '340.00', deliveryMethod: '快递', remark: '' },
    { id: '3', No: 3, code: 'EL-003', name: '雷电3数据线 1.2m', qty: 1, price: '345.00', date: '2026-07-02 14:00:00', warehouse: '华东仓', supplier: '深圳雷电科技', spec: '1.2m/白色', unit: '条', taxRate: '13%', amount: '345.00', discount: '0.00', netAmount: '345.00', deliveryMethod: '物流', remark: '需要发票' },
    { id: '4', No: 4, code: 'EL-004', name: '雷电3数据线 1.2m', qty: 1, price: '345.00', date: '2026-07-02 14:00:00', warehouse: '华东仓', supplier: '深圳雷电科技', spec: '2.0m/白色', unit: '条', taxRate: '13%', amount: '345.00', discount: '10.00', netAmount: '335.00', deliveryMethod: '物流', remark: '' },
    { id: '5', No: 5, code: 'EL-005', name: '雷电3数据线 1.2m', qty: 3, price: '128.00', date: '2026-07-02 14:00:00', warehouse: '华北仓', supplier: '北京数码配件', spec: '1.2m/灰色', unit: '条', taxRate: '13%', amount: '384.00', discount: '0.00', netAmount: '384.00', deliveryMethod: '快递', remark: '' },
    { id: '6', No: 6, code: 'EL-006', name: '雷电3数据线 1.2m', qty: 2, price: '128.00', date: '2026-07-02 14:00:00', warehouse: '华北仓', supplier: '北京数码配件', spec: '1.2m/白色', unit: '条', taxRate: '13%', amount: '256.00', discount: '6.00', netAmount: '250.00', deliveryMethod: '快递', remark: '优先发货' },
    { id: '7', No: 7, code: 'EL-007', name: '雷电3数据线 1.2m', qty: 3, price: '128.00', date: '2026-07-02 14:00:00', warehouse: '华南仓', supplier: '北京数码配件', spec: '2.0m/黑色', unit: '条', taxRate: '13%', amount: '384.00', discount: '0.00', netAmount: '384.00', deliveryMethod: '物流', remark: '' },
    { id: '8', No: 8, code: 'EL-008', name: '雷电3数据线 1.2m', qty: 2, price: '128.00', date: '2026-07-02 14:00:00', warehouse: '华南仓', supplier: '北京数码配件', spec: '1.2m/白色', unit: '条', taxRate: '13%', amount: '256.00', discount: '0.00', netAmount: '256.00', deliveryMethod: '快递', remark: '' },
    { id: '9', No: 9, code: 'EL-009', name: '雷电3数据线 1.2m', qty: 3, price: '599.00', date: '2026-07-02 14:00:00', warehouse: '华东仓', supplier: '上海优品电子', spec: '1.2m/银色', unit: '条', taxRate: '13%', amount: '1797.00', discount: '50.00', netAmount: '1747.00', deliveryMethod: '物流', remark: '大客户订单' },
    { id: '10', No: 10, code: 'EL-012', name: '雷电3数据线 1.2m', qty: 2, price: '599.00', date: '2026-07-02 14:00:00', warehouse: '华东仓', supplier: '上海优品电子', spec: '2.0m/银色', unit: '条', taxRate: '13%', amount: '1198.00', discount: '0.00', netAmount: '1198.00', deliveryMethod: '物流', remark: '' },
    { id: '11', No: 11, code: 'USB-001', name: 'USB-C 扩展坞', qty: 2, price: '299.00', date: '2026-07-03 10:00:00', warehouse: '华南仓', supplier: '广州拓展科技', spec: '7合1/银色', unit: '个', taxRate: '13%', amount: '598.00', discount: '20.00', netAmount: '578.00', deliveryMethod: '快递', remark: '' },
    { id: '12', No: 12, code: 'USB-002', name: 'USB-C 扩展坞', qty: 2, price: '299.00', date: '2026-07-03 10:00:00', warehouse: '华北仓', supplier: '广州拓展科技', spec: '10合1/深空灰', unit: '个', taxRate: '13%', amount: '598.00', discount: '0.00', netAmount: '598.00', deliveryMethod: '物流', remark: '含HDMI接口' },
    { id: '13', No: 13, code: 'KB-001', name: '机械键盘 87键', qty: 1, price: '459.00', date: '2026-07-04 09:00:00', warehouse: '华东仓', supplier: '东莞键盘工厂', spec: '红轴/白色', unit: '把', taxRate: '13%', amount: '459.00', discount: '0.00', netAmount: '459.00', deliveryMethod: '快递', remark: '' },
    { id: '14', No: 14, code: 'KB-002', name: '机械键盘 87键', qty: 1, price: '459.00', date: '2026-07-04 09:00:00', warehouse: '华东仓', supplier: '东莞键盘工厂', spec: '茶轴/黑色', unit: '把', taxRate: '13%', amount: '459.00', discount: '15.00', netAmount: '444.00', deliveryMethod: '快递', remark: '员工福利' },
    { id: '15', No: 15, code: 'KB-003', name: '机械键盘 87键', qty: 1, price: '459.00', date: '2026-07-04 09:00:00', warehouse: '华南仓', supplier: '东莞键盘工厂', spec: '青轴/白色', unit: '把', taxRate: '13%', amount: '459.00', discount: '0.00', netAmount: '459.00', deliveryMethod: '物流', remark: '' },
    { id: '16', No: 16, code: 'KB-004', name: '机械键盘 87键', qty: 1, price: '459.00', date: '2026-07-04 09:00:00', warehouse: '华北仓', supplier: '东莞键盘工厂', spec: '红轴/黑色', unit: '把', taxRate: '13%', amount: '459.00', discount: '0.00', netAmount: '459.00', deliveryMethod: '快递', remark: '定制键帽' }
  ]

  // 三层分组
  const groupInfo = {
    grouped: true,
    groupHeaders: [
      {
        level: 1,
        fieldKey: 'name',
        displayName: '分组: 物料名称：雷电3数据线 1.2m',
        collapsed: false,
        rowIndexes: [],
        subtotals: { qty: 14 },
        children: [
          {
            level: 2,
            fieldKey: 'price',
            displayName: '分组: 含税单价：128.00',
            collapsed: false,
            rowIndexes: [],
            subtotals: { qty: 10 },
            children: [
              {
                level: 3,
                fieldKey: 'date',
                displayName: '分组: 交货日期：2026-07-02',
                collapsed: false,
                rowIndexes: [4, 5, 6, 7],
                subtotals: { qty: 10 },
                children: []
              }
            ]
          },
          {
            level: 2,
            fieldKey: 'price',
            displayName: '分组: 含税单价：345.00',
            collapsed: false,
            rowIndexes: [0, 1, 2, 3],
            subtotals: { qty: 4 },
            children: []
          },
          {
            level: 2,
            fieldKey: 'price',
            displayName: '分组: 含税单价：599.00',
            collapsed: false,
            rowIndexes: [8, 9],
            subtotals: { qty: 5 },
            children: []
          }
        ]
      },
      {
        level: 1,
        fieldKey: 'name',
        displayName: '分组: 物料名称：USB-C 扩展坞',
        collapsed: true,
        rowIndexes: [10, 11],
        subtotals: { qty: 4 },
        children: []
      },
      {
        level: 1,
        fieldKey: 'name',
        displayName: '分组: 物料名称：机械键盘 87键',
        collapsed: true,
        rowIndexes: [12, 13, 14, 15],
        subtotals: { qty: 4 },
        children: []
      }
    ]
  }

  const columns = [
    { code: 'No', name: '序号', width: 60, align: 'center' },
    { code: 'code', name: '编码', width: 100 },
    { code: 'name', name: '物料名称', width: 200 },
    { code: 'spec', name: '规格型号', width: 130 },
    { code: 'unit', name: '单位', width: 60, align: 'center' },
    { code: 'qty', name: '购买数量', width: 100, align: 'center' },
    { code: 'price', name: '含税单价', width: 100, align: 'right' },
    { code: 'taxRate', name: '税率', width: 80, align: 'center' },
    { code: 'amount', name: '金额', width: 120, align: 'right' },
    { code: 'discount', name: '折扣', width: 100, align: 'right' },
    { code: 'netAmount', name: '净额', width: 120, align: 'right' },
    { code: 'date', name: '交货日期', width: 180 },
    { code: 'warehouse', name: '仓库', width: 100 },
    { code: 'supplier', name: '供应商', width: 150 },
    { code: 'deliveryMethod', name: '配送方式', width: 100 },
    { code: 'remark', name: '备注', width: 150 }
  ]

  const pipeline = useTablePipeline()
    .input({ dataSource, columns })
    .primaryKey('id')
    .use(features.rowGrouping({ groupInfo }))
    .use(features.rangeSelection({
      rangeSelectedChange: function(cellRanges, isFinished) {
        if (isFinished) {
          console.log('框选结果:', cellRanges)
        }
      }
    }))
    .use(features.contextMenu({}))

  return <Table style={{ height: 500, overflow: 'auto' }} {...pipeline.getProps()} />
}
```
