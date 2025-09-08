import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack,
  Text,
  useToast,
  VStack,
  Card,
  CardBody,
  Icon,
} from '@chakra-ui/react';
import { FiHeart } from 'react-icons/fi';
import { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(formData.email, formData.password, formData.rememberMe);

    if (result.success) {
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${result.user.name}!`,
        status: 'success',
        duration: 3000,
      });
      navigate(from, { replace: true });
    } else {
      toast({
        title: 'Login Failed',
        description: result.message || 'Invalid email or password',
        status: 'error',
        duration: 5000,
      });
    }

    setIsLoading(false);
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Container maxW="md" py={12}>
      <VStack spacing={8}>
        <VStack spacing={4} textAlign="center">
          <Icon as={FiHeart} w={12} h={12} color="primary.500" />
          <Heading size="lg">Welcome Back</Heading>
          <Text color="gray.600">
            Sign in to your Hemo Connect account
          </Text>
        </VStack>

        <Card w="full">
          <CardBody p={8}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                  />
                </FormControl>

                <Stack spacing={6}>
                  <Stack direction="row" align="start" justify="space-between">
                    <Checkbox
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                    >
                      Remember me
                    </Checkbox>
                    <Link as={RouterLink} to="/forgot-password" color="primary.500">
                      Forgot password?
                    </Link>
                  </Stack>

                  <Button
                    type="submit"
                    colorScheme="primary"
                    size="lg"
                    fontSize="md"
                    isLoading={isLoading}
                    loadingText="Signing in..."
                  >
                    Sign In
                  </Button>
                </Stack>
              </Stack>
            </form>
          </CardBody>
        </Card>

        <Text textAlign="center">
          Don't have an account?{' '}
          <Link as={RouterLink} to="/signup" color="primary.500" fontWeight="medium">
            Sign up here
          </Link>
        </Text>
      </VStack>
    </Container>
  );
}

export default LoginPage;