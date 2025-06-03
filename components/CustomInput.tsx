import { Colors } from '@/constants/Colors';
import { CommonStyles } from '@/constants/CommonStyles';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface CustomInputProps extends TextInputProps {
  label?: string;
  containerStyle?: any;
}

export default function CustomInput({ 
  label, 
  containerStyle, 
  style,
  ...props 
}: CustomInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={CommonStyles.inputLabel}>{label}</Text>
      )}
      <TextInput
        style={[CommonStyles.input, style]}
        placeholderTextColor={Colors.neutral.gray40}
        autoCapitalize="none"
        autoCorrect={false}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
});