import React from 'react'
function hasContainer(title) {
  return title.props.headOperationArea
}
export function getTitleWithOprCon(title, opr) {
  if (title && hasContainer(title)) {
    const _container = title.props.headOperationArea
    // 创建新的 React 元素，包含原有元素和额外的子元素
    const newHeaderOpt = React.cloneElement(_container, {
      ..._container.props,
      children: _container.props.children ? [opr, ..._container.props.children] : [opr]
    });
    return React.cloneElement(title, {
      ...title.props,
      headOperationArea: newHeaderOpt
    });
  }
}
