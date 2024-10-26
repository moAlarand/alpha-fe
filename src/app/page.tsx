import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center">ALPHA</h1>
        <p className="text-center text-gray-400">
قم بستجل الدخول لكي تتمكن من استخدام الفا لترشحيات الاسهم الرابحه في البورصه
        </p>
        <div className="flex justify-center mt-6">
        <Link href="/login">login</Link>
        </div>
      </div>
    </div>
  );
}