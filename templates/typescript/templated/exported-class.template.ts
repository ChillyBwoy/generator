import { template } from "lodash";

export default template(`
// Code generated by @open-rpc/client-generator DO NOT EDIT.
import { RequestManager, WebSocketTransport, HTTPTransport, Client } from '@open-rpc/client-js';
import _ from "lodash";
import { OpenRPC, MethodObject, ContentDescriptorObject } from "@open-rpc/meta-schema";
import { MethodCallValidator } from "@open-rpc/schema-utils-js";

<%= methodTypings.toString("typescript") %>

export interface Options {
  transport: {
    type: "websocket" | "http" | "https";
    host: string;
    port: number;
  }
}

export class <%= className %> {
  public rpc: Client;
  private validator: MethodCallValidator;
  private openrpcDocument: OpenRPC;

  constructor(options: Options) {
    this.openrpcDocument = <%= JSON.stringify(openrpcDocument) %>;

    if (options.transport === undefined || options.transport.type === undefined) {
      throw new Error("Invalid constructor params");
    }

    let transport;
    switch (options.transport.type) {
      case 'http':
      case 'https':
        transport = new HTTPTransport(options.transport.type + "://" + options.transport.host + ":" + options.transport.port)
        break;
      case 'websocket':
        transport = new WebSocketTransport("ws://" + options.transport.host + ":" + options.transport.port)
        break;
      default:
        throw new Error("unsupported transport");
        break;
    }
    this.rpc = new Client(new RequestManager([transport]));
    this.validator = new MethodCallValidator(this.openrpcDocument);
  }

  private request(methodName: string, params: any[]): Promise<any> {
    const methodObject = _.find(this.openrpcDocument.methods, ({name}) => name === methodName) as MethodObject;
    const openRpcMethodValidationErrors = this.validator.validate(methodName, params);
    if (openRpcMethodValidationErrors.length > 0) {
      return Promise.reject(openRpcMethodValidationErrors);
    }

    let rpcParams;
    if (methodObject.paramStructure && methodObject.paramStructure === "by-name") {
      rpcParams = _.zipObject(params, _.map(methodObject.params, "name"));
    } else {
      rpcParams = params;
    }
    return this.rpc.request(methodName, rpcParams);
  }

  <% openrpcDocument.methods.forEach((method) => { %>
  /**
   * <%= method.summary %>
   */
  public <%= method.name %>: <%= methodTypings.getTypingNames("typescript", method).method %> = (...params) => {
    return this.request("<%= method.name %>", params);
  }
  <% }); %>
}
export default <%= className %>;
`);
