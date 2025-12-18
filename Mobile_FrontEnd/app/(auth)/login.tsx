import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import CustomTextInput from "../../components/common/CustomTextField";
import { loginStyles } from "../../styles/screens/LoginPageStyles";
import { router } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleLogin = async () => {

    // Eğer boş ise uyarı ver
    if (!email || !password) {
      Alert.alert("Hata", "Email ve şifre alanlarını doldurunuz");
      return;
    }

    // Giriş yapmayı dene
    const success = await login(email, password, 'client');

    // Giriş başarısız olursa uyarı ver eğer başarılıysa ana sayfaya (Yani Meals Page'e) yönlendir
    if (!success) {
      Alert.alert("Hata", "Geçersiz email veya şifre");
    } else {
      router.replace("/(tabs)/meals");
    }
  };

  return (
    <View style={loginStyles.container}>
      
        <View style={loginStyles.logoContainer}>
            <Image
            source={require("../../assets/images/DA_logo.png")}
            style={loginStyles.logo}
            />
        </View>

        <View style={loginStyles.titleContainer}>
            <Text style={loginStyles.title}>
            Welcome! Sign in and quickly manage your data
            </Text>
        </View>

        <CustomTextInput
            label="Email"
            icon="👤"
            placeholder="youremail123@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
        />


        <CustomTextInput
            label="Password"
            icon="🔒"
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
        />


        <TouchableOpacity>
            <Text style={loginStyles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={loginStyles.signInButton} onPress={handleLogin}>
            <Text style={loginStyles.signInButtonText}>Sign in</Text>
        </TouchableOpacity>

        <Text style={loginStyles.footer}>
            © 2025 XXXXX. All rights reserved.
        </Text>

        </View>
  );
}
