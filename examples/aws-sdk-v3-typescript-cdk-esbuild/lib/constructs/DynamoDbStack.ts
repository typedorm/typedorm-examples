import {
  BillingMode,
  CfnGlobalTableProps,
  CfnTable,
  StreamViewType,
} from "aws-cdk-lib/aws-dynamodb";
import { CfnGlobalTable } from "aws-cdk-lib/aws-dynamodb";
import { NestedStack, NestedStackProps } from "aws-cdk-lib";
import { StagingEnvironment } from "../../bin/index";
import { Construct } from "constructs";

const PRIMARY_KEY = "PK";
const SORT_KEY = "SK";
const GSI_PREFIX = "GSI";
const HASH = "HASH";
const RANGE = "RANGE";

// Key represents Global Secondary index order, value represents value type of sort key
const GSIMap = {
  1: "S",
  2: "S",
  3: "S",
  4: "S",
  5: "N",
  6: "N",
};

export interface DynamoDbStackProps extends NestedStackProps {
  readonly pointInTimeRecoveryEnabled: boolean;
  readonly stage: StagingEnvironment;
  readonly defaultRegion: string;
  readonly backupRegion: string;
}

/**
 * Represents stateful Global DynamoDB table
 */
export class DynamoDbStack extends NestedStack {
  readonly table: CfnGlobalTable;
  constructor(scope: Construct, id: string, props: DynamoDbStackProps) {
    super(scope, id, props);

    // Create dynamo global table
    const dynamoProps = this.getDefaultDynamoTableProps(props);
    const dynamoTable = new CfnGlobalTable(this, "DynamoTable", dynamoProps);
    this.table = dynamoTable;
  }

  /**
   * Creates Attribute Definitions
   * @returns
   */
  private createAttributeDefinitions = () => {
    // Define Attribute Definitions
    const ATTRIBUTE_DEFS: CfnTable.AttributeDefinitionProperty[] = [
      {
        attributeName: PRIMARY_KEY,
        attributeType: "S",
      },
      {
        attributeName: SORT_KEY,
        attributeType: "S",
      },
    ];
    for (const [key, value] of Object.entries(GSIMap)) {
      ATTRIBUTE_DEFS.push({
        attributeName: `${GSI_PREFIX}${key}${PRIMARY_KEY}`,
        attributeType: "S",
      });
      ATTRIBUTE_DEFS.push({
        attributeName: `${GSI_PREFIX}${key}${SORT_KEY}`,
        attributeType: value,
      });
    }
    return ATTRIBUTE_DEFS;
  };

  /**
   * Creates GSI Configuration
   * @returns
   */
  private createGlobalSecondaryIndexConfiguration = () => {
    // Define GSIs
    const GSIs: CfnTable.GlobalSecondaryIndexProperty[] = [];
    Object.keys(GSIMap).forEach((num) => {
      const name = `${GSI_PREFIX}${num}`;
      GSIs.push({
        indexName: name,
        keySchema: [
          {
            attributeName: `${name}${PRIMARY_KEY}`,
            keyType: HASH,
          },
          {
            attributeName: `${name}${SORT_KEY}`,
            keyType: RANGE,
          },
        ],
        projection: {
          projectionType: "ALL",
        },
      });
    });
    return GSIs;
  };

  /**
   * Defines replica configurations for 2+ regions
   * @param defaultRegion Default Region
   * @param backupRegion Backup Region
   * @param pointInTimeRecoveryEnabled True or false
   * @returns
   */
  private createReplicaConfiguration = (
    defaultRegion: string,
    backupRegion: string,
    pointInTimeRecoveryEnabled = false
  ) => {
    const regions = [defaultRegion, backupRegion];
    return regions.map((region) => {
      return {
        region,
        pointInTimeRecoverySpecification: {
          pointInTimeRecoveryEnabled,
        },
      };
    });
  };

  private constructTableName() {
    return `${this.stackName}Table`;
  }

  /**
   * Creates default dynamoDB global table props
   * @param stage Stage
   * @param defaultRegion
   * @param backupRegion
   * @param pointInTimeRecoveryEnabled
   * @returns
   */
  private getDefaultDynamoTableProps = (
    props: DynamoDbStackProps
  ): CfnGlobalTableProps => {
    const tableConfiguration: CfnGlobalTableProps = {
      billingMode: BillingMode.PAY_PER_REQUEST,
      replicas: this.createReplicaConfiguration(
        props.defaultRegion,
        props.backupRegion,
        props.pointInTimeRecoveryEnabled
      ),
      streamSpecification: {
        streamViewType: StreamViewType.NEW_AND_OLD_IMAGES,
      },
      keySchema: [
        { attributeName: PRIMARY_KEY, keyType: HASH },
        { attributeName: SORT_KEY, keyType: RANGE },
      ],
      attributeDefinitions: this.createAttributeDefinitions(),
      globalSecondaryIndexes: this.createGlobalSecondaryIndexConfiguration(),
      tableName: this.constructTableName(),
    };
    return tableConfiguration;
  };
}
