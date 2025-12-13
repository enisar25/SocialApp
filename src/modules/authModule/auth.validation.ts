import z from 'zod';

export const loginSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

export const registerSchema = z.object({
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters long'
  }),
  email: z.email({
    message: 'Invalid email address'
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters long'
  }),
  confirmPassword: z.string().min(8, {
    message: 'Confirm Password must be at least 8 characters long' 
  }),
  age: z.number().min(13, {
    message: 'You must be at least 13 years old to register'
  }),
  phone: z.string().min(10, {
    message: 'Phone number must be at least 10 digits long'
  }),

}).refine(  (data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
},)

export const confirmEmailSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  otp: z.string().length(6, { message: 'OTP must be 6 characters long' }),
});

export const resendOTPSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
});