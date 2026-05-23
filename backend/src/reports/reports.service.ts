import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // Sales summary
  async getSalesSummary() {
    return this.dataSource.query(`
      SELECT
        COUNT(DISTINCT o.order_id) as total_orders,
        COUNT(DISTINCT o.customer_id) as total_customers,
        SUM(od.quantity * od.unit_price * (1 - od.discount)) as total_revenue,
        AVG(od.quantity * od.unit_price * (1 - od.discount)) as avg_order_value
      FROM orders o
      LEFT JOIN order_details od ON o.order_id = od.order_id
    `);
  }

  // Top selling products
  async getTopProducts() {
    return this.dataSource.query(`
      SELECT
        p.product_id,
        p.product_name,
        c.category_name,
        SUM(od.quantity) as total_sold,
        SUM(od.quantity * od.unit_price * (1 - od.discount)) as total_revenue
      FROM order_details od
      LEFT JOIN products p ON od.product_id = p.product_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      GROUP BY p.product_id, p.product_name, c.category_name
      ORDER BY total_sold DESC
      LIMIT 10
    `);
  }

  // Sales by category
  async getSalesByCategory() {
    return this.dataSource.query(`
      SELECT
        c.category_name,
        COUNT(DISTINCT od.order_id) as total_orders,
        SUM(od.quantity) as total_quantity,
        SUM(od.quantity * od.unit_price * (1 - od.discount)) as total_revenue
      FROM order_details od
      LEFT JOIN products p ON od.product_id = p.product_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      GROUP BY c.category_name
      ORDER BY total_revenue DESC
    `);
  }

  // Sales by employee
  async getSalesByEmployee() {
    return this.dataSource.query(`
      SELECT
        e.employee_id,
        e.first_name || ' ' || e.last_name as employee_name,
        e.title,
        COUNT(DISTINCT o.order_id) as total_orders,
        SUM(od.quantity * od.unit_price * (1 - od.discount)) as total_revenue
      FROM employees e
      LEFT JOIN orders o ON e.employee_id = o.employee_id
      LEFT JOIN order_details od ON o.order_id = od.order_id
      GROUP BY e.employee_id, e.first_name, e.last_name, e.title
      ORDER BY total_revenue DESC
    `);
  }

  // Sales by country
  async getSalesByCountry() {
    return this.dataSource.query(`
      SELECT
        o.ship_country,
        COUNT(DISTINCT o.order_id) as total_orders,
        SUM(od.quantity * od.unit_price * (1 - od.discount)) as total_revenue
      FROM orders o
      LEFT JOIN order_details od ON o.order_id = od.order_id
      GROUP BY o.ship_country
      ORDER BY total_revenue DESC
    `);
  }

  // Top customers
  async getTopCustomers() {
    return this.dataSource.query(`
      SELECT
        c.customer_id,
        c.company_name,
        c.contact_name,
        c.country,
        COUNT(DISTINCT o.order_id) as total_orders,
        SUM(od.quantity * od.unit_price * (1 - od.discount)) as total_spent
      FROM customers c
      LEFT JOIN orders o ON c.customer_id = o.customer_id
      LEFT JOIN order_details od ON o.order_id = od.order_id
      GROUP BY c.customer_id, c.company_name, c.contact_name, c.country
      ORDER BY total_spent DESC
      LIMIT 10
    `);
  }

  // Monthly sales
  async getMonthlySales() {
    return this.dataSource.query(`
      SELECT
        EXTRACT(YEAR FROM o.order_date) as year,
        EXTRACT(MONTH FROM o.order_date) as month,
        COUNT(DISTINCT o.order_id) as total_orders,
        SUM(od.quantity * od.unit_price * (1 - od.discount)) as total_revenue
      FROM orders o
      LEFT JOIN order_details od ON o.order_id = od.order_id
      GROUP BY year, month
      ORDER BY year DESC, month DESC
    `);
  }

  // Low stock report
  async getLowStockReport() {
    return this.dataSource.query(`
      SELECT
        p.product_id,
        p.product_name,
        p.units_in_stock,
        p.reorder_level,
        p.units_on_order,
        s.company_name as supplier_name,
        s.phone as supplier_phone,
        c.category_name
      FROM products p
      LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.units_in_stock <= p.reorder_level
      AND p.discontinued = 0
      ORDER BY p.units_in_stock ASC
    `);
  }
}