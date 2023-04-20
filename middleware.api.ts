import { withAuth } from 'next-auth/middleware'

// this will route to the login screen if not logged in, from any route
// todo: might want to exclude pages/api so it can send json back instead of redirecting to sign in page
// see: https://next-auth.js.org/configuration/nextjs#middleware
export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      // disable sign in redirect in dev/test mode. Must also set a userId in [...nextauth]'s callback
      if (process.env.NODE_ENV !== 'production') {
        return true
      }
      // this is the default behavior
      return !!token
    },
  },
})
