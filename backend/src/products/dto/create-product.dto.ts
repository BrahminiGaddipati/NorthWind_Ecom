import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Chai' })
  @IsString()
  product_name: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  supplier_id: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  category_id: number;

  @ApiProperty({ example: '10 boxes x 20 bags' })
  @IsOptional()
  @IsString()
  quantity_per_unit: string;

  @ApiProperty({ example: 18.00 })
  @IsNumber()
  unit_price: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  units_in_stock: number;

  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumber()
  units_on_order: number;

  @ApiProperty({ example: 10 })
  @IsOptional()
  @IsNumber()
  reorder_level: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  discontinued: number;
}