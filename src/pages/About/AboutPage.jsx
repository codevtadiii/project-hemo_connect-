import {
  Container,
  VStack,
  Heading,
  Text,
  Box,
  Grid,
  GridItem,
  Card,
  CardBody,
  Icon,
  HStack,
  Avatar,
  Stack,
} from '@chakra-ui/react';
import { FiHeart, FiTarget, FiUsers, FiAward } from 'react-icons/fi';

function AboutPage() {
  const teamMembers = [
    {
      name: "Aditya Kumar Jha",
      role: "Medical Director",
      image: "",
    },
    {
      name: "Arun Jelsinge",
      role: "Technology Lead",
      image: "",
    },
    
  ];

  return (
    <Container maxW="6xl" py={12}>
      <VStack spacing={16}>
        {/* Hero Section */}
        <VStack spacing={6} textAlign="center" maxW="4xl">
          <Icon as={FiHeart} w={16} h={16} color="primary.500" />
          <Heading size="2xl">About Hemo Connect</Heading>
          <Text fontSize="lg" color="gray.600">
            We're on a mission to make blood donation more accessible and efficient, 
            connecting donors with recipients when every second counts.
          </Text>
        </VStack>

        {/* Mission & Values */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={8}>
          <GridItem>
            <Card h="full" textAlign="center">
              <CardBody p={8}>
                <VStack spacing={4}>
                  <Icon as={FiTarget} w={12} h={12} color="primary.500" />
                  <Heading size="md">Our Mission</Heading>
                  <Text color="gray.600">
                    To save lives by creating a seamless connection between 
                    blood donors and recipients through technology.
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card h="full" textAlign="center">
              <CardBody p={8}>
                <VStack spacing={4}>
                  <Icon as={FiUsers} w={12} h={12} color="primary.500" />
                  <Heading size="md">Community First</Heading>
                  <Text color="gray.600">
                    Building a supportive community where every donation 
                    creates a ripple effect of hope and healing.
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card h="full" textAlign="center">
              <CardBody p={8}>
                <VStack spacing={4}>
                  <Icon as={FiAward} w={12} h={12} color="primary.500" />
                  <Heading size="md">Excellence</Heading>
                  <Text color="gray.600">
                    Committed to the highest standards of safety, 
                    reliability, and user experience in healthcare technology.
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Impact Stats */}
        <Box bg="primary.50" p={12} rounded="2xl" w="full">
          <VStack spacing={8} textAlign="center">
            <Heading size="xl">Our Impact</Heading>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={8}>
              <VStack>
                <Text fontSize="4xl" fontWeight="bold" color="primary.500">
                  2,547
                </Text>
                <Text color="gray.600">Lives Saved</Text>
              </VStack>
              <VStack>
                <Text fontSize="4xl" fontWeight="bold" color="primary.500">
                  1,234
                </Text>
                <Text color="gray.600">Active Donors</Text>
              </VStack>
              <VStack>
                <Text fontSize="4xl" fontWeight="bold" color="primary.500">
                  856
                </Text>
                <Text color="gray.600">Successful Matches</Text>
              </VStack>
            </Grid>
          </VStack>
        </Box>

        {/* Team Section */}
        <VStack spacing={8}>
          <VStack spacing={4} textAlign="center">
            <Heading size="xl">Meet Our Team</Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              Our dedicated team combines medical expertise with cutting-edge 
              technology to create a platform that saves lives.
            </Text>
          </VStack>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={8}>
            {teamMembers.map((member, index) => (
              <Card key={index} textAlign="center">
                <CardBody p={8}>
                  <VStack spacing={4}>
                    <Avatar
                      size="xl"
                      name={member.name}
                      src={member.image}
                    />
                    <Box>
                      <Heading size="md">{member.name}</Heading>
                      <Text color="gray.600">{member.role}</Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </Grid>
        </VStack>

        {/* Story Section */}
        <Box maxW="4xl">
          <VStack spacing={6} textAlign="center">
            <Heading size="xl">Our Story</Heading>
            <Text fontSize="lg" color="gray.600" lineHeight="tall">
              Hemo Connect was born from a personal experience when our founder's 
              family member needed an emergency blood transfusion. The traditional 
              process was slow and stressful. We knew technology could do better.
            </Text>
            <Text fontSize="lg" color="gray.600" lineHeight="tall">
              Today, we're proud to serve thousands of donors and recipients, 
              making blood donation as simple as a few taps on your phone. 
              Every donation facilitated through our platform represents hope, 
              healing, and the power of human connection.
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}

export default AboutPage;