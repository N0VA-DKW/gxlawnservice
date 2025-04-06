import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-primary-dark text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">RoboMow</h3>
            <p className="text-neutral-light">
              Automated lawn mowing services for a perfectly maintained yard, without the hassle.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-neutral-light hover:text-white transition duration-300">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-light hover:text-white transition duration-300">
                  Services
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-light hover:text-white transition duration-300">
                  Booking
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-light hover:text-white transition duration-300">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-light hover:text-white transition duration-300">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                <span className="text-neutral-light">(123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                <span className="text-neutral-light">info@robomow.com</span>
              </li>
              <li className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="text-neutral-light">
                  123 Green Street, Lawnville, LW 12345
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Newsletter</h3>
            <p className="text-neutral-light mb-2">
              Subscribe for updates and special offers
            </p>
            <form className="flex">
              <Input
                type="email"
                placeholder="Your email"
                className="rounded-l-lg w-full text-neutral-dark focus:outline-none rounded-r-none"
              />
              <Button className="bg-primary hover:bg-primary-light text-white rounded-l-none" size="icon">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
        <div className="border-t border-primary-light mt-8 pt-6 text-center text-sm text-neutral-light">
          <p>&copy; {new Date().getFullYear()} RoboMow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
