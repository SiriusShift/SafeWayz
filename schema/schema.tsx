import * as yup from "yup";

export const loginSchema = {
  schema: yup.object().shape({
    username: yup.string().required("Username is required"),
    password: yup.string().required("Password is required"),
  }),
  defaultValues: {
    username: "",
    password: "",
  },
};

export const signUpSchema = {
  schema: yup.object().shape({
    fullname: yup.string().required("First name is required"),
    username: yup.string().required("Username is required"),
    email: yup.string().email("Email is invalid").required("Email is required"),
    password: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: yup
      .string()
      .required("Confirm Password is required")
      .oneOf([yup.ref("password")], "Passwords must match"),
  }),
  defaultValues: {
    fullname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
};

export const forgotPasswordSchema = {
  schema: yup.object().shape({
    email: yup.string().email("Email is invalid").required("Email is required"),
  }),
  defaultValues: {
    email: "",
  },
};

export const resetPasswordSchema = {
  schema: yup.object().shape({
    code: yup.number().required("OTP is required"),
    password: yup.string().required("Password is required").min(8, "Password must be at least 8 characters"),
    confirmPassword: yup.string().required("Confirm Password is required").oneOf([yup.ref("password")], "Passwords must match"),
  })
}

export const verifyCodeSchema = {
  schema: yup.object().shape({
    code: yup.number().required("OTP is required"),
  }),
  defaultValues: {
    code: ""
  }
}

export const reportFormSchema = {
  schema: yup.object().shape({
    type: yup.string().required("Type is required"),
    severity: yup.string().required("Severity is required"),
    description: yup.string().required("Description is required"),
    date: yup.date().required("Date is required"),
    casualty: yup.number().required("Casualty is required"),
    notified: yup.boolean().required("Notified is required"),
  }),
  defaultValues: {
    type: "",
    severity: "",
    description: "",
    date: new Date(),
    vehiclesNum: 0,
    notified: false
  }
}

export const profileFormSchema = {
  schema: yup.object().shape({
    fullname: yup.string().required("Full name is required"),
    // profile: yup.object().required("Profile is required"),
    username: yup.string().required("Username is required"),
    email: yup.string().email("Email is invalid").required("Email is required"),
  }),
  defaultValues: {
    fullname: "",
    // profile: "",
    username: "",
    email: "",
  }
}

export const changePasswordSchema = {
  schema: yup.object().shape({
    oldPassword: yup.string().required("Old Password is required"),
    password: yup.string().required("Password is required").min(8, "Password must be at least 8 characters"),
    confirmPassword: yup.string().required("Confirm Password is required").oneOf([yup.ref("password")], "Passwords must match"),
  }),
  defaultValues: {
    oldPassword: "",
    password: "",
    confirmPassword: "",
  }
}