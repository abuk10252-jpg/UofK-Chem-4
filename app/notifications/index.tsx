import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { apiCall } from "../../src/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../src/constants/colors";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await apiCall("/api/notifications");
      setNotifications(data.notifications || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 20 }}>
        Notifications
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.accent} />
      ) : notifications.length === 0 ? (
        <Text>No notifications</Text>
      ) : (
        notifications.map((n, i) => (
          <View
            key={i}
            style={{
              backgroundColor: "#FFF",
              padding: 12,
              borderRadius: 10,
              marginBottom: 12,
              flexDirection: "row",
              gap: 10,
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.08)",
            }}
          >
            <Ionicons
              name={
                n.file_type === "pdf"
                  ? "document-text"
                  : n.file_type === "mp4"
                  ? "videocam"
                  : "document"
              }
              size={22}
              color={Colors.accent}
            />

            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700", fontSize: 14 }}>{n.title}</Text>
              <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>
                {n.body}
              </Text>
              <Text style={{ color: "#999", fontSize: 11, marginTop: 4 }}>
                {new Date(n.created_at).toLocaleString()}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
