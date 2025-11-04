import { useState } from "react";
import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";

import styles from "../../assets/styles/create.styles";
import COLORS from "../../constants/colors";
import { useAuthStore } from "../../store/authStore";
import { API_URL } from "../../constants/api";

export default function Create() {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(3);
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { token } = useAuthStore();

  const pickImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "App needs photo access permission");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setImage(asset.uri);
        setImageBase64(asset.base64 || null);
        await uploadImageToServer(asset.uri, asset.base64 || null);
      }
    } catch (err) {
      console.error("Error picking image:", err);
      Alert.alert("Error", "There was a problem selecting the image");
    }
  };

  const uploadImageToServer = async (
    imageUri: string,
    base64Data: string | null
  ) => {
    if (!base64Data) {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: "base64",
      });
      base64Data = base64;
    }

    const fileType = imageUri.split(".").pop()?.toLowerCase() || "jpeg";
    const imageType = `image/${fileType}`;
    const imageDataUrl = `data:${imageType};base64,${base64Data}`;

    setUploading(true);
    setUploadProgress(0);

    try {
      const res = await axios.post(
        `${API_URL}/upload`,
        { image: imageDataUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          onUploadProgress: (progressEvent) => {
            const progress =
              progressEvent.total && progressEvent.loaded
                ? progressEvent.loaded / progressEvent.total
                : 0;
            setUploadProgress(progress);
          },
        }
      );

      if (res.data?.url) {
        setImageUrl(res.data.url);
      } else {
        throw new Error("No URL returned from server");
      }
    } catch (err: any) {
      console.error("Image upload failed:", err);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Image upload failed"
      );
      setImageUrl(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async () => {
    if (!title || !caption || !rating || !imageUrl) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/book`,
        {
          title,
          caption,
          rating,
          image: imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data?.success) {
        Alert.alert("Success", "Book posted successfully!");
        setTitle("");
        setCaption("");
        setRating(3);
        setImage(null);
        setImageUrl(null);
        router.push("/");
      } else {
        throw new Error(res.data?.message || "Failed to create book");
      }
    } catch (err: any) {
      console.error("Error creating book:", err);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderRatingPicker = () => (
    <View style={styles.ratingContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={32}
            color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.scrollViewStyle}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Book Recommendation</Text>
            <Text style={styles.subtitle}>
              Share your favorite reads with others
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Title</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="book-outline"
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter book title"
                  placeholderTextColor={COLORS.placeholderText}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Your Rating</Text>
              {renderRatingPicker()}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Image</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ? (
                  <View style={{ position: "relative" }}>
                    <Image
                      source={{ uri: imageUrl || image }}
                      style={[
                        styles.previewImage,
                        uploading && { opacity: 0.5 },
                      ]}
                    />
                    {uploading && (
                      <View
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: 6,
                          backgroundColor: "#ccc",
                        }}
                      >
                        <View
                          style={{
                            width: `${uploadProgress * 100}%`,
                            height: "100%",
                            backgroundColor: COLORS.primary,
                          }}
                        />
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons
                      name="image-outline"
                      size={40}
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.placeholderText}>
                      Tap to select image
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Caption</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Write your review..."
                placeholderTextColor={COLORS.placeholderText}
                value={caption}
                onChangeText={setCaption}
                multiline
              />
            </View>

            <TouchableOpacity
              style={[styles.button, uploading && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={loading || uploading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color={COLORS.white}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Share</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
