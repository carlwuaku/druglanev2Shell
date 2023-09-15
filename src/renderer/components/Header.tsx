/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSignOut } from 'react-auth-kit';
import { Home, Logout } from '@mui/icons-material';
import LocalImage from './Image';

// eslint-disable-next-line react/require-default-props
function Header({ showBackArrow }: { showBackArrow?: boolean }) {
  const [title, setTitle] = useState('...');
  const history = useNavigate();
  useEffect(() => {
    window.electron.ipcRenderer.send('getAppDetails');
    window.electron.ipcRenderer.on('appDetailsSent', (event: any, data: any) => {
      setTitle(data.title);
    });
  }, []);
  const signOut = useSignOut();

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const logout = () => {
    signOut();
    history('/login');
  };
  return (
    <AppBar className="margin-bottom-10" position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {showBackArrow ? (
            <IconButton
              onClick={() => {
                window.history.back();
              }}
              aria-label="delete"
            >
              <ArrowBackIcon />
            </IconButton>
          ) : (
            ''
          )}

          <LocalImage height="35px" image="logo.png" />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'flex' },
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Druglane
          </Typography>

          <Button
            component={RouterLink}
            to="/"
            sx={{ my: 2, color: 'white', display: 'block' }}
            startIcon={<Home />}
          >
            Home/Menu
          </Button>
          <Box sx={{ flexGrow: 1, display: 'flex' }} />
          {/* <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'flex' } }}>
            {items.map((page) => (

              <Button component={RouterLink}
                to={`${page.link}`}
                key={page.label}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page.label}
              </Button>
))}
          </Box> */}
          <Button
            sx={{ my: 2, color: 'white', display: 'block' }}
            onClick={logout}
            endIcon={<Logout />}
          >
            Logout
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;
