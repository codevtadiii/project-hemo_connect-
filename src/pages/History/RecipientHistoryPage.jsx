import {
  Container,
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  Badge,
  HStack,
  Icon,
  Box,
  Alert,
  AlertIcon,
  Grid,
  GridItem,
  Stack,
  Button,
  Progress,
} from '@chakra-ui/react';
import { FiRefreshCw, FiCalendar, FiMapPin, FiClock } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';

function RecipientHistoryPage() {
  const [requestHistory, setRequestHistory] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    fulfilledRequests: 0,
    averageResponseTime: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequestHistory();
  }, []);

  const fetchRequestHistory = async () => {
    try {
      const response = await fetch('/api/requests/my-history', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const history = await response.json();
        setRequestHistory(history);
        
        // Calculate stats
        const fulfilled = history.filter(req => req.status === 'fulfilled');
        setStats({
          totalRequests: history.length,
          fulfilledRequests: fulfilled.length,
          averageResponseTime: calculateAverageResponseTime(history),
        });
      }
    } catch (error) {
      console.error('Failed to fetch request history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAverageResponseTime = (history) => {
    const respondedRequests = history.filter(req => 
      req.status === 'matched' || req.status === 'fulfilled'
    );
    
    if (respondedRequests.length === 0) return 0;
    
    // Mock calculation - in real app, track actual response times
    return 4.5; // hours
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
      case 'cancelled': return 0;
      default: return 0;
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
        <Text>Loading request history...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between" align="start">
          <Box>
            <Heading size="lg" mb={2}>Request History</Heading>
            <Text color="gray.600">
              View all your blood requests and their outcomes
            </Text>
          </Box>
          <Button
            as={RouterLink}
            to="/request-blood"
            colorScheme="primary"
            leftIcon={<Icon as={FiRefreshCw} />}
          >
            New Request
          </Button>
        </HStack>

        {/* Stats Cards */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
          <Card>
            <CardBody textAlign="center" p={8}>
              <VStack spacing={4}>
                <Icon as={FiRefreshCw} w={12} h={12} color="blue.500" />
                <Box>
                  <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                    {stats.totalRequests}
                  </Text>
                  <Text color="gray.600">Total Requests</Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody textAlign="center" p={8}>
              <VStack spacing={4}>
                <Icon as={FiCalendar} w={12} h={12} color="green.500" />
                <Box>
                  <Text fontSize="3xl" fontWeight="bold" color="green.500">
                    {stats.fulfilledRequests}
                  </Text>
                  <Text color="gray.600">Fulfilled Requests</Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody textAlign="center" p={8}>
              <VStack spacing={4}>
                <Icon as={FiClock} w={12} h={12} color="orange.500" />
                <Box>
                  <Text fontSize="3xl" fontWeight="bold" color="orange.500">
                    {stats.averageResponseTime}h
                  </Text>
                  <Text color="gray.600">Avg. Response Time</Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </Grid>

        {/* Request History */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="md">Your Blood Requests</Heading>
              
              {requestHistory.length > 0 ? (
                <VStack spacing={4}>
                  {requestHistory.map((request) => (
                    <Card key={request._id} variant="outline">
                      <CardBody>
                        <Stack spacing={4}>
                          <HStack justify="space-between" wrap="wrap">
                            <HStack spacing={3}>
                              <Badge colorScheme="primary" fontSize="md" px={3} py={1}>
                                {request.bloodGroup}
                              </Badge>
                              <Badge colorScheme={getUrgencyColor(request.urgencyLevel)}>
                                {request.urgencyLevel}
                              </Badge>
                            </HStack>
                            <Badge colorScheme={getStatusColor(request.status)} fontSize="md">
                              {request.status}
                            </Badge>
                          </HStack>
                          
                          <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={6}>
                            <Box>
                              <VStack spacing={3} align="start">
                                <Box>
                                  <Text fontWeight="medium" fontSize="lg" mb={1}>
                                    {request.hospital}
                                  </Text>
                                  <Text color="gray.600">
                                    {request.units} units requested
                                  </Text>
                                </Box>
                                
                                <HStack>
                                  <Icon as={FiCalendar} color="gray.500" w={4} h={4} />
                                  <Text fontSize="sm" color="gray.600">
                                    Requested: {new Date(request.createdAt).toLocaleDateString()}
                                  </Text>
                                </HStack>
                                
                                <HStack>
                                  <Icon as={FiMapPin} color="gray.500" w={4} h={4} />
                                  <Text fontSize="sm" color="gray.600">
                                    Contact: {request.contactNumber}
                                  </Text>
                                </HStack>

                                {request.additionalNotes && (
                                  <Box>
                                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                                      Notes:
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                      {request.additionalNotes}
                                    </Text>
                                  </Box>
                                )}
                              </VStack>
                            </Box>

                            <Box>
                              <VStack spacing={4} align="stretch">
                                <Box>
                                  <HStack justify="space-between" mb={2}>
                                    <Text fontSize="sm" fontWeight="medium">
                                      Progress
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                      {request.status}
                                    </Text>
                                  </HStack>
                                  <Progress
                                    value={getStatusProgress(request.status)}
                                    colorScheme={getStatusColor(request.status)}
                                    size="sm"
                                    rounded="full"
                                  />
                                </Box>

                                {request.status === 'fulfilled' && (
                                  <Box p={3} bg="green.50" rounded="md">
                                    <Text fontSize="sm" color="green.700" textAlign="center">
                                      ✓ Request fulfilled successfully
                                    </Text>
                                  </Box>
                                )}

                                {request.status === 'cancelled' && (
                                  <Box p={3} bg="red.50" rounded="md">
                                    <Text fontSize="sm" color="red.700" textAlign="center">
                                      Request was cancelled
                                    </Text>
                                  </Box>
                                )}

                                {(request.status === 'fulfilled' || request.status === 'cancelled') && (
                                  <Button
                                    size="sm"
                                    colorScheme="primary"
                                    variant="outline"
                                    leftIcon={<Icon as={FiRefreshCw} />}
                                    as={RouterLink}
                                    to="/request-blood"
                                  >
                                    Repeat Request
                                  </Button>
                                )}
                              </VStack>
                            </Box>
                          </Grid>
                        </Stack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              ) : (
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="medium">No request history</Text>
                    <Text fontSize="sm">
                      You haven't made any blood requests yet. Click "New Request" to get started.
                    </Text>
                  </Box>
                </Alert>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}

export default RecipientHistoryPage;