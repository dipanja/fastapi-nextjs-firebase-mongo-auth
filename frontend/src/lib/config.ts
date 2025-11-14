// src/lib/config.ts

/**
 * Determines the FastAPI backend base URL dynamically based on
 * where the frontend and backend are running.
 *
 * BACKEND_RUNNING_ON and FRONTEND_RUNNING_ON must be set in .env.local
 */

export type EnvType = "local" | "cloud";

const FRONTEND_RUNNING_ON =
  (process.env.NEXT_PUBLIC_FRONTEND_RUNNING_ON as EnvType) || "local";
const BACKEND_RUNNING_ON =
  (process.env.NEXT_PUBLIC_BACKEND_RUNNING_ON as EnvType) || "local";

const BACKEND_URL_LOCAL =
  process.env.NEXT_PUBLIC_BACKEND_URL_LOCAL || "http://localhost:8000";
const BACKEND_URL_CLOUD = process.env.NEXT_PUBLIC_BACKEND_URL_CLOUD!;

/**
 * Returns the correct FastAPI backend base URL based on the combination
 * of FRONTEND_RUNNING_ON and BACKEND_RUNNING_ON.
 */
export const getBackendBaseUrl = (): string => {
  if (BACKEND_RUNNING_ON === "local") {
    console.info(`[Config] Frontend=${FRONTEND_RUNNING_ON}, Backend=local`);
    return BACKEND_URL_LOCAL;
  }

  if (BACKEND_RUNNING_ON === "cloud") {
    console.info(`[Config] Frontend=${FRONTEND_RUNNING_ON}, Backend=cloud`);
    return BACKEND_URL_CLOUD;
  }

  console.warn(
    "[Config] Unexpected backend config, defaulting to local backend",
  );
  return BACKEND_URL_LOCAL;
};

/**
 * Logs startup summary for clarity.
 */
export const logEnvironmentSummary = () => {
  console.info("========== Environment Summary ==========");
  console.info("Frontend running on:", FRONTEND_RUNNING_ON);
  console.info("Backend running on:", BACKEND_RUNNING_ON);
  console.info("Backend URL Local:", BACKEND_URL_LOCAL);
  console.info("Backend URL Cloud:", BACKEND_URL_CLOUD);
  console.info("Active Backend Base URL:", getBackendBaseUrl());
  console.info("=========================================");
};
