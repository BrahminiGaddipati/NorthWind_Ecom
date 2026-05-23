import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateShippingDto {
  @ApiProperty({ example: '2024-01-15' })
  @IsOptional()
  @IsString()
  shipped_date: string;

  @ApiProperty({ example: 'In Transit' })
  @IsOptional()
  @IsString()
  tracking_status: string;
}

export class UpdateLocationDto {
  @ApiProperty({ example: 17.3850 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 78.4867 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: 'In Transit' })
  @IsOptional()
  @IsString()
  tracking_status: string;
}

export class UpdateShipperDto {
  @ApiProperty({ example: 'Federal Shipping' })
  @IsOptional()
  @IsString()
  company_name: string;

  @ApiProperty({ example: '(503) 555-9931' })
  @IsOptional()
  @IsString()
  phone: string;
}