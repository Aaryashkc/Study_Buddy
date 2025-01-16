import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Box,
  Card,
  CardContent,
  Button,
  Avatar,
  Drawer,
  InputAdornment,
  Chip,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MessageIcon from '@mui/icons-material/Message';
import ChatWindow from '../components/Chat/ChatWindow';

function Dashboard() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(collection(db, 'users'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(user => user.id !== currentUser.uid);
      
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.expert?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.good?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartChat = (user) => {
    setSelectedUser(user);
    setIsChatOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section with Gradient */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          borderRadius: '16px',
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome, {currentUser?.name || 'Study Buddy'}!
        </Typography>
        <Typography variant="subtitle1">
          Find and connect with study partners who share your interests
        </Typography>
      </Paper>

      {/* Search Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4,
          background: '#fff',
          borderRadius: '12px',
        }}
      >
        <TextField
          fullWidth
          placeholder="Search by name or expertise..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
            }
          }}
        />
      </Paper>

      {/* Users List */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Study Buddies
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredUsers.map((user) => (
              <Grid item xs={12} sm={6} md={4} key={user.id}>
                <Card 
                  elevation={3}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    height: '100%',
                    p: 3,
                  }}>
                    {/* User Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          width: 56, 
                          height: 56, 
                          bgcolor: 'primary.main',
                          mr: 2 
                        }}
                      >
                        {user.name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Expertise Section */}
                    <Box sx={{ mb: 2, flexGrow: 1 }}>
                      {user.expert && (
                        <Box sx={{ mb: 1 }}>
                          <Chip 
                            label={`Expert in: ${user.expert}`}
                            color="success"
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        </Box>
                      )}
                      {user.good && (
                        <Box sx={{ mb: 1 }}>
                          <Chip 
                            label={`Good at: ${user.good}`}
                            color="primary"
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        </Box>
                      )}
                    </Box>

                    {/* Chat Button */}
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<MessageIcon />}
                      onClick={() => handleStartChat(user)}
                      sx={{
                        mt: 'auto',
                        borderRadius: '8px',
                        textTransform: 'none',
                      }}
                    >
                      Start Chat
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Chat Drawer */}
      <Drawer
        anchor="right"
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 400 },
            p: 2,
          },
        }}
      >
        {selectedUser && (
          <ChatWindow
            recipientId={selectedUser.id}
            recipientName={selectedUser.name}
          />
        )}
      </Drawer>
    </Container>
  );
}

export default Dashboard; 