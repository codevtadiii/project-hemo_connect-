import {
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Box,
  Icon,
  HStack,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiUsers, FiPhone, FiHome } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';

function NoDonorsPage() {
  return (
    <Container maxW="md" py={20}>
      <VStack spacing={8} textAlign="center">
        <Box>
          <Icon as={FiUsers} w={20} h={20} color="gray.400" mb={4} />
          <Heading size="lg" mb={4}>
            No Donors Available
          </Heading>
          <Text color="gray.600" mb={8}>
            We couldn't find any available donors in your area right now. 
            Don't worry, we have alternative options to help you.
          </Text>
        </Box>

        <Alert status="info" rounded="lg">
          <AlertIcon />
          <Box>
            <Text fontWeight="medium">Emergency Blood Banks</Text>
            <Text fontSize="sm">
              Contact these blood banks directly for immediate assistance:
            </Text>
          </Box>
        </Alert>

        <VStack spacing={4} w="full">
          <Box p={4} borderWidth={1} borderColor="gray.200" rounded="lg" w="full">
            <VStack spacing={2}>
              <Text fontWeight="medium">Red Cross Blood Bank</Text>
              <Text fontSize="sm" color="gray.600">24/7 Emergency Service</Text>
              <Button
                as="a"
                href="tel:+1234567890"
                size="sm"
                colorScheme="primary"
                leftIcon={<Icon as={FiPhone} />}
              >
                Call Now
              </Button>
            </VStack>
          </Box>

          <Box p={4} borderWidth={1} borderColor="gray.200" rounded="lg" w="full">
            <VStack spacing={2}>
              <Text fontWeight="medium">City General Hospital Blood Bank</Text>
              <Text fontSize="sm" color="gray.600">Open 6 AM - 10 PM</Text>
              <Button
                as="a"
                href="tel:+1234567891"
                size="sm"
                colorScheme="primary"
                leftIcon={<Icon as={FiPhone} />}
              >
                Call Now
              </Button>
            </VStack>
          </Box>
        </VStack>
        
        <HStack spacing={4}>
          <Button
            as={RouterLink}
            to="/request-blood"
            colorScheme="primary"
            size="lg"
          >
            Try New Request
          </Button>
          <Button
            as={RouterLink}
            to="/"
            variant="outline"
            size="lg"
            leftIcon={<Icon as={FiHome} />}
          >
            Go Home
          </Button>
        </HStack>
      </VStack>
    </Container>
  );
}

export default NoDonorsPage;