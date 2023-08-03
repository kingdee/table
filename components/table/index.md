---
category: Components
type: 通用
title: Table
subtitle: 表格
---

表格是一种提供了一个排列成列和行的有序的字段组合的用户界面元素。

## 何时使用
1. 当有大量的结构化的数据需要展现或对比时
2. 当需要对数据进行排序、搜索、分页、自定义操作等复杂行为时

## 如何使用
指定表格的数据源 `dataSource` 和列的定义 `columns` ，二者均为一个数组。

```javascript
const dataSource = [
    {"No":1,"order":"AP-202009-00001","from":"陕西环宇科技","to":"深圳环球科技","amount":"26,800.00","balance":"500.00"},
    {"No":2,"order":"AP-202009-00001","from":"陕西环宇科技","to":"深圳环球科技","amount":"26,800.00","balance":"500.00"},
    {"No":3,"order":"AP-202009-00001","from":"陕西环宇科技","to":"深圳环球科技","amount":"26,800.00","balance":"500.00"},
    {"No":4,"order":"AP-202009-00001","from":"陕西环宇科技","to":"深圳环球科技","amount":"26,800.00","balance":"500.00"},
    {"No":5,"order":"AP-202009-00001","from":"陕西环宇科技","to":"深圳环球科技","amount":"26,800.00","balance":"500.00"}
]

const columns = [
  { code: 'No', name: '序号', width: 60, align: 'center' },
  { code: 'order', name: '单据号', width: 200 },
  { code: 'from', name: '来户', width: 200 },
  { code: 'to', name: '往户', width: 200 },
  { code: 'amount', name: '应付金额', width: 100, align: 'right' },
  { code: 'balance', name: '应收余额', width: 100, align: 'right' }
]

const pipeline = useTablePipeline().input({ dataSource: dataSource, columns: columns })

<Table {...pipeline.getProps()} />
```

## API

### Table

| 属性 | 说明 | 类型 | 默认值 | 可选值 | 版本 |
| --- | --- | --- | --- | --- | --- |
| useOuterBorder | 是否带边框 | boolean | `true` | `true` `false` | 0.0.1-beta.1 |
| columns | 表格列的配置描述，具体项见下表 | ArtColumn[]1 | - | - | 0.0.1-beta.1 |
| dataSource | 数据数组 | any[] | - | - | 0.0.1-beta.1 |
| isLoading | 表格是否在加载中 | boolean | `false` | `true` `false` | 0.0.1-beta.1 |
| style | 自定义内联样式 | CSSProperties | `-` | `-` | 0.0.1-beta.1 |
| primaryKey | 主键 | string | - | - | 0.0.1-beta.1 |
| hasHeader | 表格是否具有头部 | boolean | `true` | `true` `false` | 0.0.1-beta.1 |
| emptyCellHeight | 数据为空时，单元格的高度 | number | - | - | 0.0.1-beta.1 |
| useVirtual | 是否开启虚拟滚动 | boolean auto | `auto` | `true` `false` `auto` | 0.0.1-beta.1 |
| estimatedRowHeight | 虚拟滚动开启情况下，表格中每一行的预估高度 | number | `48` | - | 0.0.1-beta.1 |



### Column

| 属性 | 说明 | 类型 | 默认值 | 可选值 | 版本 |
| --- | --- | --- | --- | --- | --- |
| name | 列的名称 | string | - | - | 0.0.1-beta.1 |
| code | 在数据中的字段 | string | - | - | 0.0.1-beta.1 |
| title | 列标题的展示名称；在页面中进行展示时，该字段将覆盖 name 字段 | string | - | - | 0.0.1-beta.1 |
| width | 列的宽度，如果该列是锁定的，则宽度为必传项 | number | - | - | 0.0.1-beta.1 |
| align | 单元格中的文本或内容的 对其方向 | `center` | `-` | `left` `center` `right` | 0.0.1-beta.1 |
| verticalAlign | 单元格中的文本或内容的 垂直水平轴对其方向 | string | `middle` | `top` `bottom` `middle` | 0.0.1-beta.1 |
| hidden | 是否隐藏 | boolean | `false` | `true` `false` | 0.0.1-beta.1 |
| lock | 是否锁列 | boolean | - | `HTMLTableCellElement` | 0.0.1-beta.1 |
| headerCellProps | 表头单元格的 props | number | - | - | 0.0.1-beta.1 |
| features | 功能开关, 具体项见下表 | 	{ [key: string]: any } | - | - | 0.0.1-beta.1 |
| estimatedRowHeight | 虚拟滚动开启情况下，表格中每一行的预估高度 | number | `48` | - | 0.0.1-beta.1 |
| filterable | 是否开启过滤功能 | boolean | `false` | `true` `false` | 0.0.1-beta.1 |


### column.features
| 属性 | 说明 | 类型 | 默认值 | 可选值 | 版本 |
| --- | --- | --- | --- | --- | --- |
| sortable | 是否开启排序功能 | boolean \| (a,b)=>boolean | `false` | `true` `false`  | 0.0.1-beta.1 |
| filterable | 是否开启过滤功能 | boolean \| (filterValue) => (value) =>boolean | `false` | `true` `false`  | 0.0.1-beta.1 |
<br/>

### table.features

表格功能都需要单独引用，使用方式为`pipeline.use(features.FeatureName(FeatureOptions))`, 下面做具体的说明。
<br/>


#### multiSelect
行多选配置项

- 启用行多选功能之前，pipeline 必须已经设置了 primaryKey
- 行多选依赖复选框组件，使用之前需要先设置 pipeline.ctx.components.Checkbox

| 属性 | 说明 | 类型 | 默认值 | 可选值 | 版本 |
| --- | --- | --- | --- | --- | --- |
| defaultValue | 非受控用法：默认选中的值 | string[] | `-` | `-` | 0.0.1-beta.1 |
| value | 受控用法：当前选中的 keys | string[] | `-` | `-` | 0.0.1-beta.1 |
| onChange | 受控用法：状态改变回调 | (nextValue,key,keys,action) => void | `-` | `-` | 0.0.1-beta.1 |
| checkboxPlacement | 复选框所在列的位置 | string | `start` | `start` `end` | 0.0.1-beta.1 |
| checkboxColumn | 复选框所在列的 column 配置，可指定 width，lock, title, align, features 等属性 | Partial<ArtColumnStaticPart> | `-` | `-` | 0.0.1-beta.1 |
| highlightRowWhenSelected | 是否高亮被选中的行 | boolean | `true` | `true` `false` | 0.0.1-beta.1 |
| isDisabled | 判断一行中的 checkbox 是否要禁用 | (row, rowIndex) => boolean| `-` | `-` | 0.0.1-beta.1 |
| clickArea | 点击事件的响应区域 | string | `checkbox` | `checkbox` `cell` `row` | 0.0.1-beta.1 |
| stopClickEventPropagation | 是否对触发 onChange 的 click 事件调用 event.stopPropagation() | boolean | `false` | `true` `false` | 0.0.1-beta.1 |

##### onChange
- `nextValue` 即将被选中的 keys 数组。
- `key` 触发本次状态改变的表格行的 key。
- `keys` 本次状态改变相关的 keys 数组。
    - 一般情况下该数组长度为 1。
    - 多选（按住 shift 键）或全选的情况下，该数组长度可能超过 1。
- `action` 交互行为。
    - `check` 选中一个或多个。
    - `uncheck` 取消选中一个或多个。
    - `check-all` 选择全部。
    - `uncheck-all` 反选全部。

    
<br/>

#### singleSelect
行单选配置项

- 启用行单选功能之前，pipeline 必须已经设置了 primaryKey。
- 行单选依赖单选框组件，使用 singleSelect 之前需要通过 pipeline context 设置 components.Radio。

| 属性 | 说明 | 类型 | 默认值 | 可选值 | 版本 |
| --- | --- | --- | --- | --- | --- |
| defaultValue | 非受控用法：默认选中的值 | string | `-` | `-` | 0.0.1-beta.1 |
| value | 受控用法：当前选中的 keys | string | `-` | `-` | 0.0.1-beta.1 |
| onChange | 受控用法：状态改变回调 | (nextValue) => void | `-` | `-` | 0.0.1-beta.1 |
| radioPlacement | 单选框所在列的位置 | string | `start` | `start` `end` | 0.0.1-beta.1 |
| radioColumn | 单选框所在列的 column 配置，可指定 width，lock, title, align, features 等属性 | Partial<ArtColumnStaticPart> | `-` | `-` | 0.0.1-beta.1 |
| highlightRowWhenSelected | 是否高亮被选中的行 | boolean | `true` | `true` `false` | 0.0.1-beta.1 |
| isDisabled | 判断一行中的 checkbox 是否要禁用 | fucntion(row, rowIndex) => boolean| `-` | `-` | 0.0.1-beta.1 |
| clickArea | 点击事件的响应区域 | string | `checkbox` | `checkbox` `cell` `row` | 0.0.1-beta.1 |
| stopClickEventPropagation | 是否对触发 onChange 的 click 事件调用 event.stopPropagation() | boolean | `false` | `true` `false` | 0.0.1-beta.1 |

##### onChange
- `nextValue` 即将被选中的 key。

    
<br/>

#### filter
过滤配置项

| 属性 | 说明 | 类型 | 默认值 | 可选值 | 版本 |
| --- | --- | --- | --- | --- | --- |
| defaultFilters | (非受控用法) 默认的过滤字段列表 | object[] | `-` | `[{code,filter}]` | 0.0.1-beta.1 |
| filters | (受控用法) 过滤字段列表  | object[] | `-` | `[{code,filter}]` | 0.0.1-beta.1 |
| onChangeFilters | 更新过滤字段列表的回调函数 | (nextFilters: Filters) | `-` | `-` | 0.0.1-beta.1 |
| keepDataSource | 是否保持 dataSource 不变 | boolean | `false` | `true` `false` | 0.0.1-beta.1 |
| mode | 过滤模式。单选 single，多选 multiple | string | `multiple` | `single` `multiple` | 0.0.1-beta.1 |
| stopClickEventPropagation | 是否对触发弹出过滤面板的点击事件阻止冒泡 | boolean | `false` | `true` `false` | 0.0.1-beta.1 |

##### 更新排序字段列表的回调函数 onChangeFilters
- `nextFilters` 即将被更新的过滤字段列表数组。
    - `code` 列标识。
    - `filter` 过滤值数组。
    - `filterCondition` 过滤条件标识，默认过滤面板使用。
<br/>

#### sort
排序配置项

| 属性 | 说明 | 类型 | 默认值 | 可选值 | 版本 |
| --- | --- | --- | --- | --- | --- |
| defaultSorts | (非受控用法) 默认的排序字段列表 | object[] | `-` | `[{code,order}]` | 0.0.1-beta.1 |
| sorts | (受控用法) 排序字段列表  | object[] | `-` | `[{code,order}]` | 0.0.1-beta.1 |
| onChangeSorts | 更新排序字段列表的回调函数 | (nextFilters: Filters) | `-` | `-` | 0.0.1-beta.1 |
| orders | 排序切换顺序 | [] | `-` | [`desc` `asc` `none`] | 0.0.1-beta.1 |
| keepDataSource | 是否保持 dataSource 不变 | boolean | `false` | `true` `false` | 0.0.1-beta.1 |
| mode | 排序模式。单选 single，多选 multiple | string | `single` | `single` `multiple` | 0.0.1-beta.1 |
| SortHeaderCell | 自定义排序表头 | React.ComponentType<SortHeaderCellProps> | `` | `` | 0.0.1-beta.1 |
| highlightColumnWhenActive | 排序激活时 是否高亮这一列的单元格 | boolean | `false` | `true` `false` | 0.0.1-beta.1 |
| stopClickEventPropagation | 是否对触发排序点击阻止冒泡 | boolean | `false` | `true` `false` | 0.0.1-beta.1 |
| clickArea | 点击事件的响应区域 | string | `content` | `content` `icon` | 0.0.1-beta.1 |

##### 更新排序字段列表的回调函数 onChangeSorts
- `nextSorts` 即将被更新的排序字段列表数组。
    - `code` 列标识。
    - `order` 本次排序状态，值为：['desc', 'asc', 'none']。

##### 自定义排序顺序 orders
可以用来指定排序切换顺序。该选项的默认值为 ['desc', 'asc', 'none']，即连续点击某一列的表头时，先按降序排序，然后按升序排序，最后取消排序；传入自定义的 orders 可以覆盖默认的切换顺序。

##### 自定义排序表头 SortHeaderCell
可用于自定义排序表头的内容和样式，组件接口如下：
```js
SortHeaderCellProps {
  /** 调用 features.sort(...) 时的参数 */
  sortOptions: object

  /** 在添加排序相关的内容之前 表头原有的渲染内容 */
  children: ReactNode

  /** 当前排序 */
  sortOrder: SortOrder

  /** 多列排序下，sortIndex 指明了当前排序字段起作用的顺序. 当 sortOrder 为 none 时，sortIndex 为 -1 */
  sortIndex: number

  /** 当前列的配置 */
  column: ArtColumn

  /** 切换排序的回调 */
  onToggle(): void
}
```

<br/>

#### rowDetail 
详情行配置项

| 属性 | 说明 | 类型 | 默认值 | 可选值 | 版本 |
| --- | --- | --- | --- | --- | --- |
| defaultOpenAll | (非受控用法) 是否默认展开所有详情单元格 | boolean | `false` | `true` &#124; `false` | 0.0.1-beta.1 |
| defaultOpenKeys | (非受控用法) 默认展开的 keys  | string[] | `-` | `-` | 0.0.1-beta.1 |
| openKeys | (受控用法) 当前展开的 keys | string[] | `-` | `-` | 0.0.1-beta.1 |
| onChangeOpenKeys | (受控用法) openKeys 改变的回调 | (nextKeys: string[], key: string, action: 'expand' &#124; 'collapse'):void | `-` | `-` | 0.0.1-beta.1 |
| renderDetail | 详情单元格的渲染方法 | (row: any, rowIndex: number): ReactNode | `-` | `-` | 0.0.1-beta.1 |
| hasDetail | 是否包含详情单元格 | (row: any, rowIndex: number): boolean | `-` | `-` | 0.0.1-beta.1 |
| getDetailKey | 获取详情单元格所在行的 key，默认为 `(row) => row[primaryKey] + '_detail'` | (row: any, rowIndex: number): string | `-` | `-` | 0.0.1-beta.1 |
| detailCellStyle | 详情单元格 td 的额外样式 | React.CSSProperties | `-` | `-` | 0.0.1-beta.1 |
| clickArea | 点击事件的响应区域 | string | `cell` | `'cell'` &#124; `'content'` &#124; `'icon'` | 0.0.1-beta.1 |
| stopClickEventPropagation | 是否对触发展开/收拢的 click 事件调用 event.stopPropagation() | boolean | `false` | `true` &#124; `false` | 0.0.1-beta.1 |
| rowDetailMetaKey | 指定表格每一行元信息的记录字段 | string &#124; symbol | `Symbol('row-detail')` | `-` | 0.0.1-beta.1 |
| expandColumnCode | 指定在哪一列设置展开按钮 | string | `-` | `-` | 0.0.1-beta.1 |
<br/>

#### rangeSelection
范围框选配置项

| 属性 | 说明 | 类型 | 默认值 | 可选值 | 版本 |
| --- | --- | --- | --- | --- | --- |
| rangeSelectedChange | 范围框选回调函数 | (cellRanges: CellRange[], isFinished:boolean):void | `-` | `-` | 0.0.1-beta.1 |
| preventkDefaultOfKeyDownEvent | 是否阻止keydown的默认行为  | boolean | `false` | `true` &#124; `false` | 0.0.1-beta.1 |
| suppressMultiRangeSelection | 是否禁止多范围框选 | boolean | `false` | `true` &#124; `false` | 0.0.1-beta.1 |
<br/>

#### treeMode
树形数据展示配置项

| 属性 | 说明 | 类型 | 默认值 | 可选值 | 版本 |
| --- | --- | --- | --- | --- | --- |
| defaultOpenKeys | (非受控用法) 默认展开的 keys  | string[] | `-` | `-` | 0.0.1-beta.1 |
| openKeys | (受控用法) 当前展开的 keys | string[] | `-` | `-` | 0.0.1-beta.1 |
| onChangeOpenKeys | (受控用法) openKeys 改变的回调 | (nextKeys: string[], key: string, action: 'expand' &#124; 'collapse'):void | `-` | `-` | 0.0.1-beta.1 |
| isLeafNode | 自定义叶子节点的判定逻辑 | (node: any, nodeMeta: { depth: number; expanded: boolean; rowKey: string }): boolean | `-` | `-` | 0.0.1-beta.1 |
| iconIndent | icon 的缩进值。一般为负数，此时 icon 将向左偏移，默认从 pipeline.ctx.indents 中获取 | number | `-` | `-` | 0.0.1-beta.1 |
| iconGap | icon 与右侧文本的距离，默认从 pipeline.ctx.indents 中获取 | number | `-` | `-` | 0.0.1-beta.1 |
| indentSize | 每一级缩进产生的距离，默认从 pipeline.ctx.indents 中获取 | number | `-` | `-` | 0.0.1-beta.1 |
| clickArea | 点击事件的响应区域 | string | `cell` | `'cell'` &#124; `'content'` &#124; `'icon'` | 0.0.1-beta.1 |
| stopClickEventPropagation | 是否对触发展开/收拢的 click 事件调用 event.stopPropagation() | boolean | `false` | `true` &#124; `false` | 0.0.1-beta.1 |
| treeMetaKey | 指定表格每一行元信息的记录字段 | string &#124; symbol | `Symbol('treeMetaSymbol')` | `-` | 0.0.1-beta.1 |
<br/>

#### contextMenu(beta)
右键菜单 

| 属性 | 说明 | 类型 | 默认值 | 可选值 | 版本 |
| --- | --- | --- | --- | --- | --- |
| getContextMenuOptions | 自定义右键菜单项 | ({row,column,value})=> [MenuItem] | `` | ``| 0.0.1-beta.1 |


##### getContextMenuOptions
- 参数 
    - row 该行数据
    - column 列信息，包含：colId
    - value 单元格值
- 返回值需为`MenuItem`的数组，`MenuItem`参数为：
    - key 唯一标识
    - name 显示名称
    - action 点击所触发的操作

<br/>
#### 虚拟滚动

数据量较大时，表格会自动开启虚拟滚动。你也可以通过表格的 useVirtual 属性来调整虚拟滚动功能，目前 useVirtual 支持以下几个值：

- 'auto' （默认值）表示根据表格的行数或列数自动调整是否开启虚拟滚动
  - 行数量超过 100 时，自动开启纵向虚拟滚动
  - 列数量超过 100 时，自动开启横向虚拟滚动
  - 表头的横向虚拟滚动默认关闭
- true 开启所有虚拟滚动
- false 关闭所有虚拟滚动
- 传入一个对象可以分别指定 横向/纵向/表头 是否开启虚拟滚动
  - 对象的结构为 { horizontal?: boolean | 'auto', vertical?: boolean | 'auto', header?: boolean | 'auto' }

此外，水平方向的虚拟滚动 要求「所有的列都有一个指定的宽度」。推荐设置 <BaseTable defaultColumnWidth={...} />，确保所有的列都有一个指定的宽度

> 注意设置表格的高度或最大高度（宽度同理），并设置 style.overflow = 'auto'

##### 虚拟滚动与单元格合并

在虚拟滚动开启的情况下，如果想要进行单元格合并，则要使用 column.getSpanRect 来进行设定：

- column.getSpanRect 返回一个 SpanRect 的对象来表示对应单元所处的合并后的位置。
- SpanRect 的具体类型为 { left: number, right: number, top: number, bottom: number }
  - 注意其中 left/top 是 inclusive 的，right/bottom 是 exclusive 的。
  
不开启虚拟滚动时，单元格合并可以通过 column.getCellProps(...) 返回 colSpan / rowSpan 进行实现。

##### 预估行高

在元素被渲染在页面之前，组件是无法获取该元素的尺寸的。为了展示尽量真实的滚动条，表格组件内部需要算出所有行的高度之和。在一行没有被渲染之前，表格内部会使用 props.estimatedRowHeight (默认值为 48）来作为该行的高度，从而计算所有行的高度和。

在实际使用时，实际行高可能与预估行高有较大出入，此时可以设置 estimatedRowHeight 来提升预估高度的准确性。