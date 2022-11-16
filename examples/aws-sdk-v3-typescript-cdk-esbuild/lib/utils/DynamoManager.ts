import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DocumentClientV3 } from "@typedorm/document-client";

import { EntityTarget, Table, INDEX_TYPE } from "@typedorm/common";
import {
  BatchManager,
  Connection,
  createConnection,
  EntityManager,
  ScanManager,
} from "@typedorm/core";
import { randomUUID } from "crypto";
import { UserEntity } from "../entities/UserEntity";
import { CreatedEntity } from "./types";

const connection: Connection | null = null;

/**
 * Creates connection to desired dynamo table
 */
export default class DynamoManager {
  connection: Connection;
  /**
   * Typedorm entity manager that exposes most commonly used operations
   */
  entityManager: EntityManager;
  /**
   * Typedorm scan manager that exposes the scan method (not efficient as it scans
   * over whole table)
   */
  scanManager: ScanManager;
  /**
   * Typedorm batch manager that exposes batch operations api
   */
  batchManager: BatchManager;

  entities: EntityTarget<CreatedEntity>[] = [UserEntity];

  /**
   * DynamoDB Endpoint
   *
   * @type {(string | undefined)}
   * @memberof DynamoManager
   */
  endpoint: string | undefined;

  /**
   * Dynamo DB Configured table
   *
   * @type {Table}
   * @memberof DynamoManager
   */
  table: Table;

  constructor() {
    try {
      this.setEndpoint();
      this.setDynamoTable();
      this.createConn();
    } catch (e) {
      throw new Error(
        `Failed to create connection to DynamoDB (table name: ${this.table.name}`
      );
    }
    this.entityManager = this.connection.entityManager;
    this.scanManager = this.connection.scanManager;
    this.batchManager = this.connection.batchManager;
  }

  /**
   * Sets endpoint
   */
  private setEndpoint() {
    if (process.env["AWS_SAM_LOCAL"]) {
      this.endpoint = "http://dynamo:8000";
    } else if ("local" === process.env["APP_STAGE"]) {
      this.endpoint = "http://localhost:8000";
    }
  }

  /**
   * Make sure that this definition is in line with what is defined
   * in AWS SAM template.yml
   *
   */
  private setDynamoTable = () => {
    if (!process.env.TABLE_NAME) {
      throw new Error("Dynamo Table has no name and is undefined");
    }
    this.table = new Table({
      name: process.env.TABLE_NAME,
      partitionKey: "PK",
      sortKey: "SK",
      indexes: {
        GSI1: {
          type: INDEX_TYPE.GSI,
          partitionKey: "GSI1PK",
          sortKey: "GSI1SK",
        },
        GSI2: {
          type: INDEX_TYPE.GSI,
          partitionKey: "GSI2PK",
          sortKey: "GSI2SK",
        },
        GSI3: {
          type: INDEX_TYPE.GSI,
          partitionKey: "GSI3PK",
          sortKey: "GSI3SK",
        },
        GSI4: {
          type: INDEX_TYPE.GSI,
          partitionKey: "GSI4PK",
          sortKey: "GSI4SK",
        },
        GSI5: {
          type: INDEX_TYPE.GSI,
          partitionKey: "GSI5PK",
          sortKey: "GSI5SK",
        },
        GSI6: {
          type: INDEX_TYPE.GSI,
          partitionKey: "GSI6PK",
          sortKey: "GSI6SK",
        },
      },
    });
  };

  private createConn() {
    if (connection) {
      this.connection = connection;
    } else {
      this.connection = createConnection({
        name: randomUUID(),
        table: this.table,
        entities: this.entities,
        documentClient: this.createDocumentClient(),
      });
    }
  }

  /**
   * Creates DynamoDB client
   * @returns
   */
  private createDocumentClient() {
    const docClientOptions: DynamoDBClientConfig = {};
    if (this.endpoint) {
      docClientOptions["endpoint"] = this.endpoint;
    }
    const marshallOptions = {
      // Whether to automatically convert empty strings, blobs, and sets to `null`.
      convertEmptyValues: false, // false, by default.
      // Whether to remove undefined values while marshalling.
      removeUndefinedValues: true, // false, by default.
      // Whether to convert typeof object to map attribute.
      convertClassInstanceToMap: false, // false, by default.
    };

    const unmarshallOptions = {
      // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
      wrapNumbers: false, // false, by default.
    };

    const translateConfig = { marshallOptions, unmarshallOptions };
    // Create the DynamoDB Document client.
    const ddbDocClient = DynamoDBDocumentClient.from(
      new DynamoDBClient(docClientOptions),
      translateConfig
    );
    return new DocumentClientV3(ddbDocClient);
  }
}

/**
 * Factory method for creating instance of Typedorm dynamo manager
 * @returns DynamoManager
 */
export const getClient = (): DynamoManager => {
  return new DynamoManager();
};
