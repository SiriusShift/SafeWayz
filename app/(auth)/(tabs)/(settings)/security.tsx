import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import React, { useState } from "react";
import StyledView from "@/components/StyledView";
import StyledText from "@/components/StyledText";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { changePasswordSchema } from "@/schema/schema";
import { Button, TextInput, useTheme } from "react-native-paper";
import { usePatchPasswordMutation } from "@/features/user/api/userApi";
import { useSnackbar } from "@/hooks/useSnackbar";
import { useRouter } from "expo-router";

const Security = () => {

  //States
  const [focusedField, setFocusedField] = useState(null);
  const [visibility, setVisibility] = useState({
    oldPassword: false,
    password: false,
    confirmPassword: false,
  });

  // HOOKS
  const {showSnackbar} = useSnackbar();
  const router = useRouter();
  const theme = useTheme();


  // React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(changePasswordSchema.schema),
    defaultValues: changePasswordSchema.defaultValues,
  });

  console.log(errors?.oldPassword?.message);

  //RTK QUERY
  const [triggerSubmit, {isLoading}] = usePatchPasswordMutation();

  // FUNCTIONS
  const onSubmit = async (data: Object) => {
    try{
      await triggerSubmit({
        password: data?.oldPassword,
        newPassword: data?.password
      }).unwrap();
      showSnackbar("Password changed successfully!", 3000, "success");
      router.push("/(auth)/(tabs)/(settings)");
    }catch(err){
      console.log(err);
      showSnackbar("Failed to change password", 3000, "danger");
    }
  };

  const getRightIcon = (fieldName) =>
    focusedField === fieldName ? (
      <TextInput.Icon
        icon={visibility[fieldName] ? "eye-off-outline" : "eye-outline"}
        onPress={() =>
          setVisibility((prev) => ({
            ...prev,
            [fieldName]: !prev[fieldName],
          }))
        }
      />
    ) : null;

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    <StyledView className="flex-1 flex justify-between pb-[62px] gap-2 flex-col">
      <View className="px-5 gap-2">
        <StyledText className="text-2xl font-bold">Change Password</StyledText>
        <StyledText className="mb-3">
          Password length must be at least 8 characters
        </StyledText>

        <Controller
          control={control}
          name="oldPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
            <TextInput
              label="Old Password"
              mode="outlined"
              secureTextEntry={!visibility.oldPassword}
              right={getRightIcon("oldPassword")}
              onFocus={() => setFocusedField("oldPassword")}
              onBlur={() => {
                onBlur();
                setFocusedField(null);
              }}
              error={!!errors.oldPassword}
              onChangeText={onChange}
              value={value}
            />
            {errors.oldPassword && (
              <StyledText className="text-red-500">
                {errors?.oldPassword?.message}
              </StyledText>
            )}
            </>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
            <TextInput
              label="Password"
              mode="outlined"
              secureTextEntry={!visibility.password}
              right={getRightIcon("password")}
              onFocus={() => setFocusedField("password")}
              onBlur={() => {
                onBlur();
                setFocusedField(null);
              }}
              error={!!errors.password}
              onChangeText={onChange}
              value={value}
            />
            {errors.password && (
              <StyledText className="text-red-500">
                {errors?.password?.message}
              </StyledText>
            )}
            </>
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
            <TextInput
              label="Retype new password"
              mode="outlined"
              secureTextEntry={!visibility.confirmPassword}
              right={getRightIcon("confirmPassword")}
              onFocus={() => setFocusedField("confirmPassword")}
              onBlur={() => {
                onBlur();
                setFocusedField(null);
              }}
              error={!!errors.confirmPassword}
              onChangeText={onChange}
              value={value}
            />
            {errors.confirmPassword && (
              <StyledText className="text-red-500">
                {errors?.confirmPassword?.message}
              </StyledText>
            )}
            </>
          )}
        />
      </View>

      <View className="w-full h-20 items-center justify-center">
        <Button
          mode="contained"
          className="w-[350px]"
          disabled={!isValid || isLoading}
          loading={isLoading}
          onPress={handleSubmit(onSubmit)}
        >
          {isLoading ? "Submitting..." : "Change Password"}
        </Button>
      </View>
    </StyledView>
    </TouchableWithoutFeedback>
  );
};

export default Security;
