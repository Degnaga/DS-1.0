import { Category, Notice, NoticeType } from "./schema";

export type CategoryWithNotices = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  notices: {
    id: string;
    type: NoticeType;
    price: number;
    title: string;
    slug: string;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
    likeCount: number;
    commentCount: number;
    author: {
      id: string;
      name: string;
      image: string;
    };
  }[];
};

// export type CategoryNotice = {
//   id: string;
//   type: NoticeType;
//   price: number;
//   title: string;
//   slug: string;
//   image: string | null;
//   createdAt: Date;
//   updatedAt: Date;
//   likeCount: number;
//   commentCount: number;
//   author: {
//     id: string;
//     name: string;
//     image: string;
//   };
// };

export interface NoticeWithAuthorAndCategory extends Notice {
  author: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
  };
  category: {
    name: string;
    slug: string;
  };
}

export interface NoticeWithCategory extends Notice {
  category: Category;
}

export interface GetCategoryNoticesResult {
  notices: NoticeWithAuthorAndCategory[];
  noticesCount: number;
}

export type CategoryNoticesFilters = {
  priceValue: number[];
  orderBy: string;
  type: string;
};
