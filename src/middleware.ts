import { auth } from "@/auth";
import { NextResponse, type NextRequest } from "next/server";
import { authRoutes, publicRoutes } from "./routes";

// const middleware = async (req: NextRequest) => {
//   const { nextUrl } = req;
//   const path = nextUrl.pathname;

//   // Skip middleware for static files and assets
//   if (
//     path.startsWith("/_next") ||
//     path.startsWith("/api/auth") || // Skip auth API routes
//     path === "/favicon.ico" ||
//     path === "/icon.ico" ||
//     path.match(/\.(png|jpg|jpeg|svg|gif)$/) ||
//     path === "/robots.txt" ||
//     path === "/sitemap.xml"
//   ) {
//     return NextResponse.next();
//   }

//   console.log("Middleware triggered for path:", path);

//   const session = await auth();
//   console.log("Session:", session);

//   const isSignedIn = !!session?.user;
//   console.log("Is signed in:", isSignedIn);

//   const isPublic = publicRoutes.includes(path);
//   const isAuthRoute = authRoutes.includes(path);

//   console.log("Is public route:", isPublic);
//   console.log("Is auth route:", isAuthRoute);

//   if (isPublic) {
//     console.log("Allowing access to public route:", path);
//     return NextResponse.next();
//   }

//   if (isAuthRoute) {
//     if (isSignedIn) {
//       return NextResponse.redirect(new URL("/profile", nextUrl));
//     }
//     console.log("Allowing access to auth route:", path);
//     return NextResponse.next();
//   }

//   if (!isSignedIn && !isPublic) {
//     console.log("Redirecting unauthenticated user to /sign-in");
//     return NextResponse.redirect(new URL("/sign-in", nextUrl));
//   }

//   console.log("Allowing access to protected route:", path);
//   return NextResponse.next();
// };

// export default middleware;

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon\\.ico|icon\\.ico|robots\\.txt|sitemap\\.xml).*)",
//     "/api/:path*",
//   ],
// };

const middleware = async (req: NextRequest) => {
  const { nextUrl } = req;

  const session = await auth();

  const isSignedIn = !!session?.user;

  const isPublic = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isPublic) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isSignedIn) {
      return NextResponse.redirect(new URL("/profile", nextUrl));
    }
    return NextResponse.next();
  }

  if (!isSignedIn && !isPublic) {
    return NextResponse.redirect(new URL("/sign-in", nextUrl));
  }

  return NextResponse.next();
};
export default middleware;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|sitemap.xml|robots.txt|.*\\.(?:css|js|png|jpg|jpeg|gif|svg|ico)).*)",
  ],
};
