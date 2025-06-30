import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "onboardingStep";

export async function getStep(): Promise<number> {
  const s = await AsyncStorage.getItem(KEY);
  return s ? Number(s) : 0;
}

export async function setStep(step: number): Promise<void> {
  await AsyncStorage.setItem(KEY, String(step));
}