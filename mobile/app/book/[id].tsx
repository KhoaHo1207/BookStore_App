import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import axios from "axios";

import { API_URL } from "../../constants/api";
import { useAuthStore } from "../../store/authStore";
import COLORS from "../../constants/colors";
import styles from "../../assets/styles/bookDetail.styles";
import Loader from "../../components/Loader";
import { formatPublishDate } from "../../lib/utils";
import { BookType } from "@/types";

export default function BookDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuthStore();
  const router = useRouter();

  const [book, setBook] = useState<BookType | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBookDetail = async () => {
    try {
      const res = await axios.get(`${API_URL}/book/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBook(res.data?.data || res.data);
    } catch (err: any) {
      console.error("Error fetching book:", err);
      Alert.alert("Error", "Failed to load book details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetail();
  }, [id]);

  if (loading) return <Loader />;
  if (!book)
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={60}
          color={COLORS.textSecondary}
        />
        <Text style={styles.emptyText}>Book not found</Text>
      </View>
    );

  const renderRatingStars = (rating: number) =>
    [...Array(5)].map((_, i) => (
      <Ionicons
        key={i}
        name={i + 1 <= rating ? "star" : "star-outline"}
        size={18}
        color={i + 1 <= rating ? "#f4b400" : COLORS.textSecondary}
      />
    ));

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Detail</Text>
        <View style={{ width: 24 }} /> {/* placeholder for spacing */}
      </View>

      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={book.image}
          style={styles.bookImage}
          contentFit="cover"
          transition={300}
        />
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{book.title}</Text>
        <View style={styles.ratingRow}>
          {renderRatingStars(book.rating)}
          <Text style={styles.date}>• {formatPublishDate(book.createdAt)}</Text>
        </View>

        <Text style={styles.caption}>{book.caption}</Text>
      </View>

      {/* Author */}
      <View style={styles.userSection}>
        <Image
          source={{ uri: book.user?.profileImage }}
          style={styles.avatar}
        />
        <Text style={styles.username}>{book.user?.username}</Text>
      </View>

      {/* CTA */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={20} color={COLORS.primary} />
          <Text style={styles.actionText}>Add to Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color={COLORS.primary} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
