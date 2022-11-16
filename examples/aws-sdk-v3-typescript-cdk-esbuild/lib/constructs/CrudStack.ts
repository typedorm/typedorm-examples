import { CfnGlobalTable } from "aws-cdk-lib/aws-dynamodb";
import { Aws, Duration, NestedStack, NestedStackProps } from "aws-cdk-lib";
import {
  NodejsFunction,
  NodejsFunctionProps,
  SourceMapMode,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { join } from "path";
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { MainAppStackProps } from "./MainAppStack";
import { StagingEnvironment } from "../../bin";
import { CrudFunctions, FuncsMapping } from "../utils/types";
import { Runtime } from "aws-cdk-lib/aws-lambda";

export interface CrudStackProps extends NestedStackProps, MainAppStackProps {
  readonly dynamoTable: CfnGlobalTable;
}

export class CrudStack extends NestedStack {
  functions: CrudFunctions;
  readonly dynamoTable: CfnGlobalTable;
  dynamoCrudPolicy: PolicyStatement;
  stage: StagingEnvironment;

  constructor(scope: Construct, id: string, props: CrudStackProps) {
    super(scope, id, props);
    this.dynamoTable = props.dynamoTable;
    this.stage = props.stage;
    this.createFunctions(this.dynamoTable.tableName!);
  }
  /**
   * Creates lambda functions before
   * @param tableName Dynamo Tablename
   */
  private createFunctions(tableName: string) {

    // Create a Lambda function for each of the CRUD operations
    const userFuncId = "UserCrudHandlerFunction";
    const userCrudHandler = new NodejsFunction(this, userFuncId, {
      memorySize: 768,
      timeout: Duration.seconds(60),
      runtime: Runtime.NODEJS_16_X,
      awsSdkConnectionReuse: true,
      bundling: {
        minify: true, // minify code, defaults to false
        sourceMap: true, // include source map, defaults to false
        sourceMapMode: SourceMapMode.DEFAULT, // defaults to SourceMapMode.DEFAULT
        sourcesContent: true, // do not include original source into source map, defaults to true
        target: "es2022", // target environment for the generated JavaScript code
        preCompilation: true, // Emit decorator metadata fix goes here,
      },
      entry: join(__dirname, "../handlers/userHandler.ts"),
    });


    this.functions = {
      users: { logicalId: userFuncId, func: userCrudHandler },
    };

    this.dynamoCrudPolicy = this.createDynamoReadWritePolicy(tableName);
    this.addDynamoPermissions(this.functions);
  }

  private addDynamoPermissions(funcs: CrudFunctions) {
    for (const [_name, funcInfo] of Object.entries(funcs)) {
      const info = funcInfo as FuncsMapping;
      info.func.role?.attachInlinePolicy(
        new Policy(this, `DynamoCrudPolicy${info.logicalId}`, {
          statements: [this.dynamoCrudPolicy],
        })
      );
    }
  }

  private createDynamoReadWritePolicy = (tableName: string) => {
    return new PolicyStatement({
      actions: [
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
        "dynamodb:PutItem",
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:UpdateItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:BatchGetItem",
        "dynamodb:DescribeTable",
        "dynamodb:ConditionCheckItem",
      ],
      resources: [
        `arn:${Aws.PARTITION}:dynamodb:${Aws.REGION}:${Aws.ACCOUNT_ID}:table/${tableName}`,
        `arn:${Aws.PARTITION}:dynamodb:${Aws.REGION}:${Aws.ACCOUNT_ID}:table/${tableName}/index/*`,
      ],
    });
  };
}
