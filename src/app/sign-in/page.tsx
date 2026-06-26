import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";

export default async function SignInPage() {
  const session = await auth();
  if (session) redirect("/");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 flex flex-col items-center gap-8 w-full max-w-sm">
        {/* logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                fill="white"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            Civic Fix-It Board
          </h1>
          <p className="text-sm text-gray-500">
            Sign in to report and track local issues
          </p>
        </div>

        {/* google button */}
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
          className="w-full"
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
              />
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center">
          By signing in you agree to report issues responsibly and in good
          faith.
        </p>
      </div>
    </div>
  );
}