import React, { ReactElement } from 'react'
import { getChildren } from 'jsonml.js/lib/utils'
import { Language } from 'prism-react-renderer'
import LiveDemo from './live-demo'

export type Meta = {
  title: string
  subtitle: string
}

export type DemoMeta = {
  title: string
  filename: string
  order: number
  id?: string
}

export type Utils = {
  toReactComponent(T: Array<any>): ReactElement
}

export type Demo = {
  code: string
  content: Array<any>
  meta: DemoMeta
  lang: Language
}

export type LocalizedPageData = {
  meta: Meta
  content: Array<any>
  api: Array<any>
}

export type Props = {
  localizedPageData: LocalizedPageData
  demos: Record<string, Demo>
  utils: Utils
}

// 渲染文章主体内容
function renderArticle(props: Props) {
  const { localizedPageData, utils, demos } = props
  const {
    meta: { title, subtitle },
    content,
    api,
  } = localizedPageData
  return (
    <article>
      <section className="markdown">
        <h1>
          {title}
          <div className="md-subtitle">{subtitle}</div>
        </h1>
      </section>
      {/* 组件入口 md 文档内容 */}
      {utils.toReactComponent(['section', { className: 'markdown' }].concat(getChildren(content)))}
      {/* 组件demo渲染 */}
      {demos && <div className="markdown-demo">{renderDemo(demos, utils)}</div>}
      {/* 组件入口 md API 内容 */}
      {utils.toReactComponent(
        [
          'section',
          {
            className: 'markdown api-container',
          },
        ].concat(getChildren(api || ['placeholder'])),
      )}
    </article>
  )
}

// 渲染 组件demo
function renderDemo(demos: Record<string, Demo>, utils: Utils) {
  const demoValues = Object.keys(demos).map((key) => demos[key])
  return (
    demoValues
      // 根据 order 排序
      .sort((a, b) => a.meta.order - b.meta.order)
      .map((demo) => {
        const {
          meta: { title, filename },
          content,
          code: codeText,
          lang,
        } = demo
        // console.log(demo)
        // id（锚点）即文件名
        const id = filename.replace(/\.md$/, '').replace(/\//g, '-')
        // console.log(codeText)
        let code = codeText.trim().replace(/>;$/, '>')
        if (code.startsWith(';')) {
          code = code.substring(1)
        }
        return (
          <div key={filename} className="demo">
            <LiveDemo code={code} content={content} id={id} utils={utils} title={title} lang={lang} />
          </div>
        )
      })
  )
}

function Article(props: Props) {
  return <>{renderArticle(props)}</>
}

export default Article
