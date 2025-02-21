import {
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useState } from "react";
import Logo from "@/assets/images/location.png";
import { useForm, Controller } from "react-hook-form";
import { Button, TextInput, useTheme } from "react-native-paper";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link } from "expo-router";
import { loginSchema } from "@/schema/schema";
import StyledText from "@/components/StyledText";
import StyledView from "@/components/StyledView";
import { useSnackbar } from "@/hooks/useSnackbar";
import { usePostSigninMutation } from "@/features/authentication/api/authApi";
import { useAuth } from "@/context/authContext";
const signIn = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const {showSnackbar} = useSnackbar();
  const {login} = useAuth();
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(loginSchema.schema),
    defaultValues: loginSchema.defaultValues,
  });

  const [loginTrigger, {isLoading}] = usePostSigninMutation();

  const onSubmit = async () => {
    const data = watch() || {}; // Get form data
    try{
      const response = await loginTrigger(data).unwrap();
      login(response);
      showSnackbar("Login Successful!", 3000, "success");
    }catch(err){
      showSnackbar(err?.data?.message || "Login Failed. Please Try Again", 3000, "danger");
    }
  };

  console.log(watch())

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <StyledView className="flex-1 justify-center items-center w-full gap-y-5">
        {/* Logo */}
        <Image source={Logo} style={{ height: 70, width: 70 }} />

        {/* Welcome Text */}
        <StyledText className="text-3xl font-bold">Welcome back!</StyledText>

        {/* Input Fields */}
        <View className="w-5/6 gap-y-3">
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

        </View>

        {/* Sign In Button */}
        <Button
          mode="contained"
          className="w-5/6 mt-4"
          onPress={() => onSubmit()}
        >
          Sign In
        </Button>
        <StyledText>
          Don't have an account?{" "}
          <Link className="font-bold" href="/sign-up">
            Sign Up
          </Link>
        </StyledText>
      </StyledView>
    </TouchableWithoutFeedback>
  );
};

export default signIn;
