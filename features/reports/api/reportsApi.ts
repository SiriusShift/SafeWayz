import {api} from "@/features/api"

const reportsApi = api.enhanceEndpoints({addTagTypes: ['Report']}).injectEndpoints({
    endpoints: (builder) => ({
        createReport: builder.mutation({
            query: (body) => ({
                url: "/reports/createReport",
                method: "POST",
                body,
            }),
            invalidatesTags: ['Report'],
        }),
        getReports: builder.query({
            query: () => ({
                url: "/reports/getReports",
                method: "GET",
            }),
            providesTags: ['Report'],
        })
    }),
});

export const {useCreateReportMutation, useGetReportsQuery} = reportsApi