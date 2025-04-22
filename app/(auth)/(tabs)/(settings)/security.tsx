import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import React, { useState } from "react";
import StyledView from "@/components/StyledView";
import StyledText from "@/components/StyledText";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { changePasswordSchema } from "@/schema/schema";
import { Button, TextInput } from "react-native-paper";

const Security = () => {
  const [focusedField, setFocusedField] = useState(null);
  const [visibility, setVisibility] = useState({
    oldPassword: false,
    password: false,
    confirmPassword: false,
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(changePasswordSchema.schema),
    defaultValues: changePasswordSchema.defaultValues,
  });

  const onSubmit = (data) => {
    console.log("Submitted data:", data);
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
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
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
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
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
          )}
        />
      </View>

      <View className="w-full h-20 border-t border-gray-500 items-center justify-center">
        <Button
          mode="contained"
          className="w-[350px]"
          disabled={!isValid}
          onPress={handleSubmit(onSubmit)}
        >
          Change Password
        </Button>
      </View>
    </StyledView>
    </TouchableWithoutFeedback>
  );
};

export default Security;
