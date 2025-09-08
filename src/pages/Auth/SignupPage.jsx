import {
  Box,
  Button,
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
  Select,
  RadioGroup,
  HStack,
  Radio,
} from '@chakra-ui/react';
import { FiHeart } from 'react-icons/fi';
import { useState } from 'react';
import { Link as RouterLink, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bloodGroup: '',
    location: '',
    role: 'donor',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signup, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    const result = await signup(formData);

    if (result.success) {
      toast({
        title: 'Account Created',
        description: 'Welcome to Hemo Connect! Please complete your profile.',
        status: 'success',
        duration: 3000,
      });
      navigate('/profile-setup');
    } else {
      toast({
        title: 'Signup Failed',
        description: result.message || 'Failed to create account',
        status: 'error',
        duration: 5000,
      });
    }

    setIsLoading(false);
  };

  if (isAuthenticated) {
    return <Navigate to="/profile-setup" replace />;
  }

  return (
    <Container maxW="md" py={12}>
      <VStack spacing={8}>
        <VStack spacing={4} textAlign="center">
          <Icon as={FiHeart} w={12} h={12} color="primary.500" />
          <Heading size="lg">Join Hemo Connect</Heading>
          <Text color="gray.600">
            Create your account and start saving lives
          </Text>
        </VStack>

        <Card w="full">
          <CardBody p={8}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                </FormControl>

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
                    placeholder="Create a password"
                    autoComplete="new-password"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Blood Group</FormLabel>
                  <Select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    placeholder="Select your blood group"
                  >
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Location</FormLabel>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter your city/location"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>I want to</FormLabel>
                  <RadioGroup
                    name="role"
                    value={formData.role}
                    onChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                  >
                    <HStack spacing={6}>
                      <Radio value="donor">Become a Donor</Radio>
                      <Radio value="recipient">Request Blood</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="primary"
                  size="lg"
                  fontSize="md"
                  isLoading={isLoading}
                  loadingText="Creating account..."
                >
                  Create Account
                </Button>
              </Stack>
            </form>
          </CardBody>
        </Card>

        <Text textAlign="center">
          Already have an account?{' '}
          <Link as={RouterLink} to="/login" color="primary.500" fontWeight="medium">
            Sign in here
          </Link>
        </Text>
      </VStack>
    </Container>
  );
}

export default SignupPage;