import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Booking, BookingStatus } from "@shared/schema";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Check,
  ClipboardList,
  Eye,
  Loader2,
  RotateCcw,
  Search,
  X
} from "lucide-react";

export function BookingTable() {
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: BookingStatus;
    }) => {
      const res = await apiRequest("PATCH", `/api/admin/bookings/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/stats"] });
      toast({
        title: "Status updated",
        description: "The booking status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (id: number, status: BookingStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

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

  const filteredBookings = bookings
    ? bookings
        .filter((booking) => filter === "all" || booking.status === filter)
        .filter((booking) => {
          if (!searchTerm) return true;
          const searchLower = searchTerm.toLowerCase();
          return (
            booking.firstName.toLowerCase().includes(searchLower) ||
            booking.lastName.toLowerCase().includes(searchLower) ||
            booking.email.toLowerCase().includes(searchLower) ||
            booking.address.toLowerCase().includes(searchLower) ||
            `${booking.id}`.includes(searchLower)
          );
        })
    : [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Booking Management</h2>
        <div className="flex space-x-2">
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg p-2 text-sm"
          />
          <Button variant="default" className="bg-primary-dark hover:bg-primary p-2">
            <Search className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap space-x-2 mb-6">
        <Button
          onClick={() => setFilter("all")}
          variant={filter === "all" ? "default" : "ghost"}
          className={filter === "all" ? "bg-primary-light text-white" : ""}
        >
          All
        </Button>
        <Button
          onClick={() => setFilter("pending")}
          variant={filter === "pending" ? "default" : "ghost"}
          className={filter === "pending" ? "bg-primary-light text-white" : ""}
        >
          Pending
        </Button>
        <Button
          onClick={() => setFilter("approved")}
          variant={filter === "approved" ? "default" : "ghost"}
          className={filter === "approved" ? "bg-primary-light text-white" : ""}
        >
          Approved
        </Button>
        <Button
          onClick={() => setFilter("completed")}
          variant={filter === "completed" ? "default" : "ghost"}
          className={filter === "completed" ? "bg-primary-light text-white" : ""}
        >
          Completed
        </Button>
        <Button
          onClick={() => setFilter("cancelled")}
          variant={filter === "cancelled" ? "default" : "ghost"}
          className={filter === "cancelled" ? "bg-primary-light text-white" : ""}
        >
          Cancelled
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-neutral-lightest">
                <th className="py-3 px-4 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Booking ID</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Customer</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Service</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Date & Time</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Amount</th>
                <th className="py-3 px-4 text-right text-xs font-medium text-neutral-dark uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-neutral-lightest">
                  <td className="py-4 px-4 whitespace-nowrap">#{booking.id.toString().padStart(4, '0')}</td>
                  <td className="py-4 px-4 whitespace-nowrap">{`${booking.firstName} ${booking.lastName}`}</td>
                  <td className="py-4 px-4 whitespace-nowrap">{getServiceTypeLabel(booking.serviceType)}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    {`${format(new Date(booking.serviceDate), "MMM dd, yyyy")} (${getTimeLabel(booking.serviceTime)})`}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <StatusBadge status={booking.status as "pending" | "approved" | "completed" | "cancelled"} />
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">${booking.price.toFixed(2)}</td>
                  <td className="py-4 px-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2 justify-end">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-primary hover:text-primary-dark" 
                        title="View Details"
                        onClick={() => window.location.href = `/admin/bookings/${booking.id}`}
                      >
                        <Eye className="w-5 h-5" />
                      </Button>
                      
                      {booking.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-700"
                            title="Approve"
                            onClick={() => handleStatusChange(booking.id, "approved")}
                            disabled={updateStatusMutation.isPending}
                          >
                            <Check className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            title="Cancel"
                            onClick={() => handleStatusChange(booking.id, "cancelled")}
                            disabled={updateStatusMutation.isPending}
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </>
                      )}
                      
                      {booking.status === "approved" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-700"
                            title="Mark Complete"
                            onClick={() => handleStatusChange(booking.id, "completed")}
                            disabled={updateStatusMutation.isPending}
                          >
                            <Check className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            title="Cancel"
                            onClick={() => handleStatusChange(booking.id, "cancelled")}
                            disabled={updateStatusMutation.isPending}
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </>
                      )}
                      
                      {booking.status === "completed" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-primary hover:text-primary-dark"
                          title="Invoice"
                        >
                          <ClipboardList className="w-5 h-5" />
                        </Button>
                      )}
                      
                      {booking.status === "cancelled" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-primary hover:text-primary-dark"
                          title="Restore"
                          onClick={() => handleStatusChange(booking.id, "pending")}
                          disabled={updateStatusMutation.isPending}
                        >
                          <RotateCcw className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-dark">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination */}
      {filteredBookings.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-neutral-medium">
            Showing {filteredBookings.length} {filteredBookings.length === 1 ? 'entry' : 'entries'}
          </p>
          <div className="flex space-x-1">
            <Button variant="outline" className="px-3 py-1" disabled>Previous</Button>
            <Button className="px-3 py-1 bg-primary-light text-white">1</Button>
            <Button variant="outline" className="px-3 py-1" disabled>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
