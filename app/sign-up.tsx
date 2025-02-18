import {
  View,
  Text,
  TouchableWithoutFeedback,
  Image,
  Keyboard,
} from "react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signUpSchema } from "@/schema/schema";
import Logo from "@/assets/images/location.png";
import { Button, TextInput } from "react-native-paper";
import { Link, useNavigation } from "expo-router";
// import { encryptString } from "@/utils/customFunction";
import { usePostSignupMutation } from "@/features/authentication/api/signupApi";
import {BASE_URL} from '@env'


const signUp = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const navigate = useNavigation()

  console.log(BASE_URL);

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(signUpSchema.schema),
    defaultValues: signUpSchema.defaultValues,
  });

  const [signupTrigger, {isLoading}] = usePostSignupMutation();
  
  console.log(errors);

  const onSubmit = async () => {
    const data = watch() || {}; // Get form data
    console.log(data); // Log the form data to ensure it's correct
    // const encryptedPassword = encryptString(getValues('password'));
    // console.log(encryptedPassword)
    try {
      const response = await signupTrigger(data).unwrap();

      console.log(response);

    } catch (error) {
      console.error("Error:", error); // Handle errors such as network issues
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View className="flex-1 justify-center items-center w-full gap-y-5 bg-white">
        {/* Logo */}
        <Image source={Logo} style={{ height: 70, width: 70 }} />

        {/* Welcome Text */}
        <Text className="text-3xl font-bold">Create an account</Text>

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
            <Text style={{ color: "red" }}>
              {errors.confirmPassword.message}
            </Text>
          )}
        </View>

        {/* Sign In Button */}
        <Button mode="contained" className="w-5/6 mt-4" onPress={onSubmit}>
          Sign Up
        </Button>
        <Text>
          Already have an account?{" "}
          <Link className="font-bold" href="/sign-in">
            Sign In
          </Link>
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default signUp;