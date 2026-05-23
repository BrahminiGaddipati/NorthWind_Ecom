import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.EMPLOYEE)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales-summary')
  @ApiOperation({ summary: 'Get sales summary' })
  getSalesSummary() {
    return this.reportsService.getSalesSummary();
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Get top selling products' })
  getTopProducts() {
    return this.reportsService.getTopProducts();
  }

  @Get('sales-by-category')
  @ApiOperation({ summary: 'Get sales by category' })
  getSalesByCategory() {
    return this.reportsService.getSalesByCategory();
  }

  @Get('sales-by-employee')
  @ApiOperation({ summary: 'Get sales by employee' })
  getSalesByEmployee() {
    return this.reportsService.getSalesByEmployee();
  }

  @Get('sales-by-country')
  @ApiOperation({ summary: 'Get sales by country' })
  getSalesByCountry() {
    return this.reportsService.getSalesByCountry();
  }

  @Get('top-customers')
  @ApiOperation({ summary: 'Get top customers' })
  getTopCustomers() {
    return this.reportsService.getTopCustomers();
  }

  @Get('monthly-sales')
  @ApiOperation({ summary: 'Get monthly sales' })
  getMonthlySales() {
    return this.reportsService.getMonthlySales();
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock report' })
  getLowStockReport() {
    return this.reportsService.getLowStockReport();
  }
}