import * as Location from "expo-location";
import { useEffect, useState } from "react";

export type Coords = { lat: number; lng: number };

// Shared by the Home top-bar label and the booking form's pickup
// pre-fill — same GPS permission + reverse-geocode, two call sites.
export function useCurrentLocation() {
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoading(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = position.coords;
      setCoords({ lat: latitude, lng: longitude });

      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (place) {
        const parts = [place.name, place.street, place.city].filter(Boolean);
        setAddress(parts.join(", "));
      }
      setLoading(false);
    })();
  }, []);

  return { address, setAddress, coords, loading };
}
