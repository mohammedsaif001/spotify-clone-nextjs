import spotifyAPI, { LOGIN_URL } from "@/lib/spotify"
import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"


// refer Next auth token rotation page for detail explanation
// https://next-auth.js.org/v3/tutorials/refresh-token-rotation


/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token) {
    try {
        spotifyAPI.setAccessToken(token.accessToken)
        spotifyAPI.setRefreshToken(token.refreshToken)

        // After sending the above 2 tokens - access token and refresh token, we are getting the new access token ; as the refresh token doesn't expire only the access token does
        const { body: refreshedToken } = await spotifyAPI.refreshAccessToken()

        return {
            ...token,
            accessToken: refreshedToken.access_token,
            accessTokenExpires: Date.now() + refreshedToken.expires_in * 1000,  //1hr as 3600 returns from spotify API
            refreshToken: refreshedToken.refresh_token ?? token.refreshToken, // replace if the new one came back else fall back to old refresh token
        }
    } catch (error) {
        console.log(error)

        return {
            ...token,
            error: "RefreshAccessTokenError",
        }
    }
}




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
    secret: process.env.JWT_SECRET,
    pages: {
        signIn: "/login"
    },
    callbacks: {
        // Getting JWT token after signing in from spotify
        async jwt({ token, account, user }) {
            // Initial sign in
            if (account && user) {
                console.log("Initial Sigin", account)
                return {
                    accessToken: account.access_token,
                    accessTokenExpires: account.expires_at * 1000, //we are handling expiry times in ms hence * 1000
                    refreshToken: account.refresh_token,
                    username: account.providerAccountId,
                }
            }

            // Return previous token if the access token has not expired yet
            if (Date.now() < token.accessTokenExpires) {
                console.log("Existing Access Token Is Valid")
                return token
            }

            // Access token has expired, try to update it
            console.log("Access Token Has Expired, Refreshing")
            return await refreshAccessToken(token)
        },

        async session({ session, token }) {
            session.user.accessToken = token.accessToken;
            session.user.refreshToken = token.refreshToken;
            session.user.username = token.username;

            return session
        }
    }
}

export default NextAuth(authOptions)