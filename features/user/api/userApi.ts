import { api } from "@/features/api";

const userApi = api.enhanceEndpoints({ addTagTypes: ["User"] }).injectEndpoints({
    endpoints: (builder) => ({
        updateUserDetails: builder.mutation({
            query: (body) => ({
                url: "/updateUserDetails",
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["User"],
        })
    }),
});

export const { useUpdateUserDetailsMutation } = userApi;