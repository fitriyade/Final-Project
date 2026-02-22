export interface LoginResponse {
  code: string;
  status: string;
  message: string;
  user: {
    id: string;
    username: string;
    name: string;
    email: string;
    role: string;
    profilePictureUrl: string;
    phoneNumber: string;
    bio: string;
    website: string;
  };
  token: string;
}
