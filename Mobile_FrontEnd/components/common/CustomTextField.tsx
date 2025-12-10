import { View, TextInput, Text, StyleSheet, TextInputProps } from "react-native";

interface CustomTextInputProps extends TextInputProps {
  label: string;
  icon: string;   // ✅ direkt emoji kabul ediyoruz
}

export default function CustomTextInput({
  label,
  icon,
  ...textInputProps
}: CustomTextInputProps) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputContainer}>
        {/* ✅ EMOJI GÜVENLİ ŞEKİLDE <Text> İÇİNDE */}
        <Text style={styles.icon}>{icon}</Text>

        <TextInput
          style={styles.input}
          placeholderTextColor="#999"
          {...textInputProps}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8e3d8",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
  },

  icon: {
    fontSize: 20,
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
});
