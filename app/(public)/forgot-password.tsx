import { View, Text, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthLayout from "@/components/AuthLayout";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { forgotPasswordSchema, resetPasswordSchema } from "@/schema/schema";
import { Button, TextInput } from "react-native-paper";
import { usePostSendResetCodeMutation } from "@/features/authentication/api/authApi";
import StyledText from "@/components/StyledText";
import LottieView from "lottie-react-native";
import Logo from "@/assets/images/wrong-password.png";
import successAnimation from "@/assets/animations/success.json";
import emailAnimation from "@/assets/lottie/email.json";

const ForgotPassword = () => {
  const [step, setStep] = useState("email"); // 'email' -> 'animation' -> 'reset'

  const {
    control,
    handleSubmit,
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

  const [triggerSend, { isLoading }] = usePostSendResetCodeMutation();

  const onSubmitEmail = async (data) => {
    try {
      await triggerSend(data.email).unwrap();
      setStep("animation");
      setTimeout(() => {
        setStep("reset");
      }, 2500); // 2.5 seconds animation
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmitReset = (data) => {
    console.log("Reset Password Data:", data);
    // Add logic to send the reset code, new password to backend
  };

  if (step === "animation") {
    return (
      <View className="flex-1 justify-center items-center bg-white">
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
              name="newPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  label="New Password"
                  secureTextEntry
                  error={!!errors.newPassword}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </>
        )}
      </View>

      <Button
        disabled={!isValid}
        mode="contained"
        className="w-5/6 mt-4"
        loading={isLoading}
        onPress={handleSubmit(step === "email" ? onSubmitEmail : onSubmitReset)}
      >
        {isLoading
          ? ""
          : step === "email"
          ? "Send Reset Code"
          : "Reset Password"}
      </Button>
    </AuthLayout>
  );
};

export default ForgotPassword;
