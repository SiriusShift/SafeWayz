import React, { createContext, useContext, useEffect, useState } from "react";
import { socket } from "@/socket";
import { useReportFetcher } from "@/hooks/useReportFetcher"; // update path if needed
import { useDispatch } from "react-redux";
// import { reportsApi } from "@/features/reports/api/reportsApi";
import { fetchGeocodeData } from "@/utils/map/getGeolocationDetails";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { reports, isLoading, setReports } = useReportFetcher();
  const [latestReport, setLatestReport] = useState(reports);
  console.log(latestReport);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleNewReport = async (data) => {
      console.log("Received from socket:", data);

      try {
        const geocoded = await fetchGeocodeData(data);

        // setReports((prev) => [geocoded, ...prev]); // prepend to reports
        setLatestReport((prev) => [geocoded, ...prev]);
        // dispatch(reportsApi.util.invalidateTags(["Table Report"]));
      } catch (error) {
        console.error("Error geocoding socket data:", error);
      }
    };

    socket.on("new_report", handleNewReport);
    socket.on("test_event", (data) => {
      console.log("Received test event:", data);
    });

    return () => {
      socket.off("new_report", handleNewReport);
      socket.off("test_event");
    };
  }, [setReports]);

  useEffect(() =>{
    setLatestReport(reports);
  }, [reports])

  return (
    <SocketContext.Provider value={{ isLoading, latestReport }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);