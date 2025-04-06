import { Card, CardContent } from "@/components/ui/card";
import { Star, StarHalf } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  initials: string;
  rating: number;
  text: string;
}

export function TestimonialCard({ name, initials, rating, text }: TestimonialCardProps) {
  // Generate star rating elements
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="w-4 h-4 fill-current text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="w-4 h-4 fill-current text-yellow-400" />);
    }

    return stars;
  };

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className="mr-4">
            <div className="bg-primary-light rounded-full h-12 w-12 flex items-center justify-center text-white font-bold">
              {initials}
            </div>
          </div>
          <div>
            <h4 className="font-semibold">{name}</h4>
            <div className="flex text-yellow-400">
              {renderStars()}
            </div>
          </div>
        </div>
        <p className="text-neutral-dark">{text}</p>
      </CardContent>
    </Card>
  );
}
