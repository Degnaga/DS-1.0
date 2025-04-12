"use client";

import {
  AppBar,
  Toolbar,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  profileNoticesFilterClientSchema,
  ProfileNoticesFilterClientSchema,
} from "@/lib/validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebouncedCallback } from "use-debounce";
import { Category } from "@/types";

interface ProfileNoticesFilterProps {
  categories: Category[] | undefined;
}

export default function ProfileNoticesFilters({
  categories,
}: ProfileNoticesFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { register, handleSubmit, watch } =
    useForm<ProfileNoticesFilterClientSchema>({
      resolver: zodResolver(profileNoticesFilterClientSchema),
      defaultValues: {
        noticeCategory: searchParams.get("noticeCategory") || "All",
        noticeStatus:
          (searchParams.get("noticeStatus") as "Published" | "Draft") || "All",
        noticeType:
          (searchParams.get("noticeType") as "Offer" | "Request") || "All",
        noticeOrderBy:
          (searchParams.get("noticeOrderBy") as
            | "newest"
            | "oldest"
            | "popular"
            | "commented") || "newest",
      },
    });

  const debouncedSubmit = useDebouncedCallback(
    handleSubmit((values) => {
      const params = new URLSearchParams(searchParams.toString());

      if (values.noticeStatus === "All") params.delete("noticeStatus");
      else if (values.noticeStatus)
        params.set("noticeStatus", values.noticeStatus);

      if (values.noticeCategory === "All") params.delete("noticeCategory");
      else if (values.noticeCategory)
        params.set("noticeCategory", values.noticeCategory);

      if (values.noticeType === "All") {
        params.delete("noticeType");
      } else {
        params.set("noticeType", values.noticeType);
      }

      params.set("noticeOrderBy", values.noticeOrderBy);
      console.log("Client params", params.toString());
      router.replace(`${pathname}?${params.toString()}`);
    }),
    500
  );

  const createFieldHandler = (
    fieldName: keyof ProfileNoticesFilterClientSchema
  ) => ({
    ...register(fieldName, {
      onChange: () => {
        if (
          [
            "noticeType",
            "noticeOrderBy",
            "noticeStatus",
            "noticeCategory",
          ].includes(fieldName)
        ) {
          debouncedSubmit.cancel();
          debouncedSubmit();
        }
      },
    }),
  });

  return (
    <AppBar position="relative" sx={{ mt: 2 }}>
      <Toolbar
        id="profile-notices-filters-form"
        component="form"
        onChange={debouncedSubmit}
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
          <InputLabel id="notice-status-select-label">Status</InputLabel>
          <Select
            labelId="notice-status-select-label"
            id="notice-status-select"
            size="small"
            label="status"
            value={watch("noticeStatus")}
            {...createFieldHandler("noticeStatus")}
            sx={{
              height: "2.1em",
              bgcolor: (theme) => theme.palette.secondary.dark,
              "& .MuiSelect-select": {
                paddingX: "4px !important",
              },
            }}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Draft">Draft</MenuItem>
            <MenuItem value="Published">Published</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ flex: 1 }}>
          <InputLabel id="notice-category-select-label">Category</InputLabel>
          <Select
            labelId="notice-category-select-label"
            id="notice-category-select"
            size="small"
            label="category"
            value={watch("noticeCategory")}
            {...createFieldHandler("noticeCategory")}
            sx={{
              height: "2.1em",
              bgcolor: (theme) => theme.palette.secondary.dark,
              "& .MuiSelect-select": {
                paddingX: "4px !important",
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
        {/* </Grid2>
          <Grid2 size={{ xs: 3 }}> */}
        <FormControl sx={{ flex: 1 }}>
          <InputLabel id="notice-type-select-label">Type</InputLabel>
          <Select
            labelId="notice-type-select-label"
            id="notice-type-select"
            size="small"
            label="type"
            value={watch("noticeType")}
            {...createFieldHandler("noticeType")}
            sx={{
              height: "2.1em",
              bgcolor: (theme) => theme.palette.secondary.dark,
              "& .MuiSelect-select": {
                paddingX: "4px !important",
              },
            }}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Offer">Offer</MenuItem>
            <MenuItem value="Request">Request</MenuItem>
          </Select>
        </FormControl>
        {/* </Grid2>
          <Grid2 size={{ xs: 3 }}> */}
        <FormControl sx={{ flex: 1 }}>
          <InputLabel id="notice-order-by-select-label">Order by</InputLabel>
          <Select
            labelId="notice-order-by-select-label"
            id="notice-order-by-select"
            size="small"
            label="order by"
            value={watch("noticeOrderBy")}
            {...createFieldHandler("noticeOrderBy")}
            sx={{
              height: "2.1em",
              bgcolor: (theme) => theme.palette.secondary.dark,
              "& .MuiSelect-select": {
                paddingX: "4px !important",
              },
            }}
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
            <MenuItem value="popular">Popular</MenuItem>
            <MenuItem value="commented">Commented</MenuItem>
          </Select>
        </FormControl>
        {/* </Grid2> */}
        {/* <Box sx={{ flexGrow: 1 }} />
                  <IconButton
                    edge="start"
                    color="primary"
                    onClick={handleOpenNoticesFilters}
                    aria-label="close-profile-notices-filters"
                  >
                    <HideSourceIcon />
                  </IconButton> */}
        {/* </Grid2> */}
        {/* </Grid2>
        <Grid2 size="grow"></Grid2> */}
      </Toolbar>
    </AppBar>
  );
}
