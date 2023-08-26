'use client';

import { useRef } from "react";
import { useMap } from "../hooks/useMap";
import useSwr from "swr";
import { fetcher } from "../utils/http";
import { Route } from "../utils/models";

function DriverPage() {

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useMap(mapContainerRef);

  const {data: routes, error, isLoading} = useSwr<Route[]>('http://localhost:3000/routes', fetcher, {

    fallbackData: []
  });

  const startRoute = async () => {
      
      const routeId = (document.getElementById("route") as HTMLSelectElement).value;
      const response = await fetch(`http://localhost:3000/routes/${routeId}`);
      const route: Route = await response.json();
      map?.removeAllRoutes();
      await map?.addRouteWithIcons({

        routeId: routeId,
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

      const {steps} = route.directions.routes[0].legs[0];

      for(const step of steps){

        await sleep(2000)
        map?.moveCar(routeId, step.start_location)

        await sleep(2000)
        map?.moveCar(routeId, step.end_location)

      }
  }

  return (
    <div className="flex flex-row h-full w-full">
      <div>
        <h1>Minha viagem</h1>
        <div className="flex flex-col">
          <select id="route">
              {isLoading && <option>Carregando rotas...</option>}
              {routes!.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name}
                </option>
              ))}
          </select>
          <button onClick={startRoute}>Iniciar a viagem</button>
        </div>
        
      </div>
      <div ref={mapContainerRef} className="h-full w-full" id="map"></div>
    </div>
  );
}

export default DriverPage;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));