import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import React from "react";
import {
  Appbar,
  Button,
  SegmentedButtons,
  Switch,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { reportFormSchema } from "@/schema/schema";
import { yupResolver } from "@hookform/resolvers/yup";
import StyledText from "@/components/StyledText";
import { useDispatch, useSelector } from "react-redux";
import { useCreateReportMutation } from "@/features/reports/api/reportsApi";
import { clearCamera } from "@/features/reports/reducers/reportsSlice";
import { Dropdown } from "react-native-element-dropdown";

const ReportForm = () => {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();
  const reportImages = useSelector((state: any) => state.reports);
  const location = useSelector((state: any) => state.user.location);
  
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(reportFormSchema.schema),
    defaultValues: reportFormSchema.defaultValues,
  });

  const [triggerReport, { isLoading }] = useCreateReportMutation();

  console.log(watch());
  const onSubmit = async (data: Object) => {
    console.log(data);
    const transformImage = {
      ...data,
      backImage: reportImages.backCamera.base64,
      frontImage: reportImages.frontCamera.base64,
      lat: location.latitude,
      lng: location.longitude,
    };
    console.log("submit report", transformImage);
    try {
      await triggerReport(transformImage).unwrap();
      dispatch(clearCamera());
      router.push("/(auth)/(tabs)");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Appbar.Header
          style={{ backgroundColor: theme?.dark ? "#000" : "#fff" }}
          className="flex justify-between"
        >
          <Appbar.BackAction
            onPress={() => router.replace("/(auth)/(reports)")}
          />
          <Appbar.Content titleStyle={{ fontSize: 20 }} title="Report Form" />
        </Appbar.Header>

        <View className="flex-1 px-5 pb-16">
          {/* Form Fields */}
          <View className="gap-5">
            {/* Severity Selection */}
            <Controller
              name="severity"
              control={control}
              render={({ field: { onChange, value } }) => (
                <SegmentedButtons
                  value={value}
                  onValueChange={onChange}
                  buttons={[
                    {
                      label: "Low",
                      value: "low",
                      style:
                        value === "low"
                          ? { backgroundColor: theme.colors.primary }
                          : {},
                      labelStyle: value === "low" ? { color: "white" } : {},
                    },
                    {
                      label: "Medium",
                      value: "medium",
                      style:
                        value === "medium"
                          ? { backgroundColor: theme.colors.primary }
                          : {},
                      labelStyle: value === "medium" ? { color: "white" } : {},
                    },
                    {
                      label: "High",
                      value: "high",
                      style:
                        value === "high"
                          ? { backgroundColor: theme.colors.primary }
                          : {},
                      labelStyle: value === "high" ? { color: "white" } : {},
                    },
                  ]}
                />
              )}
            />

            <View>
              <StyledText>Accident Type</StyledText>
              <Controller
                name="type"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Dropdown
                    data={[
                      { title: "Collision" },
                      { title: "Hit and run" },
                      { title: "Overturned vehicle" },
                      { title: "Road obstruction" },
                      { title: "Other" },
                    ]}
                    labelField="title"
                    valueField="title"
                    placeholder="Select type"
                    value={value}
                    onChange={(item) => onChange(item.title)}
                    style={{
                      backgroundColor: theme.colors.background,
                      borderWidth: 1,
                      borderColor: theme.colors.onSurface,
                      padding: 10,
                      borderRadius: 5,
                    }}
                    containerStyle={{
                      borderRadius: 8,
                      overflow: "hidden",
                      borderWidth: 1,
                      borderColor: theme.colors.onSurface,
                    }}
                    itemContainerStyle={{
                      backgroundColor: theme.colors.background,
                    }}
                    itemTextStyle={{
                      color: theme.colors.onSurface,
                    }}
                    placeholderStyle={{
                      color: theme.colors.onSurfaceVariant,
                    }}
                    activeColor={theme.dark ? "#505050" : "#6e6e6e"}
                    selectedTextStyle={{
                      color: theme.colors.onSurface,
                    }}
                    maxHeight={220} // Ensures dropdown only shows 4 items before scrolling
                    flatListProps={{
                      scrollEnabled: true, // Enables scrolling if there are more than 4 items
                      nestedScrollEnabled: true, // Ensures smooth scrolling inside dropdown
                    }}
                  />
                )}
              />
            </View>

            {watch().type === "Other" && (
              <View>
                <StyledText>Other Accident Type</StyledText>
                <Controller
                  name="otherType"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      mode="outlined"
                      value={value}
                      onChangeText={onChange}
                      placeholder="Enter other accident type"
                      style={{ height: 45 }}
                    />
                  )}
                />
              </View>
            )}

            {/* Number of Vehicles Involved */}
            <View>
              <StyledText>Number of Vehicles Involved</StyledText>
              <Controller
                name="vehiclesNum"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    mode="outlined"
                    value={value ? value.toString() : ""}
                    onChangeText={(text) =>
                      onChange(text.replace(/[^0-9]/g, ""))
                    }
                    placeholder="Enter number of vehicles"
                    keyboardType="numeric"
                    style={{ height: 45 }}
                  />
                )}
              />
            </View>
            <View>
              <StyledText>Description</StyledText>
              <Controller
                name="description"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    mode="outlined"
                    numberOfLines={10}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Enter description"
                    multiline
                    style={{ height: 200, textAlignVertical: "top" }}
                  />
                )}
              />
            </View>

            {/* Injuries & Reported Toggles */}
            <View className="flex flex-row justify-between">
              <View className="flex flex-row items-center">
                <StyledText>Injuries</StyledText>
                <Controller
                  name="injuries"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Switch value={value || false} onValueChange={onChange} />
                  )}
                />
              </View>
              <View className="flex flex-row items-center">
                <StyledText>Notified</StyledText>
                <Controller
                  name="notified"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Switch value={value || false} onValueChange={onChange} />
                  )}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Sticky Submit Button */}
        <View
          style={[
            styles.submitContainer,
            { backgroundColor: theme.dark ? "#000" : "#fff" },
          ]}
        >
          <Button
            mode="contained"
            disabled={!isValid || isLoading}
            loading={isLoading}
            onPress={handleSubmit(onSubmit)}
          >
            {isLoading ? null : "Submit"}
          </Button>
        </View>
      </View>
    </TouchableWithoutFeedback>
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

export default ReportForm;
