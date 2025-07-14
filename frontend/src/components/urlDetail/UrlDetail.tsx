import type { UrlDetail } from '../../types/urlDetail';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#4F46E5', '#F59E42'];

export default function UrlDetailView({ url }: { url: UrlDetail }) {
  const chartData = [
    { name: 'Internal Links', value: url.internalLinkCount },
    { name: 'External Links', value: url.externalLinkCount },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 break-all">{url.pageTitle || url.url}</h2>
      <div className="mb-6">
        <div className="w-full h-64">
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
      <div>
        <h3 className="text-lg font-semibold mb-2">Broken Links</h3>
        {url.brokenLinks.length === 0 ? (
          <div className="text-gray-500">No broken links found.</div>
        ) : (
          <table className="min-w-full border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border-b">URL</th>
                <th className="px-4 py-2 border-b">Status Code</th>
              </tr>
            </thead>
            <tbody>
              {url.brokenLinks.map((link, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 border-b break-all">{link.url}</td>
                  <td className="px-4 py-2 border-b">{link.statusCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 