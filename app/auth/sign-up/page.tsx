"use client"
import { authClient } from "../_lib/auth-client"

export default function Signup() {
    async function Google() {
        await authClient.signIn.social({
            provider:"google",
            callbackURL:"/startup/new"
        })
    }
    return (
        <div className="min-h-screen flex justify-center items-center bg-linear-to-tr from-orange-500 via-black to-gray-500">
            <div className="flex flex-col gap-2">
                <p className="text-2xl m-2 text-gray-200">To build startup & track <span className="underline decoration-pink-500 decoration-4 underline-offset-8"> work</span> you need create account</p>
                <button onClick={Google} className="font-[Playfair_Display] hover:cursor-pointer text-3xl bg-gray-100 shadow-md shadow-white rounded-4xl p-4 m-2">Continue with Google</button>
            </div>
        </div>
    )
}