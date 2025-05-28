"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { Graph, Node, Edge } from "@/lib/graph";
import {
  findNearestMcDonalds,
  calculateDistance,
  getDirections,
} from "@/lib/location-service";
import type { McDonalds, UserLocation, DirectionStep } from "@/types";

import LocationCard from "@/components/location-card";
import MapComponent from "@/components/map-component";

export default function HomePage() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearestMcDonalds, setNearestMcDonalds] = useState<McDonalds | null>(
    null
  );
  const [allLocations, setAllLocations] = useState<McDonalds[]>([]);
  const [directions, setDirections] = useState<DirectionStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [graph, setGraph] = useState<Graph | null>(null);

  useEffect(() => {
    // Initialize graph with McDonald's locations
    initializeGraph();
  }, []);

  const initializeGraph = async () => {
    try {
      const response = await fetch("/api/mcdonalds-locations");
      const locations: McDonalds[] = await response.json();

      const newGraph = new Graph();

      // Add nodes for each McDonald's location
      locations.forEach((location) => {
        newGraph.addNode(
          new Node(location.id, location.lat, location.lng, location)
        );
      });

      // Add edges between nearby locations (within 5km)
      locations.forEach((location1) => {
        locations.forEach((location2) => {
          if (location1.id !== location2.id) {
            const distance = calculateDistance(
              location1.lat,
              location1.lng,
              location2.lat,
              location2.lng
            );
            if (distance <= 5) {
              // Connect locations within 5km
              newGraph.addEdge(new Edge(location1.id, location2.id, distance));
            }
          }
        });
      });

      setGraph(newGraph);
      setAllLocations(locations);
    } catch (err) {
      setError("Failed to initialize location data");
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setUserLocation(location);

        if (graph) {
          const nearest = findNearestMcDonalds(location, allLocations, graph);
          setNearestMcDonalds(nearest);

          if (nearest) {
            const directionSteps = await getDirections(location, nearest);
            setDirections(directionSteps);
          }
        }

        setLoading(false);
      },
      (error) => {
        setError("Unable to retrieve your location");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-600 mb-2">
            McDonald's Finder
          </h1>
          <p className="text-gray-600 text-lg">
            Find the nearest McDonald's using advanced graph algorithms
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Control Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location Services
                </CardTitle>
                <CardDescription>
                  Get your current location to find the nearest McDonald's
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={getCurrentLocation}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Finding Location...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 mr-2" />
                      Find Nearest McDonald&apos;s
                    </>
                  )}
                </Button>

                {error && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {userLocation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">
                    Your Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Latitude: {userLocation.lat.toFixed(6)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Longitude: {userLocation.lng.toFixed(6)}
                  </p>
                </CardContent>
              </Card>
            )}

            {nearestMcDonalds && (
              <LocationCard
                location={nearestMcDonalds}
                userLocation={userLocation}
                directions={directions}
              />
            )}
          </div>

          {/* Map */}
          <div className="lg:sticky lg:top-8">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle>Interactive Map</CardTitle>
                <CardDescription>
                  View McDonald&apos;s locations and optimal routes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-[520px]">
                <MapComponent
                  userLocation={userLocation}
                  nearestMcDonalds={nearestMcDonalds}
                  allLocations={allLocations}
                  directions={directions}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Algorithm Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Graph Theory Implementation</CardTitle>
            <CardDescription>
              This application uses advanced data structures and algorithms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800">Graph Structure</h3>
                <p className="text-sm text-blue-600 mt-2">
                  McDonald&apos;s locations as nodes, distances as weighted
                  edges
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800">
                  Dijkstra's Algorithm
                </h3>
                <p className="text-sm text-green-600 mt-2">
                  Finds shortest path between locations efficiently
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800">
                  Adjacency List
                </h3>
                <p className="text-sm text-purple-600 mt-2">
                  Optimized graph representation for fast lookups
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
