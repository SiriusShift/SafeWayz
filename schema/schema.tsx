import * as yup from "yup"

export const loginSchema = {
    schema: yup.object().shape({
        username: yup.string().required("Username is required"),
        password: yup.string().required("Password is required")
    }),
    defaultValues: {
        username: "",
        password: ""
    }
}

export const signUpSchema = {   
    schema: yup.object().shape({
        fullname: yup.string().required("First name is required"),
        username: yup.string().required("Username is required"),
        password: yup.string().required("Password is required").min(8, "Password must be at least 8 characters"),
        confirmPassword: yup.string().required("Confirm Password is required").oneOf([yup.ref("password")], "Passwords must match")
    }),
    defaultValues: {
        fullname: "",
        username: "",
        password: "",
        confirmPassword: ""
    }
}