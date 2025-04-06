import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertBookingSchema, bookingStatusSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Public API routes
  
  // Create a new booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const newBooking = await storage.createBooking(bookingData);
      res.status(201).json(newBooking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });
  
  // Get a specific booking by ID
  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      
      const booking = await storage.getBookingById(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve booking" });
    }
  });
  
  // Admin API routes
  
  // Get all bookings
  app.get("/api/admin/bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve bookings" });
    }
  });
  
  // Get bookings by status
  app.get("/api/admin/bookings/status/:status", async (req, res) => {
    try {
      const status = req.params.status;
      
      // Validate status
      try {
        bookingStatusSchema.parse(status);
      } catch (error) {
        return res.status(400).json({ message: "Invalid booking status" });
      }
      
      const bookings = await storage.getBookingsByStatus(status as any);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve bookings" });
    }
  });
  
  // Update booking status
  app.patch("/api/admin/bookings/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      
      const { status } = req.body;
      
      // Validate status
      try {
        bookingStatusSchema.parse(status);
      } catch (error) {
        return res.status(400).json({ message: "Invalid booking status" });
      }
      
      const updatedBooking = await storage.updateBookingStatus(id, status);
      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(updatedBooking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });
  
  // Get dashboard stats
  app.get("/api/admin/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve dashboard stats" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
