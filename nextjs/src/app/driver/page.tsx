'use client';

import { useEffect, useRef } from "react";
import { useMap } from "../hooks/useMap";
import useSwr from "swr";
import { fetcher } from "../utils/http";
import { Route } from "../utils/models";
import { socket } from "../utils/socket-io";
import { Button, NativeSelect, Typography } from "@mui/material";
import { RouteSelect } from "../components/RouteSelect";

function DriverPage() {

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useMap(mapContainerRef);

  useEffect(() => {

    socket.connect();

    return () => {

      socket.disconnect();
    };

  }, []);


  const startRoute = async () => {
      
      const routeId = (document.getElementById("route") as HTMLSelectElement).value;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/routes/${routeId}`);
      const route: Route = await response.json();
      console.log(route)
      map?.removeAllRoutes();
      await map?.addRouteWithIcons({

        routeId: routeId,
        startMarkerOptions: {
          position: route.directions?.routes[0].legs[0].start_location
        },
        endMarkerOptions: {
          position: route.directions?.routes[0].legs[0].end_location
        },
        carMarkerOptions: {
          position: route.directions?.routes[0].legs[0].start_location
        }
      });

      const {steps} = route.directions.routes[0].legs[0];

      for(const step of steps){

        await sleep(2000)
        map?.moveCar(routeId, step.start_location)
        socket.emit('new-points', {
          routeId,
          lat: step.start_location.lat,
          lng: step.start_location.lng,
        })

        await sleep(2000)
        map?.moveCar(routeId, step.end_location)
        socket.emit('new-points', {
          routeId,
          lat: step.end_location.lat,
          lng: step.end_location.lng,
        })

      }
  }

  return (
    <div className="flex flex-row h-full w-full">
      <div>
        <Typography sx={{mb: 3, textAlign: 'center'}} variant="h4">Minha viagem</Typography>
        <div className="flex flex-col">
          <RouteSelect id="route"/>
          <Button variant="text" onClick={startRoute}>Iniciar a viagem</Button>
        </div>
        
      </div>
      <div ref={mapContainerRef} className="h-full w-full" id="map"></div>
    </div>
  );
}

export default DriverPage;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));