// import { View, Text, StyleSheet } from "react-native";
// import React from "react";
// import { Appbar, SegmentedButtons, useTheme } from "react-native-paper";
// import { useRouter } from "expo-router";
// import { Controller, useForm } from "react-hook-form";
// import { reportFormSchema } from "@/schema/schema";
// import { yupResolver } from "@hookform/resolvers/yup";
// import StyledText from "@/components/StyledText";
// import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";

// const form = () => {
//   const theme = useTheme();
//   const router = useRouter();
//   const {
//     control,
//     handleSubmit,
//     watch,
//     formState: { errors, isValid },
//   } = useForm({
//     mode: "onChange",
//     resolver: yupResolver(reportFormSchema.schema),
//     defaultValues: reportFormSchema.defaultValues,
//   });

//   console.log(watch());
//   return (
//     <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
//       <Appbar.Header
//         style={{ backgroundColor: theme?.dark ? "#000" : "#fff" }}
//         className="flex justify-between"
//       >
//         <Appbar.BackAction
//           onPress={() => router.replace("/(auth)/(reports)")}
//         />
//         <Appbar.Content titleStyle={{ fontSize: 20 }} title="Report Form" />
//       </Appbar.Header>
//       <View className="px-5 gap-5">
//         <Controller
//           name="severity"
//           control={control}
//           render={({ field: { onChange, value } }) => (
//             <SegmentedButtons
//               value={value}
//               onValueChange={onChange}
//               buttons={[
//                 {
//                   label: "Low",
//                   value: "low",
//                   style:
//                     value === "low"
//                       ? { backgroundColor: theme.colors.primary }
//                       : {},
//                   labelStyle: value === "low" ? { color: "white" } : {},
//                 },
//                 {
//                   label: "Medium",
//                   value: "medium",
//                   style:
//                     value === "medium"
//                       ? { backgroundColor: theme.colors.primary }
//                       : {},
//                   labelStyle: value === "medium" ? { color: "white" } : {},
//                 },
//                 {
//                   label: "High",
//                   value: "high",
//                   style:
//                     value === "high"
//                       ? { backgroundColor: theme.colors.primary }
//                       : {},
//                   labelStyle: value === "high" ? { color: "white" } : {},
//                 },
//               ]}
//             />
//           )}
//         />
//         <View>
//           <StyledText>Accident Type</StyledText>
//           <Controller
//             name="type"
//             control={control}
//             render={({ field: { onChange, value } }) => (
//               <AutocompleteDropdown
//                 clearOnFocus={false}
//                 closeOnBlur={true}
//                 closeOnSubmit={false}
//                 inputContainerStyle={{
//                   backgroundColor: theme.colors.background,
//                   borderWidth: 0.5,
//                   borderColor: theme.colors.onSurface,
//                 }}
//                 initialValue={{ id: value, title: value }} // Ensure it shows selected value
//                 dataSet={[
//                   { id: "1", title: "Collision" },
//                   { id: "2", title: "Hit and run" },
//                   { id: "3", title: "Overturned vehicle" },
//                   { id: "4", title: "Road obstruction" },
//                   { id: "5", title: "Other" },
//                 ]}
//                 textInputProps={{ placeholder: "Select type" }}
//                 onSelectItem={(item) => {
//                   onChange(item ? item : ""); // Update form value
//                 }}
//               />
//             )}
//           />
//         </View>
//       </View>
//     </View>
//   );
// };

// export default form;
