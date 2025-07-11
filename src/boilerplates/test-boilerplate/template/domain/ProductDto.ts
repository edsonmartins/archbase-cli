/**
 * ProductDto - Data Transfer Object
 * 
 * Following powerview-admin patterns for DTO structure.
 * Generated by DomainGenerator.
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  IsNotEmpty,
  IsEmail,
  ValidateNested,
  IsOptional
} from 'archbase-react';

import { ProductStatus } from './ProductStatus';


export class ProductDto {
  @IsNotEmpty({
    message: "mentors:id product dever ser informado",
  })
  id: string;

  @IsOptional()
  code: string;

  @IsOptional()
  version: number;

  @IsOptional()
  createEntityDate: string;

  @IsOptional()
  updateEntityDate: string;

  @IsOptional()
  createdByUser: string;

  @IsOptional()
  lastModifiedByUser: string;

  @IsOptional()
  id: number;

  @IsOptional()
  name: string;

  @IsOptional()
  price: number;

  @IsOptional()
  active: boolean;

  // New record flag
  isNovoProduct: boolean;

  constructor(data: any) {
    this.id = data.id;
        this.code = data.code;
        this.version = data.version;
        this.createEntityDate = data.createEntityDate;
        this.updateEntityDate = data.updateEntityDate;
        this.createdByUser = data.createdByUser;
        this.lastModifiedByUser = data.lastModifiedByUser;
        this.id = data.id;
        this.name = data.name;
        this.price = data.price;
        this.active = data.active;
        
    this.isNovoProduct = data.isNovoProduct || false;
  }

  // Static factory method for new instances
  static newInstance = () => {
    return new ProductDto({
      id: uuidv4(),
      isNovoProduct: true
    });
  };

  // Audit helper methods
  isNewRecord(): boolean {
    return this.isNovoProduct || !this.id;
  }
}