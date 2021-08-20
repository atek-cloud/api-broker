import { routeRpc } from './registry.js'
import { TransportEnum, SomeJSONSchema, ExportMap, getMethod, assertParamsValid, assertResponseValid } from './types.js'

export class ApiBrokerClient {
  _apiId: string
  _schema: SomeJSONSchema
  _exportMap: ExportMap

  constructor (apiId: string, schema: SomeJSONSchema, exportMap: ExportMap) {
    this._apiId = apiId
    this._schema = schema
    this._exportMap = exportMap
  }

  async _rpc (methodName: string, params: any[] = []): Promise<any> {
    const methodDef = getMethod(this._schema, this._exportMap, methodName)
    // if (methodDef.params) assertParamsValid(methodDef.params, params) TODO
    // else if (params.length) throw new Error(`Invalid parameter: ${methodName} takes no arguments`)
    const response = await routeRpc({transport: TransportEnum.RPC, api: this._apiId}, methodName, params)
    // if (methodDef.response) assertResponseValid(methodDef.response, response) TODO
    // else if (typeof response !== 'undefined') throw new Error(`Invalid response: ${methodName} has no response`)
    return response
  }

  _subscribe (params: any[] = []): any {
    // TODO
    return undefined
  }
}