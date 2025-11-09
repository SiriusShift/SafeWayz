import { useEffect, useState } from "react";
import { useGetReportsQuery } from "@/features/reports/api/reportsApi";
import { Report, ReportsState } from "@/types/types";
import { fetchGeocodeData } from "@/utils/map/getGeolocationDetails";

export const useReportFetcher = () => {
  const { data, isLoading } = useGetReportsQuery({});
  const [reports, setReports] = useState<ReportsState>({
    latestReports: [],
    pastReports: [],
  });

  useEffect(() => {
    if (!data) return;

    const fetchData = async () => {
      try {
        const geocodedReports = await Promise.all(
          data?.data.latestReports?.map(async (report: Report) => {
            // const response = await fetch(
            //   `https://maps.googleapis.com/maps/api/geocode/json?latlng=${report.latitude
            //   },${report.longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_API
            //   }`
            // );
            // const result = await response.json();
            // console.log(result, "fetched result")
            const location = await fetchGeocodeData(report || []);
            console.log(location, "location fetched")
            return {
              ...report,
              street: location.street,
              barangay: location.barangay,
              city: location.city,
            };
          })
        );
        
        console.log(geocodedReports, 'geocoded reports')

        setReports({
          latestReports: [...geocodedReports],
          pastReports: [...data?.data?.pastReports],
        });
      } catch (error) {
        console.error("Error fetching geocode data:", error);
      }
    };

    fetchData();
  }, [data]);

  return { reports, isLoading, setReports };
};
