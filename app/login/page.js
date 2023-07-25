// import { signIn, useSession } from "next-auth/client";
import { getProviders, signIn } from "next-auth/react"

const LoginPage = ({ providers }) => {
    return (
        <div>
            <h1>This is a Login Page</h1>
        </div>
    )
}
export default LoginPage

// Server Side Rendering

export async function getServersSideProps() {
    const providers = await getProviders()
    return {
        props: {
            providers,
        }
    }
}