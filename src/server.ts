import { CallDescription, SomeJSONSchema, ExportMap, getMethod, assertParamsValid, assertResponseValid, ParamValidationError, ResponseValidationError, GeneralError } from './types.js'

export type ApiBrokerServerHandlers = {
  [key: string]: (...params: any[]) => any
}

export type ApiBrokerServerMethods = {
  [key: string]: (...params: any[]) => any
}

export class ApiBrokerServer {
  schema: SomeJSONSchema
  exportMap: ExportMap
  handlers: ApiBrokerServerHandlers
  methods: ApiBrokerServerMethods

  constructor (schema: SomeJSONSchema, exportMap: ExportMap, handlers: ApiBrokerServerHandlers) {
    this.schema = schema
    this.exportMap = exportMap
    this.handlers = handlers
    this.methods = generateServerMethods(schema, exportMap, handlers)
  }

  handle (callDesc: CallDescription, methodName: string, params: any[]): Promise<any> {
    return this.methods[methodName](params)
  }
}

function generateServerMethods (schema: SomeJSONSchema, exportMap: ExportMap, handlers: ApiBrokerServerHandlers): ApiBrokerServerMethods {
  const methods: ApiBrokerServerMethods = {}

  for (const methodName in handlers) {
    const methodDef = getMethod(schema, exportMap, methodName)

    methods[methodName] = async (params: [any]): Promise<any> => {
      try {
        // if (methodDef.params) assertParamsValid(methodDef.params, params) TODO
        // else if (params.length) throw new Error(`Invalid parameter: ${methodName} takes no arguments`)
        const response = await handlers[methodName](...params)
        // if (methodDef.response) assertResponseValid(methodDef.response, response) TODO
        // else if (typeof response !== 'undefined') throw new Error(`Invalid response: ${methodName} has no response`)
        return response
      } catch (e) {
        if (e instanceof ParamValidationError) throw e
        if (e instanceof ResponseValidationError) throw e
        throw new GeneralError(e.message || e.toString())
      }
    }
  }

  return methods
}
