import {
  Controller, Get, Put,
  Param, Body, UseGuards
} from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { UpdateShippingDto, UpdateShipperDto, UpdateLocationDto } from './dto/update-shipping.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  // Employee/Customer - get all shippers
  @Get('shippers')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all shippers' })
  findAllShippers() {
    return this.shippingService.findAllShippers();
  }

  // Employee only - get shipping stats
  @Get('stats')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shipping statistics (Employee only)' })
  getShippingStats() {
    return this.shippingService.getShippingStats();
  }

  // Shipper + Employee - get single shipper
  @Get('shippers/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SHIPPER, UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shipper by id' })
  findOneShipper(@Param('id') id: string) {
    return this.shippingService.findOneShipper(+id);
  }

  // Shipper + Employee - get all orders for shipper
  @Get('shippers/:id/orders')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SHIPPER, UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all orders for shipper' })
  findOrdersByShipper(@Param('id') id: string) {
    return this.shippingService.findOrdersByShipper(+id);
  }

  // Shipper only - get pending orders
  @Get('shippers/:id/pending')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SHIPPER, UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pending orders for shipper' })
  findPendingOrders(@Param('id') id: string) {
    return this.shippingService.findPendingOrders(+id);
  }

  // Shipper only - mark order as shipped
  @Put('orders/:id/ship')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SHIPPER, UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark order as shipped' })
  updateShipping(
    @Param('id') id: string,
    @Body() updateDto: UpdateShippingDto
  ) {
    return this.shippingService.updateShipping(+id, updateDto);
  }

  // Shipper only - update profile
  @Put('shippers/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SHIPPER, UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update shipper profile' })
  updateShipper(
    @Param('id') id: string,
    @Body() updateDto: UpdateShipperDto
  ) {
    return this.shippingService.updateShipper(+id, updateDto);
  }
  // Shipper - update order location
  @Put('orders/:id/location')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SHIPPER, UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order location (Shipper only)' })
  updateLocation(
    @Param('id') id: string,
    @Body() updateDto: UpdateLocationDto
  ) {
    return this.shippingService.updateLocation(+id, updateDto);
  }

  // Customer + Shipper - get order tracking
  @Get('orders/:id/tracking')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.SHIPPER, UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order tracking info (Customer/Shipper)' })
  getOrderTracking(@Param('id') id: string) {
    return this.shippingService.getOrderTracking(+id);
  }
}