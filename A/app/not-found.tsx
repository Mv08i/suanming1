import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1410] px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-[#d4a574] mb-2 tracking-tight">404</h1>
          <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-[#d4a574]/50 to-transparent" />
        </div>

        <h2 className="text-2xl font-semibold text-[#f5e6d3] mb-3">
          Page Not Found
        </h2>
        <p className="text-[#a89888] mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#d4a574] text-[#1a1410] font-semibold hover:bg-[#c49464] transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-[#d4a574]/30 text-[#d4a574] font-semibold hover:bg-[#d4a574]/10 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
