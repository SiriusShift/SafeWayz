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

    postVerifyEmail : builder.mutation({
      query: (body) => ({
        url: "/verify-email",
        method: "POST",
        body,
      })
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
    }),

    postSendResetCode: builder.mutation({
      query: (body) => ({
        url: "/forgot-password",
        method: "POST",
        body,
      }),
    }),

    postResetPassword: builder.mutation({
      query: (body) => ({
        url: "/reset-password",
        method: "POST",
        body,
      })
    })
  }),
});
export const {
  usePostSignupMutation,
  usePostSigninMutation,
  usePostLogoutMutation,
  usePostSendResetCodeMutation,
  usePostResetPasswordMutation,
  usePostVerifyEmailMutation
} = authApi;
