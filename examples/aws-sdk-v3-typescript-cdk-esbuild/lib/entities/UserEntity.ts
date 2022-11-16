import "reflect-metadata";

import { Attribute, Entity, INDEX_TYPE } from "@typedorm/common";
import { Base, BaseEntity } from "./BaseEntity";
import { getClient } from "../utils/DynamoManager";

export interface User extends Base {
  fName: string;
  lName: string;
  teamId: string;
  email: string;
}

@Entity<UserEntity>({
  name: "user",
  primaryKey: {
    partitionKey: "USER#{{id}}",
    sortKey: "USER#{{id}}",
  },
  indexes: {
    GSI1: {
      partitionKey: "USER#{{email}}",
      sortKey: "USER#{{email}}",
      type: INDEX_TYPE.GSI,
    },
    GSI2: {
      partitionKey: "USERTEAM#{{teamId}}",
      sortKey: "LNAME#{{lName}}",
      type: INDEX_TYPE.GSI,
    },
  },
})
export class UserEntity extends BaseEntity {
  @Attribute()
  fName: string;

  @Attribute()
  lName: string;

  @Attribute()
  teamId: string;

  @Attribute()
  email: string;


  constructor(obj: User) {
    super(obj);
    this.fName = obj.fName;
    this.lName = obj.lName;
    this.teamId = obj.teamId;
    this.email = obj.email;
  }
}

export const createUser = async (user: User): Promise<User> => {
  const client = getClient();
  const newUser = new UserEntity(user);
  return client.entityManager.create<UserEntity>(newUser);
};

export const getUserById = async (
  id: string
): Promise<UserEntity | undefined> => {
  const client = getClient();
  const user = await client.entityManager.findOne<UserEntity>(UserEntity, {
    id: id,
  });

  return user;
};
