import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔥 تخزين أي بيانات
export async function saveItem(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.log("Storage Save Error:", e);
  }
}

// 🔥 قراءة أي بيانات
export async function getItem(key) {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.log("Storage Read Error:", e);
    return null;
  }
}

// 🔥 حذف بيانات
export async function removeItem(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.log("Storage Remove Error:", e);
  }
}
