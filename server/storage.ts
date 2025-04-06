import { User, type InsertUser, Booking, InsertBooking, BookingStatus } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bookings: Map<number, Booking>;
  private userId: number;
  private bookingId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.userId = 1;
    this.bookingId = 1;
    
    // Create admin user by default
    this.createUser({
      username: "admin@robomow.com",
      password: "adminpassword",
    }).then(user => {
      // Update user to be an admin
      const adminUser = {...user, isAdmin: true};
      this.users.set(user.id, adminUser);
    });
    
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
    const newBooking: Booking = { 
      ...booking, 
      id,
      status: "pending" as BookingStatus,
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

export const storage = new MemStorage();
