import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  Stack,
  Avatar,
  Text,
  Badge,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, BellIcon } from '@chakra-ui/icons';
import { FiHeart } from 'react-icons/fi';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isAuthenticated, user, logout } = useAuth();
  const { notifications } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'donor':
        return '/donor-dashboard';
      case 'recipient':
        return '/recipient-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <Box 
      bg="white" 
      px={4} 
      position="fixed" 
      top={0} 
      left={0} 
      right={0} 
      zIndex={1000}
      borderBottom="1px"
      borderColor="gray.200"
      boxShadow="sm"
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <IconButton
          size="md"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Open Menu"
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        
        <HStack spacing={8} alignItems="center">
          <Box as={RouterLink} to="/" display="flex" alignItems="center" gap={2}>
            <Box as={FiHeart} size="24px" color="primary.500" />
            <Text fontSize="xl" fontWeight="bold" color="primary.500">
              HEMO CONNECT
            </Text>
          </Box>
          
          <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
            <Link as={RouterLink} to="/about">About</Link>
            <Link as={RouterLink} to="/contact">Contact</Link>
            {isAuthenticated && (
              <>
                <Link as={RouterLink} to={getDashboardLink()}>Dashboard</Link>
                <Link as={RouterLink} to="/find-donors">Find Donors</Link>
              </>
            )}
          </HStack>
        </HStack>

        <Flex alignItems="center">
          {isAuthenticated ? (
            <HStack spacing={4}>
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<BellIcon />}
                  variant="ghost"
                  position="relative"
                >
                  {notifications.length > 0 && (
                    <Badge
                      colorScheme="red"
                      borderRadius="full"
                      position="absolute"
                      top="-1"
                      right="-1"
                      fontSize="xs"
                    >
                      {notifications.length}
                    </Badge>
                  )}
                </MenuButton>
                <MenuList>
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notification) => (
                      <MenuItem key={notification.id}>
                        <Box>
                          <Text fontWeight="medium">{notification.title}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {notification.message}
                          </Text>
                        </Box>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem>
                      <Text color="gray.500">No new notifications</Text>
                    </MenuItem>
                  )}
                  <MenuDivider />
                  <MenuItem as={RouterLink} to="/notifications">
                    View All Notifications
                  </MenuItem>
                </MenuList>
              </Menu>

              <Menu>
                <MenuButton
                  as={Button}
                  rounded="full"
                  variant="link"
                  cursor="pointer"
                  minW={0}
                >
                  <Avatar size="sm" name={user?.name} />
                </MenuButton>
                <MenuList>
                  <MenuItem>
                    <Text fontWeight="medium">{user?.name}</Text>
                  </MenuItem>
                  <MenuItem>
                    <Badge colorScheme="primary">{user?.role}</Badge>
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem as={RouterLink} to={getDashboardLink()}>
                    Dashboard
                  </MenuItem>
                  {user?.role === 'donor' && (
                    <MenuItem as={RouterLink} to="/profile">
                      Profile
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          ) : (
            <HStack spacing={4}>
              <Button 
                as={RouterLink} 
                to="/login" 
                variant="ghost"
              >
                Login
              </Button>
              <Button 
                as={RouterLink} 
                to="/signup"
                colorScheme="primary"
              >
                Sign Up
              </Button>
            </HStack>
          )}
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as="nav" spacing={4}>
            <Link as={RouterLink} to="/about">About</Link>
            <Link as={RouterLink} to="/contact">Contact</Link>
            {isAuthenticated ? (
              <>
                <Link as={RouterLink} to={getDashboardLink()}>Dashboard</Link>
                <Link as={RouterLink} to="/find-donors">Find Donors</Link>
                <Button onClick={handleLogout} variant="ghost" size="sm">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link as={RouterLink} to="/login">Login</Link>
                <Link as={RouterLink} to="/signup">Sign Up</Link>
              </>
            )}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}

export default Navbar;