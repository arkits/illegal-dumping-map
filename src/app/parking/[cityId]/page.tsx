import ParkingCityPageLayout from "@/components/ParkingCityPageLayout";
import { getParkingCityConfig, PARKING_CITIES, ParkingCityId } from "@/lib/parking-citations";
import { notFound } from "next/navigation";

interface ParkingCityPageProps {
  params: Promise<{
    cityId: string;
  }>;
}

// Map URL slugs to city IDs
function getCityIdFromSlug(slug: string): ParkingCityId | null {
  const slugToCityId: Record<string, ParkingCityId> = {
    "oakland": "oakland",
    "san-francisco": "sanfrancisco",
    "los-angeles": "losangeles",
  };
  
  return slugToCityId[slug] || null;
}

export default async function ParkingCityPage({ params }: ParkingCityPageProps) {
  const { cityId: cityIdSlug } = await params;
  const cityId = getCityIdFromSlug(cityIdSlug);
  
  if (!cityId || !(cityId in PARKING_CITIES)) {
    notFound();
  }

  const city = getParkingCityConfig(cityId);

  return <ParkingCityPageLayout cityId={cityId} city={city} />;
}
