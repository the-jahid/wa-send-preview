'use client';

export default function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
        <p className="text-sm text-gray-600 mt-1">
          Plug in your charts (daily usage, response rates, conversions).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
          <p className="text-sm text-gray-600 mb-3">Usage over time</p>
          <div className="h-56 border border-dashed border-gray-300 rounded-lg grid place-items-center text-gray-500">
            Chart area
          </div>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
          <p className="text-sm text-gray-600 mb-3">Lead funnel</p>
          <div className="h-56 border border-dashed border-gray-300 rounded-lg grid place-items-center text-gray-500">
            Chart area
          </div>
        </div>
      </div>
    </div>
  );
}
