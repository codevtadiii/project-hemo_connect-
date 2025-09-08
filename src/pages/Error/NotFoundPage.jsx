import {
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Box,
  Icon,
} from '@chakra-ui/react';
import { FiHome } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';

function NotFoundPage() {
  return (
    <Container maxW="md" py={20}>
      <VStack spacing={8} textAlign="center">
        <Box>
          <Text fontSize="6xl" fontWeight="bold" color="primary.500">
            404
          </Text>
          <Heading size="lg" mb={4}>
            Page Not Found
          </Heading>
          <Text color="gray.600" mb={8}>
            The page you're looking for doesn't exist or has been moved.
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

export default NotFoundPage;