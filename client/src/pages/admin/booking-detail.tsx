import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Booking, BookingStatus } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";
import { ArrowLeft, Loader2, MapPin, Mail, Phone, Calendar, Clock, Ruler, LucideIcon, Leaf } from "lucide-react";

export default function BookingDetail() {
  const [, setLocation] = useLocation();
  const [bookingId, setBookingId] = useState<number | null>(null);
  
  // Extract the booking ID from the URL
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/admin\/bookings\/(\d+)/);
    if (match && match[1]) {
      setBookingId(parseInt(match[1]));
    }
  }, []);
  
  const { data: booking, isLoading, error } = useQuery<Booking>({
    queryKey: [`/api/bookings/${bookingId}`],
    queryFn: bookingId ? getQueryFn({ on401: "throw" }) : undefined,
    enabled: !!bookingId
  });
  
  const getTimeLabel = (time: string): string => {
    switch (time) {
      case "morning":
        return "Morning (8am - 11am)";
      case "afternoon":
        return "Afternoon (12pm - 3pm)";
      case "evening":
        return "Evening (4pm - 7pm)";
      default:
        return time;
    }
  };

  const getServiceTypeLabel = (type: string): string => {
    switch (type) {
      case "standard":
        return "Standard Mowing";
      case "premium":
        return "Premium Mowing";
      case "complete":
        return "Complete Lawn Care";
      default:
        return type;
    }
  };

  const getLawnSizeLabel = (size: number): string => {
    if (size < 1000) return "Small (under 1,000 sq ft)";
    if (size < 5000) return "Medium (1,000 - 5,000 sq ft)";
    if (size < 10000) return "Large (5,000 - 10,000 sq ft)";
    return "Very Large (over 10,000 sq ft)";
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-6">
            <Button onClick={() => setLocation("/admin")} variant="outline" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Booking Not Found</h1>
          </div>
          <p className="text-red-500">Unable to load booking details. The booking may not exist or you don't have permission to view it.</p>
          <Button onClick={() => setLocation("/admin")} className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-6">
          <Button onClick={() => setLocation("/admin")} variant="outline" className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Booking #{booking.id.toString().padStart(4, '0')}</h1>
          <div className="ml-auto">
            <StatusBadge status={booking.status as "pending" | "approved" | "completed" | "cancelled"} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="bg-neutral-lightest p-4 rounded-lg">
              <div className="mb-4">
                <h3 className="font-medium text-lg">{booking.firstName} {booking.lastName}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-primary mr-2" />
                  <div>
                    <p>{booking.address}</p>
                    <p>{booking.city}, {booking.zipCode}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-primary mr-2" />
                  <p>{booking.email}</p>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-primary mr-2" />
                  <p>{booking.phone}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Service Details</h2>
            <div className="bg-neutral-lightest p-4 rounded-lg">
              <div className="space-y-4">
                <div className="flex">
                  <div className="w-1/2">
                    <p className="text-neutral-medium text-sm">Service</p>
                    <p className="font-medium">{getServiceTypeLabel(booking.serviceType)}</p>
                  </div>
                  <div className="w-1/2">
                    <p className="text-neutral-medium text-sm">Price</p>
                    <p className="font-medium">${booking.price.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="w-1/2">
                    <p className="text-neutral-medium text-sm">Date</p>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-primary mr-1" />
                      <p>{format(new Date(booking.serviceDate), "MMMM dd, yyyy")}</p>
                    </div>
                  </div>
                  <div className="w-1/2">
                    <p className="text-neutral-medium text-sm">Time</p>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-primary mr-1" />
                      <p>{getTimeLabel(booking.serviceTime)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="w-1/2">
                    <p className="text-neutral-medium text-sm">Lawn Size</p>
                    <div className="flex items-center">
                      <Ruler className="w-4 h-4 text-primary mr-1" />
                      <p>{getLawnSizeLabel(booking.lawnSize)}</p>
                    </div>
                  </div>
                  <div className="w-1/2">
                    <p className="text-neutral-medium text-sm">Lawn Condition</p>
                    <div className="flex items-center">
                      <Leaf className="w-4 h-4 text-primary mr-1" />
                      <p>{booking.lawnCondition || "Not specified"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Special instructions section is optional */}
        
        {booking.obstacles && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Obstacles or Hazards</h2>
            <div className="bg-neutral-lightest p-4 rounded-lg">
              <p>{booking.obstacles}</p>
            </div>
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t border-neutral-light">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-neutral-medium">Booking created on</p>
              <p>{format(new Date(booking.createdAt), "MMMM dd, yyyy, h:mm a")}</p>
            </div>
            <Button onClick={() => setLocation("/admin")} variant="default" className="bg-primary-light">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}