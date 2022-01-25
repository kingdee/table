---
title: 数据加载中
order: 30
---

可以通过指定表格参数`isLoading`来显示加载中效果。


```jsx

() => {

    const [ isLoading, setIsLoadding ] = React.useState(false)
    const [dataSource,setDataSource] = React.useState([])

    const columns = [
        { code: 'No', name: '序号', width: 60, align: 'center' },
        { code: 'order', name: '单据号', width: 200 },
        { code: 'from', name: '来户', width: 200 },
        { code: 'to', name: '往户', width: 200 },
        { code: 'amount', name: '应付金额', width: 100, align: 'right' },
        { code: 'balance', name: '应收余额', width: 100, align: 'right' }
    ]

    const requestDataMock = () => {
        const dataSource = [
            {"No":1,"order":"AP-202009-00001","from":"陕西环宇科技","to":"深圳环球科技","amount":"26,800.00","balance":"5,200.00"},
            {"No":2,"order":"AP-202009-00002","from":"陕西环宇科技","to":"深圳环球科技","amount":"236,800.00","balance":"1,500.00"},
            {"No":3,"order":"AP-202009-00003","from":"陕西环宇科技","to":"深圳环球科技","amount":"246,800.00","balance":"5,300.00"},
            {"No":4,"order":"AP-202009-00004","from":"陕西环宇科技","to":"深圳环球科技","amount":"216,800.00","balance":"5,400.00"},
            {"No":5,"order":"AP-202009-00005","from":"陕西环宇科技","to":"深圳环球科技","amount":"236,800.00","balance":"1,500.00"}
        ]
        return new Promise((resolve, reject)=>{
            setTimeout(()=>{
                resolve(dataSource)
            },2000)
        })
    }

    const showLoadding = () => {
        setIsLoadding(true)
    }

    const hideLoadding = () => {
        setIsLoadding(false)
    }

    React.useEffect(()=>{     
        setIsLoadding(true)
        requestDataMock().then(data=>{
            setDataSource(data)
            setIsLoadding(false)
        })
    },[])
 

    const pipeline = useTablePipeline({}).input({ dataSource: dataSource, columns: columns })

    return <div>
        <Button type="primary" onClick={showLoadding}>显示加载动画</Button>
        <Button  onClick={hideLoadding} style={{marginLeft:'5px'}}>隐藏加载动画</Button>
        <br/>
        <br/>
        <Table {...pipeline.getProps()} isLoading={isLoading}/>
    </div>
}
```


