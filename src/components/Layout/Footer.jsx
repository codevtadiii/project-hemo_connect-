import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { FiHeart, FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';

function Footer() {
  return (
    <Box bg="gray.900" color="white">
      <Container as={Stack} maxW="6xl" py={10}>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ base: 'center', md: 'space-between' }}
          align={{ base: 'center', md: 'center' }}
        >
          <HStack>
            <Box as={FiHeart} color="primary.400" />
            <Text fontWeight="bold">HEMO CONNECT</Text>
          </HStack>
          
          <Text fontSize="sm">
            Saving lives one donation at a time
          </Text>
          
          <HStack spacing={4}>
            <IconButton
              as="a"
              href="#"
              aria-label="Facebook"
              icon={<FiFacebook />}
              variant="ghost"
              size="sm"
              color="white"
              _hover={{ color: 'primary.400' }}
            />
            <IconButton
              as="a"
              href="#"
              aria-label="Twitter"
              icon={<FiTwitter />}
              variant="ghost"
              size="sm"
              color="white"
              _hover={{ color: 'primary.400' }}
            />
            <IconButton
              as="a"
              href="#"
              aria-label="Instagram"
              icon={<FiInstagram />}
              variant="ghost"
              size="sm"
              color="white"
              _hover={{ color: 'primary.400' }}
            />
          </HStack>
        </Stack>
        
        <Text pt={6} fontSize="xs" textAlign="center" color="gray.400">
          © 2025 Hemo Connect. All rights reserved.
        </Text>
      </Container>
    </Box>
  );
}

export default Footer;