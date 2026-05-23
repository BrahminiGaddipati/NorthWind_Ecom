import {
  Controller, Get, Post, Put,
  Param, Body, UseGuards, Request
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Employee only - get all orders
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all orders (Employee only)' })
  findAll() {
    return this.ordersService.findAll();
  }

  // Employee only - get stats
  @Get('stats')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order statistics (Employee only)' })
  getStats() {
    return this.ordersService.getStats();
  }

  // Customer - get their orders
  @Get('customer/:customerId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get orders by customer' })
  findByCustomer(@Param('customerId') customerId: string) {
    return this.ordersService.findByCustomer(customerId);
  }

  // Shipper - get their orders
  @Get('shipper/:shipperId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SHIPPER, UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get orders by shipper' })
  findByShipper(@Param('shipperId') shipperId: string) {
    return this.ordersService.findByShipper(+shipperId);
  }

  // Supplier - get their orders
  @Get('supplier/:supplierId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPPLIER, UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get orders containing supplier products' })
  findBySupplier(@Param('supplierId') supplierId: string) {
    return this.ordersService.findBySupplier(+supplierId);
  }

  // Get single order
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get single order with items' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  // Customer only - place order
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Place new order (Customer only)' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  // Shipper only - update shipped date
  @Put(':id/ship')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SHIPPER, UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update shipped date (Shipper only)' })
  updateShipped(
    @Param('id') id: string,
    @Body('shipped_date') shippedDate: string
  ) {
    return this.ordersService.updateShipped(+id, shippedDate);
  }
}