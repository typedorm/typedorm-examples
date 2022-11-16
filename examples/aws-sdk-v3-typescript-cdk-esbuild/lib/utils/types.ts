import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { UserEntity } from "../entities/UserEntity";

export type CreatedEntity = UserEntity;

export interface FuncsMapping {
    logicalId: string;
    func: NodejsFunction;
  }
  
  export interface CrudFunctions {
    users: FuncsMapping;
  }