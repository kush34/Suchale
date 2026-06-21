import posthog from "posthog-js";

const posthogKey = import.meta.env.VITE_POSTHOG_KEY;

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: import.meta.env.VITE_POSTHOG_HOST,
    person_profiles: "identified_only",
  });
}

export const trackEvent = (
  eventName: string,
  properties?: Record<string, unknown>
) => {
  if (!posthogKey) return;
  posthog.capture(eventName, properties);
};

export default posthog;
