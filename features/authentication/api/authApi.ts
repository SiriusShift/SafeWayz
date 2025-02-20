import { api } from "@/features/api";
const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    postSignup: builder.mutation({
      query: (body) => ({
        url: "/sign-up",
        method: "POST",
        body,
      }),
    }),

    postSignin: builder.mutation({
      query: (body) => ({
        url: "/sign-in",
        method: "POST",
        body,
      }),
    })
  }),
});
export const { usePostSignupMutation, usePostSigninMutation } = authApi;
