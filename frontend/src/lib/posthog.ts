let posthogPromise: Promise<typeof import("posthog-js")> | null = null;

const posthogKey = import.meta.env.VITE_POSTHOG_KEY;

async function getPostHog() {
  if (!import.meta.env.PROD || !posthogKey) {
    return null;
  }

  if (!posthogPromise) {
    posthogPromise = import("posthog-js");

    const { default: posthog } = await posthogPromise;

    posthog.init(posthogKey, {
      api_host: import.meta.env.VITE_POSTHOG_HOST,
      person_profiles: "identified_only",
    });
  }

  const { default: posthog } = await posthogPromise;
  return posthog;
}

export async function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
) {
  const posthog = await getPostHog();

  if (!posthog) return;

  posthog.capture(eventName, properties);
}

export async function identify(
  userId: string,
  properties?: Record<string, unknown>
) {
  const posthog = await getPostHog();

  if (!posthog) return;

  posthog.identify(userId, properties);
}

export async function reset() {
  const posthog = await getPostHog();

  if (!posthog) return;

  posthog.reset();
}