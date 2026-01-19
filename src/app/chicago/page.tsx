"use client";

import CityPageLayout from "@/components/CityPageLayout";
import { getCityConfig } from "@/lib/utils";

export default function ChicagoPage() {
  const cityId = "chicago";
  const city = getCityConfig(cityId);

  return <CityPageLayout cityId={cityId} city={city} />;
}
