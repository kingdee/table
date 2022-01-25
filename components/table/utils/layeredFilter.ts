import isLeafNode from './isLeafNode'
import { AbstractTreeNode } from '../interfaces'

export default function layeredFilter<T extends AbstractTreeNode> (array: T[], filter: (x: T, index: number) => boolean): T[] {
  return dfs(array)

  function dfs (rows: T[]): T[] {
    if (!Array.isArray(array)) {
      return array
    }
    return rows
      .map((row) => {
        if (isLeafNode(row)) {
          return row
        }
        return { ...row, children: dfs(row.children as T[]) }
      })
      .filter(filter)
  }
}
