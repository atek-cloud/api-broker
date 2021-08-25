import { CallDescription, SomeJSONSchema, ExportMap, Ajv, compileSchema, getMethod, assertParamsValid, assertResponseValid, ParamValidationError, ResponseValidationError, GeneralError } from './types.js'

export type ApiBrokerServerHandlers = {
  [key: string]: (...params: any[]) => any
}

export class ApiBrokerServer {
  schema: SomeJSONSchema|undefined
  ajv: Ajv|undefined
  exportMap: ExportMap|undefined
  handlers: ApiBrokerServerHandlers

  constructor (schema: SomeJSONSchema|undefined, exportMap: ExportMap|undefined, handlers: ApiBrokerServerHandlers) {
    this.schema = schema
    this.ajv = schema ? compileSchema(schema) : undefined
    this.exportMap = exportMap
    this.handlers = generateServerMethods(this.ajv, exportMap, handlers)
  }

  handle (callDesc: CallDescription, methodName: string, params: any[]): Promise<any> {
    return this.handlers[methodName](params)
  }
}

function generateServerMethods (ajv: Ajv|undefined, exportMap: ExportMap|undefined, handlers: ApiBrokerServerHandlers): ApiBrokerServerHandlers {
  const methods: ApiBrokerServerHandlers = {}

  for (const methodName in handlers) {
    const methodDef = ajv && exportMap ? getMethod(ajv, exportMap, methodName) : undefined

    methods[methodName] = async (params: [any]): Promise<any> => {
      try {
        if (methodDef?.params) assertParamsValid(methodDef.params, params)
        else if (params.length) throw new ParamValidationError(`Invalid parameter: ${methodName} takes no arguments`)
        const response = await handlers[methodName](...params)
        if (methodDef?.returns) assertResponseValid(methodDef.returns, response)
        return response
      } catch (e) {
        console.log('failwhale', methodName, params)
        if (e instanceof ParamValidationError) throw e
        if (e instanceof ResponseValidationError) throw e
        throw new GeneralError(e.message || e.toString())
      }
    }
  }

  return methods
}
