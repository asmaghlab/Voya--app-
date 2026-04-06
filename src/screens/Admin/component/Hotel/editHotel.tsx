import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { addHotelSchema, AddHotelSchemaType, IHotel } from "../../../../features/hotels/type";
import { AppDispatch } from "../../../../routes/store";
import { editHotel } from "../../../../features/hotels/hotelsSlice";
import HotelFormFields from "./HotelFormField";



interface Props {
  hotel: IHotel;
}

export default function EditHotels({ hotel }: Props) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddHotelSchemaType>({
    resolver: zodResolver(addHotelSchema),
    defaultValues: {
      ...hotel,
      amenities: hotel.amenities?.join(",") || "",
      offers: hotel.offers?.join(",") || "",
      images: hotel.images?.join(",") || "",
    },
  });

  useEffect(() => {
    reset({
      ...hotel,
      amenities: hotel.amenities?.join(",") || "",
      offers: hotel.offers?.join(",") || "",
      images: hotel.images?.join(",") || "",
    });
  }, [hotel]);

  const onSubmit = async (data: AddHotelSchemaType) => {
    const payload = {
      ...data,
      amenities:
        typeof data.amenities === "string"
          ? data.amenities.split(",").map((a) => a.trim())
          : data.amenities,
      offers:
        typeof data.offers === "string"
          ? data.offers.split(",").map((a) => a.trim())
          : data.offers,
      images:
        typeof data.images === "string"
          ? data.images.split(",").map((a) => a.trim())
          : data.images,
    };

    try {
      await dispatch(editHotel({ id: hotel.id, data: payload })).unwrap();

      Alert.alert("Success", "Hotel updated successfully");
      setOpen(false);
      reset();
    } catch {
      Alert.alert("Error", "Error updating hotel");
    }
  };

  return (
    <>
      {/* Edit Button */}
      <Pressable style={styles.editBtn} onPress={() => setOpen(true)}>
        <Text style={styles.editText}>✏️</Text>
      </Pressable>

      {/* Modal */}
      <Modal visible={open} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>Edit Hotel</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <HotelFormFields
                control={control}
                errors={errors}
                setValue={setValue}
              />

              <View style={styles.actions}>
                <Pressable
                  style={[styles.btn, styles.cancel]}
                  onPress={() => setOpen(false)}
                >
                  <Text>Close</Text>
                </Pressable>

                <Pressable
                  style={[styles.btn, styles.save]}
                  onPress={handleSubmit(onSubmit)}
                >
                  <Text style={{ color: "#fff" }}>Save</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}const styles = StyleSheet.create({
  editBtn: {
    padding: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  editText: {
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    width: "90%",
    maxHeight: "90%",
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  cancel: {
    backgroundColor: "#e5e7eb",
  },
  save: {
    backgroundColor: "#2563eb",
  },
});

