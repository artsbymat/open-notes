import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex justify-center items-center h-full flex-col">
      <h1 className="text-2xl">404 | Page Not Found</h1>
      <Link href="/" className="mt-2 text-link hover:underline">
        Back to Home Page
      </Link>
    </div>
  );
}
