import { IdLiteralType, IdType } from 'modules/common/types/id-type.type';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

export abstract class BaseEnumEntity<T> {
  @PrimaryGeneratedColumn({ type: IdLiteralType })
  id: IdType;

  @Column({ unique: true, type: 'text' })
  name: T;
}
