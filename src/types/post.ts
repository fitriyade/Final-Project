import { User } from "@/types/user";
export interface Post {
  id: string;
  userId: string;
  imageUrl: string;
  caption: string;
  isLike: boolean;
  totalLikes: number;
  user: User;
  createdAt: string;
  updatedAt: string;
}
