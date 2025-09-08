import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
  VStack,
  Card,
  CardBody,
  Icon,
  Select,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiHeart } from 'react-icons/fi';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function BloodRequestPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    bloodGroup: '',
    units: 1,
    hospital: user?.hospital || '',
    contactNumber: user?.phone || '',
    urgencyLevel: 'medium',
    additionalNotes: '',
    requiredByDate: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (valueString) => {
    setFormData(prev => ({
      ...prev,
      units: parseInt(valueString) || 1,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newRequest = await response.json();
        toast({
          title: 'Request Submitted',
          description: 'Your blood request has been submitted successfully!',
          status: 'success',
          duration: 5000,
        });
        
        // Redirect to request success page or dashboard
        navigate('/recipient-dashboard', { 
          state: { newRequestId: newRequest._id } 
        });
      } else {
        const data = await response.json();
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit blood request',
        status: 'error',
        duration: 5000,
      });
    }

    setIsLoading(false);
  };

  return (
    <Container maxW="2xl" py={12}>
      <VStack spacing={8}>
        <VStack spacing={4} textAlign="center">
          <Icon as={FiHeart} w={12} h={12} color="primary.500" />
          <Heading size="lg">Request Blood</Heading>
          <Text color="gray.600">
            Submit your blood request and we'll notify nearby donors
          </Text>
        </VStack>

        <Alert status="info">
          <AlertIcon />
          <Box>
            <Text fontWeight="medium">Important:</Text>
            <Text fontSize="sm">
              Please ensure all information is accurate. Emergency requests will be prioritized.
            </Text>
          </Box>
        </Alert>

        <Card w="full">
          <CardBody p={8}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Blood Group Needed</FormLabel>
                  <Select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    placeholder="Select blood group"
                  >
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Units Required</FormLabel>
                  <NumberInput
                    value={formData.units}
                    onChange={handleNumberChange}
                    min={1}
                    max={10}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Hospital/Medical Center</FormLabel>
                  <Input
                    name="hospital"
                    value={formData.hospital}
                    onChange={handleChange}
                    placeholder="Enter hospital name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Contact Number</FormLabel>
                  <Input
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="Enter contact number"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Urgency Level</FormLabel>
                  <Select
                    name="urgencyLevel"
                    value={formData.urgencyLevel}
                    onChange={handleChange}
                  >
                    <option value="low">Low - Planned Surgery (1+ weeks)</option>
                    <option value="medium">Medium - Within 48 hours</option>
                    <option value="high">High - Within 24 hours</option>
                    <option value="critical">Critical - Immediate</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Required By Date</FormLabel>
                  <Input
                    name="requiredByDate"
                    type="datetime-local"
                    value={formData.requiredByDate}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Additional Notes</FormLabel>
                  <Textarea
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleChange}
                    placeholder="Any additional information for donors"
                    rows={4}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="primary"
                  size="lg"
                  fontSize="md"
                  isLoading={isLoading}
                  loadingText="Submitting request..."
                >
                  Submit Blood Request
                </Button>
              </Stack>
            </form>
          </CardBody>
        </Card>

        <Text textAlign="center" fontSize="sm" color="gray.500">
          Your request will be shared with verified donors in your area.
          You'll receive notifications as soon as donors respond.
        </Text>
      </VStack>
    </Container>
  );
}

export default BloodRequestPage;