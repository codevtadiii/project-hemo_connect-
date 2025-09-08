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
  Select,
  Input,
  FormControl,
  FormLabel,
  useToast,
} from '@chakra-ui/react';
import { FiMapPin, FiPhone, FiMail, FiFilter, FiUser } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function DonorMatchingPage() {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [filters, setFilters] = useState({
    bloodGroup: '',
    location: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchDonors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [donors, filters]);

  const fetchDonors = async () => {
    try {
      const response = await fetch('/api/donors/nearby', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const donorsData = await response.json();
        setDonors(donorsData);
      }
    } catch (error) {
      console.error('Failed to fetch donors:', error);
      toast({
        title: 'Failed to load donors',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...donors];

    if (filters.bloodGroup) {
      filtered = filtered.filter(donor => donor.bloodGroup === filters.bloodGroup);
    }

    if (filters.location) {
      filtered = filtered.filter(donor =>
        donor.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredDonors(filtered);
    
    // Redirect to no donors page if no results
    if (filtered.length === 0 && donors.length > 0) {
      navigate('/no-donors');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      bloodGroup: '',
      location: '',
    });
  };

  const contactDonor = (donor, method) => {
    if (method === 'phone') {
      window.open(`tel:${donor.phone}`, '_blank');
    } else if (method === 'email') {
      window.open(`mailto:${donor.email}`, '_blank');
    }
    
    toast({
      title: 'Contact Initiated',
      description: `Opening ${method} to contact ${donor.name}`,
      status: 'success',
      duration: 3000,
    });
  };

  if (isLoading) {
    return (
      <Container maxW="6xl" py={8}>
        <Text>Loading available donors...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Find Blood Donors</Heading>
          <Text color="gray.600">
            Connect with available donors in your area
          </Text>
        </Box>

        {/* Filters */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack>
                <Icon as={FiFilter} color="primary.500" />
                <Heading size="md">Filter Donors</Heading>
              </HStack>
              
              <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                <FormControl>
                  <FormLabel>Blood Group</FormLabel>
                  <Select
                    name="bloodGroup"
                    value={filters.bloodGroup}
                    onChange={handleFilterChange}
                    placeholder="All blood groups"
                  >
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <Input
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    placeholder="Enter location"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="end">
                  <Button onClick={clearFilters} variant="outline" w="full">
                    Clear Filters
                  </Button>
                </FormControl>
              </Grid>

              <Text fontSize="sm" color="gray.600">
                Found {filteredDonors.length} available donors
              </Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Donors List */}
        {filteredDonors.length > 0 ? (
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
            {filteredDonors.map((donor) => (
              <Card key={donor._id} variant="outline" _hover={{ boxShadow: 'md' }}>
                <CardBody>
                  <Stack spacing={4}>
                    <HStack justify="space-between">
                      <HStack>
                        <Icon as={FiUser} color="primary.500" />
                        <Text fontWeight="medium">{donor.name}</Text>
                      </HStack>
                      <Badge colorScheme="primary" fontSize="md" px={3} py={1}>
                        {donor.bloodGroup}
                      </Badge>
                    </HStack>
                    
                    <VStack spacing={2} align="start">
                      <HStack>
                        <Icon as={FiMapPin} color="gray.500" w={4} h={4} />
                        <Text fontSize="sm" color="gray.600">
                          {donor.location}
                        </Text>
                      </HStack>
                      
                      <HStack>
                        <Badge colorScheme="green" size="sm">Available</Badge>
                        <Text fontSize="sm" color="gray.500">
                          Last active: {new Date(donor.lastActive).toLocaleDateString()}
                        </Text>
                      </HStack>
                    </VStack>

                    <Stack spacing={2}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">
                        Contact Options:
                      </Text>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          leftIcon={<Icon as={FiPhone} />}
                          onClick={() => contactDonor(donor, 'phone')}
                          flex={1}
                        >
                          Call
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="green"
                          leftIcon={<Icon as={FiMail} />}
                          onClick={() => contactDonor(donor, 'email')}
                          flex={1}
                        >
                          Email
                        </Button>
                      </HStack>
                    </Stack>
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </Grid>
        ) : (
          <Alert status="warning">
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">No donors found</Text>
              <Text fontSize="sm">
                Try adjusting your filters or check back later for new donors.
              </Text>
            </Box>
          </Alert>
        )}
      </VStack>
    </Container>
  );
}

export default DonorMatchingPage;