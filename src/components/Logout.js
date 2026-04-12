import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const Logout = ({ visible, onClose }) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>

        <View style={styles.card}>

          <Icon name="log-out-outline" size={40} color="#ee2e2e" />

          <Text style={styles.title}>Logout</Text>

          <Text style={styles.message}>
            Are you sure you want to logout?
          </Text>

          <View style={styles.row}>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

          </View>

        </View>

      </View>
    </Modal>
  );
};

export default Logout;

const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 25,
    alignItems: "center",
    elevation: 6,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
  },

  message: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginVertical: 15,
  },

  row: {
    flexDirection: "row",
    gap: 20,
  },

  cancel: {
    backgroundColor: "#e8e4e4",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 15,
    color: "#555",
  },

  logoutBtn: {
    backgroundColor: "#ee2e2e",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "600",
  },

});