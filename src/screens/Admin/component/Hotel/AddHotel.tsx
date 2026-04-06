import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../routes/store";
import { addHotelDefaultValues, addHotelSchema, AddHotelSchemaType } from "../../../../features/hotels/type";
import { addHotel, fetchHotels } from "../../../../features/hotels/hotelsSlice";
import HotelFormFields from "./HotelFormField";


export default function AddHotelsDB() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

const {
  control,
  handleSubmit,
  formState: { errors },
  reset,
  setValue
} = useForm<AddHotelSchemaType>({
  resolver: zodResolver(addHotelSchema),
  defaultValues: addHotelDefaultValues,
});

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
      await dispatch(addHotel(payload )).unwrap();

      Alert.alert("Success", "Hotel added successfully");
      reset();
      setOpen(false);
      dispatch(fetchHotels());
    } catch (err) {
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <>
      <Pressable style={styles.addBtn} onPress={() => setOpen(true)}>
        <Text style={styles.addBtnText}>+ ADD Hotel</Text>
      </Pressable>

      {/* Modal */}
      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>Add Hotel</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* <HotelFormFields
                register={register}
                errors={errors}
                setValue={setValue}
              /> */}
              <HotelFormFields
                control={control}
                errors={errors}
                setValue={setValue}
              />
            </ScrollView>

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
          </View>
        </View>
      </Modal>
    </>
  );
}
const styles = StyleSheet.create({
  addBtn: {
    backgroundColor: "#00c0f5",
    padding: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "600",
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
    fontWeight: "bold",
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancel: {
    backgroundColor: "#e5e7eb",
  },
  save: {
    backgroundColor: "#2563eb",
  },
});
