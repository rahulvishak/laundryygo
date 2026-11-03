import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ArrowRight, Camera, Check, DoorOpen, Sparkles, UserRound } from 'lucide-react-native';

import { defaultProfile } from '../lib/data';
import { writeStorageStrict } from '../lib/storage';

function WashingMachineAnimation() {
  const spin = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 3600, useNativeDriver: Platform.OS !== 'web' }),
    );
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1500, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(float, { toValue: 0, duration: 1500, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );

    spinLoop.start();
    floatLoop.start();
    return () => {
      spinLoop.stop();
      floatLoop.stop();
    };
  }, [float, spin]);

  const drumRotation = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const bubbleOffset = float.interpolate({
    inputRange: [0, 1],
    outputRange: [8, -8],
  });

  return (
    <View style={styles.illustrationStage} accessibilityLabel="Animated 3D washing machine">
      <View style={[styles.orbit, styles.orbitOne]} />
      <View style={[styles.orbit, styles.orbitTwo]} />
      <Animated.View style={[styles.bubble, styles.bubbleOne, { transform: [{ translateY: bubbleOffset }] }]} />
      <Animated.View style={[styles.bubble, styles.bubbleTwo, { transform: [{ translateY: Animated.multiply(bubbleOffset, -1) }] }]} />

      <View style={styles.machineShadow} />
      <View style={styles.machine3d}>
        <View style={styles.machineSide} />
        <View style={styles.machineTop}>
          <View style={styles.topDial} />
          <View style={styles.topDisplay}><View style={styles.displayDot} /></View>
          <View style={styles.topButton} />
        </View>
        <View style={styles.machineBody}>
          <View style={styles.brandLine}>
            <View style={styles.brandMark}><Sparkles size={10} color="#ffffff" /></View>
            <Text style={styles.brandText}>LAUNDRY GO</Text>
            <View style={styles.statusLight} />
          </View>
          <View style={styles.doorFrame}>
            <View style={styles.doorRim}>
              <View style={styles.drumWindow}>
                <View style={styles.drumShine} />
                <Animated.View style={[styles.drum, { transform: [{ rotate: drumRotation }] }]}>
                  <View style={[styles.drumFin, styles.drumFinTop]} />
                  <View style={[styles.drumFin, styles.drumFinRight]} />
                  <View style={[styles.drumFin, styles.drumFinBottom]} />
                  <View style={[styles.drumFin, styles.drumFinLeft]} />
                  <View style={styles.drumHub} />
                </Animated.View>
                <View style={styles.waterLine} />
              </View>
            </View>
          </View>
          <View style={styles.machineBase}>
            <View style={styles.baseFoot} />
            <View style={styles.baseFoot} />
          </View>
        </View>
      </View>
      <View style={styles.illustrationCaption}>
        <View style={styles.liveDot} />
        <Text style={styles.illustrationCaptionText}>SMART WASH · READY WHEN YOU ARE</Text>
      </View>
    </View>
  );
}

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 820;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const choosePhoto = async () => {
    setErrorMessage('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) setPhotoUrl(result.assets[0].uri);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not open your photo library.');
    }
  };

  const onSubmit = async () => {
    const cleanName = name.trim();
    const cleanRoom = roomNumber.trim();
    if (cleanName.length < 2) {
      setErrorMessage('Enter your name to continue.');
      return;
    }
    if (!/^[\p{L}\p{N}-]{1,12}$/u.test(cleanRoom)) {
      setErrorMessage('Enter a valid room number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await writeStorageStrict('laundryq-profile', {
        ...defaultProfile,
        fullName: cleanName,
        roomNumber: cleanRoom,
        photoUrl,
      });
      await writeStorageStrict('laundryq-authenticated', true);
      router.replace('/home');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save your profile.');
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.page, isWide && styles.pageWide]}>
        <View style={[styles.heroPanel, isWide && styles.heroPanelWide]}>
          <View style={styles.heroHeader}>
            <View style={styles.logoBox}><Sparkles size={19} color="#ffffff" /></View>
            <Text style={styles.logoText}>Laundry Go</Text>
          </View>
          <WashingMachineAnimation />
          <Text style={styles.heroEyebrow}>YOUR LAUNDRY, YOUR TIME</Text>
          <Text style={styles.heroTitle}>Your wash day, made easy.</Text>
          <Text style={styles.heroCopy}>
            Find an open machine, reserve your time, and skip the queue.
          </Text>
          <View style={styles.heroFeature}>
            <View style={styles.featureCheck}><Check size={13} color="#103da9" /></View>
            <Text style={styles.featureText}>Machine availability at a glance</Text>
          </View>
          <View style={styles.heroFeature}>
            <View style={styles.featureCheck}><Check size={13} color="#103da9" /></View>
            <Text style={styles.featureText}>Book a slot in seconds</Text>
          </View>
        </View>

        <View style={[styles.formPanel, isWide && styles.formPanelWide]}>
          <View style={styles.formHeadingRow}>
            <View style={styles.formHeading}>
              <Text style={styles.formEyebrow}>STUDENT PORTAL</Text>
              <Text style={styles.formTitle}>Let’s get started</Text>
              <Text style={styles.formDescription}>Enter your name and room to continue.</Text>
            </View>
            <Pressable onPress={choosePhoto} style={styles.photoPicker} accessibilityRole="button" accessibilityLabel="Choose profile photo">
              {photoUrl ? <Image source={{ uri: photoUrl }} style={styles.photoPreview} /> : <UserRound size={25} color="#368b7b" />}
              <View style={styles.photoCamera}><Camera size={12} color="#ffffff" /></View>
            </Pressable>
          </View>

          <Text style={styles.fieldLabel}>Your name</Text>
          <View style={[styles.inputShell, errorMessage && !name.trim() && styles.inputError]}>
            <UserRound size={18} color="#8b98ad" />
            <TextInput
              accessibilityLabel="Your name"
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#a0a9b8"
              autoCapitalize="words"
              autoCorrect={false}
              textContentType="name"
              value={name}
              onChangeText={(value) => { setName(value); setErrorMessage(''); }}
              returnKeyType="next"
            />
          </View>

          <Text style={[styles.fieldLabel, styles.roomLabel]}>Room number</Text>
          <View style={[styles.inputShell, errorMessage && name.trim() && styles.inputError]}>
            <DoorOpen size={18} color="#8b98ad" />
            <TextInput
              accessibilityLabel="Room number"
              style={styles.input}
              placeholder="e.g. B-214"
              placeholderTextColor="#a0a9b8"
              autoCapitalize="characters"
              autoCorrect={false}
              value={roomNumber}
              onChangeText={(value) => { setRoomNumber(value); setErrorMessage(''); }}
              onSubmitEditing={onSubmit}
              returnKeyType="go"
            />
          </View>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Pressable
            style={({ pressed }) => [styles.signInButton, pressed && styles.buttonPressed, isSubmitting && styles.buttonDisabled]}
            onPress={onSubmit}
            disabled={isSubmitting}
            accessibilityRole="button"
          >
            {isSubmitting ? <ActivityIndicator color="#ffffff" /> : (
              <>
                <Text style={styles.signInText}>Continue</Text>
                <ArrowRight size={18} color="#ffffff" />
              </>
            )}
          </Pressable>

          <Text style={styles.termsText}>Your name, room number, and selected photo stay on this device.</Text>
        </View>
      </View>
      <Text style={styles.footerText}>LAUNDRY GO  ·  MADE FOR HOSTEL LIFE</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f1f8f6' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 28 },
  page: { width: '100%', maxWidth: 520, alignSelf: 'center' },
  pageWide: { maxWidth: 1080, flexDirection: 'row', alignItems: 'stretch', gap: 26 },
  heroPanel: { minHeight: 470, overflow: 'hidden', backgroundColor: '#0f766e', borderRadius: 28, padding: 24, marginBottom: 18 },
  heroPanelWide: { flex: 1, minHeight: 640, padding: 34, marginBottom: 0, justifyContent: 'center' },
  heroHeader: { flexDirection: 'row', alignItems: 'center' },
  logoBox: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#ffffff30', alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  logoText: { fontSize: 17, fontWeight: '800', color: '#ffffff', letterSpacing: 0.2 },
  illustrationStage: { height: 245, alignItems: 'center', justifyContent: 'center', marginTop: 6, marginBottom: 2 },
  orbit: { position: 'absolute', borderWidth: 1, borderColor: '#ffffff20', borderRadius: 999 },
  orbitOne: { width: 225, height: 225 },
  orbitTwo: { width: 190, height: 190 },
  bubble: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: '#8ee9f2', borderWidth: 3, borderColor: '#ffffff80', zIndex: 4 },
  bubbleOne: { top: 48, right: '22%' },
  bubbleTwo: { left: '22%', bottom: 52, width: 10, height: 10 },
  machineShadow: { position: 'absolute', width: 190, height: 22, borderRadius: 99, bottom: 13, backgroundColor: '#102d8d80', transform: [{ scaleX: 1.06 }] },
  machine3d: { width: 156, height: 195, marginTop: 20, transform: [{ perspective: 700 }, { rotateY: '-9deg' }, { rotateX: '2deg' }] },
  machineSide: { position: 'absolute', width: 18, right: -15, top: 12, bottom: 5, borderTopRightRadius: 13, borderBottomRightRadius: 12, backgroundColor: '#b7c8ec', transform: [{ skewY: '-5deg' }] },
  machineTop: { height: 38, backgroundColor: '#eef3ff', borderTopLeftRadius: 16, borderTopRightRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 9, borderBottomWidth: 1, borderBottomColor: '#ccd7ef' },
  topDial: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#d8e2f5', borderWidth: 4, borderColor: '#98a9c8' },
  topDisplay: { width: 48, height: 15, backgroundColor: '#173358', borderRadius: 4, padding: 4, justifyContent: 'center' },
  displayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#61e3ba' },
  topButton: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ccd8ed', marginLeft: 'auto' },
  machineBody: { flex: 1, backgroundColor: '#f8faff', borderBottomLeftRadius: 15, borderBottomRightRadius: 11, paddingHorizontal: 12, shadowColor: '#0a1f61', shadowOpacity: 0.25, shadowRadius: 14, shadowOffset: { width: 5, height: 9 }, elevation: 8 },
  brandLine: { height: 27, flexDirection: 'row', alignItems: 'center' },
  brandMark: { width: 16, height: 16, borderRadius: 5, backgroundColor: '#0f766e', alignItems: 'center', justifyContent: 'center', marginRight: 5 },
  brandText: { fontSize: 7, fontWeight: '900', letterSpacing: 1, color: '#53627d' },
  statusLight: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#22c99a', marginLeft: 'auto' },
  doorFrame: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 6 },
  doorRim: { width: 112, height: 112, borderRadius: 56, backgroundColor: '#d7e0f0', borderWidth: 5, borderColor: '#e7edf7', alignItems: 'center', justifyContent: 'center', shadowColor: '#8092b0', shadowOpacity: 0.4, shadowRadius: 5, shadowOffset: { width: 2, height: 3 }, elevation: 3 },
  drumWindow: { width: 91, height: 91, overflow: 'hidden', borderRadius: 46, backgroundColor: '#133761', borderWidth: 3, borderColor: '#91a5c5', alignItems: 'center', justifyContent: 'center' },
  drumShine: { position: 'absolute', width: 35, height: 75, top: 1, left: 7, borderRadius: 24, backgroundColor: '#ffffff18', transform: [{ rotate: '27deg' }] },
  drum: { width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderColor: '#a9eff0', backgroundColor: '#286b91', alignItems: 'center', justifyContent: 'center' },
  drumFin: { position: 'absolute', width: 10, height: 27, borderRadius: 8, backgroundColor: '#87deeb' },
  drumFinTop: { top: 3 },
  drumFinRight: { right: 3, transform: [{ rotate: '90deg' }] },
  drumFinBottom: { bottom: 3, transform: [{ rotate: '180deg' }] },
  drumFinLeft: { left: 3, transform: [{ rotate: '270deg' }] },
  drumHub: { width: 17, height: 17, borderRadius: 9, backgroundColor: '#d1f6f7', borderWidth: 4, borderColor: '#4fa6c3' },
  waterLine: { position: 'absolute', bottom: 9, width: 51, height: 8, borderRadius: 999, backgroundColor: '#68d7e780' },
  machineBase: { height: 8, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 9 },
  baseFoot: { width: 19, height: 6, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, backgroundColor: '#aab9d3' },
  illustrationCaption: { position: 'absolute', bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 7 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#5af0c1' },
  illustrationCaptionText: { color: '#d7e6ff', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  heroEyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 2, color: '#9bb7ff', marginTop: 8 },
  heroTitle: { fontSize: 27, lineHeight: 33, fontWeight: '800', color: '#ffffff', marginTop: 8, maxWidth: 360 },
  heroCopy: { fontSize: 13, lineHeight: 19, color: '#d5e0ff', marginTop: 8, maxWidth: 350 },
  heroFeature: { flexDirection: 'row', alignItems: 'center', marginTop: 13 },
  featureCheck: { width: 19, height: 19, borderRadius: 10, backgroundColor: '#e2f5ff', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  featureText: { color: '#f2f6ff', fontSize: 12, fontWeight: '600' },
  formPanel: { backgroundColor: '#ffffff', borderRadius: 26, padding: 24, shadowColor: '#233e72', shadowOpacity: 0.08, shadowRadius: 22, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  formPanelWide: { flex: 1, justifyContent: 'center', paddingHorizontal: 38, paddingVertical: 42, marginVertical: 20 },
  formHeadingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 26 },
  formHeading: { flex: 1 },
  formEyebrow: { color: '#0f766e', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  formTitle: { color: '#17233d', fontSize: 30, fontWeight: '800', marginTop: 7 },
  formDescription: { color: '#748096', fontSize: 13, marginTop: 7 },
  fieldLabel: { color: '#29354c', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  roomLabel: { marginTop: 18 },
  inputShell: { height: 52, borderWidth: 1, borderColor: '#e3e8f0', backgroundColor: '#fbfcfe', borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 },
  inputError: { borderColor: '#e07474' },
  input: { flex: 1, height: '100%', color: '#17233d', fontSize: 13 },
  errorText: { color: '#c24141', fontSize: 11, marginTop: 6 },
  signInButton: { height: 52, backgroundColor: '#0f766e', borderRadius: 14, marginTop: 23, paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#0f766e', shadowOpacity: 0.22, shadowRadius: 8, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  buttonDisabled: { opacity: 0.7 },
  signInText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  photoPicker: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#e5f4f0', borderWidth: 2, borderColor: '#b8ded5', alignItems: 'center', justifyContent: 'center', marginLeft: 12, position: 'relative' },
  photoPreview: { width: '100%', height: '100%', borderRadius: 29 },
  photoCamera: { position: 'absolute', right: -2, bottom: -2, width: 22, height: 22, borderRadius: 11, backgroundColor: '#0f766e', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#ffffff' },
  termsText: { color: '#9aa4b4', fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 19 },
  footerText: { color: '#9aa4b4', fontSize: 9, fontWeight: '700', letterSpacing: 1.4, textAlign: 'center', marginTop: 20 },
});
