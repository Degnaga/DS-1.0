export type User = {
  id: string;
  email: string;
  emailVerified?: string | null;
  password: string;
};

export type Account = {
  id: string;
  user_id: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
};

export type Session = {
  id: string;
  sessionToken: string;
  user_id: string;
  expires: string;
};

export type VerificationToken = {
  identifier: string;
  token: string;
  expires: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Profile = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  about?: string | null;
  created_at: string;
  updated_at?: string;
  image: string | null;
};

export type ProfileImage = {
  id: string;
  url: string;
  file_id: string;
  profile_id?: string | null;
};

export type ProfileLike = {
  source_profile_id: string;
  target_profile_id: string;
};

export type Message = {
  id: string;
  text: string;
  created_at?: string;
  updated_at?: string;
  sender_id: string;
  recipient_id: string;
  date_read?: string | null;
  sender_deleted?: boolean;
  recipient_deleted?: boolean;
};

export type Notice = {
  id: string;
  type: "Offer" | "Request";
  price: number;
  title: string;
  slug: string | null;
  text: string;
  image: string;
  created_at: string | number | Date;
  updated_at: string | number | Date;
  status: "Published" | "Draft";
  author_id: string;
  category_id: string;
  like_count?: number;
  comment_count?: number;
};

export type Comment = {
  id: string;
  text: string;
  created_at: string | number | Date;
  updated_at: string | number | Date;
  author_id: string;
  notice_id: string;
  parent_id?: string | null;
};

export type NoticeLike = {
  notice_id: string;
  source_profile_id: string;
  created_at?: string;
};

export type NoticeImage = {
  id: string;
  url: string;
  file_id: string;
  notice_id?: string | null;
};

export type NoticeType = "Offer" | "Request";
