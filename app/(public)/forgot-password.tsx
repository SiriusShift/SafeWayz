import { View, Text, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthLayout from "@/components/AuthLayout";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { forgotPasswordSchema, resetPasswordSchema } from "@/schema/schema";
import { Button, TextInput, useTheme } from "react-native-paper";
import {
  usePostResetPasswordMutation,
  usePostSendResetCodeMutation,
} from "@/features/authentication/api/authApi";
import StyledText from "@/components/StyledText";
import LottieView from "lottie-react-native";
import Logo from "@/assets/images/wrong-password.png";
import emailAnimation from "@/assets/lottie/email.json";
import { useSnackbar } from "@/hooks/useSnackbar";
import { useRouter } from "expo-router";

const ForgotPassword = () => {
  const [step, setStep] = useState("email"); // 'email' -> 'animation' -> 'reset'
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [resendTimer, setResendTimer] = useState(0); // Timer for resend code
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const theme = useTheme();
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(
      step === "email"
        ? forgotPasswordSchema.schema
        : resetPasswordSchema.schema
    ),
    defaultValues:
      step === "email"
        ? forgotPasswordSchema.defaultValues
        : resetPasswordSchema.defaultValues,
  });

  console.log(watch());
  console.log(resendTimer);

  useEffect(() => {
    let interval;
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

  const [triggerSend, { isLoading }] = usePostSendResetCodeMutation();
  const [triggerReset, { isLoading: resetLoading }] =
    usePostResetPasswordMutation();

  const onSubmitEmail = async (data: Object) => {
    try {
      await triggerSend(data).unwrap();
      if (step === "email") {
        setStep("animation");
        setTimeout(() => {
          setStep("reset");
        }, 4000); // 2.5 seconds animation
      }
      startResendTimer();
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmitReset = async (data: Object) => {
    console.log("Reset Password Data:", data.code);
    try {
      await triggerReset({
        password: data.password,
        confirmPassword: data.confirmPassword,
        code: watch().code,
      }).unwrap();
      reset();
      router.push("/sign-in");
      showSnackbar("Reset Password Successful!", 3000, "success");
    } catch (err) {
      showSnackbar(
        err?.data?.message || "Reset Password Failed. Please Try Again",
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
          Please check your inbox for the reset code.
        </StyledText>
      </View>
    );
  }

  return (
    <AuthLayout>
      <Image source={Logo} style={{ height: 70, width: 70 }} />
      <StyledText className="text-3xl font-bold">
        {step === "email" ? "Forgot Password" : "Reset Password"}
      </StyledText>

      <View className="w-5/6 gap-y-3">
        {step === "email" ? (
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                mode="outlined"
                label="Email"
                error={!!errors.email}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        ) : (
          <>
            <Controller
              control={control}
              name="code"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  label="Reset Code"
                  error={!!errors.code}
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
              <Text style={{ color: "red" }}>
                {errors.confirmPassword.message}
              </Text>
            )}
          </>
        )}
      </View>

      <Button
        disabled={!isValid || isLoading || resetLoading}
        mode="contained"
        className="w-5/6 mt-4"
        loading={isLoading || resetLoading}
        onPress={handleSubmit(step === "email" ? onSubmitEmail : onSubmitReset)}
      >
        {isLoading
          ? ""
          : step === "email"
          ? "Send Reset Code"
          : "Reset Password"}
      </Button>
       {step !== "email" && (
        <StyledText
          onPress={resendTimer === 0 ? onSubmitEmail : null}
          style={{
            color: resendTimer === 0 ? "red" : "gray",
          }}
        >
          {resendTimer > 0
            ? `Resend Code in ${resendTimer}s`
            : "Resend Code"}
        </StyledText>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
