import { ArtColumn } from '../interfaces'

export const MULTI_SELECT_MARK_PROPNAME = 'checkboxSelection'
export const SINGLE_SELECT_MARK_PROPNAME = 'radioSelection'

export function isSelectColumn (column:ArtColumn):boolean {
  const features = column.features || {}
  return features[MULTI_SELECT_MARK_PROPNAME] === true || features[SINGLE_SELECT_MARK_PROPNAME] === true
}
