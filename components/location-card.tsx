import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Phone, MapPin, Navigation, Star } from "lucide-react";
import type { McDonalds, UserLocation, DirectionStep } from "@/types";
import { calculateDistance } from "@/lib/location-service";

interface LocationCardProps {
  location: McDonalds;
  userLocation: UserLocation | null;
  directions: DirectionStep[];
}

export default function LocationCard({
  location,
  userLocation,
  directions,
}: LocationCardProps) {
  const distance = userLocation
    ? calculateDistance(
        userLocation.lat,
        userLocation.lng,
        location.lat,
        location.lng
      )
    : 0;

  const isOpen = () => {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= 6 && currentHour < 23; // Assuming 6 AM - 11 PM
  };

  return (
    <Card className="border-red-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-red-600">{location.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4" />
              {location.address}
            </CardDescription>
          </div>
          <Badge variant={isOpen() ? "default" : "secondary"} className="ml-2">
            {isOpen() ? "Open" : "Closed"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">
              {distance.toFixed(2)} km away
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">{location.rating}/5.0</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-green-500" />
          <span className="text-sm">{location.hours}</span>
        </div>

        {location.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{location.phone}</span>
          </div>
        )}

        {directions.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm mb-2">Directions:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {directions.slice(0, 3).map((step, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-600 flex items-start gap-2"
                >
                  <span className="bg-red-100 text-red-600 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{step.instruction}</span>
                </div>
              ))}
              {directions.length > 3 && (
                <div className="text-xs text-gray-400">
                  +{directions.length - 3} more steps...
                </div>
              )}
            </div>
          </div>
        )}

        <Button className="w-full bg-red-600 hover:bg-red-700">
          <Navigation className="w-4 h-4 mr-2" />
          Get Directions
        </Button>
      </CardContent>
    </Card>
  );
}
