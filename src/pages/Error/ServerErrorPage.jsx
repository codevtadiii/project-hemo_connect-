import {
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Box,
  Icon,
  HStack,
} from '@chakra-ui/react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';

function ServerErrorPage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <Container maxW="md" py={20}>
      <VStack spacing={8} textAlign="center">
        <Box>
          <Icon as={FiAlertTriangle} w={20} h={20} color="red.500" mb={4} />
          <Heading size="lg" mb={4}>
            Server Error
          </Heading>
          <Text color="gray.600" mb={8}>
            Something went wrong on our end. Please try again or contact support if the problem persists.
          </Text>
        </Box>
        
        <HStack spacing={4}>
          <Button
            onClick={handleRetry}
            colorScheme="primary"
            size="lg"
            leftIcon={<Icon as={FiRefreshCw} />}
          >
            Try Again
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

export default ServerErrorPage;