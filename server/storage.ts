import { User, type InsertUser, Booking, InsertBooking, BookingStatus } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import mysql from "mysql2/promise";
// Use a dynamic import for express-mysql-session
import expressMySQL from 'express-mysql-session';

const MemoryStore = createMemoryStore(session);
// Create MySQL session store
const MySQLStore = expressMySQL(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllBookings(): Promise<Booking[]>;
  getBookingById(id: number): Promise<Booking | undefined>;
  getBookingsByStatus(status: BookingStatus): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: BookingStatus): Promise<Booking | undefined>;
  
  getDashboardStats(): Promise<{
    totalBookings: number;
    pendingBookings: number;
    completedBookings: number;
    totalRevenue: number;
  }>;
  
  sessionStore: any;
  init?(): Promise<void>;
}

// MySQL Database Storage Implementation
export class MySQLStorage implements IStorage {
  private pool: mysql.Pool;
  sessionStore: any;
  
  constructor() {
    // Create database connection pool
    this.pool = mysql.createPool({
      host: "sql207.infinityfree.com",
      user: "if0_38682468",
      password: "AA0qXZXjfCJ",
      database: "if0_38682468_backgx",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Setup MySQL session store
    const options = {
      host: "sql207.infinityfree.com",
      port: 3306,
      user: "if0_38682468",
      password: "AA0qXZXjfCJ",
      database: "if0_38682468_backgx",
      createDatabaseTable: true
    };
    
    this.sessionStore = new MySQLStore(options);
  }
  
  async init(): Promise<void> {
    // Create users table if it doesn't exist
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        isAdmin BOOLEAN DEFAULT FALSE
      )
    `);
    
    // Create bookings table if it doesn't exist
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        zipCode VARCHAR(20) NOT NULL,
        serviceType VARCHAR(50) NOT NULL,
        serviceDate DATE NOT NULL,
        serviceTime VARCHAR(20) NOT NULL,
        lawnSize INT NOT NULL,
        lawnCondition VARCHAR(100) NULL,
        obstacles TEXT NULL,
        status ENUM('pending', 'approved', 'completed', 'cancelled') DEFAULT 'pending',
        price DECIMAL(10, 2) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Check if admin user exists
    const [rows] = await this.pool.query('SELECT * FROM users WHERE username = ?', ['admin@robomow.com']);
    
    // Create admin user if it doesn't exist
    if (Array.isArray(rows) && (rows as any[]).length === 0) {
      await this.pool.query(
        'INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)',
        ['admin@robomow.com', 'adminpassword', true]
      );
      console.log('Admin user created in MySQL database');
    }
  }
  
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [rows] = await this.pool.query('SELECT * FROM users WHERE id = ?', [id]);
      const users = rows as any[];
      
      if (users.length === 0) {
        return undefined;
      }
      
      return {
        id: users[0].id,
        username: users[0].username,
        password: users[0].password,
        isAdmin: Boolean(users[0].isAdmin)
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return undefined;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [rows] = await this.pool.query('SELECT * FROM users WHERE username = ?', [username]);
      const users = rows as any[];
      
      if (users.length === 0) {
        return undefined;
      }
      
      return {
        id: users[0].id,
        username: users[0].username,
        password: users[0].password,
        isAdmin: Boolean(users[0].isAdmin)
      };
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [result] = await this.pool.query(
        'INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)',
        [insertUser.username, insertUser.password, false]
      );
      
      const id = (result as mysql.ResultSetHeader).insertId;
      
      return {
        id,
        username: insertUser.username,
        password: insertUser.password,
        isAdmin: false
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user in database');
    }
  }
  
  async getAllBookings(): Promise<Booking[]> {
    try {
      const [rows] = await this.pool.query('SELECT * FROM bookings ORDER BY createdAt DESC');
      return this.mapBookingsFromDB(rows as any[]);
    } catch (error) {
      console.error('Error getting all bookings:', error);
      return [];
    }
  }
  
  async getBookingById(id: number): Promise<Booking | undefined> {
    try {
      const [rows] = await this.pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
      const bookings = this.mapBookingsFromDB(rows as any[]);
      
      if (bookings.length === 0) {
        return undefined;
      }
      
      return bookings[0];
    } catch (error) {
      console.error('Error getting booking by ID:', error);
      return undefined;
    }
  }
  
  async getBookingsByStatus(status: BookingStatus): Promise<Booking[]> {
    try {
      const [rows] = await this.pool.query(
        'SELECT * FROM bookings WHERE status = ? ORDER BY serviceDate ASC',
        [status]
      );
      return this.mapBookingsFromDB(rows as any[]);
    } catch (error) {
      console.error('Error getting bookings by status:', error);
      return [];
    }
  }
  
  async createBooking(booking: InsertBooking): Promise<Booking> {
    try {
      // Calculate price based on service type and lawn size
      let price = 0;
      const lawnSizeFactor = booking.lawnSize / 1000; // Adjust price based on lawn size in sq ft
      
      switch (booking.serviceType) {
        case "standard":
          price = 50 + (lawnSizeFactor * 10); // Base $50 + $10 per 1000 sq ft
          break;
        case "premium":
          price = 75 + (lawnSizeFactor * 15); // Base $75 + $15 per 1000 sq ft
          break;
        case "complete":
          price = 100 + (lawnSizeFactor * 20); // Base $100 + $20 per 1000 sq ft
          break;
        default:
          price = 50;
      }
      
      // Round to 2 decimal places
      price = Math.round(price * 100) / 100;
      
      const [result] = await this.pool.query(
        `INSERT INTO bookings (
          firstName, lastName, email, phone, address, city, zipCode,
          serviceType, serviceDate, serviceTime, lawnSize, lawnCondition,
          obstacles, status, price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          booking.firstName, booking.lastName, booking.email, booking.phone,
          booking.address, booking.city, booking.zipCode, booking.serviceType,
          booking.serviceDate, booking.serviceTime, booking.lawnSize,
          booking.lawnCondition || null, booking.obstacles || null,
          'pending', price
        ]
      );
      
      const id = (result as mysql.ResultSetHeader).insertId;
      const createdBooking = await this.getBookingById(id);
      
      if (!createdBooking) {
        throw new Error('Failed to retrieve created booking');
      }
      
      return createdBooking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new Error('Failed to create booking in database');
    }
  }
  
  async updateBookingStatus(id: number, status: BookingStatus): Promise<Booking | undefined> {
    try {
      const [result] = await this.pool.query(
        'UPDATE bookings SET status = ? WHERE id = ?',
        [status, id]
      );
      
      if ((result as mysql.ResultSetHeader).affectedRows === 0) {
        return undefined;
      }
      
      return this.getBookingById(id);
    } catch (error) {
      console.error('Error updating booking status:', error);
      return undefined;
    }
  }
  
  async getDashboardStats(): Promise<{
    totalBookings: number;
    pendingBookings: number;
    completedBookings: number;
    totalRevenue: number;
  }> {
    try {
      // Get total bookings
      const [totalRows] = await this.pool.query('SELECT COUNT(*) as count FROM bookings');
      const totalBookings = (totalRows as any[])[0].count;
      
      // Get pending bookings
      const [pendingRows] = await this.pool.query('SELECT COUNT(*) as count FROM bookings WHERE status = ?', ['pending']);
      const pendingBookings = (pendingRows as any[])[0].count;
      
      // Get completed bookings
      const [completedRows] = await this.pool.query('SELECT COUNT(*) as count FROM bookings WHERE status = ?', ['completed']);
      const completedBookings = (completedRows as any[])[0].count;
      
      // Get total revenue from completed and approved bookings
      const [revenueRows] = await this.pool.query(
        'SELECT SUM(price) as total FROM bookings WHERE status IN (?, ?)',
        ['completed', 'approved']
      );
      const totalRevenue = (revenueRows as any[])[0].total || 0;
      
      return {
        totalBookings,
        pendingBookings,
        completedBookings,
        totalRevenue: Number(totalRevenue)
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        totalRevenue: 0
      };
    }
  }
  
  // Helper method to map database rows to Booking objects
  private mapBookingsFromDB(rows: any[]): Booking[] {
    return rows.map(row => ({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      phone: row.phone,
      address: row.address,
      city: row.city,
      zipCode: row.zipCode,
      serviceType: row.serviceType,
      serviceDate: row.serviceDate,
      serviceTime: row.serviceTime,
      lawnSize: row.lawnSize,
      lawnCondition: row.lawnCondition,
      obstacles: row.obstacles,
      status: row.status as BookingStatus,
      price: parseFloat(row.price),
      createdAt: new Date(row.createdAt)
    }));
  }
}

// In-Memory Storage Implementation (as a fallback)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bookings: Map<number, Booking>;
  private userId: number;
  private bookingId: number;
  sessionStore: any;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.userId = 1;
    this.bookingId = 1;
    
    // Direct set admin user with plaintext password
    // The password will be verified directly in the auth function
    const adminUser: User = {
      id: this.userId++,
      username: "admin@robomow.com",
      password: "adminpassword",
      isAdmin: true
    };
    
    this.users.set(adminUser.id, adminUser);
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Clear expired sessions every day
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, isAdmin: false };
    this.users.set(id, user);
    return user;
  }
  
  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values()).sort((a, b) => {
      // Sort by creation date, newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  
  async getBookingById(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }
  
  async getBookingsByStatus(status: BookingStatus): Promise<Booking[]> {
    return Array.from(this.bookings.values())
      .filter(booking => booking.status === status)
      .sort((a, b) => {
        // Sort by service date, soonest first
        return new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime();
      });
  }
  
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.bookingId++;
    
    // Calculate price based on service type and lawn size
    let price = 0;
    const lawnSizeFactor = booking.lawnSize / 1000; // Adjust price based on lawn size in sq ft
    
    switch (booking.serviceType) {
      case "standard":
        price = 50 + (lawnSizeFactor * 10); // Base $50 + $10 per 1000 sq ft
        break;
      case "premium":
        price = 75 + (lawnSizeFactor * 15); // Base $75 + $15 per 1000 sq ft
        break;
      case "complete":
        price = 100 + (lawnSizeFactor * 20); // Base $100 + $20 per 1000 sq ft
        break;
      default:
        price = 50;
    }
    
    // Round to 2 decimal places
    price = Math.round(price * 100) / 100;
    
    // Ensure lawnCondition is properly typed as string | null
    const lawnCondition = booking.lawnCondition || null;
    const obstacles = booking.obstacles || null;
    
    const newBooking: Booking = { 
      id,
      firstName: booking.firstName,
      lastName: booking.lastName,
      email: booking.email,
      phone: booking.phone,
      address: booking.address,
      city: booking.city,
      zipCode: booking.zipCode,
      serviceType: booking.serviceType,
      serviceDate: booking.serviceDate,
      serviceTime: booking.serviceTime,
      lawnSize: booking.lawnSize,
      lawnCondition: lawnCondition,
      obstacles: obstacles,
      status: "pending" as BookingStatus,
      price,
      createdAt: new Date()
    };
    
    this.bookings.set(id, newBooking);
    return newBooking;
  }
  
  async updateBookingStatus(id: number, status: BookingStatus): Promise<Booking | undefined> {
    const booking = await this.getBookingById(id);
    if (!booking) return undefined;
    
    const updatedBooking: Booking = {
      ...booking,
      status
    };
    
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
  
  async getDashboardStats(): Promise<{
    totalBookings: number;
    pendingBookings: number;
    completedBookings: number;
    totalRevenue: number;
  }> {
    const allBookings = await this.getAllBookings();
    const pendingBookings = await this.getBookingsByStatus("pending");
    const completedBookings = await this.getBookingsByStatus("completed");
    
    const totalRevenue = allBookings.reduce((sum, booking) => {
      if (booking.status === "completed" || booking.status === "approved") {
        return sum + booking.price;
      }
      return sum;
    }, 0);
    
    return {
      totalBookings: allBookings.length,
      pendingBookings: pendingBookings.length,
      completedBookings: completedBookings.length,
      totalRevenue
    };
  }
}

// For now, let's use in-memory storage
// In a production environment, you would want to use MySQL
// We've kept the MySQL implementation for reference
const storage: IStorage = new MemStorage();
console.log('Using in-memory storage for now');

export { storage };
