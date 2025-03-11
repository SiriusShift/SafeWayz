import { View, Text, Image } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthLayout from "@/components/AuthLayout";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { forgotPasswordSchema } from "@/schema/schema";
import { Button, TextInput } from "react-native-paper";
import { usePostSendResetCodeMutation } from "@/features/authentication/api/authApi";
import StyledText from "@/components/StyledText";
import Logo from "@/assets/images/wrong-password.png";

const ForgotPassword = () => {
  const [passwordSent, setPasswordSent] = useState(false);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(forgotPasswordSchema.schema),
    defaultValues: forgotPasswordSchema.defaultValues,
  });

  const onSubmit = (data) => {
    triggerSend(data.email).unwrap();
    setPasswordSent(true);
  };

  const [triggerSend, { isLoading }] = usePostSendResetCodeMutation();
  return (
    <>
      {passwordSent ? (
        <AuthLayout>
          <Image source={Logo} style={{ height: 70, width: 70 }} />
          <StyledText className="text-3xl font-bold">
            Forgot Password
          </StyledText>
          <View className="w-5/6 gap-y-3">
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
          </View>
          {/* Sign In Button */}
          <Button
            disabled={!isValid}
            mode="contained"
            className="w-5/6 mt-4"
            loading={isLoading}
            onPress={handleSubmit(onSubmit)}
          >
            {isLoading ? "" : "Reset Password"}
          </Button>
        </AuthLayout>
      ) : (
        <AuthLayout>
          <Image source={Logo} style={{ height: 70, width: 70 }} />
          <StyledText className="text-3xl font-bold">
            Reset Password
          </StyledText>
          <View className="w-5/6 gap-y-3">
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
          </View>
          {/* Sign In Button */}
          <Button
            disabled={!isValid}
            mode="contained"
            className="w-5/6 mt-4"
            loading={isLoading}
            onPress={handleSubmit(onSubmit)}
          >
            {isLoading ? "" : "Reset Password"}
          </Button>
        </AuthLayout>
      )}
    </>
  );
};

export default ForgotPassword;
