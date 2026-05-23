import {
  Controller, Get, Put,
  Param, Body, UseGuards
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  // Employee only - get all suppliers
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all suppliers (Employee only)' })
  findAll() {
    return this.suppliersService.findAll();
  }

  // Supplier + Employee - get single supplier
  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPPLIER, UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get supplier by id' })
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(+id);
  }

  // Supplier + Employee - get supplier with products
  @Get(':id/products')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPPLIER, UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get supplier with their products' })
  findWithProducts(@Param('id') id: string) {
    return this.suppliersService.findWithProducts(+id);
  }

  // Supplier + Employee - get supplier stats
  @Get(':id/stats')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPPLIER, UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get supplier statistics' })
  getStats(@Param('id') id: string) {
    return this.suppliersService.getStats(+id);
  }

  // Supplier only - update their profile
  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPPLIER, UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update supplier profile' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSupplierDto
  ) {
    return this.suppliersService.update(+id, updateDto);
  }
}