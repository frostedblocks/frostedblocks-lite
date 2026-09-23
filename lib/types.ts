export type IceDoor = "lite" | "network";

export type IcePost = {
  id: string;
  content: string;
  author: string;
  authorName: string;
  /** Public avatar URL for Lite authors */
  authorAvatar?: string | null;
  likes: number;
  loves: number;
  /** Likes from Lite users on bridged Network posts */
  liteLikes?: number;
  likedByMe?: boolean;
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
