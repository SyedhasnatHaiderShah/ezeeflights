export const dynamic = "force-dynamic"; // @capacitor-dynamic-override @capacitor-build-toggle

import * as React from "react";
import { CityInsightsClient } from "./CityInsightsClient";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { internalV1Url } from "@/lib/bff/config";

export function generateStaticParams() {
  return [
    { slug: "dubai" },
    { slug: "abu-dhabi" },
    { slug: "paris" },
    { slug: "lyon" },
    { slug: "bangkok" },
    { slug: "phuket" },
  ];
}

function slugToDisplayName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function fetchCityInsights(slug: string, displayName: string) {
  const url = `${internalV1Url("ai/city-insights")}?${new URLSearchParams({
    city: displayName,
    slug,
  }).toString()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(
      err?.message ||
        "Unable to load live travel insights for this destination.",
    );
  }

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(
      json.message || "Unable to load live travel insights for this destination.",
    );
  }

  return json.data;
}

export default async function CityInsightsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  return <CityInsightsClient slug={slug} />;
}
