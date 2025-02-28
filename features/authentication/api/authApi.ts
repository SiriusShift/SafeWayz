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
    }),

    postLogout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    })
  }),
});
export const { usePostSignupMutation, usePostSigninMutation, usePostLogoutMutation } = authApi;
