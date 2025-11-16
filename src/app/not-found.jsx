import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <h1 className="text-2xl">404 | Page Not Found</h1>
      <Link href="/" className="text-link mt-2 hover:underline">
        Back to Home Page
      </Link>
    </div>
  );
}
