import { routeRpc } from './registry.js'
import { TransportEnum } from './types.js'

export class ApiBrokerClient {
  _apiId: string

  constructor (apiId: string) {
    this._apiId = apiId
  }

  _rpc (methodName: string, params: any[] = []): Promise<any> {
    return routeRpc({transport: TransportEnum.RPC, api: this._apiId}, methodName, params)
  }

  _subscribe (params: any[] = []): any {
    // TODO
    return undefined
  }
}