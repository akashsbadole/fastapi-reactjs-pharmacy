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
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  InputAdornment,
  Tooltip,
  Pagination,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  AttachFile as AttachIcon,
  PriorityHigh as HighPriorityIcon,
  ArrowUpward as MediumPriorityIcon,
  ArrowDownward as LowPriorityIcon,
  QuestionAnswer as FAQIcon,
  Book as BookIcon,
  ContactSupport as ContactIcon
} from '@mui/icons-material';
import { supportService } from '../services/api';

function Support() {
  const [tickets, setTickets] = useState([]);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTab, setActiveTab] = useState('tickets');
  
  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'MEDIUM',
    category: 'GENERAL'
  });

  useEffect(() => {
    if (activeTab === 'tickets') {
      fetchTickets();
    } else if (activeTab === 'knowledge') {
      fetchKnowledgeBase();
    }
    
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
  }, [page, searchTerm, statusFilter, priorityFilter, activeTab]);

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        // Load cached tickets if offline
        const cachedTickets = localStorage.getItem('support_tickets');
        if (cachedTickets) {
          setTickets(JSON.parse(cachedTickets));
        }
        setLoading(false);
        return;
      }
      
      const params = {
        page,
        limit: 10,
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      if (priorityFilter) {
        params.priority = priorityFilter;
      }
      
      const data = await supportService.getTickets(params);
      setTickets(data.items || []);
      setTotalPages(data.pages || 1);
      
      // Cache tickets
      localStorage.setItem('support_tickets', JSON.stringify(data.items || []));
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to fetch tickets');
      
      // Try to load cached tickets
      const cachedTickets = localStorage.getItem('support_tickets');
      if (cachedTickets) {
        setTickets(JSON.parse(cachedTickets));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchKnowledgeBase = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        // Load cached knowledge base if offline
        const cachedKB = localStorage.getItem('knowledge_base');
        if (cachedKB) {
          setKnowledgeBase(JSON.parse(cachedKB));
        }
        setLoading(false);
        return;
      }
      
      const data = await supportService.getKnowledgeBase();
      setKnowledgeBase(data.articles || []);
      
      // Cache knowledge base
      localStorage.setItem('knowledge_base', JSON.stringify(data.articles || []));
    } catch (err) {
      console.error('Error fetching knowledge base:', err);
      setError('Failed to fetch knowledge base');
      
      // Try to load cached knowledge base
      const cachedKB = localStorage.getItem('knowledge_base');
      if (cachedKB) {
        setKnowledgeBase(JSON.parse(cachedKB));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handlePriorityFilterChange = (event) => {
    setPriorityFilter(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleCreateTicket = () => {
    setEditingTicket(null);
    setFormData({
      subject: '',
      description: '',
      priority: 'MEDIUM',
      category: 'GENERAL'
    });
    setTicketDialogOpen(true);
  };

  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setFormData({
      subject: ticket.subject || '',
      description: ticket.description || '',
      priority: ticket.priority || 'MEDIUM',
      category: ticket.category || 'GENERAL'
    });
    setTicketDialogOpen(true);
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setViewDialogOpen(true);
  };

  const handleDeleteTicket = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot delete ticket while offline');
        setLoading(false);
        return;
      }
      
      await supportService.deleteTicket(id);
      setSuccess('Ticket deleted successfully');
      fetchTickets();
    } catch (err) {
      console.error('Error deleting ticket:', err);
      setError('Failed to delete ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTicket = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot save ticket while offline');
        setLoading(false);
        return;
      }
      
      if (editingTicket) {
        await supportService.updateTicket(editingTicket.id, formData);
        setSuccess('Ticket updated successfully');
      } else {
        await supportService.createTicket(formData);
        setSuccess('Ticket created successfully');
      }
      
      setTicketDialogOpen(false);
      fetchTickets();
    } catch (err) {
      console.error('Error saving ticket:', err);
      setError('Failed to save ticket');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'error';
      case 'IN_PROGRESS': return 'warning';
      case 'RESOLVED': return 'success';
      case 'CLOSED': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH': return <HighPriorityIcon />;
      case 'MEDIUM': return <MediumPriorityIcon />;
      case 'LOW': return <LowPriorityIcon />;
      default: return <LowPriorityIcon />;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Support Center
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={activeTab === 'tickets' ? fetchTickets : fetchKnowledgeBase}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          {activeTab === 'tickets' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateTicket}
              disabled={!isOnline}
            >
              New Ticket
            </Button>
          )}
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
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Button
          variant={activeTab === 'tickets' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('tickets')}
          sx={{ mr: 2 }}
        >
          My Tickets
        </Button>
        <Button
          variant={activeTab === 'knowledge' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('knowledge')}
          startIcon={<BookIcon />}
        >
          Knowledge Base
        </Button>
      </Box>
      
      {activeTab === 'tickets' && (
        <Card>
          <CardContent>
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search tickets..."
                  variant="outlined"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="OPEN">Open</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="RESOLVED">Resolved</MenuItem>
                    <MenuItem value="CLOSED">Closed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={priorityFilter}
                    onChange={handlePriorityFilterChange}
                    label="Priority"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="HIGH">High</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="LOW">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <Typography>Loading...</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="text.secondary" py={2}>
                            No tickets found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      tickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell>#{ticket.id}</TableCell>
                          <TableCell>{ticket.subject}</TableCell>
                          <TableCell>
                            <Chip
                              icon={getPriorityIcon(ticket.priority)}
                              label={ticket.priority}
                              color={getPriorityColor(ticket.priority)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={ticket.status}
                              color={getStatusColor(ticket.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Tooltip title="View">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewTicket(ticket)}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditTicket(ticket)}
                                  disabled={!isOnline || ticket.status === 'CLOSED'}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteTicket(ticket.id)}
                                  disabled={!isOnline}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </CardContent>
        </Card>
      )}
      
      {activeTab === 'knowledge' && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Frequently Asked Questions
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <Typography>Loading...</Typography>
              </Box>
            ) : (
              <Box>
                {knowledgeBase.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <FAQIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      No articles found in the knowledge base.
                    </Typography>
                  </Box>
                ) : (
                  knowledgeBase.map((article) => (
                    <Accordion key={article.id}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display="flex" alignItems="center" width="100%">
                          <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                            {article.title}
                          </Typography>
                          <Chip
                            label={article.category}
                            size="small"
                            color="primary"
                            sx={{ mr: 2 }}
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="text.secondary">
                          {article.content}
                        </Typography>
                        {article.attachments && article.attachments.length > 0 && (
                          <Box mt={2}>
                            <Typography variant="subtitle2">Attachments:</Typography>
                            {article.attachments.map((attachment, index) => (
                              <Button
                                key={index}
                                size="small"
                                startIcon={<AttachIcon />}
                                sx={{ mr: 1, mt: 1 }}
                              >
                                {attachment.name}
                              </Button>
                            ))}
                          </Box>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ))
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Create/Edit Ticket Dialog */}
      <Dialog open={ticketDialogOpen} onClose={() => setTicketDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTicket ? 'Edit Ticket' : 'Create New Ticket'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  label="Priority"
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  label="Category"
                >
                  <MenuItem value="GENERAL">General</MenuItem>
                  <MenuItem value="TECHNICAL">Technical</MenuItem>
                  <MenuItem value="BILLING">Billing</MenuItem>
                  <MenuItem value="FEATURE">Feature Request</MenuItem>
                  <MenuItem value="BUG">Bug Report</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTicketDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTicket} variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* View Ticket Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Ticket Details</DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Ticket ID:</Typography>
                <Typography variant="body1">#{selectedTicket.id}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Status:</Typography>
                <Chip
                  label={selectedTicket.status}
                  color={getStatusColor(selectedTicket.status)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Priority:</Typography>
                <Chip
                  icon={getPriorityIcon(selectedTicket.priority)}
                  label={selectedTicket.priority}
                  color={getPriorityColor(selectedTicket.priority)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Category:</Typography>
                <Typography variant="body1">{selectedTicket.category}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Subject:</Typography>
                <Typography variant="body1">{selectedTicket.subject}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Description:</Typography>
                <Typography variant="body1">{selectedTicket.description}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Created:</Typography>
                <Typography variant="body2">
                  {new Date(selectedTicket.created_at).toLocaleString()}
                </Typography>
              </Grid>
              {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Responses
                  </Typography>
                  {selectedTicket.responses.map((response, index) => (
                    <Box key={index} mb={2}>
                      <Typography variant="subtitle2">
                        {response.admin_name} - {new Date(response.created_at).toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        {response.message}
                      </Typography>
                    </Box>
                  ))}
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
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

export default Support;