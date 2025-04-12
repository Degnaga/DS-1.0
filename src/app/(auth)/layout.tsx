import AuthFooter from "@/components/Auth/AuthFooter";
import AuthNavbar from "@/components/Auth/AuthNavbar";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AuthNavbar />
      {children}
      <AuthFooter />
    </>
  );
};
export default AuthLayout;
