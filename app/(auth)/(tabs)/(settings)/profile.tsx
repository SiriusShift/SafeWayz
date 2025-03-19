import { View, Text, TouchableOpacity, Image } from "react-native";
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

const profile = () => {
  const { user } = useAuth();
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

  useEffect(() => {
    if (user) {
      setValue("fullname", user.name);
      setValue("username", user.username);
      setValue("email", user.email);
      setValue("profile", user.profileImg);
    }
  }, [user])

  console.log(watch());

  const onSubmit = (data: any) => {
    console.log(data);
  }

  const pickImage = async () => {
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
      aspect: [1, 1], // Square crop
      quality: 1,
    });

    if (!result.canceled) {
      setValue("profile", result.assets[0].uri);
    }
  };

  return (
    <StyledView style={{ flex: 1 }}>
      <View className="w-full h-32 flex justify-center items-center">
        <TouchableOpacity onPress={() => pickImage()} className="relative">
          <Image
            source={
              getValues("profile")
                ? { uri: getValues("profile") }
                : user?.profileImg
                ? { uri: user.profileImg }
                : defaultImage
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
          <Button style={{borderRadius: 5}} contentStyle={{flexDirection: "row-reverse"}} icon={"arrow-right"} mode="outlined" disabled={isDirty}>Change Password</Button>
          <Button mode="contained" onPress={handleSubmit(onSubmit)} style={{borderRadius: 5}}>Submit</Button>
        </View>
      </View>
    </StyledView>
  );
};

export default profile;