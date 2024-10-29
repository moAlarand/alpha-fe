"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ErrorPageContent = () => {
  const searchParams = useSearchParams();
  const message =
    searchParams.get("message") ||
    "An unexpected error occurred. Please try again later.";

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold">Oops!</h1>
        <p>Sorry, something went wrong.</p>
        <p className="text-red-500">{message}</p>
        <Link href="/" className="text-blue-400 hover:underline">
          Go back to home
        </Link>
      </div>
    </div>
  );
};

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorPageContent />
    </Suspense>
  );
}
