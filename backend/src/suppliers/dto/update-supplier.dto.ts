import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSupplierDto {
  @ApiProperty({ example: 'Exotic Liquids' })
  @IsOptional()
  @IsString()
  company_name: string;

  @ApiProperty({ example: 'Charlotte Cooper' })
  @IsOptional()
  @IsString()
  contact_name: string;

  @ApiProperty({ example: 'Purchasing Manager' })
  @IsOptional()
  @IsString()
  contact_title: string;

  @ApiProperty({ example: '49 Gilbert St.' })
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty({ example: 'London' })
  @IsOptional()
  @IsString()
  city: string;

  @ApiProperty({ example: 'UK' })
  @IsOptional()
  @IsString()
  country: string;

  @ApiProperty({ example: '(171) 555-2222' })
  @IsOptional()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'www.exotic-liquids.com' })
  @IsOptional()
  @IsString()
  homepage: string;
}