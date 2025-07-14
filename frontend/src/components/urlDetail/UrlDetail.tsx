import type { UrlDetail } from '../../types/urlDetail';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#4F46E5', '#F59E42'];

export default function UrlDetailView({ url }: { url: UrlDetail }) {
  const chartData = [
    { name: 'Internal Links', value: url.internalLinkCount },
    { name: 'External Links', value: url.externalLinkCount },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold mb-4 break-all">{url.pageTitle || url.url}</h2>
      
      {/* Link Distribution Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Link Distribution</h3>
        <div className="w-full h-64" data-testid="link-distribution-chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {chartData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Broken Links Table */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Broken Links</h3>
        {url.brokenLinks.length === 0 ? (
          <div className="text-gray-500 bg-gray-50 p-4 rounded-md border border-gray-200">
            No broken links found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">URL</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">Status Code</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {url.brokenLinks.map((link, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-b border-gray-200 break-all text-sm text-gray-900">{link.url}</td>
                    <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        link.statusCode >= 400 && link.statusCode < 500 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {link.statusCode}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 