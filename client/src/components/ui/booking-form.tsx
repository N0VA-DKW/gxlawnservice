import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { insertBookingSchema, InsertBooking } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const services = [
  {
    id: "standard",
    title: "Standard Mowing",
    description: "Basic lawn mowing service",
    price: 49,
  },
  {
    id: "premium",
    title: "Premium Mowing",
    description: "Enhanced service with edge trimming",
    price: 79,
  },
  {
    id: "complete",
    title: "Complete Lawn Care",
    description: "Comprehensive service package",
    price: 119,
  },
];

const lawnConditions = [
  { value: "good", label: "Good - Regular maintenance" },
  { value: "fair", label: "Fair - Occasional maintenance" },
  { value: "poor", label: "Poor - Needs significant work" },
];

const timeSlots = [
  { value: "morning", label: "Morning (8am - 11am)" },
  { value: "afternoon", label: "Afternoon (12pm - 3pm)" },
  { value: "evening", label: "Evening (4pm - 7pm)" },
];

// Extend the insert schema with additional validations
const bookingFormSchema = insertBookingSchema.extend({
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

// Merge the insert type with our custom fields
type BookingFormValues = InsertBooking & {
  termsAccepted: boolean;
};

export function BookingForm() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      zipCode: "",
      serviceType: "standard",
      lawnSize: 1000,
      lawnCondition: "good",
      obstacles: "",
      serviceDate: format(new Date(), "yyyy-MM-dd"),
      serviceTime: "morning",
      price: 49,
      termsAccepted: false,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: InsertBooking) => {
      const res = await apiRequest("POST", "/api/bookings", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Booking Successful",
        description: "Your lawn mowing service has been scheduled.",
      });
      setLocation(`/booking-confirmation/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function handleServiceChange(value: string) {
    const service = services.find(s => s.id === value);
    if (service) {
      form.setValue("serviceType", value);
      form.setValue("price", service.price);
    }
  }

  function onSubmit(data: BookingFormValues) {
    // Remove the terms field as it's not part of the API model
    const { termsAccepted, ...bookingData } = data;
    mutate(bookingData);
  }

  function nextStep() {
    setStep(step + 1);
  }

  function prevStep() {
    setStep(step - 1);
  }

  return (
    <div className="max-w-2xl mx-auto bg-neutral-lightest rounded-lg shadow-md p-6">
      {/* Step 1: Service Selection */}
      {step === 1 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">1. Select Your Service</h3>
          <Form {...form}>
            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={(value) => handleServiceChange(value)}
                      className="space-y-4 mb-6"
                    >
                      {services.map((service) => (
                        <div
                          key={service.id}
                          className="flex items-start p-4 border rounded-lg cursor-pointer hover:border-primary transition duration-300"
                        >
                          <RadioGroupItem value={service.id} id={service.id} className="mt-1" />
                          <Label htmlFor={service.id} className="ml-3 cursor-pointer">
                            <span className="font-medium block">{service.title}</span>
                            <span className="text-sm text-neutral-dark">{service.description}</span>
                            <span className="block text-primary-dark font-medium mt-1">${service.price}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
          <div className="text-right">
            <Button onClick={nextStep} className="bg-primary hover:bg-primary-dark text-white">
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Lawn Information */}
      {step === 2 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">2. Lawn Information</h3>
          <Form {...form}>
            <div className="space-y-4 mb-6">
              <FormField
                control={form.control}
                name="lawnSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lawn Size (sq ft)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 5000"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lawnCondition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lawn Condition</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lawn condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {lawnConditions.map((condition) => (
                          <SelectItem key={condition.value} value={condition.value}>
                            {condition.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="obstacles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Any obstacles to note?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Trees, garden beds, playground equipment, etc."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
          <div className="flex justify-between">
            <Button
              onClick={prevStep}
              variant="outline"
              className="border border-primary text-primary hover:bg-primary-light hover:text-white"
            >
              Back
            </Button>
            <Button onClick={nextStep} className="bg-primary hover:bg-primary-dark text-white">
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Date & Time */}
      {step === 3 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">3. Select Date & Time</h3>
          <Form {...form}>
            <div className="space-y-4 mb-6">
              <FormField
                control={form.control}
                name="serviceDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Service Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(field.value)}
                          onSelect={(date) => field.onChange(format(date || new Date(), "yyyy-MM-dd"))}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Time</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot.value} value={slot.value}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-neutral-light p-4 rounded-lg text-sm">
                <p>
                  Our robotic mowers work quietly and can operate in most weather conditions.
                  We'll contact you if rescheduling is necessary due to severe weather.
                </p>
              </div>
            </div>
          </Form>
          <div className="flex justify-between">
            <Button
              onClick={prevStep}
              variant="outline"
              className="border border-primary text-primary hover:bg-primary-light hover:text-white"
            >
              Back
            </Button>
            <Button onClick={nextStep} className="bg-primary hover:bg-primary-dark text-white">
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Contact Information */}
      {step === 4 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">4. Your Information</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(123) 456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Street Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="ZIP Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I agree to the <a href="#" className="text-primary">Terms of Service</a> and{" "}
                        <a href="#" className="text-primary">Privacy Policy</a>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  onClick={prevStep}
                  variant="outline"
                  className="border border-primary text-primary hover:bg-primary-light hover:text-white"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white"
                  disabled={isPending}
                >
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Complete Booking
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
