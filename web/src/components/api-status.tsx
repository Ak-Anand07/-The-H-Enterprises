"use client";

import { useEffect, useState } from "react";
import styles from "../app/page.module.css";

type ApiHealth = {
  status: string;
  service: string;
  timestamp: string;
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:3032";

export function ApiStatus() {
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadHealth = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/health`, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`API responded with ${response.status}`);
        }

        const data = (await response.json()) as ApiHealth;

        if (!cancelled) {
          setHealth(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to reach API");
        }
      }
    };

    loadHealth();

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className={styles.statusCard}>
        <p className={styles.statusLabel}>Backend connection</p>
        <h2>API unavailable</h2>
        <p className={styles.statusText}>
          Start the backend with <code>npm.cmd run dev</code> in <code>apps/api</code>.
        </p>
        <p className={styles.statusError}>{error}</p>
      </div>
    );
  }

  if (!health) {
    return (
      <div className={styles.statusCard}>
        <p className={styles.statusLabel}>Backend connection</p>
        <h2>Checking API status...</h2>
        <p className={styles.statusText}>Calling <code>{apiBaseUrl}/health</code></p>
      </div>
    );
  }

  return (
    <div className={styles.statusCard}>
      <p className={styles.statusLabel}>Backend connection</p>
      <h2>API connected</h2>
      <p className={styles.statusText}>
        Service <strong>{health.service}</strong> responded with status{" "}
        <strong>{health.status}</strong>.
      </p>
      <p className={styles.statusMeta}>
        Last response: {new Date(health.timestamp).toLocaleString()}
      </p>
    </div>
  );
}
