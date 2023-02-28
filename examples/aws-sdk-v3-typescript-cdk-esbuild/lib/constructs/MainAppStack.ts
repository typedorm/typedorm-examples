import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ApiStack } from "./ApiStack";
import { CrudStack } from "./CrudStack";
import { DynamoDbStack, DynamoDbStackProps } from "./DynamoDbStack";
import {StagingEnvironment} from "../../bin/index"

export interface MainAppStackProps extends StackProps, DynamoDbStackProps {
  readonly appName: string;
  readonly stage: StagingEnvironment;
}

export class MainAppStack extends Stack {
  dynamoDbStack: DynamoDbStack;
  crudStack: CrudStack;
  apiStack: ApiStack;
  constructor(scope: Construct, id: string, props: MainAppStackProps) {
    super(scope, id, props);

    this.dynamoDbStack = new DynamoDbStack(this, "DynamoDbStack", props);
    const { table } = this.dynamoDbStack;

    this.crudStack = new CrudStack(this, "CrudStack", {
      dynamoTable: table,
      ...props,
    });

    this.apiStack = new ApiStack(this, "ApiStack", {
      funcs: this.crudStack.functions,
      ...props,
    });


    this.crudStack.addDependency(
      this.dynamoDbStack,
      "Needs dynamodb crud permissions to perform operations on database"
    );

    this.apiStack.addDependency(
      this.crudStack,
      "Needs lambda functions already defined to use them"
    );
  }
}
