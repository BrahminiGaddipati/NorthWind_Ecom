import {
  Controller, Get, Post, Put,
  Param, Body, UseGuards, Request
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Public - anyone can see products
  @Get()
  @ApiOperation({ summary: 'Get all products' })
  findAll() {
    return this.productsService.findAll();
  }

  // Public - get categories
  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  getCategories() {
    return this.productsService.getCategories();
  }

  // Public - get single product
  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  // Public - get products by category
  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get products by category' })
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.productsService.findByCategory(+categoryId);
  }

  // Supplier only - get their products
  @Get('supplier/:supplierId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPPLIER, UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get products by supplier' })
  findBySupplier(@Param('supplierId') supplierId: string) {
    return this.productsService.findBySupplier(+supplierId);
  }

  // Supplier only - create product
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPPLIER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new product (Supplier only)' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // Supplier/Employee - update product
  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPPLIER, UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product (Supplier/Employee only)' })
  update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateProductDto>
  ) {
    return this.productsService.update(+id, updateData);
  }

  // Supplier/Employee - low stock alert
  @Get('stock/low')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPPLIER, UserRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get low stock products' })
  findLowStock() {
    return this.productsService.findLowStock();
  }
}