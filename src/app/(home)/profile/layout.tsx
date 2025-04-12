import ProfileHome from "@/components/Profile/ProfileHome";

function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ProfileHome />
      {children}
    </>
  );
}

export default ProfileLayout;
