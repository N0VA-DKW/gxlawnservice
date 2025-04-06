import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
}

export function StatsCard({
  title,
  value,
  trend,
  icon: Icon,
  iconColor = "text-primary-dark",
  iconBgColor = "bg-primary-light bg-opacity-20",
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-neutral-dark font-medium">{title}</h2>
          <span className={`${iconBgColor} ${iconColor} p-2 rounded-full`}>
            <Icon className="w-5 h-5" />
          </span>
        </div>
        <p className="text-3xl font-bold">{value}</p>
        {trend && <p className="text-sm text-neutral-medium mt-2">{trend}</p>}
      </CardContent>
    </Card>
  );
}
