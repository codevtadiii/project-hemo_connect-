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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  Icon,
  Box,
  useToast,
  Stack,
} from '@chakra-ui/react';
import { FiMail, FiPhone, FiMapPin, FiClock, FiHeart } from 'react-icons/fi';
import { useState } from 'react';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Message Sent',
          description: 'Thank you for contacting us! We\'ll get back to you soon.',
          status: 'success',
          duration: 5000,
        });
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      toast({
        title: 'Message Failed',
        description: 'Failed to send your message. Please try again.',
        status: 'error',
        duration: 5000,
      });
    }

    setIsLoading(false);
  };

  return (
    <Container maxW="6xl" py={12}>
      <VStack spacing={12}>
        <VStack spacing={4} textAlign="center">
          <Heading size="xl">Contact Us</Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            Have questions or need support? We're here to help you make a difference 
            in saving lives through blood donation.
          </Text>
        </VStack>

        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={12}>
          {/* Contact Form */}
          <GridItem>
            <Card>
              <CardHeader>
                <Heading size="md">Send us a Message</Heading>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={6}>
                    <FormControl isRequired>
                      <FormLabel>Name</FormLabel>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Email</FormLabel>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Your email address"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Subject</FormLabel>
                      <Input
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Message subject"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Message</FormLabel>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Your message"
                        rows={6}
                      />
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="primary"
                      size="lg"
                      isLoading={isLoading}
                      loadingText="Sending..."
                    >
                      Send Message
                    </Button>
                  </Stack>
                </form>
              </CardBody>
            </Card>
          </GridItem>

          {/* Contact Information */}
          <GridItem>
            <VStack spacing={8}>
              <Card w="full">
                <CardBody p={8}>
                  <VStack spacing={6}>
                    <Heading size="md">Get in Touch</Heading>
                    
                    <VStack spacing={4} align="stretch">
                      <HStack>
                        <Icon as={FiMail} color="primary.500" />
                        <Box>
                          <Text fontWeight="medium">Email</Text>
                          <Text color="gray.600" fontSize="sm">
                            support@hemoconnect.org
                          </Text>
                        </Box>
                      </HStack>

                      <HStack>
                        <Icon as={FiPhone} color="primary.500" />
                        <Box>
                          <Text fontWeight="medium">Emergency Helpline</Text>
                          <Text color="gray.600" fontSize="sm">
                            +1 (555) 123-BLOOD
                          </Text>
                        </Box>
                      </HStack>

                      <HStack>
                        <Icon as={FiMapPin} color="primary.500" />
                        <Box>
                          <Text fontWeight="medium">Address</Text>
                          <Text color="gray.600" fontSize="sm">
                            123 Health Street<br />
                            Medical District<br />
                            City, State 12345
                          </Text>
                        </Box>
                      </HStack>

                      <HStack>
                        <Icon as={FiClock} color="primary.500" />
                        <Box>
                          <Text fontWeight="medium">Support Hours</Text>
                          <Text color="gray.600" fontSize="sm">
                            24/7 for emergencies<br />
                            Mon-Fri 9 AM - 6 PM for general inquiries
                          </Text>
                        </Box>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              <Card w="full" bg="primary.50">
                <CardBody p={8}>
                  <VStack spacing={4} textAlign="center">
                    <Icon as={FiHeart} w={12} h={12} color="primary.500" />
                    <Heading size="md">Emergency Support</Heading>
                    <Text color="gray.700" fontSize="sm">
                      For life-threatening emergencies requiring immediate blood, 
                      call 911 first, then contact our emergency helpline for 
                      donor coordination support.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
    </Container>
  );
}

export default ContactPage;