import { useEffect, useState } from "react";
import { useGetReportsQuery } from "@/features/reports/api/reportsApi";
import { Report, ReportsState } from "@/types/types";

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
        
        setReports({
          latestReports: [...data?.data?.latestReports],
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
