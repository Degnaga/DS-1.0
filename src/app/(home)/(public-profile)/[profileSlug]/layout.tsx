import PublicProfileHome from "@/components/Profile/PublicProfileHome";
import { getProfileBySlug } from "@/lib/actions";
import { notFound } from "next/navigation";

async function ProfilePublicLayout({
  children,
  params,
}: {
  params: Promise<{ profileSlug: string }>;
  children: React.ReactNode;
}) {
  const { profileSlug } = await params;
  const profile = await getProfileBySlug(profileSlug);

  if (profile.status === "error") {
    notFound();
  }

  return (
    <>
      <PublicProfileHome profile={profile.data} />
      {children}
    </>
  );
}

export default ProfilePublicLayout;
