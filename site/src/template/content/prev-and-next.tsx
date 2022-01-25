import React from 'react'
import { Link } from 'bisheng/router'

export type NodeObj = {
  filename: string
  title: string
}

export type Props = {
  prev: NodeObj
  next: NodeObj
}

function getRouterPath(filename: string) {
  return filename && filename.replace(/(\/index)?\.md$/i, '')
}

const PrevAndNext = ({ prev, next }: Props) => (
  <section className="prev-next-nav">
    {prev ? (
      <Link className="prev-page" to={getRouterPath(prev.filename)}>
        <button>arrow-left</button>
        {prev.title}
      </Link>
    ) : null}
    {next ? (
      <Link className="next-page" to={getRouterPath(next.filename)}>
        {next.title}
        <button>arrow-right</button>
      </Link>
    ) : null}
  </section>
)

export default PrevAndNext
