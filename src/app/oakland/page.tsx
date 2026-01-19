"use client";

import CityPageLayout from "@/components/CityPageLayout";
import { getCityConfig } from "@/lib/utils";

export default function OaklandPage() {
  const cityId = "oakland";
  const city = getCityConfig(cityId);

  return <CityPageLayout cityId={cityId} city={city} />;
}
