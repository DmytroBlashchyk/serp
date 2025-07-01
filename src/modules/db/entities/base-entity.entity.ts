import { IdLiteralType, IdType } from 'modules/common/types/id-type.type';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity<T = IdType> {
  @PrimaryGeneratedColumn({ type: IdLiteralType })
  id: T;
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
