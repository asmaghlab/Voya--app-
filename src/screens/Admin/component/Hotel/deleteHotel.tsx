import React from "react";
import { Alert, TouchableOpacity, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";
// import { AppDispatch } from "@/routes/store";
// import { deleteHotel, fetchHotel } from "@/features/hotels/hotelsSlice";
import { MaterialIcons } from "@expo/vector-icons";
import { deleteHotel, fetchHotels } from "../../../../features/hotels/hotelsSlice";
import { AppDispatch } from "../../../../routes/store";

interface IProps {
  id: string;
  name: string | undefined;
}

export default function DeleteHotels({ id, name }: IProps) {
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = () => {
    dispatch(deleteHotel(id)).unwrap();
    dispatch(fetchHotels());
    // Alert.alert(
    //   "Confirm Delete",
    //   `Are you sure you want to delete ${name}?`,
    //   [
    //     {
    //       text: "Cancel",
    //       style: "cancel",
    //     },
    //     {
    //       text: "Delete",
    //       style: "destructive",
    //       onPress: async () => {
    //         try {
    //           await dispatch(deleteHotel(id)).unwrap();
    //           dispatch(fetchHotel());

    //           Alert.alert(
    //             "Deleted!",
    //             "The hotel has been deleted successfully."
    //           );
    //         } catch {
    //           Alert.alert(
    //             "Error",
    //             "Something went wrong while deleting the hotel."
    //           );
    //         }
    //       },
    //     },
    //   ],
    //   { cancelable: true }
    // );
  };

  return (
    <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
      <MaterialIcons name="delete" size={18} color="#991b1b" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  deleteBtn: {
    padding: 8,
    backgroundColor: "#fecaca", // red-200
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});


