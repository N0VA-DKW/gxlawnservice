import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { SiteHeader } from "@/components/ui/site-header";
import { BookingTable } from "@/components/ui/booking-table";
import { StatsCard } from "@/components/ui/stats-card";
import { 
  BarChart4, Calendar, DollarSign, Loader2, PieChart, Users 
} from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/admin/dashboard/stats"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SiteHeader isAdmin={true} />
      
      <main className="bg-neutral-lightest min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Bookings"
              value={stats?.totalBookings || 0}
              trend="+12% from last month"
              icon={Calendar}
            />
            
            <StatsCard
              title="Pending"
              value={stats?.pendingBookings || 0}
              trend="Need approval"
              icon={Users}
              iconColor="text-yellow-600"
              iconBgColor="bg-yellow-100"
            />
            
            <StatsCard
              title="Completed"
              value={stats?.completedBookings || 0}
              trend="This month"
              icon={Calendar}
              iconColor="text-green-600"
              iconBgColor="bg-green-100"
            />
            
            <StatsCard
              title="Revenue"
              value={`$${stats?.totalRevenue.toFixed(2) || "0.00"}`}
              trend="+8.2% from last month"
              icon={DollarSign}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-100"
            />
          </div>
          
          {/* Bookings Management */}
          <BookingTable />
          
          {/* Reports Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Reports</h2>
              <div className="flex space-x-2">
                <select className="border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>Last year</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bookings by Service */}
              <div>
                <h3 className="font-medium mb-4">Bookings by Service</h3>
                <div className="bg-neutral-lightest p-4 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-neutral-medium mx-auto mb-4" />
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-primary-dark mr-2"></span>
                        <span>Standard (40%)</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-primary mr-2"></span>
                        <span>Premium (45%)</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-primary-light mr-2"></span>
                        <span>Complete (15%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Revenue Over Time */}
              <div>
                <h3 className="font-medium mb-4">Revenue Over Time</h3>
                <div className="bg-neutral-lightest p-4 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart4 className="h-12 w-12 text-neutral-medium mx-auto mb-4" />
                    <div className="w-full h-32 relative">
                      <div className="absolute bottom-0 left-0 w-full h-px bg-neutral-medium"></div>
                      <div className="absolute left-0 h-full w-px bg-neutral-medium"></div>
                      <div className="absolute bottom-0 left-0 w-full h-full flex items-end">
                        <div className="w-1/6 h-12 bg-primary opacity-70 mx-1"></div>
                        <div className="w-1/6 h-16 bg-primary opacity-70 mx-1"></div>
                        <div className="w-1/6 h-20 bg-primary opacity-70 mx-1"></div>
                        <div className="w-1/6 h-24 bg-primary opacity-70 mx-1"></div>
                        <div className="w-1/6 h-28 bg-primary opacity-70 mx-1"></div>
                        <div className="w-1/6 h-32 bg-primary opacity-70 mx-1"></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-medium mt-2">
                      <span>January</span>
                      <span>February</span>
                      <span>March</span>
                      <span>April</span>
                      <span>May</span>
                      <span>June</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
