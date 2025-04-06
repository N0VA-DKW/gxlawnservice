import { useRef } from "react";
import { Check } from "lucide-react";
import { HeroSection } from "@/components/ui/hero-section";
import { ServiceCard } from "@/components/ui/service-card";
import { BookingForm } from "@/components/ui/booking-form";
import { TestimonialCard } from "@/components/ui/testimonial-card";
import { SiteHeader } from "@/components/ui/site-header";
import { SiteFooter } from "@/components/ui/site-footer";

export default function HomePage() {
  const bookingRef = useRef<HTMLDivElement>(null);

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const serviceFeatures = {
    standard: [
      "Even cutting height",
      "Mulching for lawn health",
      "Battery-powered operation",
    ],
    premium: [
      "All Standard features",
      "Edge trimming",
      "Pattern cutting options",
      "Clipping removal",
    ],
    complete: [
      "All Premium features",
      "Organic fertilization",
      "Weed spot treatment",
      "Lawn health assessment",
    ],
  };

  const testimonials = [
    {
      name: "John Davis",
      initials: "JD",
      rating: 5,
      text: "RoboMow has transformed my weekends! I no longer spend hours mowing my lawn. Their robotic service is efficient, quiet, and does a fantastic job. Highly recommend!",
    },
    {
      name: "Sarah Miller",
      initials: "SM",
      rating: 5,
      text: "The premium package is worth every penny. The lawn looks absolutely perfect with those neat edge trims. Booking was easy and the service was right on time. Will definitely continue using RoboMow!",
    },
    {
      name: "Robert Brown",
      initials: "RB",
      rating: 4.5,
      text: "I was skeptical about robotic mowing at first, but I'm impressed with the results. My lawn looks better than when I used to mow it myself. The booking process was straightforward and the staff was very helpful.",
    },
  ];

  return (
    <>
      <SiteHeader onBookNowClick={scrollToBooking} />

      <main>
        {/* Hero Section */}
        <HeroSection onBookNowClick={scrollToBooking} />

        {/* How It Works */}
        <section id="how-it-works" className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="bg-primary-light rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Book Online</h3>
                <p className="text-neutral-dark">
                  Select your service date, time, and lawn size through our simple booking form.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="bg-primary-light rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Robot Deployment</h3>
                <p className="text-neutral-dark">
                  Our technician brings and sets up the robotic mower at your property.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="bg-primary-light rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Enjoy Your Lawn</h3>
                <p className="text-neutral-dark">
                  Sit back and relax while our robot perfectly manicures your lawn.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="py-12 md:py-16 bg-neutral-lightest">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Service 1 */}
              <ServiceCard
                title="Standard Mowing"
                description="Perfect for regular maintenance of residential lawns."
                price={49}
                features={serviceFeatures.standard}
                onBookNowClick={scrollToBooking}
              />

              {/* Service 2 */}
              <ServiceCard
                title="Premium Mowing"
                description="Enhanced service with edge trimming and pattern cutting."
                price={79}
                features={serviceFeatures.premium}
                popular={true}
                onBookNowClick={scrollToBooking}
              />

              {/* Service 3 */}
              <ServiceCard
                title="Complete Lawn Care"
                description="Comprehensive service including fertilization and weed control."
                price={119}
                features={serviceFeatures.complete}
                onBookNowClick={scrollToBooking}
              />
            </div>
          </div>
        </section>

        {/* Booking Section */}
        <section id="booking" className="py-12 md:py-16 bg-white" ref={bookingRef}>
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Book Your Lawn Mowing Service
            </h2>
            <BookingForm />
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-12 md:py-16 bg-neutral-lightest">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              What Our Customers Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard
                  key={index}
                  name={testimonial.name}
                  initials={testimonial.initials}
                  rating={testimonial.rating}
                  text={testimonial.text}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <SiteFooter />
    </>
  );
}
