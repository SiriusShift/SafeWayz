import {
  View,
  Text,
  TouchableWithoutFeedback,
  Image,
  Keyboard,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signUpSchema } from "@/schema/schema";
import Logo from "@/assets/images/location.png";
import { Button, TextInput, useTheme } from "react-native-paper";
import { Link, useNavigation } from "expo-router";
// import { encryptString } from "@/utils/customFunction";
import { usePostSignupMutation } from "@/features/authentication/api/authApi";
import { useDispatch } from "react-redux";
import StyledText from "@/components/StyledText";
import StyledView from "@/components/StyledView";
import { useSnackbar } from "@/hooks/useSnackbar";
import { useAuth } from "@/context/authContext";
import AuthLayout from "@/components/AuthLayout";

const signUp = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const dispatch = useDispatch();
  const { register } = useAuth();
  const { showSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(signUpSchema.schema),
    defaultValues: signUpSchema.defaultValues,
  });

  const [signupTrigger, { isLoading }] = usePostSignupMutation();

  console.log(errors);

  const onSubmit = async () => {
    const data = watch() || {}; // Get form data
    console.log(data); // Log the form data to ensure it's correct
    // const encryptedPassword = encryptString(getValues('password'));
    // console.log(encryptedPassword)
    try {
      const response = await signupTrigger({
        fullname: data.fullname,
        username: data.username,
        password: data.password,
        email: data.email,
      }).unwrap();
      register(response);

      showSnackbar("Signup Successful!", 3000, "success");
    } catch (error) {
      showSnackbar(
        error?.data?.message || "Signup Failed. Please Try Again",
        3000,
        "danger"
      );
    }
  };

  return (
    <AuthLayout>
      <Image source={Logo} style={{ height: 70, width: 70 }} />

      {/* Welcome Text */}
      <StyledText className="text-3xl font-bold">Create an account</StyledText>
      {/* Input Fields */}
      <View className="w-5/6 gap-y-3">
        <Controller
          control={control}
          name="fullname"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Full Name"
              mode="outlined"
              error={!!errors.fullname}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Email"
              mode="outlined"
              error={!!errors.email}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Username"
              mode="outlined"
              error={!!errors.username}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.username && (
          <Text style={{ color: "red" }}>{errors.username.message}</Text>
        )}

        {/* <TextInput mode="outlined" label="Username" /> */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="Password"
              secureTextEntry={!passwordVisible} // Toggle visibility
              right={
                <TextInput.Icon
                  icon={passwordVisible ? "eye-off" : "eye"} // Change icon dynamically
                  onPress={() => setPasswordVisible(!passwordVisible)} // Toggle state
                />
              }
              error={!!errors.password}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.password && (
          <Text style={{ color: "red" }}>{errors.password.message}</Text>
        )}
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="Confirm Password"
              secureTextEntry={!confirmVisible} // Toggle visibility
              right={
                <TextInput.Icon
                  icon={confirmVisible ? "eye-off" : "eye"} // Change icon dynamically
                  onPress={() => setConfirmVisible(!confirmVisible)} // Toggle state
                />
              }
              error={!!errors.confirmPassword}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.confirmPassword && (
          <Text style={{ color: "red" }}>{errors.confirmPassword.message}</Text>
        )}
      </View>

      {/* Sign In Button */}
      <Button
        mode="contained"
        loading={isLoading}
        className="w-5/6 mt-4"
        disabled={!isValid || isLoading}
        onPress={onSubmit}
      >
        {isLoading ? "" : "Sign Up"}
      </Button>
      <StyledText>
        Already have an account?{" "}
        <Link className="font-bold" href="/sign-in">
          Sign In
        </Link>
      </StyledText>
    </AuthLayout>
  );
};

export default signUp;
