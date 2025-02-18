import { api } from "@/features/api";
const signupApi = api.injectEndpoints({
  endpoints: (builder) => ({
    postSignup: builder.mutation({
      query: (body) => ({
        url: "/sign-up",
        method: "POST",
        body,
      }),
    }),
  }),
});
export const { usePostSignupMutation } = signupApi;
