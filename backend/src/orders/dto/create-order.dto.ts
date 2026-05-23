import { IsString, IsNumber, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  product_id: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 18.00 })
  @IsNumber()
  unit_price: number;

  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsNumber()
  discount: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'ALFKI' })
  @IsString()
  customer_id: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  employee_id: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  ship_via: number;

  @ApiProperty({ example: 32.50 })
  @IsOptional()
  @IsNumber()
  freight: number;

  @ApiProperty({ example: 'Alfreds Futterkiste' })
  @IsOptional()
  @IsString()
  ship_name: string;

  @ApiProperty({ example: 'Obere Str. 57' })
  @IsOptional()
  @IsString()
  ship_address: string;

  @ApiProperty({ example: 'Berlin' })
  @IsOptional()
  @IsString()
  ship_city: string;

  @ApiProperty({ example: 'Germany' })
  @IsOptional()
  @IsString()
  ship_country: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}