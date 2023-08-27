'use client';

import { useEffect, useRef } from "react";
import { useMap } from "../hooks/useMap";
import { Route } from "../utils/models";
import { socket } from "../utils/socket-io";

function AdminPage() {

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useMap(mapContainerRef);

  useEffect(() => {

    socket.connect();

    socket.on('admin-new-points', async (data: {routeId: string, lat: number; lng: number}) => {

      if(!map?.hasRoute(data.routeId)){

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/routes/${data.routeId}`);
        const route: Route = await response.json();
        map?.removeRoute(data.routeId);
        await map?.addRouteWithIcons({

          routeId: data.routeId,
          startMarkerOptions: {
            position: route.directions.routes[0].legs[0].start_location
          },
          endMarkerOptions: {
            position: route.directions.routes[0].legs[0].end_location
          },
          carMarkerOptions: {
            position: route.directions.routes[0].legs[0].start_location
          }
        });

      } 

      map?.moveCar(data.routeId, {

        lat: data.lat,
        lng: data.lng
      })
    })

    return () => {

      socket.disconnect();
    };

  }, [map]);

  return (
    <div className="flex flex-row h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full" id="map"></div>
    </div>
  );
}

export default AdminPage;