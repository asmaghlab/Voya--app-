import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { updateUserImage } from "./ProfileService";
import { useAppDispatch } from "../../routes/hooks";
import { updateUserLocally } from "../../features/auth/authSlice";

export default function ProfileAvatar({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const pick = async () => {
    // ❌ منع Web
    if (Platform.OS === "web") {
      alert("Image upload is not supported on web");
      return;
    }

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const res = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (res.canceled) return;

    try {
      setLoading(true);

      const form = new FormData();
      form.append(
        "file",
        {
          uri: res.assets[0].uri,
          name: "avatar.jpg",
          type: "image/jpeg",
        } as any
      );
      form.append("upload_preset", "avatars");

      const cloud = await fetch(
        "https://api.cloudinary.com/v1_1/dyvbg3cgl/image/upload",
        {
          method: "POST",
          body: form,
        }
      );

      const data = await cloud.json();

      await updateUserImage(user.id, data.secure_url);
      dispatch(updateUserLocally({ image: data.secure_url }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity onPress={pick} style={styles.wrapper}>
      <Image
        source={{
          uri:
            user.image ||
            `https://ui-avatars.com/api/?name=${user.name}`,
        }}
        style={styles.avatar}
      />
      <Text style={styles.text}>
        {loading ? "Uploading..." : "Change"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },

  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: "#22d3ee",
  },

  text: {
    marginTop: 8,
    color: "#0891b2",
    fontWeight: "600",
  },
});
