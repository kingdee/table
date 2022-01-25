import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live'
import github from 'prism-react-renderer/themes/github'
import lodash from 'lodash'
import { Language } from 'prism-react-renderer'
import * as KDTable from 'kd-table'

import { Checkbox, Radio, Input, Button } from '@kingdee-ui/kui'
import '@kingdee-ui/kui/dist/kui.css'

import { Utils } from './article'

// 编辑代码错误时样式
const errorCodeStyle = {
  color: '#721c24',
  backgroundColor: '#f8d7da',
  borderColor: '#f5c6cb',
  width: '100%',
  textAlign: 'left',
  padding: '20px'
}

export type Props = {
  code: string
  title: string
  content: Array<any>
  id: string
  utils: Utils
  lang: Language
}

export type RefType = {
  current: HTMLDivElement | null | undefined
}

// react-live 需要的环境引入
const scope = {
  useState,
  useCallback,
  useContext,
  useEffect,
  useRef,
  ReactDOM,
  lodash,
  Radio,
  Checkbox,
  Input,
  Button,
  ...KDTable
}

function LiveDemo (props: Props) {
  const { code, title, content, id, utils, lang } = props

  const editorEl = useRef<HTMLDivElement>(null)
  const [expand, setExpand] = useState(false)
  const [height, setHeight] = useState<any>(0)
  const [innercode, setInnercode] = useState<string | undefined>(code)

  function codeExpand () {
    setExpand(!expand)
    !expand ? setHeight(editorEl!.current!.offsetHeight) : setHeight(0)
  }

  function onFocus () {
    setHeight('auto')
  }

  function onBlur () {
    setHeight(editorEl!.current!.offsetHeight)
  }

  useEffect(() => {
    if (code) {
      setInnercode(code)
    }
  }, [code])

  return (
    <>
      <div className="preview">
        <div id={id} className="demo-title">
          {title}
        </div>
        {/* 组件demo描述 */}
        <div>{utils.toReactComponent(['div', { className: 'demo-description' }].concat(content))}</div>
        <div className="demo-content">
          <LiveProvider
            scope={scope}
            code={innercode}
            theme={github}
            noInline={innercode ? innercode.includes('render(') : false}
            language={lang}
          >
            <div className="demo-component">
              <LivePreview style={{ width: '100%', height: '100%' }} />
            </div>
            <LiveError style={errorCodeStyle as any} />
            <div className="code-expand">
              <button onClick={() => codeExpand()}>展开代码</button>
              {/* <button style={{ marginLeft: '10px' }}>无效</button> */}
            </div>
            <div className="code-content" style={{ height: height }}>
              <div ref={editorEl}>
                <LiveEditor onChange={setInnercode} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>
          </LiveProvider>
        </div>
      </div>
    </>
  )
}

export default React.memo(LiveDemo)
