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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { FiUsers, FiActivity, FiAlertTriangle, FiBarChart2 } from 'react-icons/fi';
import { useState, useEffect } from 'react';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeRequests: 0,
    completedDonations: 0,
    pendingReports: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [flaggedRequests, setFlaggedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, flaggedRes] = await Promise.all([
        fetch('/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch('/api/admin/recent-users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch('/api/admin/flagged-requests', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setRecentUsers(usersData);
      }

      if (flaggedRes.ok) {
        const flaggedData = await flaggedRes.json();
        setFlaggedRequests(flaggedData);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      const response = await fetch(`/api/admin/requests/${requestId}/${action}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        toast({
          title: `Request ${action}ed`,
          description: `The request has been ${action}ed successfully`,
          status: 'success',
          duration: 3000,
        });
        fetchAdminData();
      }
    } catch (error) {
      toast({
        title: 'Action Failed',
        description: `Failed to ${action} the request`,
        status: 'error',
        duration: 3000,
      });
    }
  };

  if (isLoading) {
    return (
      <Container maxW="6xl" py={8}>
        <Text>Loading admin dashboard...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Admin Dashboard
          </Heading>
          <Text color="gray.600">
            Manage the Hemo Connect platform and monitor activity
          </Text>
        </Box>

        {/* Stats Cards */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>
                  <HStack>
                    <Icon as={FiUsers} color="primary.500" />
                    <Text>Total Users</Text>
                  </HStack>
                </StatLabel>
                <StatNumber>{stats.totalUsers}</StatNumber>
                <StatHelpText>Registered users</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>
                  <HStack>
                    <Icon as={FiActivity} color="blue.500" />
                    <Text>Active Requests</Text>
                  </HStack>
                </StatLabel>
                <StatNumber>{stats.activeRequests}</StatNumber>
                <StatHelpText>Pending blood requests</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>
                  <HStack>
                    <Icon as={FiBarChart2} color="green.500" />
                    <Text>Donations</Text>
                  </HStack>
                </StatLabel>
                <StatNumber>{stats.completedDonations}</StatNumber>
                <StatHelpText>This month</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>
                  <HStack>
                    <Icon as={FiAlertTriangle} color="red.500" />
                    <Text>Reports</Text>
                  </HStack>
                </StatLabel>
                <StatNumber>{stats.pendingReports}</StatNumber>
                <StatHelpText>Pending review</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={8}>
          {/* Flagged Requests */}
          <GridItem>
            <Card h="full">
              <CardHeader>
                <HStack>
                  <Icon as={FiAlertTriangle} color="red.500" />
                  <Heading size="md">Flagged Requests</Heading>
                  <Badge colorScheme="red">{flaggedRequests.length}</Badge>
                </HStack>
              </CardHeader>
              <CardBody>
                {flaggedRequests.length > 0 ? (
                  <VStack spacing={4}>
                    {flaggedRequests.map(request => (
                      <Card key={request._id} w="full" variant="outline" borderColor="red.200">
                        <CardBody p={4}>
                          <Stack spacing={3}>
                            <HStack justify="space-between">
                              <Badge colorScheme="primary">{request.bloodGroup}</Badge>
                              <Badge colorScheme="red">Flagged</Badge>
                            </HStack>
                            
                            <Text fontWeight="medium">{request.hospital}</Text>
                            <Text fontSize="sm" color="gray.600">
                              Requested by: {request.requesterName}
                            </Text>
                            <Text fontSize="sm" color="red.500">
                              Reason: {request.flagReason}
                            </Text>
                            
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                colorScheme="green"
                                onClick={() => handleRequestAction(request._id, 'approve')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="outline"
                                onClick={() => handleRequestAction(request._id, 'reject')}
                              >
                                Reject
                              </Button>
                            </HStack>
                          </Stack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                ) : (
                  <Alert status="success">
                    <AlertIcon />
                    No flagged requests to review.
                  </Alert>
                )}
              </CardBody>
            </Card>
          </GridItem>

          {/* Recent Users */}
          <GridItem>
            <Card h="full">
              <CardHeader>
                <HStack>
                  <Icon as={FiUsers} color="primary.500" />
                  <Heading size="md">Recent Users</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                {recentUsers.length > 0 ? (
                  <TableContainer>
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>Name</Th>
                          <Th>Role</Th>
                          <Th>Blood Group</Th>
                          <Th>Joined</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {recentUsers.slice(0, 5).map(user => (
                          <Tr key={user._id}>
                            <Td>{user.name}</Td>
                            <Td>
                              <Badge colorScheme="primary">{user.role}</Badge>
                            </Td>
                            <Td>{user.bloodGroup}</Td>
                            <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert status="info">
                    <AlertIcon />
                    No recent user registrations.
                  </Alert>
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <Heading size="md">Quick Actions</Heading>
          </CardHeader>
          <CardBody>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
              <Button
                colorScheme="primary"
                variant="outline"
                h="80px"
                flexDirection="column"
                gap={2}
              >
                <Icon as={FiUsers} />
                <Text fontSize="sm">Manage Users</Text>
              </Button>
              <Button
                colorScheme="blue"
                variant="outline"
                h="80px"
                flexDirection="column"
                gap={2}
              >
                <Icon as={FiBarChart2} />
                <Text fontSize="sm">View Reports</Text>
              </Button>
              <Button
                colorScheme="green"
                variant="outline"
                h="80px"
                flexDirection="column"
                gap={2}
              >
                <Icon as={FiActivity} />
                <Text fontSize="sm">System Health</Text>
              </Button>
            </Grid>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}

export default AdminDashboard;