import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // Get all suppliers (employee only)
  async findAll() {
    return this.dataSource.query(`
      SELECT 
        s.supplier_id,
        s.company_name,
        s.contact_name,
        s.contact_title,
        s.city,
        s.country,
        s.phone,
        COUNT(p.product_id) as total_products
      FROM suppliers s
      LEFT JOIN products p ON s.supplier_id = p.supplier_id
      GROUP BY s.supplier_id
      ORDER BY s.company_name
    `);
  }

  // Get single supplier
  async findOne(supplierId: number) {
    const result = await this.dataSource.query(`
      SELECT * FROM suppliers
      WHERE supplier_id = $1
    `, [supplierId]);

    if (result.length === 0) {
      throw new NotFoundException(`Supplier #${supplierId} not found`);
    }

    return result[0];
  }

  // Get supplier with their products
  async findWithProducts(supplierId: number) {
    const supplier = await this.findOne(supplierId);

    const products = await this.dataSource.query(`
      SELECT 
        p.product_id,
        p.product_name,
        p.unit_price,
        p.units_in_stock,
        p.units_on_order,
        p.reorder_level,
        p.discontinued,
        c.category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.supplier_id = $1
      ORDER BY p.product_name
    `, [supplierId]);

    return { ...supplier, products };
  }

  // Update supplier profile
  async update(supplierId: number, updateDto: UpdateSupplierDto) {
    const supplier = await this.findOne(supplierId);
    if (!supplier) {
      throw new NotFoundException(`Supplier #${supplierId} not found`);
    }

    const result = await this.dataSource.query(`
      UPDATE suppliers SET
        company_name = COALESCE($1, company_name),
        contact_name = COALESCE($2, contact_name),
        contact_title = COALESCE($3, contact_title),
        address = COALESCE($4, address),
        city = COALESCE($5, city),
        country = COALESCE($6, country),
        phone = COALESCE($7, phone),
        homepage = COALESCE($8, homepage)
      WHERE supplier_id = $9
      RETURNING *
    `, [
      updateDto.company_name,
      updateDto.contact_name,
      updateDto.contact_title,
      updateDto.address,
      updateDto.city,
      updateDto.country,
      updateDto.phone,
      updateDto.homepage,
      supplierId
    ]);

    return result[0];
  }

  // Get supplier statistics
  async getStats(supplierId: number) {
    const stats = await this.dataSource.query(`
      SELECT
        COUNT(DISTINCT p.product_id) as total_products,
        COUNT(DISTINCT od.order_id) as total_orders,
        SUM(od.quantity * od.unit_price) as total_revenue,
        COUNT(CASE WHEN p.units_in_stock <= p.reorder_level THEN 1 END) as low_stock_products
      FROM products p
      LEFT JOIN order_details od ON p.product_id = od.product_id
      WHERE p.supplier_id = $1
    `, [supplierId]);

    return stats[0];
  }
}