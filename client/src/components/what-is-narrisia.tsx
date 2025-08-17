export default function WhatIsNarrisia() {
  return (
    <section className="py-16 md:py-24 bg-black relative overflow-hidden pt-[1px] pb-[1px]">
      <div className="container animate-slide-in text-center mx-auto pt-8 px-6 pb-12">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="md:text-6xl lg:text-7xl leading-tight text-5xl font-light tracking-tighter mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400">Every person is a CEO</span>
            <br />
            <span className="text-white">of their own life</span>
          </h1>
          <p className="md:text-2xl max-w-3xl text-xl font-bold text-gray-300 tracking-normal text-center mx-auto mb-8">
            Transform Executive Productivity Through Autonomous Intelligence
          </p>
        </div>

        {/* Feature Bento Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-in">
            {/* Large Featured Cell */}
            <div className="lg:col-span-2 lg:row-span-2 glass-effect gradient-border rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-medium text-white mb-1">AI Intelligence Framework</h3>
                  <p className="text-gray-400">Advanced cognitive layers for autonomous decision-making</p>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                <div className="bg-neutral-800/50 rounded-lg p-4 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Core Layer</span>
                    <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded">Real-time</span>
                  </div>
                  <p className="text-white font-medium">Email Intelligence Pipeline</p>
                  <p className="text-gray-400 text-sm mt-1">Configuration → Parsing → Quality Analysis → Credibility Scoring</p>
                  <div className="mt-3 flex space-x-2">
                    <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="bg-neutral-800/50 rounded-lg p-4 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Decision Layer</span>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Autonomous</span>
                  </div>
                  <p className="text-white font-medium">Intelligent Response Engine</p>
                  <p className="text-gray-400 text-sm mt-1">Relevancy Scoring → Priority Recommendations → Auto Conversations</p>
                  <div className="mt-3 flex space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="bg-neutral-800/50 rounded-lg p-4 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Execution Layer</span>
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Multi-modal</span>
                  </div>
                  <p className="text-white font-medium">Omnichannel Operations</p>
                  <p className="text-gray-400 text-sm mt-1">Meeting Scheduler → Voice Agent → Performance Analytics</p>
                  <div className="mt-3 flex space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  </div>
                </div>
              </div>

            </div>

            {/* Smaller Content Areas */}
            <div className="glass-effect rounded-2xl p-6 shadow-lg border border-gray-800">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v14" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white">API Reference</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">Comprehensive REST API documentation with examples</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Endpoints</span>
                  <span className="text-teal-400">120+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">SDKs</span>
                  <span className="text-teal-400">8</span>
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-2xl p-6 shadow-lg border border-gray-800">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white">Security</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">Enterprise-grade security and compliance</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">SOC-2</span>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">GDPR</span>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">HIPAA</span>
              </div>
            </div>

            <div className="glass-effect border-gray-800 border rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16 18 6-6-6-6" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m8 6-6 6 6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white">Examples</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">Ready focus on Living while AI does your daily mundane work</p>
              <div className="space-y-2">
                <div className="text-sm text-gray-300">• Email Agent Setup</div>
                <div className="text-sm text-gray-300">• Calendar Integration</div>
                <div className="text-sm text-gray-300">• Custom Workflows</div>
              </div>
            </div>

            <div className="glass-effect rounded-2xl p-6 shadow-lg border border-gray-800">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 3.128a4 4 0 0 1 0 7.744" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white">Community</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">Join our developer community</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Discord</span>
                  <span className="text-teal-400">2.5k+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">GitHub</span>
                  <span className="text-teal-400">1.2k★</span>
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-2xl p-6 shadow-lg border border-gray-800">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white">Support</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">24/7 enterprise support</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Response</span>
                  <span className="text-teal-400">&lt; 1hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Uptime</span>
                  <span className="text-teal-400">99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}