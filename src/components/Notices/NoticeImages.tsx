"use client";

import { useSwipeable } from "react-swipeable";
import {
  alpha,
  Box,
  Chip,
  Container,
  ImageList,
  ImageListItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { generatePlaceholder } from "@/lib/utils";

interface ImageWithData {
  id: string;
  url: string;
  aspectRatio?: number;
}

interface NoticeImagesProps {
  images: { id: string; url: string }[];
  initialIndex: number;
}

const NoticeImages = ({
  images: initialImages,
  initialIndex,
}: NoticeImagesProps) => {
  const [images, setImages] = useState<ImageWithData[]>(
    initialImages.map((img) => ({ ...img }))
  );
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const mainImageRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const backgroundColor = theme.palette.background.paper;
  const selectedBackgroundColor = alpha(theme.palette.primary.main, 0.1);

  const isBetweenSmAndMd = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));
  const isUpMd = useMediaQuery(theme.breakpoints.up("md"));

  const rowColumns = isUpMd ? 12 : isBetweenSmAndMd ? 8 : isDownSm ? 4 : 6;

  useEffect(() => {
    const processImages = async () => {
      const processedImages = await Promise.all(
        initialImages.map(async (image) => {
          try {
            const img = new window.Image();

            const imageData = await new Promise<{ aspectRatio: number }>(
              (resolve) => {
                img.onload = () => {
                  const aspectRatio = img.width / img.height;
                  resolve({ aspectRatio });
                };

                img.onerror = () => {
                  resolve({ aspectRatio: 16 / 9 });
                };

                img.src = image.url;
              }
            );

            return {
              ...image,
              aspectRatio: imageData.aspectRatio,
            };
          } catch (error) {
            console.error("Error processing image:", error);
            return {
              ...image,
              aspectRatio: 16 / 9,
            };
          }
        })
      );

      setImages(processedImages);
    };

    processImages();
  }, [initialImages]);

  useEffect(() => {
    const imageIndex = Number.parseInt(searchParams.get("image") || "0", 10);
    const safeIndex = Math.min(Math.max(imageIndex, 0), images.length - 1);
    setCurrentIndex(safeIndex);
  }, [searchParams, images.length]);

  const updateUrl = useCallback(
    (index: number) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("image", index.toString());

      window.history.replaceState(
        { ...window.history.state, as: "", url: "" },
        "",
        `${pathname}?${newParams}`
      );
    },
    [pathname, searchParams]
  );

  const handlePrevious = useCallback(() => {
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(newIndex);
    updateUrl(newIndex);
  }, [currentIndex, images.length, updateUrl]);

  const handleNext = useCallback(() => {
    const newIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
    updateUrl(newIndex);
  }, [currentIndex, images.length, updateUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevious, handleNext]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handlePrevious(),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const getBlurDataURL = generatePlaceholder(backgroundColor);

  if (!images.length) return <Box>No images available</Box>;

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: { xs: 1, sm: 2, md: 3, lg: 4 },
        mt: 10,
      }}
      {...swipeHandlers}
    >
      <Box
        ref={mainImageRef}
        sx={{
          position: "relative",
          width: "100%",
          height: "60dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: backgroundColor,
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <Image
          src={images[currentIndex]?.url || ""}
          alt={`Notice image ${currentIndex + 1}`}
          fill
          placeholder="blur"
          blurDataURL={getBlurDataURL}
          priority
          style={{
            objectFit: "contain",
            borderRadius: "8px",
            transition: "transform 0.3s ease-in-out",
          }}
          sizes="(max-width: 600px) 100vw, (max-width: 960px) 80vw, 60vw"
        />

        <Chip
          label={`${currentIndex + 1} / ${images.length}`}
          sx={{
            bgcolor: "background.paper",
            position: "absolute",
            bottom: 16,
            right: 16,
            fontSize: "0.875rem",
          }}
        />
      </Box>

      <ImageList variant="quilted" gap={8} cols={rowColumns} rowHeight={100}>
        {images.map((image, index) => (
          <ImageListItem
            key={image.id}
            onClick={() => {
              setCurrentIndex(index);
              updateUrl(index);
            }}
            sx={{
              cursor: "pointer",
              borderRadius: "8px",
              overflow: "hidden",
              border:
                index === currentIndex
                  ? `2px solid ${theme.palette.primary.main}`
                  : "none",
              backgroundColor:
                index === currentIndex
                  ? selectedBackgroundColor
                  : backgroundColor,
            }}
          >
            <div
              style={{ position: "relative", width: "100%", height: "100%" }}
            >
              <Image
                src={image.url}
                alt={`Notice image ${index + 1}`}
                fill
                priority={index < 3}
                sizes="(max-width: 600px) 25vw, (max-width: 960px) 20vw, 10vw"
                placeholder="blur"
                blurDataURL={getBlurDataURL}
                style={{
                  objectFit: "cover",
                  borderRadius: "6px",
                  transition: "transform 0.3s ease-in-out",
                }}
              />
            </div>
          </ImageListItem>
        ))}
      </ImageList>
    </Container>
  );
};

export default NoticeImages;
