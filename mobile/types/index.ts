export interface UserType {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
  createdAt: string;
}

export interface ApiResponseType<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface BookType {
  title: string;
  caption: string;
  image: string;
  rating: number;
  user: UserType;
  createdAt: string;
  _id: string;
}
