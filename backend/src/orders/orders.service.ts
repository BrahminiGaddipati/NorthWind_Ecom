import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // Get all orders (employee only)
  async findAll() {
    return this.dataSource.query(`
      SELECT 
        o.order_id,
        o.order_date,
        o.required_date,
        o.shipped_date,
        o.freight,
        o.ship_name,
        o.ship_address,
        o.ship_city,
        o.ship_country,
        c.company_name as customer_name,
        c.contact_name,
        e.first_name || ' ' || e.last_name as employee_name,
        s.company_name as shipper_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      LEFT JOIN employees e ON o.employee_id = e.employee_id
      LEFT JOIN shippers s ON o.ship_via = s.shipper_id
      ORDER BY o.order_date DESC
    `);
  }

  // Get orders by customer
  async findByCustomer(customerId: string) {
    return this.dataSource.query(`
      SELECT 
        o.order_id,
        o.order_date,
        o.required_date,
        o.shipped_date,
        o.freight,
        o.ship_name,
        o.ship_city,
        o.ship_country,
        s.company_name as shipper_name
      FROM orders o
      LEFT JOIN shippers s ON o.ship_via = s.shipper_id
      WHERE o.customer_id = $1
      ORDER BY o.order_date DESC
    `, [customerId]);
  }

  // Get orders by shipper
  async findByShipper(shipperId: number) {
    return this.dataSource.query(`
      SELECT 
        o.order_id,
        o.order_date,
        o.shipped_date,
        o.ship_name,
        o.ship_address,
        o.ship_city,
        o.ship_country,
        c.contact_name as customer_name,
        c.phone as customer_phone
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      WHERE o.ship_via = $1
      ORDER BY o.order_date DESC
    `, [shipperId]);
  }

  // Get single order with details
  async findOne(orderId: number) {
    const order = await this.dataSource.query(`
      SELECT 
        o.*,
        c.company_name as customer_name,
        c.contact_name,
        c.phone as customer_phone,
        e.first_name || ' ' || e.last_name as employee_name,
        s.company_name as shipper_name,
        s.phone as shipper_phone
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      LEFT JOIN employees e ON o.employee_id = e.employee_id
      LEFT JOIN shippers s ON o.ship_via = s.shipper_id
      WHERE o.order_id = $1
    `, [orderId]);

    if (order.length === 0) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    // Get order items
    const items = await this.dataSource.query(`
      SELECT 
        od.product_id,
        od.unit_price,
        od.quantity,
        od.discount,
        p.product_name,
        od.quantity * od.unit_price * (1 - od.discount) as total_price
      FROM order_details od
      LEFT JOIN products p ON od.product_id = p.product_id
      WHERE od.order_id = $1
    `, [orderId]);

    return { ...order[0], items };
  }

  // Create new order (customer only)
  async create(createOrderDto: CreateOrderDto) {
    const {
      customer_id, employee_id, ship_via,
      freight, ship_name, ship_address,
      ship_city, ship_country, items
    } = createOrderDto;

    // Create order
    const orderResult = await this.dataSource.query(`
      INSERT INTO orders (
        customer_id, employee_id, order_date,
        required_date, ship_via, freight,
        ship_name, ship_address, ship_city, ship_country
      ) VALUES ($1,$2,NOW(), NOW() + INTERVAL '7 days',$3,$4,$5,$6,$7,$8)
      RETURNING *
    `, [
      customer_id, employee_id, ship_via,
      freight, ship_name, ship_address,
      ship_city, ship_country
    ]);

    const order = orderResult[0];

    // Insert order items
    for (const item of items) {
      await this.dataSource.query(`
        INSERT INTO order_details (
          order_id, product_id, unit_price, quantity, discount
        ) VALUES ($1,$2,$3,$4,$5)
      `, [
        order.order_id,
        item.product_id,
        item.unit_price,
        item.quantity,
        item.discount || 0
      ]);
    }

    return this.findOne(order.order_id);
  }

  // Update shipped date (shipper only)
  async updateShipped(orderId: number, shippedDate: string) {
    const result = await this.dataSource.query(`
      UPDATE orders 
      SET shipped_date = $1
      WHERE order_id = $2
      RETURNING *
    `, [shippedDate, orderId]);

    if (result.length === 0) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    return result[0];
  }

  // Get orders by supplier
  async findBySupplier(supplierId: number) {
    return this.dataSource.query(`
      SELECT DISTINCT
        o.order_id,
        o.order_date,
        o.required_date,
        o.shipped_date,
        o.freight,
        o.ship_name,
        o.ship_address,
        o.ship_city,
        o.ship_country,
        c.company_name as customer_name
      FROM orders o
      JOIN order_details od ON o.order_id = od.order_id
      JOIN products p ON od.product_id = p.product_id
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      WHERE p.supplier_id = $1
      ORDER BY o.order_date DESC
    `, [supplierId]);
  }

  // Get order statistics (employee dashboard)
  async getStats() {
    const stats = await this.dataSource.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN shipped_date IS NULL THEN 1 END) as pending_orders,
        COUNT(CASE WHEN shipped_date IS NOT NULL THEN 1 END) as shipped_orders,
        SUM(freight) as total_freight
      FROM orders
    `);

    return stats[0];
  }
}