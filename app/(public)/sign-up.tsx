import { View, Text, Image, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signUpSchema, verifyCodeSchema } from "@/schema/schema";
import Logo from "@/assets/images/location.png";
import { Button, TextInput, useTheme } from "react-native-paper";
import { Link } from "expo-router";
import {
  usePostSignupMutation,
  usePostVerifyEmailMutation,
} from "@/features/authentication/api/authApi";
import { useDispatch } from "react-redux";
import StyledText from "@/components/StyledText";
import LottieView from "lottie-react-native";
import emailAnimation from "@/assets/lottie/email.json";
import { useSnackbar } from "@/hooks/useSnackbar";
import { useAuth } from "@/context/authContext";
import AuthLayout from "@/components/AuthLayout";

const SignUp = () => {
  const [step, setStep] = useState("signup");
  const [resendTimer, setResendTimer] = useState(0); // Timer for resend code

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const dispatch = useDispatch();
  const theme = useTheme();
  const { register } = useAuth();
  const { showSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(
      step === "signup" ? signUpSchema.schema : verifyCodeSchema.schema
    ),
    defaultValues:
      step === "signup"
        ? signUpSchema.defaultValues
        : verifyCodeSchema.defaultValues,
  });

  console.log(watch());

  console.log(resendTimer);
  const [signupTrigger, { isLoading }] = usePostSignupMutation();
  const [verifyTrigger, { isLoading: verifyLoading }] =
    usePostVerifyEmailMutation();

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const startResendTimer = () => {
    setResendTimer(60); // Start 60-second countdown
  };

  const onSubmit = async (data) => {
    try {
      const user = await signupTrigger({
        email: data.email,
        code: String(data.code),
        password: data.password,
        fullname: data.fullname,
        username: data.username,
      }).unwrap();
      register(user);
      showSnackbar("Signup Successful!", 3000, "success");
      setStep("email"); // Proceed to email verification step
    } catch (error) {
      showSnackbar(
        error?.data?.message || "Signup Failed. Please Try Again",
        3000,
        "danger"
      );
    }
  };

  const verify = async (data) => {
    try {
      await verifyTrigger({
        email: data.email,
        username: data.username,
      }).unwrap();
      if (step === "signup") {
        setStep("animation");
        setTimeout(() => {
          setStep("reset");
        }, 4000); // 2.5 seconds animation
      }
      startResendTimer();
    } catch (error) {
      showSnackbar(
        error?.data?.message || "Verification Failed. Please Try Again",
        3000,
        "danger"
      );
    }
  };

  if (step === "animation") {
    return (
      <View className="flex-1 justify-center items-center" style={{backgroundColor: theme.colors.background}}>
        <LottieView
          source={emailAnimation}
          autoPlay
          loop={false}
          style={{ width: 200, height: 200 }}
        />
        <StyledText className="text-xl font-bold mt-4">Email Sent!</StyledText>
        <StyledText className="text-base text-center text-gray-600">
          Please check your inbox for the verification code.
        </StyledText>
      </View>
    );
  }

  return (
    <AuthLayout>
      <Image source={Logo} style={{ height: 70, width: 70 }} />
      <StyledText className="text-3xl font-bold">
        {step === "signup" ? "Create an account" : "Verify Email"}
      </StyledText>

      <View className="w-5/6 gap-y-3">
        {step === "signup" ? (
          <>
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
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Password"
                  mode="outlined"
                  secureTextEntry={!passwordVisible}
                  right={
                    <TextInput.Icon
                      icon={passwordVisible ? "eye-off" : "eye"}
                      onPress={() => setPasswordVisible(!passwordVisible)}
                    />
                  }
                  error={!!errors.password}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Confirm Password"
                  mode="outlined"
                  secureTextEntry={!confirmVisible}
                  right={
                    <TextInput.Icon
                      icon={confirmVisible ? "eye-off" : "eye"}
                      onPress={() => setConfirmVisible(!confirmVisible)}
                    />
                  }
                  error={!!errors.confirmPassword}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </>
        ) : (
          <Controller
            control={control}
            name="code"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Verification Code"
                mode="outlined"
                error={!!errors.code}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        )}
      </View>

      {step === "signup" ? (
        <Button
          disabled={!isValid || verifyLoading}
          mode="contained"
          className="w-5/6 mt-4"
          loading={verifyLoading}
          onPress={handleSubmit(verify)}
        >
          {verifyLoading ? "" : "Verify Email"}
        </Button>
      ) : (
        <Button
          disabled={!isValid || isLoading}
          mode="contained"
          className="w-5/6 mt-4"
          loading={isLoading}
          onPress={handleSubmit(onSubmit)}
        >
          {isLoading ? "" : "Verify Email"}
        </Button>
      )}

      {step === "signup" && (
        <StyledText>
          Already have an account?{" "}
          <Link className="font-bold" href="/sign-in">
            Sign In
          </Link>
        </StyledText>
      )}
      {step !== "signup" && (
        <StyledText
          onPress={resendTimer === 0 ? handleSubmit(verify) : null}
          style={{
            color: resendTimer === 0 ? "red" : "gray",
            marginTop: 5,
          }}
        >
          {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : "Resend Code"}
        </StyledText>
      )}
    </AuthLayout>
  );
};

export default SignUp;
