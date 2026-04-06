import { View } from "react-native";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../routes/hooks";
import { fetchUserHotelBookings } from "../../features/bookings/hotelBookingSlice";
import { fetchUserFlightBookings } from "../../features/bookings/flightBookingSlice";
import HotelBookings from "./HotelBookings";
import FlightBookings from "./FlightBookings";


export default function UserBookings() {
const dispatch = useAppDispatch();
const { user } = useAppSelector(s => s.auth);


useEffect(() => {
if (user?.email) {
dispatch(fetchUserHotelBookings(user.email));
dispatch(fetchUserFlightBookings(user.email));
}
}, [user?.email]);


return (
<View className="mt-8 space-y-8">
<HotelBookings />
<FlightBookings />
</View>
);
}