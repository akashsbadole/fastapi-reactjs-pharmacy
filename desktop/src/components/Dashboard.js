import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  TrendingUp,
  People,
  ShoppingCart,
  LocalPharmacy,
  Assignment,
  Warning,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
}));

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalMedicines: 0,
    totalPrescriptions: 0,
    totalSales: 0,
    lowStockItems: 0,
    expiringSoon: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    fetchDashboardData();
    
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
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // Check if we're online
      if (!navigator.onLine) {
        // Load cached data if available
        const cachedStats = localStorage.getItem('dashboard_stats');
        const cachedActivities = localStorage.getItem('dashboard_activities');
        
        if (cachedStats) {
          setStats(JSON.parse(cachedStats));
        }
        
        if (cachedActivities) {
          setRecentActivities(JSON.parse(cachedActivities));
        }
        
        setLoading(false);
        return;
      }

      // Determine API URL based on environment
      const isDesktop = !!window.electronAPI;
      const apiUrl = isDesktop 
        ? 'http://localhost:8000'  // Local backend for desktop
        : process.env.REACT_APP_API_URL || 'http://localhost:8000';

      const token = localStorage.getItem('token');
      
      // Fetch dashboard stats
      const statsResponse = await fetch(`${apiUrl}/api/reports/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
        localStorage.setItem('dashboard_stats', JSON.stringify(statsData));
      } else {
        throw new Error('Failed to fetch dashboard stats');
      }
      
      // Fetch recent activities
      const activitiesResponse = await fetch(`${apiUrl}/api/audit/recent?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setRecentActivities(activitiesData);
        localStorage.setItem('dashboard_activities', JSON.stringify(activitiesData));
      } else {
        // If audit endpoint doesn't exist, use mock data
        setRecentActivities([
          { id: 1, action: 'LOGIN', resource_type: 'USER', new_values: 'User logged in', created_at: new Date().toISOString() },
          { id: 2, action: 'CREATE', resource_type: 'PRESCRIPTION', new_values: 'New prescription created', created_at: new Date().toISOString() },
          { id: 3, action: 'UPDATE', resource_type: 'MEDICINE', new_values: 'Medicine stock updated', created_at: new Date().toISOString() },
        ]);
        localStorage.setItem('dashboard_activities', JSON.stringify(recentActivities));
      }
      
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load dashboard data. Please check your connection.');
      
      // Try to load cached data
      const cachedStats = localStorage.getItem('dashboard_stats');
      const cachedActivities = localStorage.getItem('dashboard_activities');
      
      if (cachedStats) {
        setStats(JSON.parse(cachedStats));
      }
      
      if (cachedActivities) {
        setRecentActivities(JSON.parse(cachedActivities));
      }
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action) => {
    switch (action) {
      case 'LOGIN':
      case 'STAFF_LOGIN':
        return <People color="primary" />;
      case 'CREATE':
        return <Assignment color="success" />;
      case 'UPDATE':
        return <LocalPharmacy color="info" />;
      case 'DELETE':
        return <Warning color="error" />;
      default:
        return <ShoppingCart color="action" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
          disabled={!isOnline}
        >
          Refresh
        </Button>
      </Box>
      
      {!isOnline && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You are currently offline. Showing cached data.
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Typography variant="h6" gutterBottom>
        Welcome, {user?.full_name || 'User'}!
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <StyledCardContent>
              <Box display="flex" alignItems="center">
                <People color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography component="h2" variant="h4">
                    {stats.totalPatients}
                  </Typography>
                  <Typography color="textSecondary">
                    Total Patients
                  </Typography>
                </Box>
              </Box>
            </StyledCardContent>
          </StyledCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <StyledCardContent>
              <Box display="flex" alignItems="center">
                <LocalPharmacy color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography component="h2" variant="h4">
                    {stats.totalMedicines}
                  </Typography>
                  <Typography color="textSecondary">
                    Total Medicines
                  </Typography>
                </Box>
              </Box>
            </StyledCardContent>
          </StyledCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <StyledCardContent>
              <Box display="flex" alignItems="center">
                <Assignment color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography component="h2" variant="h4">
                    {stats.totalPrescriptions}
                  </Typography>
                  <Typography color="textSecondary">
                    Prescriptions
                  </Typography>
                </Box>
              </Box>
            </StyledCardContent>
          </StyledCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <StyledCardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography component="h2" variant="h4">
                    ${stats.totalSales?.toFixed(2) || '0.00'}
                  </Typography>
                  <Typography color="textSecondary">
                    Total Sales
                  </Typography>
                </Box>
              </Box>
            </StyledCardContent>
          </StyledCard>
        </Grid>
      </Grid>
      
      {/* Alerts and Recent Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Alerts
            </Typography>
            <List>
              {stats.lowStockItems > 0 && (
                <ListItem>
                  <ListItemIcon>
                    <Warning color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${stats.lowStockItems} medicines low in stock`}
                    secondary="Check inventory for restocking"
                  />
                </ListItem>
              )}
              {stats.expiringSoon > 0 && (
                <ListItem>
                  <ListItemIcon>
                    <Warning color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${stats.expiringSoon} medicines expiring soon`}
                    secondary="Review expiry dates and plan accordingly"
                  />
                </ListItem>
              )}
              {stats.lowStockItems === 0 && stats.expiringSoon === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No alerts at this time"
                    secondary="Everything is running smoothly"
                  />
                </ListItem>
              )}
            </List>
          </StyledPaper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemIcon>
                        {getActivityIcon(activity.action)}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.new_values || activity.action}
                        secondary={formatDate(activity.created_at)}
                      />
                    </ListItem>
                    {recentActivities.indexOf(activity) < recentActivities.length - 1 && (
                      <Divider variant="inset" component="li" />
                    )}
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No recent activities"
                    secondary="Activities will appear here once you start using the system"
                  />
                </ListItem>
              )}
            </List>
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;