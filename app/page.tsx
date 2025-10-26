import Link from "next/link";
import { GraduationCap, Trophy, Heart, Upload } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center">
      <div className="max-w-4xl space-y-8 text-center">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex justify-center gap-4 text-6xl">
            <span>🎓</span>
            <GraduationCap className="h-16 w-16 text-sky-600" />
            <span>📚</span>
          </div>

          <h1 className="bg-linear-to-r from-sky-600 via-indigo-600 to-sky-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl">
            ISPGram
          </h1>

          <p className="text-2xl font-semibold text-gray-800">
            De Anza ISP Education Week Activity
          </p>

          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Join the Education Week activity hosted by the De Anza ISP Office for the International
            Student Program—share your photos, enjoy the gamified challenge, and have fun together!
            Presented with love by the De Anza ISP Office. Have fun, guys! 🌟
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/submit"
            className="group flex items-center gap-2 rounded-full bg-linear-to-r from-sky-600 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            <Upload className="h-5 w-5" />
            Share Your Photos
          </Link>

          <Link
            href="/vote"
            className="group flex items-center gap-2 rounded-full border-2 border-indigo-600 bg-white px-8 py-4 text-lg font-semibold text-indigo-600 shadow-lg transition-all hover:scale-105 hover:bg-indigo-50 hover:shadow-xl"
          >
            <Heart className="h-5 w-5" />
            Cheer & Vote
          </Link>
        </div>

        {/* Activity Highlights */}
        <div className="mx-auto mt-12 max-w-2xl rounded-lg border bg-white p-8 shadow-lg">
          <h2 className="mb-4 flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
            <Trophy className="h-6 w-6 text-sky-600" />
            Activity Highlights
          </h2>

          <ul className="space-y-3 text-left text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-sky-600">•</span>
              <span>
                <strong>Who can participate:</strong> De Anza College ISP students celebrating Education Week
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-600">•</span>
              <span>
                <strong>Submissions:</strong> Share one Education Week experience—photos, projects, or moments (update anytime)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-600">•</span>
              <span>
                <strong>Voting:</strong> Celebrate your friends by liking as many entries as you enjoy!
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-600">•</span>
              <span>
                <strong>Recognition:</strong> Top entries earn shout-outs from the ISP Office—have fun and get involved! 🎉
              </span>
            </li>
          </ul>
        </div>

        {/* Features */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <Upload className="mx-auto mb-3 h-8 w-8 text-sky-600" />
            <h3 className="mb-2 font-semibold text-gray-900">Easy Sharing</h3>
            <p className="text-sm text-gray-600">
              Highlight your Education Week story with a quick photo and caption
            </p>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <Heart className="mx-auto mb-3 h-8 w-8 text-indigo-600" />
            <h3 className="mb-2 font-semibold text-gray-900">Support Friends</h3>
            <p className="text-sm text-gray-600">
              Send hearts to the moments that inspire you and boost their points
            </p>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <Trophy className="mx-auto mb-3 h-8 w-8 text-amber-500" />
            <h3 className="mb-2 font-semibold text-gray-900">Friendly Leaderboard</h3>
            <p className="text-sm text-gray-600">
              Follow the friendly competition with real-time recognition
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
