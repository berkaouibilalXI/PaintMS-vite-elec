import { useAuth } from '../../context/AuthContext';
import { useDarkMode } from '../../context/DarkModeContext';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { LightMode, DarkMode, Logout } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
export default function Header() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
            <Link to="/">🎨 PaintMS</Link>
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton color="inherit" onClick={toggleDarkMode}>
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
            <Button color="inherit" startIcon={<Settings />} component={Link} to="/settings" />
            <IconButton color="inherit" onClick={handleLogout}>
              <Logout />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
    </motion.div>
  );
}