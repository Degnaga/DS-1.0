"use client";

import {
  AppBar,
  Toolbar,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  // InputAdornment,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  noticesFilterClientSchema,
  NoticesFilterClientSchema,
} from "@/lib/validation";
import { MAX_PRICE, MIN_PRICE } from "@/lib/constats";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebouncedCallback } from "use-debounce";
import { Category } from "@/types";

type NoticeBoardFilterProps = {
  categories: Category[] | undefined;
};

export default function NoticeFilters({ categories }: NoticeBoardFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPrice = (
    searchParams.get("noticePrice") || `${MIN_PRICE},${MAX_PRICE}`
  ).split(",");

  const {
    register,
    handleSubmit,
    watch,
    // setValue,
    formState: { errors },
  } = useForm<NoticesFilterClientSchema>({
    resolver: zodResolver(noticesFilterClientSchema),
    defaultValues: {
      noticeCategory: searchParams.get("noticeCategory") || "All",
      noticePriceMin: Number(initialPrice[0]) || MIN_PRICE,
      noticePriceMax: Number(initialPrice[1]) || MAX_PRICE,
      noticeType:
        (searchParams.get("noticeType") as "Offer" | "Request") || "All",
      noticeOrderBy:
        (searchParams.get("noticeOrderBy") as
          | "newest"
          | "oldest"
          | "popular"
          | "commented") || "newest",
      search: searchParams.get("search") || "",
    },
  });

  // const noticeSearchValue = watch("search");

  const noticesFiltersSubmit = useDebouncedCallback(
    handleSubmit((values) => {
      const params = new URLSearchParams(searchParams.toString());

      if (values.noticeCategory === "All") params.delete("noticeCategory");
      else if (values.noticeCategory)
        params.set("noticeCategory", values.noticeCategory);

      if (values.noticeType === "All") {
        params.delete("noticeType");
      } else {
        params.set("noticeType", values.noticeType);
      }

      params.set(
        "noticePrice",
        `${values.noticePriceMin},${values.noticePriceMax}`
      );

      params.set("noticeOrderBy", values.noticeOrderBy);

      if (values.search) {
        params.set("search", values.search);
      } else {
        params.delete("search");
      }

      router.replace(`/notice-board?${params.toString()}`);
    }),
    500
  );

  const createFieldHandler = (fieldName: keyof NoticesFilterClientSchema) => ({
    ...register(fieldName, {
      onChange: () => {
        if (
          [
            "noticeCategory",
            "noticeType",
            "noticeOrderBy",
            "noticePriceMax",
            "noticePriceMin",
          ].includes(fieldName)
        ) {
          noticesFiltersSubmit.cancel();
          noticesFiltersSubmit();
        }
        if (fieldName === "search") {
          noticesFiltersSubmit();
        }
      },
    }),
  });

  // const clearSearch = () => {
  //   setValue("search", "");
  //   categoryFiltersSubmit.cancel();
  //   categoryFiltersSubmit();
  // };

  return (
    <AppBar position="relative" sx={{ mt: { xs: 7, sm: 8 } }}>
      <Toolbar
        sx={{
          mx: "auto",
          width: "100%",
          maxWidth: "lg",
          gap: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        <TextField
          id="notices-search-field"
          aria-label="notice-search-field-label"
          label="Search"
          size="small"
          slotProps={{
            htmlInput: {
              maxLength: 70,
            },
          }}
          error={!!errors.search}
          {...createFieldHandler("search")}
          sx={{
            flex: 1,
            bgcolor: (theme) => theme.palette.secondary.dark,
            "& .MuiInputBase-input": {
              paddingY: 0.9,
              paddingX: 1,
              fontSize: "0.875rem",
            },
          }}
        />
        <FormControl sx={{ maxWidth: { xs: "4em", sm: "8em" } }}>
          <InputLabel id="notice-order-by-select-label">Order by</InputLabel>
          <Select
            labelId="notice-order-by-select-label"
            id="notice-order-by-select"
            label="order by"
            IconComponent={() => null}
            value={watch("noticeOrderBy")}
            {...createFieldHandler("noticeOrderBy")}
            sx={{
              height: "2.1em",
              bgcolor: (theme) => theme.palette.secondary.dark,
              "& .MuiSelect-select": {
                paddingX: "4px !important",
                fontSize: "0.875rem",
              },
            }}
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
            <MenuItem value="popular">Popular</MenuItem>
            <MenuItem value="commented">Commented</MenuItem>
          </Select>
        </FormControl>
      </Toolbar>
      {/* <Grid2
                id="category-notices-filters-form"
                container
                spacing={1}
                justifyContent="center"
                component="form"
                onChange={categoryFiltersSubmit}
              > */}
      {/* <Grid2 size={{ xs: 12 }}>
                <Stack direction="row">
                <TextField
                id="notices-search-field"
                label="Search notices"
                fullWidth
                variant="outlined"
                size="small"
                error={!!errors.search}
                // helperText={errors.search?.message}
                slotProps={{
                  htmlInput: {
                    maxLength: 70,
                    },
                    input: {
                      sx: { color: "secondary.main" },
                      endAdornment: noticeSearchValue ? (
                        <InputAdornment position="end">
                            <IconButton
                            color="secondary"
                            onClick={clearSearch}
                            edge="end"
                            >
                            <ClearIcon fontSize="small" />
                            </IconButton>
                            </InputAdornment>
                            ) : null,
                            },
                            }}
                            {...createFieldHandler("search")}
                            />
                            <Box sx={{ flexGrow: 1 }} />
                            <IconButton
                            color="primary"
                            onClick={handleOpenCategoryFilters}
                    aria-label="close-category-filters"
                    >
                    <HideSourceIcon />
                    </IconButton>
                    </Stack>
                    </Grid2> */}
      {/* <Grid2 size={{ xs: 2.5 }}> */}
      <Toolbar
        sx={{
          mx: "auto",
          width: "100%",
          maxWidth: "lg",
          gap: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        <FormControl sx={{ flex: 1 }}>
          <InputLabel id="notices-filter-category-select-label">
            Category
          </InputLabel>
          <Select
            labelId="notices-filter-category-select-label"
            id="notice-category-select"
            label="category"
            value={watch("noticeCategory")}
            {...createFieldHandler("noticeCategory")}
            sx={{
              height: "2.1em",
              bgcolor: (theme) => theme.palette.secondary.dark,
              "& .MuiSelect-select": {
                paddingX: "4px !important",
                fontSize: "0.875rem",
              },
            }}
          >
            <MenuItem value="All">All</MenuItem>
            {categories?.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ flex: 1 }}>
          <InputLabel id="notice-type-select-label">Type</InputLabel>
          <Select
            labelId="notice-type-select-label"
            id="notice-type-select"
            label="type"
            value={watch("noticeType")}
            {...createFieldHandler("noticeType")}
            sx={{
              height: "2.1em",
              bgcolor: (theme) => theme.palette.secondary.dark,
              "& .MuiSelect-select": {
                paddingX: "4px !important",
                fontSize: "0.875rem",
              },
            }}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Offer">Offer</MenuItem>
            <MenuItem value="Request">Request</MenuItem>
          </Select>
        </FormControl>
        <TextField
          id="notice-min-price-field"
          label="Min price"
          size="small"
          slotProps={{
            htmlInput: {
              min: MIN_PRICE,
              max: MAX_PRICE,
              inputMode: "numeric",
              maxLength: 7,
            },
          }}
          error={!!errors.noticePriceMin}
          // helperText={errors.noticePriceMin?.message}
          {...createFieldHandler("noticePriceMin")}
          sx={{
            flex: 1,
            bgcolor: (theme) => theme.palette.secondary.dark,
            "& .MuiInputBase-input": {
              paddingY: 0.9,
              paddingX: 1,
              fontSize: "0.875rem",
            },
          }}
        />
        <TextField
          id="notice-max-price-field"
          label="Max price"
          size="small"
          slotProps={{
            htmlInput: {
              min: MIN_PRICE,
              max: MAX_PRICE,
              inputMode: "numeric",
              maxLength: 7,
            },
          }}
          error={!!errors.noticePriceMax}
          // helperText={errors.noticePriceMax?.message}
          {...createFieldHandler("noticePriceMax")}
          sx={{
            flex: 1,
            bgcolor: (theme) => theme.palette.secondary.dark,
            "& .MuiInputBase-input": {
              paddingY: 0.9,
              paddingX: 1,
              fontSize: "0.875rem",
            },
          }}
        />
      </Toolbar>
      {/* <Grid2 container>
        <Grid2 size="grow"></Grid2>
        <Grid2
          container
          size={{ xs: 12, lg: 8 }}
          spacing={1}
          sx={{
            display: "flex",
            px: 0.5,
          }}
        >
          <Grid2 size={{ xs: 2.5 }}></Grid2>
          <Grid2 size={{ xs: 2.5 }}></Grid2>
          <Grid2 size={{ xs: 2.5 }}></Grid2>
          <Grid2 size={{ xs: 3 }}></Grid2>
          <Grid2 size={{ xs: 4 }}></Grid2>
        </Grid2>
        <Grid2 size="grow"></Grid2>
      </Grid2> */}
    </AppBar>
  );
}
