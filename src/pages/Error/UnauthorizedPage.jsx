import {
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Box,
  Icon,
} from '@chakra-ui/react';
import { FiLock, FiHome } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';

function UnauthorizedPage() {
  return (
    <Container maxW="md" py={20}>
      <VStack spacing={8} textAlign="center">
        <Box>
          <Icon as={FiLock} w={20} h={20} color="red.500" mb={4} />
          <Heading size="lg" mb={4}>
            Access Denied
          </Heading>
          <Text color="gray.600" mb={8}>
            You don't have permission to access this page. Please check your account role or contact support.
          </Text>
        </Box>
        
        <Button
          as={RouterLink}
          to="/"
          colorScheme="primary"
          size="lg"
          leftIcon={<Icon as={FiHome} />}
        >
          Go Home
        </Button>
      </VStack>
    </Container>
  );
}

export default UnauthorizedPage;