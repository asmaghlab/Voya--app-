import zod from "zod";

export const registerSchema = zod
  .object({
    name: zod
      .string()
      .min(3, "Please Enter your fullname")
      .max(15, "max length is 15"),
    email: zod.email("Please Enter a correct email"),
    password: zod
      .string()
      .min(8, "Your password should be 8 characters")
      .regex(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
        "Password must contain lower, upper chartecter and symbol"
      ),
    confirmPassword: zod.string(),
    phone: zod.string().min(1, "Phone is required"),
    country: zod.string().min(1, "Country is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["re_password"],
  });

export type RegisterFormData = zod.infer<typeof registerSchema>;

export const registerDefaultValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone:"",
  country:""
};
