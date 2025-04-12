export const dynamic = "force-dynamic";

import UpdateProfileForm from "@/components/Profile/UpdateProfileForm";
import { getUserProfile } from "@/lib/actions";
import { notFound } from "next/navigation";

async function UpdateProfilePage() {
  const profile = await getUserProfile();

  if (profile.error) {
    if (profile.status === 404) {
      notFound();
    }

    throw new Error(profile.error);
  }

  return <UpdateProfileForm profile={profile.data} />;
}
export default UpdateProfilePage;
