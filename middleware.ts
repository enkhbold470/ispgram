import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/submit', '/api/entries', '/api/votes', '/results', '/admin', '/api/emails'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - opengraph-image.jpeg (OpenGraph image - must be accessible)
    // - Other static files (images, fonts, etc.)
    '/((?!api|_next/static|_next/image|favicon.ico|opengraph-image\\.jpeg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

