"use client";

import {
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

interface ProfileNoticesPaginationProps {
  totalNotices: number;
  currentPage: number;
  pageSize: number;
}

const NoticesPagination = ({
  totalNotices,
  currentPage,
  pageSize,
}: ProfileNoticesPaginationProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(totalNotices / pageSize);

  const router = useRouter();

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", event.target.value.toString());
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        my: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <Pagination
        variant="outlined"
        shape="rounded"
        color="primary"
        count={totalPages}
        page={currentPage}
        hideNextButton
        hidePrevButton
        siblingCount={0}
        onChange={handlePageChange}
        // sx={{
        //   "& .MuiPaginationItem-root": {
        //     color: (theme) => theme.palette.primary.main,
        //   },
        //   "& .MuiPaginationItem-root.Mui-selected": {
        //     color: (theme) => theme.palette.primary.light,
        //   },
        // }}
      />

      <FormControl>
        <InputLabel id="notices-page-size-select-label">P/P</InputLabel>
        <Select
          variant="outlined"
          color="primary"
          labelId="notices-page-size-select-label"
          id="notices-page-size-select"
          label="P/P"
          value={pageSize}
          onChange={handlePageSizeChange}
          sx={{
            width: 44,
            height: 32,
            bgcolor: (theme) => theme.palette.secondary.dark,
            "& .MuiSelect-select": {
              paddingRight: "14px !important",
              textAlign: "center",
            },
          }}
        >
          <MenuItem value={3}>3</MenuItem>
          <MenuItem value={6}>6</MenuItem>
          <MenuItem value={12}>12</MenuItem>
        </Select>
      </FormControl>
    </Container>
  );
};
export default NoticesPagination;
