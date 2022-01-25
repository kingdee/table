import React from 'react'
import './index.less'
// import indexMa from './../../../static/image/index_ma.png'
import icon0 from './../../../static/image/footer_icon_0.png'
import icon1 from './../../../static/image/footer_icon_1.png'
import icon2 from './../../../static/image/footer_icon_2.png'
import icon3 from './../../../static/image/footer_icon_3.png'
const footList = [
  {
    title: '相关资源',
    list: [
      { name: '苍穹开发平台', link: 'https://dev.kingdee.com' },
      { name: 'BOS开发指南', link: 'https://feature.kingdee.com:2024/baseline_a/devdoc/' },
      { name: 'KUI', link: 'http://kdesign.kingdee.com/kui' },
    ],
  },
  { title: '关于KUI', list: [{ name: 'KUI', link: 'http://kdesign.kingdee.com/kui/index.html#/about' }] },
  {
    title: 'KUX平台产品',
    list: [
      { name: 'iconcool', icon: icon0, link: 'http://iconcool.kingdee.com/' },
      { name: 'UEclub', icon: icon1, link: 'http://ueclub.kingdee.com/' },
      { name: 'iKD', icon: icon2, link: 'http://ikd.kingdee.com' },
      { name: '数据可视化中心', icon: icon3, link: 'http://tools.kingdee.com/kd-charts' },
    ],
  },
  // { title: '交流平台', img: indexMa },
]
function ListItem(props: any) {
  const { list, img } = props.value
  if (list) {
    const listDivs = list.map((li: any) => {
      return (
        <div className="kd-footer-item" key={li.name}>
          <a href={li.link} target="_blank" rel="noopener noreferrer">
            {li.icon && <img src={li.icon} style={{ width: '20px', height: '20px' }}></img>}
            {li.name}
          </a>
        </div>
      )
    })
    return <>{listDivs}</>
  } else {
    return <>{<img src={img}></img>}</>
  }
}

function FootList(props: any) {
  const numbers = props.numbers
  const listItems = numbers.map((number: any) => {
    return (
      <div className="kd-footer-column" key={number.title}>
        <h2>{number.title}</h2>
        <ListItem value={number} key={number.title} />
      </div>
    )
  })
  return <>{listItems}</>
}
function Footer() {
  return (
    <>
      <footer className="kd-footer kd-footer-dark">
        <section className="kd-footer-container">
          <section className="kd-footer-columns">
            <FootList numbers={footList} />
          </section>
        </section>
        <section className="kd-footer-bottom">
          <div className="kd-footer-bottom-container">金蝶软件（中国）有限公司版权所有</div>
        </section>
      </footer>
    </>
  )
}

export default Footer
