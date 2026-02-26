"use client";

import { useRouter } from "next/navigation";

export function HeroSection() {
  const router = useRouter();

  return (
    <section
      className="relative min-h-[calc(100vh-72px)] overflow-hidden"
      style={{ backgroundColor: "rgb(5, 7, 10)" }}
    >
      {/* Background gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom right, rgb(5, 7, 10), rgb(10, 15, 25), rgb(8, 12, 22))",
        }}
      />

      {/* Animated background elements */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl opacity-40 animate-pulse" />
      <div
        className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl opacity-30 animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      {/* Content */}
      <div className="relative max-w-[1300px] mx-auto px-6 py-20 lg:py-0 lg:h-[calc(100vh-72px)] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 w-full items-center">
          {/* Left Column - Text Content */}
          <div className="flex flex-col justify-center space-y-5">
            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-[1.05] tracking-tight">
              Connecting{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent animate-pulse">
                Students and Responders
              </span>
              <span className="text-white"> When It Matters Most.</span>
            </h1>

            {/* Supporting Paragraph */}
            <p className="text-base md:text-lg text-gray-300 leading-snug max-w-xl opacity-80">
              ResQ is a disaster response and student safety platform that
              ingests and standardizes your emergency data and tracks changes in
              real time during crisis situations.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => router.push("/signup")}
                className="rounded-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 px-8 py-4 text-base font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-purple-600/50 group"
              >
                <span className="flex items-center justify-center">
                  Sign up
                </span>
              </button>
            </div>
          </div>

          {/* Right Column - 3D Neon Illustration */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-xl aspect-square perspective">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-cyan-500/20 to-indigo-700/30 rounded-3xl blur-2xl" />
              <div className="absolute inset-2 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl" />

              {/* Main container */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full max-w-lg max-h-lg">
                  {/* Central laptop card */}
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-2xl border border-cyan-400/40 overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(6, 28, 55, 0.4) 0%, rgba(23, 37, 84, 0.3) 100%)",
                      boxShadow: `
                        0 0 60px rgba(34, 211, 238, 0.25),
                        0 0 30px rgba(59, 130, 246, 0.15),
                        inset 0 0 40px rgba(34, 211, 238, 0.1)
                      `,
                    }}
                  >
                    <div className="relative w-4/5 h-4/5 flex items-center justify-center">
                      <div
                        className="text-7xl animate-bounce"
                        style={{ animationDuration: "3s" }}
                      >
                        💻
                      </div>
                    </div>
                  </div>

                  {/* AWS badge - top right */}
                  <div
                    className="absolute -top-6 -right-6 w-24 h-24 rounded-lg border border-orange-400/60 flex items-center justify-center text-3xl bg-orange-600/20 backdrop-blur-sm"
                    style={{
                      boxShadow: `0 0 40px rgba(249, 115, 22, 0.35), inset 0 0 20px rgba(249, 115, 22, 0.2)`,
                    }}
                  >
                    ☁️
                  </div>

                  {/* Azure badge - bottom left */}
                  <div
                    className="absolute -bottom-4 -left-8 w-28 h-28 rounded-full border border-cyan-400/60 flex items-center justify-center text-3xl bg-cyan-500/20 backdrop-blur-sm"
                    style={{
                      boxShadow: `0 0 50px rgba(34, 211, 238, 0.4), inset 0 0 25px rgba(34, 211, 238, 0.25)`,
                    }}
                  >
                    ⬜
                  </div>

                  {/* GCP badge - bottom right */}
                  <div
                    className="absolute bottom-6 right-4 w-32 h-32 rounded-2xl border border-purple-400/60 flex items-center justify-center text-3xl bg-gradient-to-br from-purple-600/25 to-indigo-600/20 backdrop-blur-sm"
                    style={{
                      boxShadow: `0 0 45px rgba(168, 85, 247, 0.3), inset 0 0 20px rgba(168, 85, 247, 0.15)`,
                    }}
                  >
                    🔷
                  </div>

                  {/* Neon connecting lines */}
                  <svg
                    className="absolute inset-0 w-full h-full"
                    style={{
                      filter: "drop-shadow(0 0 10px rgba(34, 211, 238, 0.3))",
                    }}
                  >
                    {/* Line to AWS */}
                    <path
                      d="M 70% 30% Q 85% 20% 90% 15%"
                      stroke="url(#gradientCyanOrange)"
                      strokeWidth="2"
                      fill="none"
                      opacity="0.7"
                      strokeLinecap="round"
                    />
                    {/* Line to Azure */}
                    <path
                      d="M 30% 70% Q 15% 75% 10% 80%"
                      stroke="url(#gradientCyanBlue)"
                      strokeWidth="2"
                      fill="none"
                      opacity="0.7"
                      strokeLinecap="round"
                    />
                    {/* Line to GCP */}
                    <path
                      d="M 75% 65% Q 85% 75% 90% 80%"
                      stroke="url(#gradientPurpleCyan)"
                      strokeWidth="2"
                      fill="none"
                      opacity="0.7"
                      strokeLinecap="round"
                    />

                    {/* Gradient definitions */}
                    <defs>
                      <linearGradient
                        id="gradientCyanOrange"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor="rgb(34, 211, 238)"
                          stopOpacity="1"
                        />
                        <stop
                          offset="100%"
                          stopColor="rgb(249, 115, 22)"
                          stopOpacity="1"
                        />
                      </linearGradient>
                      <linearGradient
                        id="gradientCyanBlue"
                        x1="100%"
                        y1="100%"
                        x2="0%"
                        y2="0%"
                      >
                        <stop
                          offset="0%"
                          stopColor="rgb(34, 211, 238)"
                          stopOpacity="1"
                        />
                        <stop
                          offset="100%"
                          stopColor="rgb(59, 130, 246)"
                          stopOpacity="1"
                        />
                      </linearGradient>
                      <linearGradient
                        id="gradientPurpleCyan"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor="rgb(168, 85, 247)"
                          stopOpacity="1"
                        />
                        <stop
                          offset="100%"
                          stopColor="rgb(34, 211, 238)"
                          stopOpacity="1"
                        />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Floating particles effect */}
                  <div
                    className="absolute top-1/4 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-ping"
                    style={{ animationDuration: "2s", opacity: 0.7 }}
                  />
                  <div
                    className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-ping"
                    style={{
                      animationDuration: "3s",
                      animationDelay: "0.5s",
                      opacity: 0.6,
                    }}
                  />
                  <div
                    className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-orange-400 rounded-full animate-ping"
                    style={{
                      animationDuration: "2.5s",
                      animationDelay: "1s",
                      opacity: 0.5,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile 3D illustration fallback */}
      <div className="lg:hidden flex justify-center mt-12 mb-8">
        <div className="relative w-64 h-64 bg-gradient-to-br from-purple-600/20 via-cyan-500/10 to-indigo-700/20 rounded-3xl border border-cyan-400/20 flex items-center justify-center">
          <div
            className="text-6xl animate-bounce"
            style={{ animationDuration: "3s" }}
          >
            💻
          </div>
        </div>
      </div>
    </section>
  );
}
