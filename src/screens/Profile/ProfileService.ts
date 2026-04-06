import { authApi } from "../../utils/api";


export const updateUserImage = async (userId: string, image: string) => {
const res = await authApi.put(`/users/${userId}`, { image });
return res.data;
};