import { routeRpc } from './registry.js'
import { TransportEnum } from './types.js'

export class ApiBrokerClient {
  $apiId: string

  constructor (apiId: string) {
    this.$apiId = apiId
  }

  $rpc (methodName: string, params: any[] = []): Promise<any> {
    return routeRpc({transport: TransportEnum.RPC, api: this.$apiId}, methodName, params)
  }

  $subscribe (params: any[] = []): any {
    // TODO
    return undefined
  }
}