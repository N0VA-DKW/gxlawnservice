import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { getQueryFn } from "@/lib/queryClient";
import { Booking } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/ui/site-header";
import { SiteFooter } from "@/components/ui/site-footer";
import { CheckCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function BookingConfirmation() {
  const { id } = useParams();
  
  const { data: booking, isLoading, error } = useQuery<Booking>({
    queryKey: [`/api/bookings/${id}`],
    queryFn: getQueryFn({ on401: "throw" }),
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

  return (
    <>
      <SiteHeader />
      
      <main className="bg-neutral-lightest min-h-screen py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <div className="text-center py-6">
                  <h3 className="text-2xl font-semibold mb-2 text-red-600">Booking Not Found</h3>
                  <p className="text-neutral-dark mb-6">
                    We couldn't find the booking you're looking for. Please check the booking ID and try again.
                  </p>
                  <Link href="/">
                    <Button className="bg-primary hover:bg-primary-dark text-white">
                      Return Home
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : booking ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <div className="text-center py-6">
                  <div className="mb-4">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Booking Confirmed!</h3>
                  <p className="text-neutral-dark mb-6">
                    Your lawn mowing service has been scheduled. A confirmation email has been sent to your email address.
                  </p>
                  
                  <div className="bg-neutral-lightest border border-neutral-light rounded-lg p-4 mb-6 text-left">
                    <h4 className="font-medium mb-2">Booking Summary</h4>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <span className="text-neutral-dark">Booking ID:</span> #{booking.id.toString().padStart(4, '0')}
                      </li>
                      <li>
                        <span className="text-neutral-dark">Service:</span> {getServiceTypeLabel(booking.serviceType)}
                      </li>
                      <li>
                        <span className="text-neutral-dark">Date:</span> {format(new Date(booking.serviceDate), "MMMM dd, yyyy")}
                      </li>
                      <li>
                        <span className="text-neutral-dark">Time:</span> {getTimeLabel(booking.serviceTime)}
                      </li>
                      <li>
                        <span className="text-neutral-dark">Address:</span> {booking.address}, {booking.city}, {booking.zipCode}
                      </li>
                      <li>
                        <span className="text-neutral-dark">Total:</span>{" "}
                        <span className="font-medium">${booking.price.toFixed(2)}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <Link href="/">
                    <Button className="bg-primary hover:bg-primary-dark text-white">
                      Return Home
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>
      
      <SiteFooter />
    </>
  );
}
