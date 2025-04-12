"use client";

import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { noticeLikeToggle } from "@/lib/actions";
import { IconButton } from "@mui/material";
import { useState } from "react";

type Props = {
  noticeId: string;
  initialIsLiked: boolean;
  initialLikeCount: number;
};

const NoticeLikeButton = ({
  noticeId,
  initialIsLiked,
  initialLikeCount,
}: Props) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  const handleToggleLike = async () => {
    try {
      const result = await noticeLikeToggle(noticeId);
      setIsLiked(result.isLiked);
      setLikeCount(result.likeCount);
    } catch (error) {
      console.log("Failed to toggle like:", error);
    }
  };

  return (
    <IconButton onClick={handleToggleLike}>
      {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      {likeCount}
    </IconButton>
  );
};
export default NoticeLikeButton;
