// Plain-JS equivalent of d3.geoEquirectangular().fitSize([960, 480], {type:
// "Sphere"}) — kept dependency-free since this is the only place the app
// needs it. Must match whatever generated world-map-path.ts's viewBox/scale.
const MAP_WIDTH = 960;
const MAP_HEIGHT = 480;
const PROJECTION_SCALE = 152.78874536821954;
const PROJECTION_TRANSLATE: [number, number] = [480, 240];
const DEG_TO_RAD = Math.PI / 180;

export const WORLD_MAP_VIEWBOX = `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`;
export const WORLD_MAP_SIZE = { width: MAP_WIDTH, height: MAP_HEIGHT };

function project([lon, lat]: [number, number]): [number, number] {
  const x = lon * DEG_TO_RAD * PROJECTION_SCALE + PROJECTION_TRANSLATE[0];
  const y = -lat * DEG_TO_RAD * PROJECTION_SCALE + PROJECTION_TRANSLATE[1];
  return [x, y];
}

// Real coordinates for the cities OPR recipes currently come from. A
// location that isn't listed here simply gets no pin — never guess a
// coordinate to force one onto the map.
const CITY_COORDINATES: Record<string, [number, number]> = {
  birmingham: [-1.8904, 52.4862],
  "new malden": [-0.2577, 51.4025],
  swansea: [-3.9436, 51.6214],
  "new delhi": [77.209, 28.6139],
  maidenhead: [-0.7161, 51.522],
  lagos: [3.3792, 6.5244],
  guildford: [-0.5704, 51.2362],
};

export function coordinatesForLocation(location: string | null | undefined): [number, number] | null {
  if (!location) return null;
  const normalised = location.toLowerCase();
  const match = Object.keys(CITY_COORDINATES).find((city) => normalised.includes(city));
  return match ? project(CITY_COORDINATES[match]) : null;
}

export function percentPosition([x, y]: [number, number]): { left: string; top: string } {
  return { left: `${(x / MAP_WIDTH) * 100}%`, top: `${(y / MAP_HEIGHT) * 100}%` };
}
