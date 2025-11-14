import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Avatar,
  Divider,
  Tooltip,
  Badge,
  Collapse,
  IconButton
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  ShoppingCart as POSIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Medication as MedicineIcon,
  Receipt as BillingIcon,
  Assignment as PrescriptionIcon,
  Support as SupportIcon,
  ExpandLess,
  ExpandMore,
  Notifications as NotificationsIcon,
  CloudOffline as OfflineIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import OfflineIndicator from './OfflineIndicator';

const drawerWidth = 240;

function Sidebar({ mobileOpen, handleDrawerToggle, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      badge: 0
    },
    {
      text: 'Patients',
      icon: <PeopleIcon />,
      path: '/patients',
      badge: 0
    },
    {
      text: 'Inventory',
      icon: <InventoryIcon />,
      path: '/inventory',
      badge: 0,
      children: [
        {
          text: 'Medicines',
          icon: <MedicineIcon />,
          path: '/inventory/medicines'
        },
        {
          text: 'Batches',
          icon: <InventoryIcon />,
          path: '/inventory/batches'
        },
        {
          text: 'Suppliers',
          icon: <PeopleIcon />,
          path: '/inventory/suppliers'
        }
      ]
    },
    {
      text: 'Prescriptions',
      icon: <PrescriptionIcon />,
      path: '/prescriptions',
      badge: 0
    },
    {
      text: 'Point of Sale',
      icon: <POSIcon />,
      path: '/pos',
      badge: 0
    },
    {
      text: 'Billing',
      icon: <BillingIcon />,
      path: '/billing',
      badge: 0
    },
    {
      text: 'Reports',
      icon: <ReportsIcon />,
      path: '/reports',
      badge: 0,
      children: [
        {
          text: 'Sales Reports',
          icon: <ReportsIcon />,
          path: '/reports/sales'
        },
        {
          text: 'Inventory Reports',
          icon: <InventoryIcon />,
          path: '/reports/inventory'
        },
        {
          text: 'Financial Reports',
          icon: <BillingIcon />,
          path: '/reports/financial'
        },
        {
          text: 'Patient Reports',
          icon: <PeopleIcon />,
          path: '/reports/patients'
        }
      ]
    },
    {
      text: 'Support',
      icon: <SupportIcon />,
      path: '/support',
      badge: 0
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      badge: 0
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (mobileOpen) {
      handleDrawerToggle();
    }
  };

  const handleInventoryClick = () => {
    setInventoryOpen(!inventoryOpen);
  };

  const handleReportsClick = () => {
    setReportsOpen(!reportsOpen);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const drawer = (
    <div>
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" noWrap component="div">
          Pharmacy Desktop
        </Typography>
        <Typography variant="caption" noWrap>
          Multi-Tenant System
        </Typography>
      </Box>
      
      <Divider />
      
      {/* User Profile */}
      {user && (
        <Box sx={{ p: 2 }}>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
              {user.first_name?.[0] || user.username?.[0]}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" noWrap>
                {user.first_name} {user.last_name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user.role}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      
      <Divider />
      
      {/* Navigation */}
      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => (
          <Box key={item.text}>
            {item.children ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={item.text === 'Inventory' ? handleInventoryClick : handleReportsClick}
                    sx={{
                      bgcolor: isActive(item.path) ? 'action.selected' : 'transparent',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon>
                      {item.badge > 0 ? (
                        <Badge badgeContent={item.badge} color="error">
                          {item.icon}
                        </Badge>
                      ) : (
                        item.icon
                      )}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                    {item.text === 'Inventory' ? (
                      inventoryOpen ? <ExpandLess /> : <ExpandMore />
                    ) : (
                      reportsOpen ? <ExpandLess /> : <ExpandMore />
                    )}
                  </ListItemButton>
                </ListItem>
                <Collapse in={item.text === 'Inventory' ? inventoryOpen : reportsOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItem key={child.text} disablePadding>
                        <ListItemButton
                          sx={{ pl: 4 }}
                          onClick={() => handleNavigation(child.path)}
                          selected={isActive(child.path)}
                        >
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            {child.icon}
                          </ListItemIcon>
                          <ListItemText primary={child.text} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <ListItem disablePadding>
                <Tooltip title={item.text} placement="right">
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    selected={isActive(item.path)}
                    sx={{
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'white',
                        },
                      },
                    }}
                  >
                    <ListItemIcon>
                      {item.badge > 0 ? (
                        <Badge badgeContent={item.badge} color="error">
                          {item.icon}
                        </Badge>
                      ) : (
                        item.icon
                      )}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            )}
          </Box>
        ))}
      </List>
      
      <Divider />
      
      {/* Offline Indicator */}
      <Box sx={{ p: 2 }}>
        <OfflineIndicator />
      </Box>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}

export default Sidebar;