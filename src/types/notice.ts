import { Category, Notice, NoticeImage, Profile } from "./schema";

export type NoticeWithRelations = Notice & {
  author: Pick<Profile, "id" | "name" | "slug" | "image">;
  images: NoticeImage[];
  category: Category;
  type: "Offer" | "Request";
  status: "Published" | "Draft";
};
