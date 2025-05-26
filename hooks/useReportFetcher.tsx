import { useEffect, useState } from "react";
import { useGetReportsQuery } from "@/features/reports/api/reportsApi";

export const useReportFetcher = () => {
  const { data, isLoading } = useGetReportsQuery();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    if (!data) return;

    const fetchGeocodeData = async () => {
      try {
        const geocodedReports = await Promise.all(
          data?.data.map(async (report) => {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${
                report.longitude
              },${report.latitude}.json?access_token=${
                process.env.EXPO_PUBLIC_MAPBOX_KEY
              }`
            );
            const result = await response.json();
            return {
              ...report,
              street: result.features[0]?.text || "Unknown Location",
              barangay: result.features[0]?.context[1]?.text || "Unknown Barangay",
              city: result.features[0]?.context[2]?.text || "Unknown City",
            };
          })
        );

        console.log(geocodedReports)

        setReports(geocodedReports);
      } catch (error) {
        console.error("Error fetching geocode data:", error);
      }
    };

    fetchGeocodeData();
  }, [data]);

  return { reports, isLoading, setReports };
};