import 'reflect-metadata';

import {
  AutoGenerateAttribute,
  AUTO_GENERATE_ATTRIBUTE_STRATEGY,
} from '@typedorm/common';

export interface Base {
  id: string;
  updatedAt: number;
  createdAt: number;
}

/**
 * Base entity for Typedorm which includes automatically generated attributes, id, updatedAt, and createdAt.
 * Any inheriting entity will have these attributes automatically created
 */
export abstract class BaseEntity {
  @AutoGenerateAttribute({
    strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY.UUID4,
  })
  id: string;

  @AutoGenerateAttribute({
    strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY.EPOCH_DATE,
    autoUpdate: true,
  })
  updatedAt: number;

  @AutoGenerateAttribute({
    strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY.EPOCH_DATE,
  })
  createdAt: number;

  constructor(obj: { id?: string }) {
    if (obj.id) this.id = obj.id;
  }
}
