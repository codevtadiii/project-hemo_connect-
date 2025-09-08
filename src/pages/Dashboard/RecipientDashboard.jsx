import {
  Container,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Box,
  useToast,
  Alert,
  AlertIcon,
  Stack,
  Icon,
  Progress,
} from '@chakra-ui/react';
import { FiPlus, FiMapPin, FiClock, FiList } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function RecipientDashboard() {
  const { user } = useAuth();
  const [activeRequests, setActiveRequests] = useState([]);
  const [requestHistory, setRequestHistory] = useState([]);
  const [nearbyDonors, setNearbyDonors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [requestsRes, historyRes, donorsRes] = await Promise.all([
        fetch('/api/requests/my-requests', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch('/api/requests/my-history', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch('/api/donors/nearby', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }),
      ]);

      if (requestsRes.ok) {
        const requests = await requestsRes.json();
        setActiveRequests(requests);
      }

      if (historyRes.ok) {
        const history = await historyRes.json();
        setRequestHistory(history);
      }

      if (donorsRes.ok) {
        const donors = await donorsRes.json();
        setNearbyDonors(donors);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelRequest = async (requestId) => {
    try {
      const response = await fetch(`/api/requests/${requestId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Request Cancelled',
          description: 'Your blood request has been cancelled',
          status: 'success',
          duration: 3000,
        });
        fetchDashboardData();
      }
    } catch (error) {
      toast({
        title: 'Cancellation Failed',
        description: 'Failed to cancel the request',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'matched': return 'blue';
      case 'fulfilled': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getStatusProgress = (status) => {
    switch (status) {
      case 'pending': return 25;
      case 'matched': return 75;
      case 'fulfilled': return 100;
      default: return 0;
    }
  };

  if (isLoading) {
    return (
      <Container maxW="6xl" py={8}>
        <Text>Loading dashboard...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between" align="start">
          <Box>
            <Heading size="lg" mb={2}>
              Welcome, {user?.name}
            </Heading>
            <Text color="gray.600">
              Manage your blood requests and track their progress
            </Text>
          </Box>
          <Button
            as={RouterLink}
            to="/request-blood"
            colorScheme="primary"
            leftIcon={<Icon as={FiPlus} />}
            size="lg"
          >
            New Request
          </Button>
        </HStack>

        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={8}>
          {/* Active Requests */}
          <GridItem>
            <Card h="full">
              <CardHeader>
                <HStack>
                  <Icon as={FiClock} color="primary.500" />
                  <Heading size="md">Active Requests</Heading>
                  <Badge>{activeRequests.length}</Badge>
                </HStack>
              </CardHeader>
              <CardBody>
                {activeRequests.length > 0 ? (
                  <VStack spacing={4}>
                    {activeRequests.map(request => (
                      <Card key={request._id} w="full" variant="outline">
                        <CardBody p={4}>
                          <Stack spacing={3}>
                            <HStack justify="space-between">
                              <Badge
                                colorScheme="primary"
                                fontSize="sm"
                                px={2}
                                py={1}
                              >
                                {request.bloodGroup}
                              </Badge>
                              <Badge colorScheme={getStatusColor(request.status)}>
                                {request.status}
                              </Badge>
                            </HStack>
                            
                            <Text fontWeight="medium">{request.hospital}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {request.units} units needed
                            </Text>
                            
                            <Box>
                              <HStack justify="space-between" mb={2}>
                                <Text fontSize="sm">Progress</Text>
                                <Text fontSize="sm">{request.status}</Text>
                              </HStack>
                              <Progress
                                value={getStatusProgress(request.status)}
                                colorScheme="primary"
                                size="sm"
                                rounded="full"
                              />
                            </Box>
                            
                            {request.status === 'pending' && (
                              <HStack spacing={2}>
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  variant="outline"
                                  onClick={() => cancelRequest(request._id)}
                                >
                                  Cancel Request
                                </Button>
                              </HStack>
                            )}
                          </Stack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                ) : (
                  <Alert status="info">
                    <AlertIcon />
                    No active requests. Click "New Request" to create one.
                  </Alert>
                )}
              </CardBody>
            </Card>
          </GridItem>

          {/* Nearby Donors */}
          <GridItem>
            <Card h="full">
              <CardHeader>
                <HStack>
                  <Icon as={FiMapPin} color="primary.500" />
                  <Heading size="md">Available Donors</Heading>
                  <Badge>{nearbyDonors.length}</Badge>
                </HStack>
              </CardHeader>
              <CardBody>
                {nearbyDonors.length > 0 ? (
                  <VStack spacing={4}>
                    {nearbyDonors.slice(0, 5).map(donor => (
                      <Card key={donor._id} w="full" variant="outline">
                        <CardBody p={4}>
                          <Stack spacing={2}>
                            <HStack justify="space-between">
                              <Text fontWeight="medium">{donor.name}</Text>
                              <Badge colorScheme="primary">{donor.bloodGroup}</Badge>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              <Icon as={FiMapPin} mr={1} />
                              {donor.location}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              Last active: {new Date(donor.lastActive).toLocaleDateString()}
                            </Text>
                            <Button
                              size="sm"
                              colorScheme="primary"
                              variant="outline"
                              as={RouterLink}
                              to={`/contact?donorId=${donor._id}`}
                            >
                              Contact Donor
                            </Button>
                          </Stack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                ) : (
                  <Alert status="warning">
                    <AlertIcon />
                    No donors available in your area right now.
                  </Alert>
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Request History */}
        <Card>
          <CardHeader>
            <HStack>
              <Icon as={FiList} color="primary.500" />
              <Heading size="md">Request History</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            {requestHistory.length > 0 ? (
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
                {requestHistory.slice(0, 6).map(request => (
                  <Card key={request._id} variant="outline">
                    <CardBody p={4}>
                      <Stack spacing={2}>
                        <HStack justify="space-between">
                          <Badge colorScheme="primary">{request.bloodGroup}</Badge>
                          <Badge colorScheme={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </HStack>
                        <Text fontWeight="medium" fontSize="sm">
                          {request.hospital}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {request.units} units
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </Text>
                      </Stack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            ) : (
              <Alert status="info">
                <AlertIcon />
                No request history available.
              </Alert>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}

export default RecipientDashboard;