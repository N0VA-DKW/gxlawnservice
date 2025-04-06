import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface HeroSectionProps {
  onBookNowClick: () => void;
}

export function HeroSection({ onBookNowClick }: HeroSectionProps) {
  return (
    <section className="relative bg-primary-dark text-white">
      <div className="absolute inset-0 bg-black opacity-30"></div>
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Automated Lawn Mowing at Your Convenience
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Book our smart robotic mowers to keep your lawn perfectly trimmed without lifting a finger.
          </p>
          <Button
            onClick={onBookNowClick}
            className="bg-white text-primary-dark hover:bg-neutral-lightest font-medium py-3 px-6 rounded-lg"
          >
            Book Your Service
          </Button>
        </div>
      </div>
    </section>
  );
}
