import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  LocalPharmacy as PharmacyIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 400,
  margin: 'auto',
  marginTop: theme.spacing(8),
}));

const StyledForm = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(1),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function Login({ onLogin }) {
  const [tabValue, setTabValue] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDesktop, setIsDesktop] = useState(false);

  React.useEffect(() => {
    // Check if running in Electron
    setIsDesktop(!!window.electronAPI);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Determine API URL based on environment
      const apiUrl = isDesktop 
        ? 'http://localhost:8000'  // Local backend for desktop
        : process.env.REACT_APP_API_URL || 'http://localhost:8000';

      // Make login request
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user info
        localStorage.setItem('token', data.access_token);
        
        // Get user info
        const userResponse = await fetch(`${apiUrl}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${data.access_token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          onLogin(userData, data.access_token);
        } else {
          setError('Failed to get user information');
        }
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Determine API URL based on environment
      const apiUrl = isDesktop 
        ? 'http://localhost:8000'  // Local backend for desktop
        : process.env.REACT_APP_API_URL || 'http://localhost:8000';

      // Make PIN login request
      const response = await fetch(`${apiUrl}/api/auth/staff-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          pin,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user info
        localStorage.setItem('token', data.access_token);
        onLogin(data.user, data.access_token);
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      console.error('PIN login error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const togglePinVisibility = () => {
    setShowPin(!showPin);
  };

  return (
    <Container component="main" maxWidth="sm">
      <StyledPaper elevation={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PharmacyIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
          <Typography component="h1" variant="h4" color="primary">
            Pharmacy
          </Typography>
        </Box>
        
        <Typography component="h2" variant="h5">
          Sign In
        </Typography>
        
        {isDesktop && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Desktop Application v{window.electronAPI?.getAppVersion ? 
              (async () => await window.electronAPI.getAppVersion())() : '1.0.0'}
          </Typography>
        )}
        
        <Box sx={{ width: '100%', mt: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Password Login" />
            <Tab label="PIN Login" />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            <StyledForm onSubmit={handleLoginSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              
              <StyledButton
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <LockIcon />}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </StyledButton>
            </StyledForm>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <StyledForm onSubmit={handlePinSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="pin-username"
                label="Username"
                name="pin-username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="pin"
                label="PIN"
                type={showPin ? 'text' : 'password'}
                id="pin"
                inputProps={{ maxLength: 4 }}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle pin visibility"
                        onClick={togglePinVisibility}
                        edge="end"
                      >
                        {showPin ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              
              <StyledButton
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <LockIcon />}
              >
                {loading ? 'Signing In...' : 'Sign In with PIN'}
              </StyledButton>
            </StyledForm>
          </TabPanel>
        </Box>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Default credentials:
          </Typography>
          <Typography variant="caption" display="block">
            Admin: username=admin, password=admin123
          </Typography>
          <Typography variant="caption" display="block">
            Staff: username=pharmacist, PIN=5678
          </Typography>
        </Box>
      </StyledPaper>
    </Container>
  );
}

export default Login;