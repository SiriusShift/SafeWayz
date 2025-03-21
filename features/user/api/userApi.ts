import { api } from "@/features/api";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const userApi = api.enhanceEndpoints({ addTagTypes: ["User"] }).injectEndpoints({
    endpoints: (builder) => ({
        updateUserDetails: builder.mutation({
            query: (body) => ({
                url: "/updateUserDetails",
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["User"],
        }),
        getUserDetails: builder.query({
            query: () => ({
                url: "/getUserDetails",
                method: "GET",
            }),
            providesTags: ["User"],
        })
    }),
});

export const { useUpdateUserDetailsMutation, useLazyGetUserDetailsQuery } = userApi;