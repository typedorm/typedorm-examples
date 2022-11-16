import {
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { NestedStack, NestedStackProps } from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { StagingEnvironment } from "../../bin";
import { CrudFunctions } from "../utils/types";

export interface ApiStackProps extends NestedStackProps {
  readonly appName: string;
  readonly stage: StagingEnvironment;
  readonly funcs: CrudFunctions;
}

export class ApiStack extends NestedStack {
  api: RestApi;
  stageName = "v1";
  readonly funcs: CrudFunctions;
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);
    this.funcs = props.funcs;
    this.createRestApi();
    this.addFunctionsToApi();
  }

  private createRestApi() {
    this.api = new apigateway.RestApi(this, "example-api-typedorm", {
      description: "API for CRUD operations and custom queries",
      deployOptions: {
        stageName: this.stageName,
      },
    });
  }

  private addFunctionsToApi() {
    const crudUsersIntegration = new LambdaIntegration(this.funcs.users.func);
    const users = this.api.root.addResource("users", {
      defaultMethodOptions: {
        authorizer: undefined,
        authorizationType: apigateway.AuthorizationType.NONE,
      },
    });
    users.addMethod("GET", crudUsersIntegration);
    users.addMethod("POST", crudUsersIntegration);
  }
}
