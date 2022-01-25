import { ArtColumn } from '../interfaces'
// 是否是叶子节点
export default function isGroupColumn (columns: ArtColumn[]) {
  return columns.findIndex((col) => col.children && col.children.length > 0) > -1
}
