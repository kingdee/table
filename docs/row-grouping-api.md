# 行分组合计 使用文档

## 功能介绍

`features.rowGrouping` 提供表格的行分组合计功能，支持：

- 多级嵌套分组
- 分组行展示汇总合计值
- 展开/折叠交互
- 分组行名称 sticky 不随横向滚动
- 复制粘贴自动跳过分组行

---

## 快速上手

```tsx
import { useTablePipeline, features, Table } from '@kdcloudjs/table'

function Demo() {
  const columns = [
    { code: 'name', name: '物料名称', width: 200 },
    { code: 'qty', name: '数量', width: 100, align: 'center' },
    { code: 'price', name: '单价', width: 100, align: 'right' },
    { code: 'amount', name: '金额', width: 120, align: 'right' },
  ]

  const dataSource = [
    { id: '1', name: '数据线A', qty: 2, price: 128, amount: 256 },
    { id: '2', name: '数据线B', qty: 3, price: 128, amount: 384 },
    { id: '3', name: '扩展坞A', qty: 1, price: 299, amount: 299 },
  ]

  const groupInfo = {
    grouped: true,
    groupHeaders: [
      {
        level: 1,
        fieldKey: 'name',
        displayName: '分组: 数据线',
        collapsed: false,
        rowIndexes: [0, 1],
        subtotals: { qty: 5, amount: 640 },
        children: [],
      },
      {
        level: 1,
        fieldKey: 'name',
        displayName: '分组: 扩展坞',
        collapsed: false,
        rowIndexes: [2],
        subtotals: { qty: 1, amount: 299 },
        children: [],
      },
    ],
  }

  const pipeline = useTablePipeline()
    .input({ dataSource, columns })
    .primaryKey('id')
    .use(features.rowGrouping({ groupInfo }))

  return <Table style={{ height: 400, overflow: 'auto' }} {...pipeline.getProps()} />
}
```

---

## API

### features.rowGrouping(options)

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `groupInfo` | `GroupInfo` | ✅ | 分组结构定义 |
| `openKeys` | `string[]` | - | 受控模式：当前展开的分组 key 列表 |
| `onChangeOpenKeys` | `(nextKeys, key, action) => void` | - | 展开/折叠状态变更回调 |
| `defaultOpenKeys` | `string[]` | - | 非受控模式：默认展开的分组 keys |
| `stopClickEventPropagation` | `boolean` | - | 是否阻止展开/折叠点击事件冒泡 |
| `groupRowClassName` | `string \| ((groupHeader, level) => string)` | - | 分组行自定义 className |
| `renderGroupRow` | `(groupHeader, expandIcon) => ReactNode` | - | 自定义分组行内容渲染 |
| `renderSubtotal` | `(value, fieldKey, groupHeader) => ReactNode` | - | 自定义汇总值渲染 |

---

## 数据结构

### GroupInfo

```ts
interface GroupInfo {
  /** 是否启用分组 */
  grouped: boolean
  /** 分组头数组 */
  groupHeaders: GroupHeader[]
}
```

### GroupHeader

```ts
interface GroupHeader {
  /** 分组层级，从 1 开始 */
  level: number
  /** 分组字段标识 */
  fieldKey: string
  /** 分组行显示文本 */
  displayName: string
  /** 是否默认折叠 */
  collapsed: boolean
  /** 该分组包含的数据行在 dataSource 中的索引（0-based） */
  rowIndexes: number[]
  /** 汇总值，key 需与列的 code 对应 */
  subtotals: Record<string, string | number>
  /** 子分组 */
  children: GroupHeader[]
}
```

**关键说明：**

- `rowIndexes`：数组元素为该分组包含的数据行在 `dataSource` 中的下标
- `subtotals`：key 必须与列定义中的 `code` 一致，前端会将汇总值渲染到对应列的分组行位置
- `collapsed`：控制初始展开/折叠状态，`true` = 折叠，`false` = 展开
- `children`：支持无限层级嵌套，无子分组时传空数组

---

## 使用场景

### 1. 单级分组 + 合计

最简单的场景：按某个维度分组并显示合计值。

```tsx
const groupInfo = {
  grouped: true,
  groupHeaders: [
    {
      level: 1,
      fieldKey: 'supplier',
      displayName: '供应商：深圳雷电科技',
      collapsed: false,
      rowIndexes: [0, 1, 2, 3],
      subtotals: { qty: 4, amount: '1380.00' },
      children: [],
    },
    {
      level: 1,
      fieldKey: 'supplier',
      displayName: '供应商：北京数码配件',
      collapsed: true,  // 默认折叠
      rowIndexes: [4, 5, 6, 7],
      subtotals: { qty: 10, amount: '1280.00' },
      children: [],
    },
  ],
}
```

### 2. 多级嵌套分组

先按物料名称分组，再按单价细分：

```tsx
const groupInfo = {
  grouped: true,
  groupHeaders: [
    {
      level: 1,
      fieldKey: 'name',
      displayName: '分组: 物料名称：雷电3数据线',
      collapsed: false,
      rowIndexes: [],       // 父分组不直接挂载行
      subtotals: { qty: 14 },
      children: [
        {
          level: 2,
          fieldKey: 'price',
          displayName: '分组: 含税单价：128.00',
          collapsed: false,
          rowIndexes: [4, 5, 6, 7],  // 行挂在叶子分组上
          subtotals: { qty: 10 },
          children: [],
        },
        {
          level: 2,
          fieldKey: 'price',
          displayName: '分组: 含税单价：345.00',
          collapsed: false,
          rowIndexes: [0, 1, 2, 3],
          subtotals: { qty: 4 },
          children: [],
        },
      ],
    },
  ],
}
```

### 3. 受控展开/折叠

通过 `openKeys` + `onChangeOpenKeys` 实现完全受控：

```tsx
function ControlledGroupTable() {
  const [openKeys, setOpenKeys] = useState<string[]>([])

  const pipeline = useTablePipeline()
    .input({ dataSource, columns })
    .primaryKey('id')
    .use(features.rowGrouping({
      groupInfo,
      openKeys,
      onChangeOpenKeys(nextKeys, key, action) {
        // action: 'expand' | 'collapse'
        setOpenKeys(nextKeys)
      },
    }))

  return <Table {...pipeline.getProps()} />
}
```

### 4. 自定义分组行渲染

```tsx
pipeline.use(features.rowGrouping({
  groupInfo,
  renderGroupRow(groupHeader, expandIcon) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {expandIcon}
        <span style={{ fontWeight: 600 }}>{groupHeader.displayName}</span>
        <span style={{ color: '#999', fontSize: 12 }}>
          共 {groupHeader.rowIndexes.length} 条
        </span>
      </div>
    )
  },
}))
```

### 5. 自定义汇总值渲染

```tsx
pipeline.use(features.rowGrouping({
  groupInfo,
  renderSubtotal(value, fieldKey, groupHeader) {
    if (fieldKey === 'amount') {
      return <span style={{ color: '#E53935', fontWeight: 600 }}>¥{value}</span>
    }
    return value
  },
}))
```

### 6. 关闭分组

```tsx
const groupInfo = { grouped: false, groupHeaders: [] }
```

传入 `grouped: false` 即可关闭分组功能，表格恢复正常平铺模式。

---

## 工具函数

组件导出了两个工具函数，方便在自定义逻辑中识别分组行：

```tsx
import { isGroupRow, getGroupRowMeta } from '@kdcloudjs/table'

// 判断某行数据是否是分组行
isGroupRow(row) // => boolean

// 获取分组行的元信息（非分组行返回 null）
const meta = getGroupRowMeta(row)
// meta: { isGroupHeader, level, displayName, fieldKey, expandable, expanded, subtotals, groupKey }
```

### GroupRowMeta 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `isGroupHeader` | `true` | 固定 true |
| `level` | `number` | 分组层级 |
| `displayName` | `string` | 显示文本 |
| `fieldKey` | `string` | 分组字段标识 |
| `expandable` | `boolean` | 是否可展开（有行数据或子分组） |
| `expanded` | `boolean` | 当前是否展开 |
| `subtotals` | `Record<string, string \| number>` | 汇总值 |
| `groupKey` | `string` | 分组唯一标识（内部生成） |

---

## 与其他功能配合使用

行分组可以和其他 pipeline feature 组合：

```tsx
const pipeline = useTablePipeline()
  .input({ dataSource, columns })
  .primaryKey('id')
  .use(features.rowGrouping({ groupInfo }))
  .use(features.rangeSelection({ rangeSelectedChange: handleRangeChange }))
  .use(features.contextMenu({}))
```

框选（rangeSelection）和复制粘贴会自动跳过分组行，只操作实际数据行。

---

## 注意事项

1. **必须指定 primaryKey**：`pipeline.primaryKey('id')` 是必需的
2. **subtotals 的 key 必须与列 code 一致**：不匹配的 key 不会展示
3. **rowIndexes 基于 dataSource 的全局索引**：确保索引在数组范围内
4. **分组行不占据数据行位置**：分组行是动态插入的虚拟行，不影响原始数据
5. **性能建议**：嵌套层级建议 ≤ 4 层，单页数据建议 ≤ 10000 行
