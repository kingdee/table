---
title: 自定义选择列
order: 701
---
通过 `features.multiSelect/singleSelect` 中设置customRender 自定义选择列的渲染方式。

customRender 接收一个参数，参数为当前行的记录，返回一个 React 元素。

例如，自定义一个选择列，点击后会在控制台打印当前行的记录。

```jsx
function () {
  const [ selected, setSelected ] = React.useState([])
  const [ selectedType, setSelectedType ] = React.useState('multi') //single or multi

  const handleSelectedTypeChange = e => {
    setSelected(selected.splice(0,1))
    setSelectedType(e.target.value)
  }
  const handleChange = (v) => {
    setSelected(v)
  }

  const barStyle = {
    position: 'absolute',
    display: 'block',
    width: '6px',
    height: '20px',
    top: '50%',
    left: '0',
    transform: 'translateY(-50%)',
  }

  const dataSource = [
    {id:"1","No":1,"order":"AP-202009-00001","from":"陕西环宇科技","to":"深圳环球科技","amount":"26,800.00","balance":"5,200.00"},
    {id:"2","No":2,"order":"AP-202009-00002","from":"陕西环宇科技","to":"深圳环球科技","amount":"236,800.00","balance":"1,500.00"},
    {id:"3","No":3,"order":"AP-202009-00003","from":"陕西环宇科技","to":"深圳环球科技","amount":"246,800.00","balance":"5,300.00"},
    {id:"4","No":4,"order":"AP-202009-00004","from":"陕西环宇科技","to":"深圳环球科技","amount":"216,800.00","balance":"5,400.00"},
    {id:"5","No":5,"order":"AP-202009-00005","from":"陕西环宇科技","to":"深圳环球科技","amount":"236,800.00","balance":"1,500.00"}
  ]

  const footerDataSource = [
    {id: "5", "No":"合计","order":"AP-202009-00004","from":"陕西环宇科技","to":"深圳环球科技","amount":"964,000.00","balance":"18,900.00"}
  ]

  const columns = [
    { code: 'No', name: '序号', width: 60, align: 'center' },
    { code: 'order', name: '单据号', width: 200 },
    { code: 'from', name: '来户', width: 200 },
    { code: 'to', name: '往户', width: 200 },
    { code: 'amount', name: '应付金额', width: 100, align: 'right' },
    { code: 'balance', name: '应收余额', width: 100, align: 'right' }
  ]

  const CustomCheckbox = (props) => <Checkbox {...props} />
  const CustomRadio = (props) => <Radio {...props} />


  const pipeline = useTablePipeline({
    components: {
      Checkbox: CustomCheckbox,
      Radio: CustomRadio
    }
  })
    .input({ dataSource: dataSource, columns: columns })
    .primaryKey('id')

   pipeline.use(features.footerDataSource({ dataSource: footerDataSource }))

  if(selectedType==='multi'){
    pipeline.use(
      features.multiSelect({
        value: selected,
        onChange: setSelected,
        highlightRowWhenSelected: true,
        clickArea: 'row',
        checkboxPlacement: 'start',
        checkboxColumn: { lock: true },
        customRender: (record) => {
          const { defaultElement, rowIndex, rowKey, checked, disabled } = record
          const style = {}
          if (rowIndex % 2 === 0) {
            style.backgroundColor = '#f00'
          } else {
            style.backgroundColor = '#ff0'
          }
          return (
            <>
              <i style={{...barStyle, ...style}}></i>
              {defaultElement}
            </>
          )
        }
      })
    )
  } else {
    pipeline.use(
      features.singleSelect({
        value: selected[0],
        onChange: v => setSelected([v]),
        highlightRowWhenSelected: true,
        radioPlacement: 'start',
        radioColumn: { lock: true },
        customRender: (record) => {
          const { defaultElement, rowIndex, rowKey, checked, disabled } = record
          const style = {}
          if (rowIndex % 2 === 0) {
            style.backgroundColor = '#f00'
          } else {
            style.backgroundColor = '#ff0'
          }
          return (
            <>
              <i style={{...barStyle, ...style}}></i>
              {defaultElement}
            </>
          )
        }
      })
    )
  }



  return (
    <div>
      <Radio.Group onChange={handleSelectedTypeChange} value={selectedType}>
        <Radio value={'multi'}>多选</Radio>
        <Radio value={'single'}>单选</Radio>
      </Radio.Group>
      <br />
      <Table
        {...pipeline.getProps()}
      />
    </div>
  )
}
```
