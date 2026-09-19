import { useAuth } from "@clerk/expo";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";

import { apiFetch } from "@/lib/api";

// Registers this device for push notifications and saves the token on
// the signed-in user's row (PATCH /api/me). Every failure path here is
// silent-by-design, never a thrown error the app has to handle: a push
// token is a nice-to-have, not something a ride flow should ever break
// over. The biggest expected "failure" isn't a bug — this project has
// no EAS projectId configured yet (no eas.json, nothing under
// app.json's extra.eas), which getExpoPushTokenAsync requires. Until
// `eas init` is run once, this hook logs why it's skipping and does
// nothing further; it starts working the moment a projectId exists,
// with no code changes needed here.
export function useRegisterPushToken() {
  const { isSignedIn, getToken } = useAuth();
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!isSignedIn || registeredRef.current) return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      console.log(
        "[push] skipping registration — no EAS projectId configured (run `eas init` to enable push notifications)",
      );
      return;
    }

    if (!Device.isDevice) {
      console.log("[push] skipping registration — simulators/emulators can't receive real pushes");
      return;
    }

    registeredRef.current = true;

    (async () => {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          console.log("[push] permission denied");
          return;
        }

        const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
        const token = await getToken();

        await apiFetch("/api/me", token, {
          method: "PATCH",
          body: JSON.stringify({ expoPushToken }),
        });
      } catch (err) {
        console.error("[push] registration failed:", err);
      }
    })();
  }, [isSignedIn, getToken]);
}
