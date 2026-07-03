import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // React Strict Mode double-invokes effects in dev (mount → unmount → mount)
  // to surface side-effect bugs. Here it just makes mount-triggered animations
  // (slot open, stamp landing, etc.) play twice in dev — a false alarm that
  // doesn't happen in prod. Turn it off so dev matches production behaviour.
  reactStrictMode: false,

  // Pin the workspace root — a parent-level lockfile exists on this machine and
  // Next would otherwise infer the wrong root.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
