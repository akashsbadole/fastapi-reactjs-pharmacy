import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  DateRange as DateRangeIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  PictureAsPdf as PdfIcon,
  Description as ExcelIcon,
  Assessment as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Print as PrintIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { reportsService } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function Reports() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Report parameters
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('today');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [reportDetailsOpen, setReportDetailsOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Dashboard data
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchReport();
    
    // Set up network status monitoring
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    if (window.electronAPI) {
      window.electronAPI.onOnline(handleOnline);
      window.electronAPI.onOffline(handleOffline);
    } else {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }
    
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('online');
        window.electronAPI.removeAllListeners('offline');
      } else {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, [reportType, dateRange, startDate, endDate]);

  const fetchDashboardData = async () => {
    try {
      if (!isOnline) {
        // Load cached dashboard data if offline
        const cachedData = localStorage.getItem('reports_dashboard');
        if (cachedData) {
          setDashboardData(JSON.parse(cachedData));
        }
        return;
      }
      
      const data = await reportsService.getDashboardData();
      setDashboardData(data);
      localStorage.setItem('reports_dashboard', JSON.stringify(data));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      // Try to load cached data
      const cachedData = localStorage.getItem('reports_dashboard');
      if (cachedData) {
        setDashboardData(JSON.parse(cachedData));
      }
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot fetch reports while offline');
        setLoading(false);
        return;
      }
      
      let params = {};
      
      if (dateRange === 'custom') {
        params.start_date = startDate;
        params.end_date = endDate;
      } else {
        params.date_range = dateRange;
      }
      
      let data;
      switch (reportType) {
        case 'sales':
          data = await reportsService.getSalesReport(params);
          break;
        case 'inventory':
          data = await reportsService.getInventoryReport(params);
          break;
        case 'prescriptions':
          data = await reportsService.getPrescriptionReport(params);
          break;
        case 'patients':
          data = await reportsService.getPatientsReport(params);
          break;
        case 'financial':
          data = await reportsService.getFinancialReport(params);
          break;
        case 'expiry':
          data = await reportsService.getExpiryReport(params);
          break;
        default:
          data = await reportsService.getSalesReport(params);
      }
      
      setReportData(data);
      prepareChartData(data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (data) => {
    if (!data) return;
    
    let chartConfig = {};
    
    switch (reportType) {
      case 'sales':
        chartConfig = {
          labels: data.daily_sales?.map(item => item.date) || [],
          datasets: [
            {
              label: 'Sales',
              data: data.daily_sales?.map(item => item.total) || [],
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        };
        break;
        
      case 'inventory':
        chartConfig = {
          labels: data.category_distribution?.map(item => item.category) || [],
          datasets: [
            {
              label: 'Stock Value',
              data: data.category_distribution?.map(item => item.value) || [],
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
              ],
              borderWidth: 1,
            },
          ],
        };
        break;
        
      case 'prescriptions':
        chartConfig = {
          labels: data.daily_prescriptions?.map(item => item.date) || [],
          datasets: [
            {
              label: 'Prescriptions',
              data: data.daily_prescriptions?.map(item => item.count) || [],
              fill: false,
              borderColor: 'rgba(75, 192, 192, 1)',
              tension: 0.1,
            },
          ],
        };
        break;
        
      case 'patients':
        chartConfig = {
          labels: ['New Patients', 'Returning Patients'],
          datasets: [
            {
              label: 'Patients',
              data: [data.new_patients || 0, data.returning_patients || 0],
              backgroundColor: [
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 99, 132, 0.6)',
              ],
              borderWidth: 1,
            },
          ],
        };
        break;
        
      case 'financial':
        chartConfig = {
          labels: data.revenue_expenses?.map(item => item.month) || [],
          datasets: [
            {
              label: 'Revenue',
              data: data.revenue_expenses?.map(item => item.revenue) || [],
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
            {
              label: 'Expenses',
              data: data.revenue_expenses?.map(item => item.expenses) || [],
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
          ],
        };
        break;
        
      case 'expiry':
        chartConfig = {
          labels: data.expiry_by_month?.map(item => item.month) || [],
          datasets: [
            {
              label: 'Expiring Items',
              data: data.expiry_by_month?.map(item => item.count) || [],
              backgroundColor: 'rgba(255, 159, 64, 0.6)',
              borderColor: 'rgba(255, 159, 64, 1)',
              borderWidth: 1,
            },
          ],
        };
        break;
        
      default:
        chartConfig = {
          labels: [],
          datasets: [],
        };
    }
    
    setChartData(chartConfig);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleExportReport = async (format) => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot export reports while offline');
        setLoading(false);
        return;
      }
      
      let params = {
        format: format,
        report_type: reportType,
      };
      
      if (dateRange === 'custom') {
        params.start_date = startDate;
        params.end_date = endDate;
      } else {
        params.date_range = dateRange;
      }
      
      const response = await reportsService.exportReport(params);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSuccess(`Report exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('Error exporting report:', err);
      setError('Failed to export report');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReport = () => {
    if (window.electronAPI) {
      window.electronAPI.printReport(reportData);
    } else {
      window.print();
    }
  };

  const handleViewDetails = (item) => {
    setSelectedReport(item);
    setReportDetailsOpen(true);
  };

  const renderDashboardCards = () => {
    if (!dashboardData) return null;
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box flexGrow={1}>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Today's Sales
                  </Typography>
                  <Typography variant="h4">
                    ${dashboardData.today_sales?.total || '0.00'}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    {dashboardData.today_sales?.change >= 0 ? (
                      <TrendingUpIcon color="success" fontSize="small" />
                    ) : (
                      <TrendingDownIcon color="error" fontSize="small" />
                    )}
                    <Typography
                      variant="body2"
                      color={dashboardData.today_sales?.change >= 0 ? 'success.main' : 'error.main'}
                      sx={{ ml: 1 }}
                    >
                      {Math.abs(dashboardData.today_sales?.change || 0)}%
                    </Typography>
                  </Box>
                </Box>
                <AnalyticsIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box flexGrow={1}>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Total Prescriptions
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData.total_prescriptions || 0}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    {dashboardData.prescriptions_change >= 0 ? (
                      <TrendingUpIcon color="success" fontSize="small" />
                    ) : (
                      <TrendingDownIcon color="error" fontSize="small" />
                    )}
                    <Typography
                      variant="body2"
                      color={dashboardData.prescriptions_change >= 0 ? 'success.main' : 'error.main'}
                      sx={{ ml: 1 }}
                    >
                      {Math.abs(dashboardData.prescriptions_change || 0)}%
                    </Typography>
                  </Box>
                </Box>
                <AnalyticsIcon color="secondary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box flexGrow={1}>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Low Stock Items
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData.low_stock_items || 0}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Chip
                      label="Alert"
                      size="small"
                      color={dashboardData.low_stock_items > 0 ? 'warning' : 'success'}
                    />
                  </Box>
                </Box>
                <AnalyticsIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box flexGrow={1}>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Expiring Soon
                  </Typography>
                  <Typography variant="h4">
                    {dashboardData.expiring_soon || 0}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Chip
                      label="Alert"
                      size="small"
                      color={dashboardData.expiring_soon > 0 ? 'error' : 'success'}
                    />
                  </Box>
                </Box>
                <AnalyticsIcon color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderReportTable = () => {
    if (!reportData) return null;
    
    let tableData = [];
    let columns = [];
    
    switch (reportType) {
      case 'sales':
        tableData = reportData.sales_items || [];
        columns = ['Date', 'Invoice', 'Customer', 'Items', 'Total'];
        break;
      case 'inventory':
        tableData = reportData.medicines || [];
        columns = ['Name', 'Category', 'Stock', 'Value', 'Status'];
        break;
      case 'prescriptions':
        tableData = reportData.prescriptions || [];
        columns = ['Date', 'Patient', 'Doctor', 'Items', 'Status'];
        break;
      case 'patients':
        tableData = reportData.patients || [];
        columns = ['Name', 'Phone', 'Email', 'Last Visit', 'Prescriptions'];
        break;
      case 'financial':
        tableData = reportData.transactions || [];
        columns = ['Date', 'Type', 'Description', 'Amount', 'Method'];
        break;
      case 'expiry':
        tableData = reportData.expiring_items || [];
        columns = ['Medicine', 'Batch', 'Expiry Date', 'Stock', 'Value'];
        break;
      default:
        tableData = [];
        columns = [];
    }
    
    return (
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column}>{column}</TableCell>
              ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column}>
                    {row[column.toLowerCase().replace(' ', '_')] || '-'}
                  </TableCell>
                ))}
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(row)}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderChart = () => {
    if (!chartData) return null;
    
    let ChartComponent;
    let chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
      },
    };
    
    switch (reportType) {
      case 'sales':
      case 'financial':
      case 'expiry':
        ChartComponent = Bar;
        break;
      case 'inventory':
      case 'patients':
        ChartComponent = Pie;
        chartOptions.plugins.legend.position = 'right';
        break;
      case 'prescriptions':
        ChartComponent = Line;
        break;
      default:
        ChartComponent = Bar;
    }
    
    return (
      <Box sx={{ mt: 3, height: 300 }}>
        <ChartComponent data={chartData} options={chartOptions} />
      </Box>
    );
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Reports & Analytics
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchReport}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {!isOnline && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You are currently offline. Showing cached data.
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Dashboard" />
          <Tab label="Reports" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        {renderDashboardCards()}
        
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Charts
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Sales Trend
                </Typography>
                {dashboardData?.sales_chart && (
                  <Line
                    data={dashboardData.sales_chart}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                    }}
                  />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Category Distribution
                </Typography>
                {dashboardData?.category_chart && (
                  <Pie
                    data={dashboardData.category_chart}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'right',
                        },
                      },
                    }}
                  />
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Generate Report
              </Typography>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<PdfIcon />}
                  onClick={() => handleExportReport('pdf')}
                  disabled={loading || !isOnline}
                  sx={{ mr: 1 }}
                >
                  Export PDF
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ExcelIcon />}
                  onClick={() => handleExportReport('excel')}
                  disabled={loading || !isOnline}
                  sx={{ mr: 1 }}
                >
                  Export Excel
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={handlePrintReport}
                  disabled={loading}
                >
                  Print
                </Button>
              </Box>
            </Box>
            
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    label="Report Type"
                  >
                    <MenuItem value="sales">Sales Report</MenuItem>
                    <MenuItem value="inventory">Inventory Report</MenuItem>
                    <MenuItem value="prescriptions">Prescription Report</MenuItem>
                    <MenuItem value="patients">Patients Report</MenuItem>
                    <MenuItem value="financial">Financial Report</MenuItem>
                    <MenuItem value="expiry">Expiry Report</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    label="Date Range"
                  >
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="week">This Week</MenuItem>
                    <MenuItem value="month">This Month</MenuItem>
                    <MenuItem value="quarter">This Quarter</MenuItem>
                    <MenuItem value="year">This Year</MenuItem>
                    <MenuItem value="custom">Custom Range</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {dateRange === 'custom' && (
                <>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
            
            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {renderChart()}
                {renderReportTable()}
              </>
            )}
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* Report Details Dialog */}
      <Dialog
        open={reportDetailsOpen}
        onClose={() => setReportDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Report Details</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Detailed Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <pre>{JSON.stringify(selectedReport, null, 2)}</pre>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        message={success}
      />
    </Box>
  );
}

export default Reports;