import { View, Text } from 'react-native'
import React from 'react'
import StyledView from '@/components/StyledView'
import StyledText from '@/components/StyledText'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from 'react-native-paper'

const index = () => {
  const theme = useTheme();
  return (
    <SafeAreaView className="h-full" style={{backgroundColor: theme.colors.background}}>
      <StyledText>Hello</StyledText>
    </SafeAreaView>
  )
}

export default index