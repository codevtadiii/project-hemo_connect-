import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
  Card,
  CardBody,
  Icon,
  Badge,
  Flex,
} from '@chakra-ui/react';
import { FiHeart, FiUsers, FiMapPin, FiClock } from 'react-icons/fi';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [activeRequests, setActiveRequests] = useState([]);

  useEffect(() => {
    // Fetch active blood requests for the ticker
    fetchActiveRequests();
  }, []);

  const fetchActiveRequests = async () => {
    try {
  const response = await fetch('/api/blood-requests/active');
      if (response.ok) {
        const data = await response.json();
        setActiveRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch active requests:', error);
    }
  };

  if (isAuthenticated && user?.profileComplete) {
    const dashboardPath = user.role === 'donor' ? '/donor-dashboard' : 
                          user.role === 'recipient' ? '/recipient-dashboard' : 
                          user.role === 'admin' ? '/admin-dashboard' : '/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box bg="gradient-to-r from-primary.500 to-primary.600" color="red" py={20}>
        <Container maxW="6xl">
          <VStack spacing={8} textAlign="center">
            <Icon as={FiHeart} w={16} h={16} />
            <Heading size="2xl" fontWeight="bold">
              Save Lives Through Blood Donation
            </Heading>
            <Text fontSize="xl" maxW="3xl">
              Connect donors with recipients in real-time. Join our community of 
              life-savers and help make blood donation accessible to everyone.
            </Text>
            
            <HStack spacing={4} pt={4}>
              <Button
                as={RouterLink}
                to="/find-donors"
                size="lg"
                bg="white"
                color="primary.500"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              >
                Find Donor
              </Button>
              <Button
                as={RouterLink}
                to="/signup"
                size="lg"
                bg="white"
                color="primary.500"
                borderColor="white"
                variant="solid"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              >
                Become Donor
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Real-time Blood Request Ticker */}
      <Box bg="gray.50" py={4} borderY="1px" borderColor="gray.200">
        <Container maxW="6xl">
          <Flex align="center" gap={4}>
            <Badge colorScheme="red" fontSize="sm" px={3} py={1} rounded="full">
              URGENT
            </Badge>
            <Box flex={1} overflow="hidden">
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                {activeRequests.length > 0 ? (
                  `${activeRequests[0].bloodGroup} blood needed at ${activeRequests[0].hospital} - ${activeRequests[0].units} units required`
                ) : (
                  'No urgent requests at the moment'
                )}
              </Text>
            </Box>
            <Button
              as={RouterLink}
              to="/find-donors"
              size="sm"
              colorScheme="primary"
              variant="outline"
            >
              Help Now
            </Button>
          </Flex>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="6xl" py={20}>
        <VStack spacing={16}>
          <VStack spacing={4} textAlign="center">
            <Heading size="xl">How Hemo Connect Works</Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              Our platform connects blood donors with recipients seamlessly, 
              making life-saving donations more accessible than ever.
            </Text>
          </VStack>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={8}>
            <GridItem>
              <Card h="full" textAlign="center" p={6}>
                <CardBody>
                  <VStack spacing={4}>
                    <Icon as={FiUsers} w={12} h={12} color="primary.500" />
                    <Heading size="md">Register as Donor</Heading>
                    <Text color="gray.600">
                      Sign up and complete your donor profile with medical 
                      information and availability preferences.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
            
            <GridItem>
              <Card h="full" textAlign="center" p={6}>
                <CardBody>
                  <VStack spacing={4}>
                    <Icon as={FiMapPin} w={12} h={12} color="primary.500" />
                    <Heading size="md">Get Matched</Heading>
                    <Text color="gray.600">
                      Receive notifications when someone nearby needs your 
                      blood type for emergency or planned donations.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
            
            <GridItem>
              <Card h="full" textAlign="center" p={6}>
                <CardBody>
                  <VStack spacing={4}>
                    <Icon as={FiHeart} w={12} h={12} color="primary.500" />
                    <Heading size="md">Save Lives</Heading>
                    <Text color="gray.600">
                      Connect with recipients, coordinate donation logistics, 
                      and help save lives in your community.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </VStack>
      </Container>

      {/* Stats Section */}
      <Box bg="primary.500" color="white" py={16}>
        <Container maxW="6xl">
          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={8}>
            <VStack>
              <Text fontSize="4xl" fontWeight="bold">2,547</Text>
              <Text>Lives Saved</Text>
            </VStack>
            <VStack>
              <Text fontSize="4xl" fontWeight="bold">1,234</Text>
              <Text>Active Donors</Text>
            </VStack>
            <VStack>
              <Text fontSize="4xl" fontWeight="bold">856</Text>
              <Text>Successful Matches</Text>
            </VStack>
            <VStack>
              <Text fontSize="4xl" fontWeight="bold">24/7</Text>
              <Text>Emergency Support</Text>
            </VStack>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Container maxW="6xl" py={20}>
        <VStack spacing={8} textAlign="center">
          <Heading size="xl">Ready to Make a Difference?</Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            Join thousands of donors who are already helping save lives. 
            Your donation can make the difference between life and death.
          </Text>
          <HStack spacing={4}>
            <Button
              as={RouterLink}
              to="/signup"
              size="lg"
              colorScheme="primary"
            >
              Join as Donor
            </Button>
            <Button
              as={RouterLink}
              to="/request-blood"
              size="lg"
              variant="outline"
              colorScheme="primary"
            >
              Request Blood
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
}

export default HomePage;