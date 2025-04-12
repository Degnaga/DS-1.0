import { Comment } from "./schema";

export type NoticeCommentWithRelations = Comment & {
  author: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
  };
  parent: {
    id: string;
    text: string;
    author: {
      name: string;
    };
  } | null;
};
