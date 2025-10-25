import Link from "next/link";
import { Ghost, Trophy, Heart, Upload } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center">
      <div className="max-w-4xl space-y-8 text-center">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex justify-center gap-4 text-6xl">
            <span>🎃</span>
            <Ghost className="h-16 w-16 text-orange-600" />
            <span>👻</span>
          </div>

          <h1 className="bg-linear-to-r from-orange-600 via-purple-600 to-orange-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl">
            ISPGram
          </h1>

          <p className="text-2xl font-semibold text-gray-800">
            De Anza Halloween Costume Contest
          </p>

          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Show off your best Halloween costume, vote for your favorites, and compete
            for the top spot on the leaderboard! 🏆
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/submit"
            className="group flex items-center gap-2 rounded-full bg-linear-to-r from-orange-600 to-orange-700 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            <Upload className="h-5 w-5" />
            Submit Your Costume
          </Link>

          <Link
            href="/vote"
            className="group flex items-center gap-2 rounded-full border-2 border-purple-600 bg-white px-8 py-4 text-lg font-semibold text-purple-600 shadow-lg transition-all hover:scale-105 hover:bg-purple-50 hover:shadow-xl"
          >
            <Heart className="h-5 w-5" />
            Vote Now
          </Link>
        </div>

        {/* Contest Rules */}
        <div className="mx-auto mt-12 max-w-2xl rounded-lg border bg-white p-8 shadow-lg">
          <h2 className="mb-4 flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
            <Trophy className="h-6 w-6 text-orange-600" />
            Contest Rules
          </h2>

          <ul className="space-y-3 text-left text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-orange-600">•</span>
              <span>
                <strong>Who can participate:</strong> De Anza College students with a valid Student ID
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600">•</span>
              <span>
                <strong>Submissions:</strong> One costume entry per student (you can edit it anytime)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600">•</span>
              <span>
                <strong>Voting:</strong> Vote for as many costumes as you like! Help your favorites win!
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600">•</span>
              <span>
                <strong>Winner:</strong> The costume with the most votes takes the crown! 👑
              </span>
            </li>
          </ul>
        </div>

        {/* Features */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <Upload className="mx-auto mb-3 h-8 w-8 text-orange-600" />
            <h3 className="mb-2 font-semibold text-gray-900">Easy Upload</h3>
            <p className="text-sm text-gray-600">
              Upload your costume photo and description in seconds
            </p>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <Heart className="mx-auto mb-3 h-8 w-8 text-purple-600" />
            <h3 className="mb-2 font-semibold text-gray-900">Vote & Support</h3>
            <p className="text-sm text-gray-600">
              Vote for your favorite costumes and help them win
            </p>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <Trophy className="mx-auto mb-3 h-8 w-8 text-yellow-600" />
            <h3 className="mb-2 font-semibold text-gray-900">Live Leaderboard</h3>
            <p className="text-sm text-gray-600">
              Track the competition with real-time rankings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
