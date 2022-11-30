import React from 'react'

export default function DefaultFilterIcon ({
  width,
  height
} :{
  width:string | number
  height:string | number
}) {
  return <svg
    width={width}
    height={height}
    style={{ verticalAlign: 'middle' }}
    viewBox="0 0 1024 1024"
    focusable="false"
    data-icon="filter"
    fill="currentColor"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg">
    <path d="M891.448889 159.573333L626.460444 460.231111v443.221333c0 32.881778-25.429333 63.658667-55.864888 63.658667l-170.268445-172.942222V456.419556L132.266667 159.857778A59.619556 59.619556 0 0 1 173.511111 56.888889h676.977778c32.995556 0 59.733333 26.680889 59.733333 59.562667 0 17.066667-7.224889 32.312889-18.773333 43.121777z"></path>
  </svg>
}
