import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp,
  Users,
  Trophy,
  Target,
  FileText,
  Loader2, // Icon cho trạng thái loading
  Hash, // Icon cho Matches
  Goal, // Icon cho Goals
  GitCommitHorizontal, // Icon cho Goals/Match
  UserCheck, // Icon cho Attendance
  Award, // Icon cho Top Scorer
  Handshake, // Icon cho Assists
  ShieldCheck, // Icon cho Clean Sheets
  Shirt // Icon cho Appearances
} from 'lucide-react';

// --- DATA (Đưa ra ngoài component để tránh khởi tạo lại) ---

const reportTypes = [
  { id: 'tournament-overview', name: 'Tổng quan giải đấu', description: 'Thống kê và bảng xếp hạng toàn diện', icon: Trophy },
  { id: 'match-statistics', name: 'Thống kê trận đấu', description: 'Dữ liệu chi tiết và chỉ số hiệu suất', icon: BarChart3 },
  { id: 'player-performance', name: 'Hiệu suất cầu thủ', description: 'Thống kê và xếp hạng cá nhân', icon: Users },
  { id: 'team-analysis', name: 'Phân tích đội bóng', description: 'Hiệu suất và phân tích chiến thuật', icon: Target },
  { id: 'attendance-revenue', name: 'Khán giả & Doanh thu', description: 'Báo cáo tài chính và lượng khán giả', icon: TrendingUp },
  { id: 'media-coverage', name: 'Truyền thông', description: 'Bài báo và tương tác trên phương tiện', icon: FileText }
];

const tournamentStats = {
  totalMatches: 108,
  totalGoals: 312,
  averageGoals: 2.89,
  averageAttendance: 54142,
};

const topPerformers = {
  topScorer: { name: 'Robert Lewandowski', team: 'Barcelona', value: 7, label: 'Bàn thắng' },
  topAssists: { name: 'Raphinha', team: 'Barcelona', value: 4, label: 'Kiến tạo' },
  mostApps: { name: 'Virgil van Dijk', team: 'Liverpool', value: 6, label: 'Lần ra sân' },
  cleanSheets: { name: 'Caoimhín Kelleher', team: 'Liverpool', value: 5, label: 'Trận giữ sạch lưới' }
};


// --- COMPONENT CON (Chia nhỏ để dễ quản lý và tái sử dụng) ---

// Component thẻ thống kê
const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className={`p-4 bg-${color}-50 rounded-lg border border-${color}-200 flex items-center space-x-4`}>
    <div className={`p-3 rounded-full bg-${color}-100`}>
      <Icon size={24} className={`text-${color}-600`} />
    </div>
    <div>
      <div className="text-gray-600 text-sm font-medium">{title}</div>
      <div className={`text-3xl font-bold text-${color}-700`}>{value}</div>
    </div>
  </div>
);

// Component thẻ cầu thủ xuất sắc
const TopPerformerCard = ({ icon: Icon, category, name, team, value, label }) => (
  <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center space-x-3 mb-3">
      <Icon className="text-gray-500" size={20} />
      <h4 className="font-semibold text-gray-800">{category}</h4>
    </div>
    <p className="text-2xl font-bold text-gray-900">{name}</p>
    <p className="text-sm text-gray-500 mb-3">{team}</p>
    <p className="text-3xl font-extrabold text-blue-600">
      {value} <span className="text-base font-medium text-gray-600">{label}</span>
    </p>
  </div>
);

// Component nội dung cho các báo cáo chưa có dữ liệu
const PlaceholderReport = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <BarChart3 size={48} className="text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">Báo cáo {title}</h3>
        <p className="text-gray-500 mt-2">Nội dung chi tiết cho báo cáo này sẽ được hiển thị tại đây.</p>
    </div>
);


// Component nội dung cho báo cáo Tổng quan
const TournamentOverviewReport = () => (
  <div>
    {/* Key Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard 
        icon={Hash} 
        title="Tổng số trận" 
        value={tournamentStats.totalMatches} 
        color="blue" 
      />
      <StatCard 
        icon={Goal} 
        title="Tổng số bàn thắng" 
        value={tournamentStats.totalGoals} 
        color="green" 
      />
      <StatCard 
        icon={GitCommitHorizontal} 
        title="Bàn thắng/Trận" 
        value={tournamentStats.averageGoals} 
        color="purple" 
      />
      <StatCard 
        icon={UserCheck} 
        title="Khán giả trung bình" 
        value={tournamentStats.averageAttendance.toLocaleString()} 
        color="yellow" 
      />
    </div>

    {/* Top Performers */}
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-4">Cá nhân xuất sắc</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopPerformerCard 
          icon={Award} 
          category="Vua phá lưới" 
          name={topPerformers.topScorer.name} 
          team={topPerformers.topScorer.team} 
          value={topPerformers.topScorer.value}
          label={topPerformers.topScorer.label}
        />
        <TopPerformerCard 
          icon={Handshake} 
          category="Vua kiến tạo" 
          name={topPerformers.topAssists.name} 
          team={topPerformers.topAssists.team} 
          value={topPerformers.topAssists.value}
          label={topPerformers.topAssists.label}
        />
        <TopPerformerCard 
          icon={Shirt} 
          category="Ra sân nhiều nhất" 
          name={topPerformers.mostApps.name} 
          team={topPerformers.mostApps.team} 
          value={topPerformers.mostApps.value}
          label={topPerformers.mostApps.label}
        />
        <TopPerformerCard 
          icon={ShieldCheck} 
          category="Giữ sạch lưới" 
          name={topPerformers.cleanSheets.name} 
          team={topPerformers.cleanSheets.team} 
          value={topPerformers.cleanSheets.value}
          label={topPerformers.cleanSheets.label}
        />
      </div>
    </div>
  </div>
);


// --- COMPONENT CHÍNH ---

const ReportsPage = () => {
  const [selectedReport, setSelectedReport] = useState('tournament-overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '2024-09-01',
    end: '2025-01-22'
  });

  const generateReport = () => {
    setIsGenerating(true);
    console.log('Đang tạo báo cáo:', selectedReport, dateRange);

    // Giả lập thời gian chờ tạo báo cáo
    setTimeout(() => {
      setIsGenerating(false);
      alert('Tạo báo cáo thành công!');
    }, 1500);
  };

  // Hàm render nội dung báo cáo tương ứng
  const renderReportContent = () => {
    const reportName = reportTypes.find(r => r.id === selectedReport)?.name || '';
    switch (selectedReport) {
      case 'tournament-overview':
        return <TournamentOverviewReport />;
      // Thêm các case khác ở đây khi có component tương ứng
      // case 'match-statistics':
      //   return <MatchStatisticsReport />;
      default:
        return <PlaceholderReport title={reportName} />;
    }
  };
  
  const selectedReportName = useMemo(() => 
    reportTypes.find(r => r.id === selectedReport)?.name,
  [selectedReport]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Báo cáo & Phân tích</h1>
            <p className="text-gray-600 mt-2">Tạo các báo cáo và thống kê toàn diện về giải đấu</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button 
              onClick={generateReport}
              disabled={isGenerating}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed w-44"
            >
              {isGenerating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              <span>{isGenerating ? 'Đang tạo...' : 'Tạo báo cáo'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Selection & Content */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Cột trái: Chọn loại báo cáo */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-8">
            <h3 className="font-semibold text-gray-900 mb-4 px-3">Loại báo cáo</h3>
            <div className="space-y-1">
              {reportTypes.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                    selectedReport === report.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <report.icon size={18} />
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className={`text-xs ${selectedReport === report.id ? 'text-blue-100' : 'text-gray-500'}`}>
                      {report.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cột phải: Nội dung báo cáo */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Header của nội dung */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-3 md:mb-0">
                {selectedReportName}
              </h2>
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-gray-500" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">đến</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Nội dung báo cáo được render động */}
            {renderReportContent()}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;