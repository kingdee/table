import RowDragApi from './RowDragApi'
import { FeatureName } from '../../const'

export function createFeatureApi (type, pipeline) {
  switch (type) {
    case FeatureName.rowDrag:
      return new RowDragApi(pipeline)
    default:
      break
  }
}
