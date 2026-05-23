import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UpdateShippingDto, UpdateShipperDto, UpdateLocationDto } from './dto/update-shipping.dto';
@Injectable()
export class ShippingService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // Get all shippers
  async findAllShippers() {
    return this.dataSource.query(`
      SELECT 
        s.shipper_id,
        s.company_name,
        s.phone,
        COUNT(o.order_id) as total_orders,
        COUNT(CASE WHEN o.shipped_date IS NULL THEN 1 END) as pending_orders,
        COUNT(CASE WHEN o.shipped_date IS NOT NULL THEN 1 END) as delivered_orders
      FROM shippers s
      LEFT JOIN orders o ON s.shipper_id = o.ship_via
      GROUP BY s.shipper_id
      ORDER BY s.company_name
    `);
  }

  // Get single shipper
  async findOneShipper(shipperId: number) {
    const result = await this.dataSource.query(`
      SELECT * FROM shippers
      WHERE shipper_id = $1
    `, [shipperId]);

    if (result.length === 0) {
      throw new NotFoundException(`Shipper #${shipperId} not found`);
    }

    return result[0];
  }

  // Get orders assigned to shipper
  async findOrdersByShipper(shipperId: number) {
    return this.dataSource.query(`
      SELECT 
        o.order_id,
        o.order_date,
        o.required_date,
        o.shipped_date,
        o.ship_name,
        o.ship_address,
        o.ship_city,
        o.ship_region,
        o.ship_postal_code,
        o.ship_country,
        o.freight,
        c.company_name as customer_name,
        c.contact_name,
        c.phone as customer_phone,
        CASE 
          WHEN o.shipped_date IS NOT NULL THEN 'Delivered'
          WHEN o.required_date < NOW() THEN 'Late'
          ELSE 'Pending'
        END as status
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      WHERE o.ship_via = $1
      ORDER BY o.order_date DESC
    `, [shipperId]);
  }

  // Get pending orders for shipper
  async findPendingOrders(shipperId: number) {
    return this.dataSource.query(`
      SELECT 
        o.order_id,
        o.order_date,
        o.required_date,
        o.ship_name,
        o.ship_address,
        o.ship_city,
        o.ship_country,
        o.freight,
        c.company_name as customer_name,
        c.contact_name,
        c.phone as customer_phone
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      WHERE o.ship_via = $1
      AND o.shipped_date IS NULL
      ORDER BY o.required_date ASC
    `, [shipperId]);
  }

  // Update shipped date
  async updateShipping(orderId: number, updateDto: UpdateShippingDto) {
    const result = await this.dataSource.query(`
      UPDATE orders
      SET shipped_date = $1
      WHERE order_id = $2
      RETURNING *
    `, [updateDto.shipped_date, orderId]);

    if (result.length === 0) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    return {
      message: 'Order marked as shipped!',
      order: result[0]
    };
  }

  // Update shipper profile
  async updateShipper(shipperId: number, updateDto: UpdateShipperDto) {
    const result = await this.dataSource.query(`
      UPDATE shippers SET
        company_name = COALESCE($1, company_name),
        phone = COALESCE($2, phone)
      WHERE shipper_id = $3
      RETURNING *
    `, [
      updateDto.company_name,
      updateDto.phone,
      shipperId
    ]);

    if (result.length === 0) {
      throw new NotFoundException(`Shipper #${shipperId} not found`);
    }

    return result[0];
  }

  // Get shipping statistics
  async getShippingStats() {
    const stats = await this.dataSource.query(`
      SELECT
        COUNT(*) as total_orders,
        COUNT(CASE WHEN shipped_date IS NULL THEN 1 END) as pending_orders,
        COUNT(CASE WHEN shipped_date IS NOT NULL THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN required_date < NOW() AND shipped_date IS NULL THEN 1 END) as late_orders,
        AVG(freight) as avg_freight
      FROM orders
    `);

    return stats[0];
  }
  // Update order location (shipper updates their location)
  async updateLocation(orderId: number, updateDto: UpdateLocationDto) {
    const result = await this.dataSource.query(`
      UPDATE orders
      SET 
        current_latitude = $1,
        current_longitude = $2,
        tracking_status = $3,
        last_location_update = NOW()
      WHERE order_id = $4
      RETURNING *
    `, [
      updateDto.latitude,
      updateDto.longitude,
      updateDto.tracking_status || 'In Transit',
      orderId
    ]);

    if (result.length === 0) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    return {
      message: 'Location updated successfully!',
      order_id: orderId,
      latitude: updateDto.latitude,
      longitude: updateDto.longitude,
      tracking_status: updateDto.tracking_status,
      last_update: new Date()
    };
  }

  // Get order tracking info (customer sees this)
  async getOrderTracking(orderId: number) {
    const result = await this.dataSource.query(`
      SELECT
        o.order_id,
        o.order_date,
        o.required_date,
        o.shipped_date,
        o.ship_name,
        o.ship_address,
        o.ship_city,
        o.ship_country,
        o.current_latitude,
        o.current_longitude,
        o.tracking_status,
        o.last_location_update,
        s.company_name as shipper_name,
        s.phone as shipper_phone
      FROM orders o
      LEFT JOIN shippers s ON o.ship_via = s.shipper_id
      WHERE o.order_id = $1
    `, [orderId]);

    if (result.length === 0) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    return result[0];
  }
}
