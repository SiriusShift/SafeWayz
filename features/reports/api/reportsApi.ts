import {api} from "@/features/api"
import { create } from "react-test-renderer";

const reportsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createReport: builder.mutation({
            query: (body) => ({
                url: "/reports/createReport",
                method: "POST",
                body,
            }),
        })
    }),
});

export const {useCreateReportMutation} = reportsApi