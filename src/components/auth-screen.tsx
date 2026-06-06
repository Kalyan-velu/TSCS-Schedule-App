import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuthStore} from '@/store/auth-store';
import {ThemedText} from './themed-text';
import {ThemedView} from './themed-view';
import {Spacing} from '@/constants/theme';
import {useTheme} from '@/hooks/use-theme';

export function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const {login, loading, error} = useAuthStore();
  const theme = useTheme();
  
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    await login(email.trim(), password.trim());
  };
  
  const isDark = theme.background === '#000000';
  
  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          
          <View style={styles.logoSection}>
            <ThemedText type="subtitle" style={styles.title}>
              Takshasheela
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
              Student Schedule Portal
            </ThemedText>
          </View>
          
          {/* Form Card */}
          <ThemedView type="backgroundElement" style={[
            styles.card,
            isDark && styles.cardDark,
          ]}>
            <ThemedText type="smallBold" style={styles.cardHeader}>
              STUDENT SIGN IN
            </ThemedText>
            
            {error && (
              <View style={[styles.errorBox, {backgroundColor: '#FF3B3015', borderColor: '#FF3B3030'}]}>
                <ThemedText style={styles.errorText}>⚠️ {error}</ThemedText>
              </View>
            )}
            
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.inputLabel}>
                Email Address
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#121214' : '#ffffff',
                    color: theme.text,
                    borderColor: isDark ? '#333' : '#e3e3e8',
                  },
                ]}
                placeholder="Enter your registered email"
                placeholderTextColor={theme.textSecondary + '70'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>
            
            {/* Password Input */}
            <View style={styles.inputContainer}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.inputLabel}>
                Password
              </ThemedText>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    {
                      backgroundColor: isDark ? '#121214' : '#ffffff',
                      color: theme.text,
                      borderColor: isDark ? '#333' : '#e3e3e8',
                    },
                  ]}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.textSecondary + '70'}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}>
                  <ThemedText style={{fontSize: 16}}>{showPassword ? '👁️' : '🙈'}</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading || !email.trim() || !password.trim()}
              style={[
                styles.submitBtn,
                {backgroundColor: '#3c87f7'},
                (!email.trim() || !password.trim() || loading) && {opacity: 0.6},
              ]}
              activeOpacity={0.8}>
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small"/>
              ) : (
                <ThemedText style={styles.submitBtnText}>Sign In</ThemedText>
              )}
            </TouchableOpacity>
            
            <ThemedText type="small" themeColor="textSecondary" style={styles.helpText}>
              Need help? Contact admin to reset or retrieve your account.
            </ThemedText>
          </ThemedView>
        
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.five,
    gap: Spacing.half,
  },
  logoOutline: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
    backgroundColor: '#3c87f710',
  },
  logoEmoji: {
    fontSize: 32,
  },
  title: {
    fontWeight: '800',
    fontSize: 34,
    lineHeight: 40,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: '#88888815',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  cardDark: {
    borderColor: '#ffffff10',
    shadowOpacity: 0.3,
  },
  cardHeader: {
    fontSize: 12,
    letterSpacing: 1,
    opacity: 0.6,
    marginBottom: Spacing.one,
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    marginBottom: Spacing.one,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  inputContainer: {
    gap: Spacing.one,
  },
  inputLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    fontSize: 15,
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: 'absolute',
    right: 0,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    height: 48,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  helpText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: Spacing.one,
    opacity: 0.7,
  },
});
