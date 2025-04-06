import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, MapPin, Menu, X } from "lucide-react";

interface SiteHeaderProps {
  onBookNowClick?: () => void;
  isAdmin?: boolean;
}

export function SiteHeader({ onBookNowClick, isAdmin = false }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/");
      },
    });
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <MapPin className="w-8 h-8 text-primary" />
          <span className="font-bold text-xl text-primary-dark">
            RoboMow
            {isAdmin && <span className="text-sm font-normal ml-1">Admin</span>}
          </span>
        </Link>

        {!isAdmin ? (
          <>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-neutral-dark hover:text-primary-dark font-medium">
                Home
              </Link>
              <a href="#services" className="text-neutral-dark hover:text-primary-dark font-medium">
                Services
              </a>
              <a href="#how-it-works" className="text-neutral-dark hover:text-primary-dark font-medium">
                How It Works
              </a>
              <a href="#testimonials" className="text-neutral-dark hover:text-primary-dark font-medium">
                Testimonials
              </a>
              <a href="#contact" className="text-neutral-dark hover:text-primary-dark font-medium">
                Contact
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              {user?.isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => setLocation("/admin/dashboard")}
                  className="text-primary border-primary hover:bg-primary hover:text-white"
                >
                  Admin Dashboard
                </Button>
              )}
              <Button
                onClick={onBookNowClick}
                className="bg-primary hover:bg-primary-dark text-white"
              >
                Book Now
              </Button>
            </div>

            <button
              onClick={toggleMobileMenu}
              className="md:hidden text-neutral-dark focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Mobile menu */}
            {mobileMenuOpen && (
              <div className="md:hidden absolute top-0 left-0 w-full bg-white z-50 px-4 py-5 shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <Link href="/" className="flex items-center space-x-2">
                    <MapPin className="w-8 h-8 text-primary" />
                    <span className="font-bold text-xl text-primary-dark">RoboMow</span>
                  </Link>
                  <button onClick={toggleMobileMenu} className="text-neutral-dark focus:outline-none">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <nav className="flex flex-col space-y-4 mb-6">
                  <Link
                    href="/"
                    className="text-neutral-dark hover:text-primary-dark font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <a
                    href="#services"
                    className="text-neutral-dark hover:text-primary-dark font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Services
                  </a>
                  <a
                    href="#how-it-works"
                    className="text-neutral-dark hover:text-primary-dark font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    How It Works
                  </a>
                  <a
                    href="#testimonials"
                    className="text-neutral-dark hover:text-primary-dark font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Testimonials
                  </a>
                  <a
                    href="#contact"
                    className="text-neutral-dark hover:text-primary-dark font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </a>
                </nav>

                <Button
                  onClick={() => {
                    if (onBookNowClick) onBookNowClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-primary hover:bg-primary-dark text-white"
                >
                  Book Now
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <span className="text-neutral-dark">Admin User: {user?.username}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5 text-neutral-dark hover:text-status-error" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
