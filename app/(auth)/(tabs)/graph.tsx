import StyledText from "@/components/StyledText";
import { locationData, mode } from "@/utils/constants";
import { useState } from "react";
import { View, Text, Dimensions } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { SegmentedButtons, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart } from "react-native-gifted-charts";
import moment from "moment";
import { ScrollView } from "react-native-gesture-handler";
import { useGetReportsBarGraphQuery } from "@/features/reports/api/reportsApi";
import { formatMode } from "@/utils/customFunction";
import { date } from "yup";

const Graph = () => {
  const theme = useTheme();
  const [barangay, setBarangay] = useState("");
  const [dateMode, setDateMode] = useState({ name: "Daily", value: "day" });
  const [date, setDate] = useState({
    from: moment().startOf("day").toISOString(),
    to: moment().endOf("day").toISOString(),
  });

  const dateToday = {
    day: moment().format("hh:00 A"),
    week: moment().format("dddd"),
    month: moment().format("DD"),
    year: moment().format("YYYY"),
  };

  const handleModeChange = (mode: Object) => {
    if (mode?.value === "day") {
      setDate({
        from: moment().startOf("day").toISOString(),
        to: moment().endOf("day").toISOString(),
      });
    } else if (mode?.value === "week") {
      setDate({
        from: moment().startOf("week").toISOString(),
        to: moment().endOf("week").toISOString(),
      });
    } else if (mode?.value === "month") {
      setDate({
        from: moment().startOf("month").toISOString(),
        to: moment().endOf("month").toISOString(),
      });
    } else if (mode?.value === "year") {
      setDate({
        from: moment().startOf("year").subtract(12, "years").toISOString(),
        to: moment().endOf("year").toISOString(),
      });
    }
    setDateMode(mode);
  };

  // const barData = [
  //   { value: 230, label: "Mon", frontColor: theme.colors.onSurface },
  //   { value: 180, label: "Tue", frontColor: theme.colors.onSurface },
  //   { value: 195, label: "Wed", frontColor: theme.colors.onSurface },
  //   { value: 250, label: "Thu", frontColor: theme.colors.onSurface },
  //   { value: 320, label: "Fri", frontColor: theme.colors.primary },
  //   { value: 0, label: "Sat", frontColor: theme.colors.onSurface },
  //   { value: 0, label: "Sun", frontColor: theme.colors.onSurface },
  // ];

  let { data, isFetching } = useGetReportsBarGraphQuery({
    mode: dateMode.value,
    dateFrom: date?.from,
    dateTo: date?.to,
    location: barangay
  });

  const barData = data?.data?.map((reports) => ({
    ...reports,
    frontColor:
      reports?.label === dateToday[dateMode.value]
        ? theme.colors.primary
        : theme.colors.onSurfaceVariant,
  }));

  console.log(barData);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background, gap: 10 }}
      className="flex flex-col p-8"
    >
      <Dropdown
        data={locationData}
        search
        searchPlaceholder="Search..."
        labelField="name"
        valueField="name"
        placeholder="Select barangay"
        value={barangay}
        onChange={(item) => setBarangay(item.name)}
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
      <Dropdown
        data={mode}
        labelField="name"
        valueField="name"
        placeholder="Select Mode"
        value={dateMode}
        onChange={(item) => handleModeChange(item)}
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
      <View
        className="border rounded-md p-5"
        style={{ borderColor: theme.colors.onSurface }}
      >
        <View className="mb-3">
          <StyledText className="text-xl font-semibold">
            Bar Chart {barangay && `(${barangay})`}
          </StyledText>
          <StyledText>
            Weekly Accident Reports ({moment().startOf("week").format("MMM DD")}{" "}
            - {moment().endOf("week").format("MMM DD")})
          </StyledText>
          <StyledText></StyledText>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            showFractionalValues
            showYAxisIndices
            noOfSections={4}
            barWidth={14}
            barBorderTopLeftRadius={5}
            barBorderTopRightRadius={5}
            endSpacing={10}
            yAxisIndicesColor={theme.colors.onSurfaceVariant}
            yAxisTextStyle={{ color: theme.colors.onSurfaceVariant }}
            yAxisColor={theme.colors.onSurfaceVariant}
            xAxisColor={theme.colors.onSurfaceVariant}
            xAxisLabelTextStyle={{ color: theme.colors.onSurfaceVariant }}
            backgroundColor={theme.colors.background}
            data={barData || []}
            isAnimated
          />
        </ScrollView>
      </View>
      <ScrollView>
        {!isFetching &&
          barData &&
          barData?.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 8,
                borderBottomWidth: index < barData.length - 1 ? 1 : 0,
                borderBottomColor: theme.colors.outline + "20",
              }}
            >
              {/* Color indicator */}
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: item.frontColor || theme.colors.primary,
                  marginRight: 12,
                }}
              />

              {/* Label */}
              <Text
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: "500",
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                {item.label}
              </Text>

              {/* Value */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: theme.colors.onSurface,
                }}
              >
                {typeof item.value === "number"
                  ? item.value.toLocaleString()
                  : item.value}
              </Text>
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Graph;
