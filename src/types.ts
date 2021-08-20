// import { SomeJSONSchema } from './vendor/ajv.d.ts'
import Ajv from './vendor/ajv.8.6.1.js'
const ajv = new Ajv({strict: false})
import pointer from 'json-pointer'

export type SomeJSONSchema = object

export type ExportMap = {
  methods?: {
    [methodName: string]: string
  }
}

export enum TransportEnum {
  PROXY = 'proxy',
  RPC = 'rpc'
}

export interface ApiProvider {
  id: string
  handleRpc? (callDesc: CallDescription, methodName: string, params: any[]): Promise<any>
  handleProxy? (callDesc: CallDescription, socket)
}

export interface CallDescription {
  transport: TransportEnum
  service?: string
  api?: string
}

export interface HandlerFn {
  (callDesc: CallDescription, methodName: string, params: any[]): Promise<any>
}

export function getMethod (schema: SomeJSONSchema, exportMap: ExportMap, methodName: string): object | undefined {
  if (!exportMap?.methods?.[methodName]) {
    throw new MethodNotFound(`"${methodName}" is not a method of this api`)
  }
  let ptr = exportMap?.methods?.[methodName]
  if (ptr) {
    if (ptr.startsWith('#')) ptr = ptr.slice(1)
    return pointer.get(schema, ptr)
  }
}

export function assertParamsValid (schema: SomeJSONSchema, params: any[]): void {
  const validate = ajv.compile(schema)
  const valid = validate(params)
  if (!valid) {
    const msg = `Parameter ${Number(validate.errors[0].instancePath.slice(1)) + 1} ${validate.errors[0].message}`
    throw new ParamValidationError(msg, validate.errors[0])
  }
}

export function assertResponseValid (schema: SomeJSONSchema, response: any): void {
  const validate = ajv.compile(schema)
  const valid = validate(response)
  if (!valid) {
    const msg = `Response ${validate.errors[0].schemaPath.slice(2)} ${validate.errors[0].message}`
    throw new ResponseValidationError(msg, validate.errors[0])
  }
}

export class CustomError extends Error {
  name: string;
  code: number;
  data: any;

  constructor(code: number, message: string, data?: any) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.data = data;
  }
}

export class ServiceNotFound extends CustomError {
  static CODE = -32601; // we're using JSON-RPC's code for this
  constructor (msg: string, data?: any) {
    super(ServiceNotFound.CODE, msg, data)
  }
}

export class MethodNotFound extends CustomError {
  static CODE = -32601; // we're using JSON-RPC's code for this
  constructor (msg: string, data?: any) {
    super(MethodNotFound.CODE, msg, data)
  }
}

export class ParamValidationError extends CustomError {
  static CODE = -32001;
  constructor (msg: string, data?: any) {
    super(ParamValidationError.CODE, msg, data)
  }
}

export class ResponseValidationError extends CustomError {
  static CODE = -32002;
  constructor (msg: string, data?: any) {
    super(ResponseValidationError.CODE, msg, data)
  }
}

export class GeneralError extends CustomError {
  static CODE = -32003;
  constructor (msg: string, data?: any) {
    super(GeneralError.CODE, msg, data)
  }
}