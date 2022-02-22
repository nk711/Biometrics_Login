import React from "react";
import { StyleSheet, Text, TextInput } from "react-native";

export const CustomInput = (props: any) => {
    const {
        field: {name, onBlur, onChange, value },
        form: {errors, touched, setFieldTouched},
        ...inputProps
    } = props

    const hasError = errors[name] && touched[name]
    
    
    return (
        <>
          <TextInput
            style={[ styles.textbox, hasError && styles.errorInput]}
            value={value}
            onChangeText={(text) => onChange(name)(text)}
            onBlur={() => {
              setFieldTouched(name)
              onBlur(name)
            }}
            {...inputProps}
          />
          {hasError && <Text style={styles.errorText}>* {errors[name]}</Text>}
        </>
    )
}

const styles = StyleSheet.create({
    textbox: {
      backgroundColor: '#E2E2E2',
      height: 70,
      width: 400,
      borderRadius: 10,
      fontSize: 20,
      paddingHorizontal: 20,
    },
    errorText: {
      marginTop: 10,
      fontSize: 15,
      color: 'red',
    },
    errorInput: {
      backgroundColor: '#e3cfcf',
    }
  })