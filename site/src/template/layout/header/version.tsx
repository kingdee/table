import React, { useState } from 'react'
import { version as kduiVersion } from '../../../../../package.json'
import { docVersions } from '../../../../consts'
import './version.less'
// import { Dropdown, Icon } from 'kd-ui'

export default function Version() {
  const version = { [kduiVersion]: kduiVersion, ...docVersions }
  const [nowVersion] = useState(Object.keys(version)[0])
  // const versionOptions = Object.keys(version).map((version) => {
  //   return <Dropdown.Item key={version}>{version}</Dropdown.Item>
  // })
  // const handleItemClick = (key: any) => {
  //   setNowVersion(key)
  // }
  // const menu = <Dropdown.Menu onClick={handleItemClick}>{versionOptions}</Dropdown.Menu>

  return (
    // <Dropdown menu={menu} getPopupContainer={() => document.querySelector('.header') as HTMLElement}>
    <a href="true" className="kd-dropdown-link kd-dropdown-version" onClick={(e) => e.preventDefault()}>
      {nowVersion}
    </a>
    // </Dropdown>
  )
}
