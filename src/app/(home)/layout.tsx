import { auth } from "@/auth";
import HomeNavbars from "@/components/Home/HomeNavbars";
import { getProfileDataForMenu } from "@/lib/actions";

async function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  const isAuthenticated = !!session?.user;

  const profileData = isAuthenticated ? await getProfileDataForMenu() : null;

  return (
    <HomeNavbars isAuthenticated={isAuthenticated} profileData={profileData}>
      {children}
    </HomeNavbars>
  );
}

export default HomeLayout;

// async function HomeLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   const session = await auth();

//   const isAuthenticated = !!session?.user;

//   const profileData = isAuthenticated ? await getProfileDataForMenu() : null;

//   return (
//     <>
//       {isAuthenticated ? (
//         <ProfileNavbar profileData={profileData} />
//       ) : (
//         <GuestNavbar />
//       )}
//       {children}
//     </>
//   );
// }

// export default HomeLayout;
