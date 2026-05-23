import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // Get all products with category and supplier info
  async findAll() {
    return this.dataSource.query(`
      SELECT 
        p.product_id,
        p.product_name,
        p.unit_price,
        p.units_in_stock,
        p.units_on_order,
        p.reorder_level,
        p.discontinued,
        p.quantity_per_unit,
        c.category_name,
        s.company_name as supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
      ORDER BY p.product_id
    `);
  }

  // Get single product by id
  async findOne(id: number) {
    const result = await this.dataSource.query(`
      SELECT 
        p.*,
        c.category_name,
        c.description as category_description,
        s.company_name as supplier_name,
        s.contact_name as supplier_contact
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
      WHERE p.product_id = $1
    `, [id]);

    if (result.length === 0) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return result[0];
  }

  // Get products by category
  async findByCategory(categoryId: number) {
    return this.dataSource.query(`
      SELECT 
        p.*,
        c.category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.category_id = $1
      ORDER BY p.product_name
    `, [categoryId]);
  }

  // Get products by supplier
  async findBySupplier(supplierId: number) {
    return this.dataSource.query(`
      SELECT * FROM products
      WHERE supplier_id = $1
      ORDER BY product_name
    `, [supplierId]);
  }

  // Create new product (supplier only)
  async create(createProductDto: CreateProductDto) {
    const {
      product_name, supplier_id, category_id,
      quantity_per_unit, unit_price, units_in_stock,
      units_on_order, reorder_level, discontinued
    } = createProductDto;

    const result = await this.dataSource.query(`
      INSERT INTO products (
        product_name, supplier_id, category_id,
        quantity_per_unit, unit_price, units_in_stock,
        units_on_order, reorder_level, discontinued
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `, [
      product_name, supplier_id, category_id,
      quantity_per_unit, unit_price, units_in_stock,
      units_on_order, reorder_level, discontinued
    ]);

    return result[0];
  }

  // Update product
  async update(id: number, updateData: Partial<CreateProductDto>) {
    const product = await this.findOne(id);
    if (!product) throw new NotFoundException(`Product #${id} not found`);

    const result = await this.dataSource.query(`
      UPDATE products SET
        product_name = COALESCE($1, product_name),
        unit_price = COALESCE($2, unit_price),
        units_in_stock = COALESCE($3, units_in_stock),
        reorder_level = COALESCE($4, reorder_level),
        discontinued = COALESCE($5, discontinued)
      WHERE product_id = $6
      RETURNING *
    `, [
      updateData.product_name,
      updateData.unit_price,
      updateData.units_in_stock,
      updateData.reorder_level,
      updateData.discontinued,
      id
    ]);

    return result[0];
  }

  // Get low stock products (for supplier/employee)
  async findLowStock() {
    return this.dataSource.query(`
      SELECT 
        p.*,
        s.company_name as supplier_name
      FROM products p
      LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
      WHERE p.units_in_stock <= p.reorder_level
      AND p.discontinued = 0
      ORDER BY p.units_in_stock ASC
    `);
  }

  // Get all categories
  async getCategories() {
    return this.dataSource.query(
      'SELECT * FROM categories ORDER BY category_name'
    );
  }
}