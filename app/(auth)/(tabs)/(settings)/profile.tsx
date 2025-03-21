import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import StyledView from "@/components/StyledView";
import defaultImage from "@/assets/images/default.png";
import { useAuth } from "@/context/authContext";
import { Controller, useForm } from "react-hook-form";
import { profileFormSchema } from "@/schema/schema";
import { yupResolver } from "@hookform/resolvers/yup";
import * as ImagePicker from "expo-image-picker";
import { useSnackbar } from "@/hooks/useSnackbar";
import { Ionicons } from "@expo/vector-icons";
import { Button, TextInput, useTheme } from "react-native-paper";
import StyledText from "@/components/StyledText";
import { useUpdateUserDetailsMutation } from "@/features/user/api/userApi";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

const profile = () => {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const theme = useTheme();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid, isDirty },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(profileFormSchema.schema),
    defaultValues: profileFormSchema.defaultValues,
  });

  console.log(watch());

  const [updateProfile, { isLoading }] = useUpdateUserDetailsMutation();

  useEffect(() => {
    if (user) {
      setValue("fullname", user.name);
      setValue("username", user.username);
      setValue("email", user.email);
    }
  }, [user]);

  const onSubmit = async (data: any) => {
    console.log("onSubmit!");
    try{
      const response = await updateProfile({...data, ...(data.profile && {profile: data.profile.base64})}).unwrap();
      showSnackbar("Profile updated successfully!", 3000, "success");
      updateUser(response);
      router.push("/(auth)/(tabs)/(settings)");
    }catch(err){
      console.log(err)
    }
  };

  const pickImage = async (onChange) => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showSnackbar(
        "Permission Denied, Allow access to photos to upload an image.",
        3000,
        "danger"
      );
      return;
    }

    // Open image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      base64: true,
      aspect: [1, 1], // Square crop
      quality: 1,
    });

    if (!result.canceled) {
      const img = {
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
      };
      onChange(img);
    }
  };

  return (
    <StyledView style={{ flex: 1 }}>
      <View className="w-full h-32 flex justify-center items-center">
        <Controller
          name="profile"
          control={control}
          render={({ field: { value, onChange } }) => (
            <TouchableOpacity
              onPress={() => pickImage(onChange)}
              className="relative"
            >
              <Image
                source={
                  value?.uri
                    ? { uri: value.uri } // Selected image
                    : user?.profileImg
                    ? { uri: user.profileImg } // Existing profile image
                    : defaultImage // Default image
                }
                className="w-20 h-20 rounded-full"
              />
              <View
                className="absolute bottom-0 right-0 p-1 rounded-full"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <Ionicons name="pencil" size={16} color="white" />
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
      <View className="flex flex-col mx-5">
        <StyledText className="font-bold">Basic Detail</StyledText>
        <View className="flex flex-col gap-3 mt-5">
          <Controller
            name="fullname"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Full Name"
                mode="outlined"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Email"
                mode="outlined"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
              />
            )}
          />
          <Controller
            name="username"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Username"
                mode="outlined"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
              />
            )}
          />
          <Button
            style={{ borderRadius: 5 }}
            contentStyle={{ flexDirection: "row-reverse" }}
            icon={"arrow-right"}
            mode="contained-tonal"
            disabled={isDirty}
          >
            Change Password
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            style={{ borderRadius: 5 }}
            disabled={!isDirty || isLoading || !isValid}
          >
            {!isLoading && "Submit"}
          </Button>
        </View>
      </View>
    </StyledView>
  );
};

const styles = StyleSheet.create({
  submitContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
});

export default profile;
