import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the Convex deployment URL
 * This can be used to construct callback URLs for external services
 */
export const getDeploymentUrl = query({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    // Try to get from environment variable first
    const convexUrl = process.env.CONVEX_URL;
    if (convexUrl) {
      return convexUrl.replace(/\/$/, "");
    }

    // Fallback: construct from deployment name if available
    const deploymentName = process.env.CONVEX_DEPLOYMENT;
    if (deploymentName) {
      return `https://${deploymentName}.convex.cloud`;
    }

    // If neither is available, throw an error
    throw new Error(
      "CONVEX_URL not set. Please set it in Convex Dashboard → Settings → Environment Variables"
    );
  },
});

