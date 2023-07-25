import { LOGIN_URL } from "@/lib/spotify"
import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"

export const authOptions = {
    // Configure one or more authentication providers
    providers: [
        SpotifyProvider({
            clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
            clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
            authorization: LOGIN_URL  //User will be sent to authorization page from SPotify
        }),
        // ...add more providers here
    ],
}

export default NextAuth(authOptions)