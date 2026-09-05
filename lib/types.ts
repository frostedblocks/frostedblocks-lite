export type IceDoor = "lite" | "network";

export type IcePost = {
  id: string;
  content: string;
  author: string;
  authorName: string;
  likes: number;
  loves: number;
  imageURL?: string | null;
  timestamp: number;
  category?: string;
  source?: IceDoor;
  mine?: boolean;
};

export type IceProfile = {
  username: string;
  bio: string;
  avatarURL: string;
  source?: IceDoor;
};
