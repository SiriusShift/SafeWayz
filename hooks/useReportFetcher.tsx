import { useEffect, useState } from "react";
import { useGetReportsQuery } from "@/features/reports/api/reportsApi";
import { Report, ReportsState } from "@/types/types";
import { extractLocationDetails } from "@/utils/customFunction";

export const useReportFetcher = () => {
  const { data, isLoading } = useGetReportsQuery({});
  const [reports, setReports] = useState<ReportsState>({
    latestReports: [],
    pastReports: [],
  });

  useEffect(() => {
    if (!data) return;

    const fetchGeocodeData = async () => {
      try {
        const geocodedReports = await Promise.all(
          data?.data.latestReports?.map(async (report: Report) => {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${data.latitude},${data.longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`
            );
            const result = await response.json();
            const location = extractLocationDetails(result?.results || []);
            return {
              ...report,
              street: location.street,
              barangay: location.barangay,
              city: location.city,
            };
          })
        );

        setReports({
          latestReports: [...geocodedReports],
          pastReports: [...data?.data?.pastReports],
        });
      } catch (error) {
        console.error("Error fetching geocode data:", error);
      }
    };

    fetchGeocodeData();
  }, [data]);

  return { reports, isLoading, setReports };
};
