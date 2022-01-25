---
order: 0
title: 介绍
---
# Table of KDesign
基于金蝶 KDesign 规范实现的 React 表格组件。

## 官网介绍
[https://react.kingdee.design/components/table](https://react.kingdee.design/components/table)

## 安装
该项目不建议直接使用，推荐安装[`kdcloudjs/kdesign`](https://github.com/kdcloudone/kdesign)项目，然后再导出其中的`Table`组件使用。

### 使用 npm 或 yarn 安装

```bash
$ npm install @kdcloudjs/kdesign --save
# 或者
$ yarn add @kdcloudjs/kdesign
```

### 浏览器引入

在浏览器中使用 `script` 和 `link` 标签直接引入文件，并使用全局变量 `kdesign`。
目前尚未将文件上传至 `cdn` 需要手动将 `dist` 目录下的 `kdesign.min.js` 和 `kdesign.min.css` 文件拷贝至项目。

使用：
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>kdesign</title>
  <script src="https://cdn.staticfile.org/react/16.14.0/umd/react.development.js"></script>
  <script src="https://cdn.staticfile.org/react-dom/16.14.0/umd/react-dom.development.js"></script>
  <script src="https://cdn.staticfile.org/babel-standalone/6.26.0/babel.min.js"></script>

  <script src="kdesign.min.js 目录地址"></script>
  <link rel="stylesheet" href="kdesign.min.css 目录地址">
</head>
<body>
<div id="root"></div>
<script type="text/babel">

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

ReactDOM.render((
    <kdesign.Table dataSource={dataSource} columns={columns}></kdesign.Table>
),
document.getElementById('root')
)
</script>
</body>
</html>
```

## 示例

```js
import React, { useState } from 'react'
import reactDom from 'react-dom'
import { Table } from '@kdcloudjs/kdesign'
import '@kdcloudjs/kdesign/dist/kdesign.css'


const dataSource = [
    { prov: '湖北省', confirm: 54406, cure: 4793, dead: 1457, t: '2020-02-15 19:52:02' },
    { prov: '广东省', confirm: 1294, cure: 409, dead: 2, t: '2020-02-15 19:52:02' },
    { prov: '河南省', confirm: 1212, cure: 390, dead: 13, t: '2020-02-15 19:52:02' },
    { prov: '浙江省', confirm: 1162, cure: 428, dead: 0, t: '2020-02-15 19:52:02' },
    { prov: '湖南省', confirm: 1001, cure: 417, dead: 2, t: '2020-02-15 19:52:02' }
]

const columns = [
    { code: 'prov', name: '省份', width: 150, features: { sortable: true, filterable: true } },
    { code: 'confirm', name: '确诊', width: 100, align: 'right', features: { sortable: true, filterable: true } },
    { code: 'cure', name: '治愈', width: 100, align: 'right', features: { sortable: true, filterable: true } },
    { code: 'dead', name: '死亡', width: 100, align: 'right', features: { sortable: true, filterable: true } },
    { code: 't', name: '更新时间', width: 180, features: { sortable: true, filterable: true } }
]

reactDom.render((
    <Table dataSource={dataSource} columns={columns} />
), document.getElementById('root'))
```
## 兼容环境
| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari-ios/safari-ios_48x48.png" alt="iOS Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>iOS Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/samsung-internet/samsung-internet_48x48.png" alt="Samsung" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Samsung | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Opera |
| --------- | --------- | --------- | --------- | --------- | --------- | --------- |
| IE11, Edge| last 2 versions| last 2 versions| last 2 versions| last 2 versions| last 2 versions| last 2 versions

##  License
该项目使用了 Apache-2.0. 详细license 请查看 [LICENSE](./LICENSE)


## 关于 
本项目基于`ali-react-table`修改，特别鸣谢！ 源地址：[https://github.com/alibaba/ali-react-table](https://github.com/alibaba/ali-react-table)