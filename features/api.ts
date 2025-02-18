import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "@env";

export const api = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
      baseUrl: process.env.BASE_URL,
      prepareHeaders: (headers) => {
        headers.set("Accept", "application/json");
        return headers; // Ensure headers are returned
      },
      credentials: "include", // Include credentials such as cookies
      fetchFn: async (url, options) => {
        console.log("Making request to:", url);
        console.log("Request options:", options);
        return fetch(url, options);
      },
    }),
    endpoints: () => ({})
  });

