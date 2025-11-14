import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Snackbar,
  LinearProgress
} from '@mui/material';
import {
  CloudOff as OfflineIcon,
  CloudQueue as SyncingIcon,
  CloudDone as OnlineIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Sync as SyncIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [pendingOperations, setPendingOperations] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [syncMessage, setSyncMessage] = useState('');
  const [showSyncMessage, setShowSyncMessage] = useState(false);

  useEffect(() => {
    // Initialize network status
    setIsOnline(navigator.onLine);
    
    // Load pending operations from localStorage
    const pending = localStorage.getItem('pending_operations');
    if (pending) {
      setPendingOperations(JSON.parse(pending).length);
    }
    
    // Load last sync time
    const lastSync = localStorage.getItem('last_sync_time');
    if (lastSync) {
      setLastSyncTime(new Date(lastSync));
    }

    // Set up network status monitoring
    const handleOnline = () => {
      setIsOnline(true);
      setSyncMessage('Connection restored. Syncing data...');
      setShowSyncMessage(true);
      syncPendingOperations();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setSyncMessage('Connection lost. Working offline.');
      setShowSyncMessage(true);
    };
    
    if (window.electronAPI) {
      window.electronAPI.onOnline(handleOnline);
      window.electronAPI.onOffline(handleOffline);
    } else {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }
    
    // Set up periodic sync check
    const syncInterval = setInterval(() => {
      if (isOnline && pendingOperations > 0) {
        syncPendingOperations();
      }
    }, 30000); // Check every 30 seconds
    
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('online');
        window.electronAPI.removeAllListeners('offline');
      } else {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
      clearInterval(syncInterval);
    };
  }, [isOnline, pendingOperations]);

  const syncPendingOperations = async () => {
    if (!isOnline || pendingOperations === 0) return;
    
    setSyncStatus('syncing');
    
    try {
      const pending = localStorage.getItem('pending_operations');
      if (!pending) return;
      
      const operations = JSON.parse(pending);
      let successCount = 0;
      let errorCount = 0;
      
      for (const operation of operations) {
        try {
          // Simulate API call - in real implementation, this would make actual API calls
          await simulateApiCall(operation);
          successCount++;
        } catch (error) {
          console.error('Failed to sync operation:', error);
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        // Remove successful operations from pending list
        const remainingOperations = operations.slice(successCount);
        localStorage.setItem('pending_operations', JSON.stringify(remainingOperations));
        setPendingOperations(remainingOperations.length);
        
        // Update last sync time
        const now = new Date();
        localStorage.setItem('last_sync_time', now.toISOString());
        setLastSyncTime(now);
      }
      
      if (errorCount === 0) {
        setSyncStatus('success');
        setSyncMessage(`Successfully synced ${successCount} operations`);
      } else {
        setSyncStatus('error');
        setSyncMessage(`Synced ${successCount} operations, ${errorCount} failed`);
      }
      setShowSyncMessage(true);
      
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      setSyncMessage('Sync failed. Please try again.');
      setShowSyncMessage(true);
    } finally {
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    }
  };

  const simulateApiCall = (operation) => {
    // Simulate API call delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error('Simulated API error'));
        }
      }, 500);
    });
  };

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleManualSync = () => {
    if (isOnline) {
      syncPendingOperations();
    }
    handleMenuClose();
  };

  const getStatusColor = () => {
    if (!isOnline) return 'error';
    if (syncStatus === 'syncing') return 'warning';
    if (syncStatus === 'error') return 'error';
    if (pendingOperations > 0) return 'warning';
    return 'success';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <OfflineIcon />;
    if (syncStatus === 'syncing') return <SyncingIcon sx={{ animation: 'spin 1s linear infinite' }} />;
    if (syncStatus === 'error') return <ErrorIcon />;
    if (pendingOperations > 0) return <SyncingIcon />;
    return <OnlineIcon />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (syncStatus === 'syncing') return 'Syncing';
    if (syncStatus === 'error') return 'Sync Error';
    if (pendingOperations > 0) return `${pendingOperations} Pending`;
    return 'Online';
  };

  const formatLastSyncTime = () => {
    if (!lastSyncTime) return 'Never';
    
    const now = new Date();
    const diff = now - lastSyncTime;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title={`Status: ${getStatusText()}`}>
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ mr: 1 }}
          >
            <Badge
              badgeContent={pendingOperations}
              color="warning"
              invisible={pendingOperations === 0}
            >
              <Chip
                icon={getStatusIcon()}
                label={getStatusText()}
                color={getStatusColor()}
                size="small"
                variant="outlined"
              />
            </Badge>
          </IconButton>
        </Tooltip>
        
        {syncStatus === 'syncing' && (
          <Box sx={{ width: 100, mr: 1 }}>
            <LinearProgress />
          </Box>
        )}
      </Box>

      {/* Status Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { width: 280 }
        }}
      >
        <MenuItem disabled>
          <ListItemIcon>
            {getStatusIcon()}
          </ListItemIcon>
          <ListItemText>
            <Typography variant="subtitle2">Connection Status</Typography>
            <Typography variant="body2" color="text.secondary">
              {getStatusText()}
            </Typography>
          </ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem disabled>
          <ListItemText>
            <Typography variant="body2">Pending Operations</Typography>
            <Typography variant="h6">{pendingOperations}</Typography>
          </ListItemText>
        </MenuItem>
        
        <MenuItem disabled>
          <ListItemText>
            <Typography variant="body2">Last Sync</Typography>
            <Typography variant="body2" color="text.secondary">
              {formatLastSyncTime()}
            </Typography>
          </ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleManualSync} disabled={!isOnline || syncStatus === 'syncing'}>
          <ListItemIcon>
            <RefreshIcon />
          </ListItemIcon>
          <ListItemText>Sync Now</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText>Offline Settings</ListItemText>
        </MenuItem>
      </Menu>

      {/* Sync Message Snackbar */}
      <Snackbar
        open={showSyncMessage}
        autoHideDuration={6000}
        onClose={() => setShowSyncMessage(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setShowSyncMessage(false)}
          severity={syncStatus === 'error' ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {syncMessage}
        </Alert>
      </Snackbar>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

export default OfflineIndicator;