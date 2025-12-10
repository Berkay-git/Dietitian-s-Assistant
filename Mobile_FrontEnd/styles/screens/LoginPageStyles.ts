import { StyleSheet } from "react-native";
import { Colors } from "../colors";
import { Spacing, Sizes } from "../spacing";

export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    paddingHorizontal: Spacing.md,
    justifyContent: "center",
  },
  
  logoContainer: {
    width: Sizes.logoLarge,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xxl,
    marginBottom: Spacing.sm,
    alignSelf: "center", //Yatayda tam ortaya alıyoruz
  },
  
  logo: {
    width: Sizes.logoLarge,
    height: Sizes.logoMedium,
    resizeMode: "contain",
    marginTop: Spacing.md,
  },
  

  titleContainer: {
    width: 250,
    height: 80,
    alignSelf: "center",
  },

  title: {
    fontSize: 16,
    fontStyle: "italic",
    fontWeight: "500",
    color: Colors.titleGrey,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textDark,
    marginBottom: Spacing.sm,
  },
  
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgSecondary,
    borderRadius: Sizes.borderRadius,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    height: Sizes.inputHeight,
  },
  
  icon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
  },
  
  forgotPassword: {
    color: Colors.accentBlue,
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: Colors.checkboxBorder,
    borderRadius: 4,
    marginRight: Spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  
  checkboxChecked: {
    backgroundColor: Colors.checkboxBg,
    borderColor: Colors.checkboxBg,
  },
  
  checkmark: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  
  rememberText: {
    fontSize: 14,
    color: Colors.textDark,
    fontWeight: "500",
  },
  
  signInButton: {
    backgroundColor: Colors.accentYellow,
    paddingVertical: Spacing.sm,
    borderRadius: Sizes.borderRadius,
    alignItems: "center",
    marginBottom: Spacing.xxl,
    shadowColor: Colors.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  
  signInButtonDisabled: {
    opacity: 0.6,
  },
  
  signInButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textDark,
  },
  
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textLight,
    marginTop: "auto",
    marginBottom: Spacing.lg,
  },
});