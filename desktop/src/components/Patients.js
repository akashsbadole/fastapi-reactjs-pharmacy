import React from 'react';
import { Typography, Box, Paper } from '@mui/material';

function Patients() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Patient Management
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1">
          Patient management functionality will be implemented here.
          This will include patient records, medical history, prescriptions, etc.
        </Typography>
      </Paper>
    </Box>
  );
}

export default Patients;