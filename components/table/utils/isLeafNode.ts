import { AbstractTreeNode } from '../interfaces'

// 是否是叶子节点
export default function isLeafNode (node: AbstractTreeNode) {
  return node.children == null || node.children.length === 0
}
