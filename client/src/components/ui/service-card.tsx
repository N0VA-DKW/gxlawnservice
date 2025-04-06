import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  price: number;
  features: string[];
  popular?: boolean;
  onBookNowClick: () => void;
}

export function ServiceCard({
  title,
  description,
  price,
  features,
  popular = false,
  onBookNowClick,
}: ServiceCardProps) {
  return (
    <Card className="overflow-hidden">
      {popular && (
        <div className="bg-primary-dark text-white py-1 px-3 text-center text-sm font-medium">
          MOST POPULAR
        </div>
      )}
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-neutral-dark mb-4">{description}</p>
        <ul className="mb-6 space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="w-5 h-5 text-primary mr-2" />
              {feature}
            </li>
          ))}
        </ul>
        <div className="text-center">
          <span className="block text-2xl font-bold text-primary-dark mb-2">From ${price}</span>
          <Button
            onClick={onBookNowClick}
            className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg w-full"
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
