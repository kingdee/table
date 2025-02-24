
import { TablePipeline } from '../../pipeline'
import { RowDropZoneParams } from '../../../interfaces'
const ROW_DRAG_STATUS = 'rowDragStatus'


export default class RowDragApi {
  private pipeline: TablePipeline
  private rowDropZoneParams: RowDropZoneParams
  private rowDropZones: RowDropZoneParams[]
  private dragStatus:string

  constructor (pipeline) {
    this.pipeline = pipeline
    this.rowDropZoneParams = null
    this.rowDropZones = []
    this.dragStatus = 'finished'
  }

  public getRowDropZoneParams () {
    return this.rowDropZoneParams
  }

  public setRowDropZoneParams (params) {
    this.rowDropZoneParams = params
  }

  public addRowDropZone (rowDropZone) {
    if(!rowDropZone || !rowDropZone?.getContainer()){
        return 
    }
    const isExist = this.rowDropZones.some(zone => zone.getContainer() === rowDropZone.getContainer())
    if(isExist){
        return
    }
    this.rowDropZones.push(rowDropZone)
  }

  public getRowDropZone(){
    return this.rowDropZones
  }

  public removeRowDropZone (rowDropZone) {
    this.rowDropZones = this.rowDropZones.filter(zone => zone.getContainer() !== rowDropZone.getContainer())
  }

  private setDragStatus(status){
    const currentStatus = this.dragStatus
    this.dragStatus = status
    
    if (currentStatus!== status){
        this.pipeline.setStateAtKey(ROW_DRAG_STATUS, status)
    }
  }

  private getDragStatus(){
    return this.dragStatus
  }
}
