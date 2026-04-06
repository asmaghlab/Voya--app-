import { useDispatch, useSelector } from "react-redux";
import React, { useEffect } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";

import { AppDispatch, RootState } from "../../routes/store";
import {
  fetchHotels,
  fetchHotelByCountryId,
} from "../../features/hotels/hotelsSlice";
import HotelsScreen from "./HotelsScreen";
import { RootStackParamList } from "../../navigation/types";


export default function HotelWrapper() {
  const dispatch = useDispatch<AppDispatch>();

  const route = useRoute<RouteProp<RootStackParamList, "Hotels">>();
  const countryId = route.params?.countryId;

  const { hotels, status, error } = useSelector(
    (state: RootState) => state.hotels
  );

  useEffect(() => {
    if (countryId) {
      dispatch(fetchHotelByCountryId(countryId));
    } else {
      dispatch(fetchHotels());
    }
  }, [dispatch, countryId]);

  return (
    <HotelsScreen
      hotels={hotels}
      status={status}
      error={error}
    //   countryId={countryId}
    />
  );
}
