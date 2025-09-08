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
  Switch,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  Badge,
  Box,
  useToast,
  Alert,
  AlertIcon,
  Stack,
  Icon,
} from '@chakra-ui/react';
import { FiHeart, FiMapPin, FiClock, FiUser } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

function DonorDashboard() {
  const { user, updateUser } = useAuth();
  const { notifications } = useSocket();
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable || false);
  const [nearbyRequests, setNearbyRequests] = useState([]);
  const [donationHistory, setDonationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [requestsRes, historyRes] = await Promise.all([
  fetch('/api/blood-requests/nearby', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }),
  fetch('/api/donor-blood/donation-history', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }),
      ]);

      if (requestsRes.ok) {
        const requests = await requestsRes.json();
        setNearbyRequests(requests);
      }

      if (historyRes.ok) {
        const history = await historyRes.json();
        setDonationHistory(history);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const response = await fetch('/api/users/toggle-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ isAvailable: !isAvailable }),
      });

      if (response.ok) {
        setIsAvailable(!isAvailable);
        updateUser({ isAvailable: !isAvailable });
        toast({
          title: 'Availability Updated',
          description: `You are now ${!isAvailable ? 'available' : 'unavailable'} for donations`,
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update availability',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const respondToRequest = async (requestId, response) => {
    try {
      const res = await fetch(`/api/requests/${requestId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ response }),
      });

      if (res.ok) {
        toast({
          title: 'Response Sent',
          description: `You have ${response}ed the blood request`,
          status: 'success',
          duration: 3000,
        });
        fetchDashboardData();
      }
    } catch (error) {
      toast({
        title: 'Response Failed',
        description: 'Failed to send response',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
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
        <Box>
          <Heading size="lg" mb={2}>
            Welcome back, {user?.name}!
          </Heading>
          <Text color="gray.600">
            Thank you for being a life-saver. Here's what's happening in your area.
          </Text>
        </Box>

        {/* Availability Toggle */}
        <Card>
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontWeight="medium">Donation Availability</Text>
                <Text fontSize="sm" color="gray.600">
                  Toggle to receive blood donation requests
                </Text>
              </VStack>
              <FormControl display="flex" alignItems="center">
                <Switch
                  id="availability"
                  isChecked={isAvailable}
                  onChange={toggleAvailability}
                  colorScheme="primary"
                  size="lg"
                />
                <FormLabel htmlFor="availability" ml={3} mb="0">
                  <Badge colorScheme={isAvailable ? 'green' : 'gray'}>
                    {isAvailable ? 'Available' : 'Unavailable'}
                  </Badge>
                </FormLabel>
              </FormControl>
            </HStack>
          </CardBody>
        </Card>

        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={8}>
          {/* Active Blood Requests */}
          <GridItem>
            <Card h="full">
              <CardHeader>
                <HStack>
                  <Icon as={FiMapPin} color="primary.500" />
                  <Heading size="md">Nearby Blood Requests</Heading>
                  <Badge>{nearbyRequests.length}</Badge>
                </HStack>
              </CardHeader>
              <CardBody>
                {nearbyRequests.length > 0 ? (
                  <VStack spacing={4}>
                    {nearbyRequests.map(request => (
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
                              <Badge colorScheme={getUrgencyColor(request.urgencyLevel)}>
                                {request.urgencyLevel}
                              </Badge>
                            </HStack>
                            
                            <Text fontWeight="medium">{request.hospital}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {request.units} units needed
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              <Icon as={FiClock} mr={1} />
                              {new Date(request.createdAt).toLocaleDateString()}
                            </Text>
                            
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                colorScheme="primary"
                                onClick={() => respondToRequest(request._id, 'accept')}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => respondToRequest(request._id, 'decline')}
                              >
                                Decline
                              </Button>
                            </HStack>
                          </Stack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                ) : (
                  <Alert status="info">
                    <AlertIcon />
                    No blood requests in your area at the moment.
                  </Alert>
                )}
              </CardBody>
            </Card>
          </GridItem>

          {/* Recent Notifications */}
          <GridItem>
            <Card h="full">
              <CardHeader>
                <HStack>
                  <Icon as={FiUser} color="primary.500" />
                  <Heading size="md">Recent Notifications</Heading>
                  <Badge>{notifications.length}</Badge>
                </HStack>
              </CardHeader>
              <CardBody>
                {notifications.length > 0 ? (
                  <VStack spacing={4}>
                    {notifications.slice(0, 5).map(notification => (
                      <Card key={notification.id} w="full" variant="outline">
                        <CardBody p={4}>
                          <Stack spacing={2}>
                            <Text fontWeight="medium" fontSize="sm">
                              {notification.title}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {notification.message}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {new Date(notification.timestamp).toLocaleString()}
                            </Text>
                          </Stack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                ) : (
                  <Alert status="info">
                    <AlertIcon />
                    No new notifications.
                  </Alert>
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Donation History */}
        <Card>
          <CardHeader>
            <HStack>
              <Icon as={FiHeart} color="primary.500" />
              <Heading size="md">Recent Donations</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            {donationHistory.length > 0 ? (
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
                {donationHistory.slice(0, 6).map(donation => (
                  <Card key={donation._id} variant="outline">
                    <CardBody p={4}>
                      <Stack spacing={2}>
                        <HStack justify="space-between">
                          <Badge colorScheme="primary">{donation.bloodGroup}</Badge>
                          <Badge colorScheme="green">Completed</Badge>
                        </HStack>
                        <Text fontWeight="medium" fontSize="sm">
                          {donation.hospital}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {donation.units} units donated
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {new Date(donation.donationDate).toLocaleDateString()}
                        </Text>
                      </Stack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            ) : (
              <Alert status="info">
                <AlertIcon />
                No donation history available.
              </Alert>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}

export default DonorDashboard;