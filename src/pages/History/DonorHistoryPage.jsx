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
} from '@chakra-ui/react';
import { FiHeart, FiCalendar, FiMapPin, FiAward } from 'react-icons/fi';
import { useState, useEffect } from 'react';

function DonorHistoryPage() {
  const [donationHistory, setDonationHistory] = useState([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    livessaved: 0,
    nextEligibleDate: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDonationHistory();
  }, []);

  const fetchDonationHistory = async () => {
    try {
  const response = await fetch('/api/donor-blood/donation-history', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const history = await response.json();
        setDonationHistory(history);
        
        // Calculate stats
        setStats({
          totalDonations: history.length,
          livessaved: history.length * 3, // Assuming each donation saves 3 lives
          nextEligibleDate: calculateNextEligibleDate(history),
        });
      }
    } catch (error) {
      console.error('Failed to fetch donation history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateNextEligibleDate = (history) => {
    if (history.length === 0) return new Date();
    
    const lastDonation = history[0]; // Most recent
    const nextDate = new Date(lastDonation.donationDate);
    nextDate.setDate(nextDate.getDate() + 56); // 8 weeks between donations
    
    return nextDate;
  };

  const isEligibleToDonate = () => {
    return stats.nextEligibleDate && new Date() >= stats.nextEligibleDate;
  };

  if (isLoading) {
    return (
      <Container maxW="6xl" py={8}>
        <Text>Loading donation history...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Donation History</Heading>
          <Text color="gray.600">
            Track your donation journey and see the impact you've made
          </Text>
        </Box>

        {/* Stats Cards */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
          <Card>
            <CardBody textAlign="center" p={8}>
              <VStack spacing={4}>
                <Icon as={FiHeart} w={12} h={12} color="primary.500" />
                <Box>
                  <Text fontSize="3xl" fontWeight="bold" color="primary.500">
                    {stats.totalDonations}
                  </Text>
                  <Text color="gray.600">Total Donations</Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody textAlign="center" p={8}>
              <VStack spacing={4}>
                <Icon as={FiAward} w={12} h={12} color="green.500" />
                <Box>
                  <Text fontSize="3xl" fontWeight="bold" color="green.500">
                    {stats.livessaved}
                  </Text>
                  <Text color="gray.600">Lives Potentially Saved</Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody textAlign="center" p={8}>
              <VStack spacing={4}>
                <Icon as={FiCalendar} w={12} h={12} color="blue.500" />
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color="blue.500">
                    {isEligibleToDonate() ? 'Eligible Now' : stats.nextEligibleDate?.toLocaleDateString()}
                  </Text>
                  <Text color="gray.600">Next Eligible Date</Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </Grid>

        {/* Eligibility Status */}
        <Alert 
          status={isEligibleToDonate() ? 'success' : 'info'} 
          variant="left-accent"
        >
          <AlertIcon />
          <Box>
            <Text fontWeight="medium">
              {isEligibleToDonate() 
                ? 'You are eligible to donate blood!' 
                : 'You need to wait before your next donation'
              }
            </Text>
            <Text fontSize="sm">
              {isEligibleToDonate()
                ? 'You can help save lives by responding to blood requests in your area.'
                : `You can donate again on ${stats.nextEligibleDate?.toLocaleDateString()}`
              }
            </Text>
          </Box>
        </Alert>

        {/* Donation History */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading size="md">Your Donations</Heading>
              
              {donationHistory.length > 0 ? (
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                  {donationHistory.map((donation) => (
                    <Card key={donation._id} variant="outline">
                      <CardBody>
                        <Stack spacing={4}>
                          <HStack justify="space-between">
                            <Badge colorScheme="primary" fontSize="md" px={3} py={1}>
                              {donation.bloodGroup}
                            </Badge>
                            <Badge colorScheme="green">Completed</Badge>
                          </HStack>
                          
                          <Box>
                            <Text fontWeight="medium" mb={2}>
                              {donation.hospital}
                            </Text>
                            <VStack spacing={2} align="start">
                              <HStack>
                                <Icon as={FiHeart} color="primary.500" w={4} h={4} />
                                <Text fontSize="sm" color="gray.600">
                                  {donation.units} units donated
                                </Text>
                              </HStack>
                              <HStack>
                                <Icon as={FiCalendar} color="blue.500" w={4} h={4} />
                                <Text fontSize="sm" color="gray.600">
                                  {new Date(donation.donationDate).toLocaleDateString()}
                                </Text>
                              </HStack>
                              <HStack>
                                <Icon as={FiMapPin} color="green.500" w={4} h={4} />
                                <Text fontSize="sm" color="gray.600">
                                  Saved approximately 3 lives
                                </Text>
                              </HStack>
                            </VStack>
                          </Box>
                        </Stack>
                      </CardBody>
                    </Card>
                  ))}
                </Grid>
              ) : (
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="medium">No donation history yet</Text>
                    <Text fontSize="sm">
                      Start your life-saving journey by accepting blood requests from your dashboard.
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

export default DonorHistoryPage;