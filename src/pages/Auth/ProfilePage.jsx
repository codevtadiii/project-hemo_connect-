
import React, { useState } from 'react';
import { Container, VStack, Heading, Text, Box, Badge, Avatar, Divider, HStack, Icon, Input, Button, useToast, FormControl, FormLabel } from '@chakra-ui/react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure, RadioGroup, Radio, Stack } from '@chakra-ui/react';
import { FiUser, FiMail, FiCheckCircle, FiXCircle, FiShield, FiPhone, FiLock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [otpMethod, setOtpMethod] = useState('email');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [resetEmailOrPhone, setResetEmailOrPhone] = useState(user?.email || '');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle sending OTP
  const handleSendOtp = async () => {
    setOtpLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: otpMethod, value: resetEmailOrPhone }),
      });
      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        toast({ title: 'OTP sent', status: 'success', duration: 3000 });
      } else {
        toast({ title: 'Failed to send OTP', description: data.message, status: 'error', duration: 3000 });
      }
    } catch (error) {
      toast({ title: 'Network error', status: 'error', duration: 3000 });
    }
    setOtpLoading(false);
  };

  // Handle OTP verification and password reset
  const handleVerifyOtpAndReset = async () => {
    setOtpLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: otpMethod, value: resetEmailOrPhone, otp, newPassword: newResetPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: 'Password reset successful', status: 'success', duration: 3000 });
        setOtpSent(false);
        setOtp('');
        setNewResetPassword('');
        onClose();
      } else {
        toast({ title: 'Failed to reset password', description: data.message, status: 'error', duration: 3000 });
      }
    } catch (error) {
      toast({ title: 'Network error', status: 'error', duration: 3000 });
    }
    setOtpLoading(false);
  };

  if (!user) {
    return (
      <Container maxW="md" py={20}>
        <VStack spacing={8} textAlign="center">
          <Heading size="lg">Unauthorized</Heading>
          <Text color="gray.600">You must be logged in to view your profile.</Text>
        </VStack>
      </Container>
    );
  }

  // Handle contact details update
  const handleContactUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ phone, address, emergencyContact }),
      });
      const data = await response.json();
      if (response.ok) {
        updateUser(data);
        toast({ title: 'Contact details updated', status: 'success', duration: 3000 });
      } else {
        toast({ title: 'Update failed', description: data.message, status: 'error', duration: 3000 });
      }
    } catch (error) {
      toast({ title: 'Network error', status: 'error', duration: 3000 });
    }
    setLoading(false);
  };

  // Handle password update
  const handlePasswordUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: 'Password updated', status: 'success', duration: 3000 });
        setOldPassword('');
        setNewPassword('');
      } else {
        toast({ title: 'Update failed', description: data.message, status: 'error', duration: 3000 });
      }
    } catch (error) {
      toast({ title: 'Network error', status: 'error', duration: 3000 });
    }
    setLoading(false);
  };

  // Handle profile picture upload
  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    setProfilePicFile(file);
    if (!file) return;
    const formData = new FormData();
    formData.append('profilePic', file);
    setLoading(true);
    try {
      // You need a backend endpoint to handle file upload, here we assume /api/upload/profile-pic returns the URL
      const uploadRes = await fetch('/api/upload/profile-pic', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (uploadRes.ok && uploadData.url) {
        // Save URL to user profile
        const response = await fetch('/api/users/profile-pic', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ profilePic: uploadData.url }),
        });
        const data = await response.json();
        if (response.ok) {
          setProfilePic(uploadData.url);
          updateUser({ profilePic: uploadData.url });
          toast({ title: 'Profile picture updated', status: 'success', duration: 3000 });
        } else {
          toast({ title: 'Update failed', description: data.message, status: 'error', duration: 3000 });
        }
      } else {
        toast({ title: 'Upload failed', description: uploadData.message, status: 'error', duration: 3000 });
      }
    } catch (error) {
      toast({ title: 'Network error', status: 'error', duration: 3000 });
    }
    setLoading(false);
  };

  return (
    <Container maxW="md" py={20}>
      <VStack spacing={8} textAlign="center">
        <Heading size="lg" color="primary.500">Your Profile</Heading>
        <Box
          bg="white"
          boxShadow="lg"
          borderRadius="xl"
          p={8}
          w="100%"
        >
          <VStack spacing={6}>
            <Avatar size="2xl" name={user.name} src={profilePic} mb={2} />
            <FormControl>
              <FormLabel>Update Profile Picture</FormLabel>
              <Input type="file" accept="image/*" onChange={handleProfilePicUpload} isDisabled={loading} />
            </FormControl>
            <Divider />
            <HStack spacing={4} w="100%" justify="center">
              <Icon as={FiUser} color="primary.500" boxSize={6} />
              <Text fontWeight="bold" fontSize="lg">{user.name}</Text>
            </HStack>
            <HStack spacing={4} w="100%" justify="center">
              <Icon as={FiMail} color="primary.500" boxSize={6} />
              <Text fontSize="md">{user.email}</Text>
            </HStack>
            <HStack spacing={4} w="100%" justify="center">
              <Icon as={FiShield} color="primary.500" boxSize={6} />
              <Text fontSize="md">Role: <Badge colorScheme="primary">{user.role}</Badge></Text>
            </HStack>
            <HStack spacing={4} w="100%" justify="center">
              {user.profileComplete ? (
                <Icon as={FiCheckCircle} color="green.400" boxSize={6} />
              ) : (
                <Icon as={FiXCircle} color="red.400" boxSize={6} />
              )}
              <Text fontSize="md">
                Profile Complete: {user.profileComplete ? 'Yes' : 'No'}
              </Text>
            </HStack>
            <Divider />
            <FormControl>
              <FormLabel><Icon as={FiPhone} mr={2} />Phone</FormLabel>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" isDisabled={loading} />
            </FormControl>
            <FormControl>
              <FormLabel>Address</FormLabel>
              <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Address" isDisabled={loading} />
            </FormControl>
            <FormControl>
              <FormLabel>Emergency Contact</FormLabel>
              <Input value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} placeholder="Emergency Contact" isDisabled={loading} />
            </FormControl>
            <Button colorScheme="primary" onClick={handleContactUpdate} isLoading={loading} w="100%">Update Contact Details</Button>
            <Divider />
            <FormControl>
              <FormLabel><Icon as={FiLock} mr={2} />Change Password</FormLabel>
              <Input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Old Password" isDisabled={loading} />
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" mt={2} isDisabled={loading} />
            </FormControl>
            <Button colorScheme="primary" onClick={handlePasswordUpdate} isLoading={loading} w="100%">Update Password</Button>
            <Button variant="link" colorScheme="primary" onClick={onOpen} w="100%" mt={2}>Forgot Password?</Button>

            {/* Modal for OTP-based password reset */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Reset Password via OTP</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <RadioGroup value={otpMethod} onChange={setOtpMethod} mb={4}>
                    <Stack direction="row">
                      <Radio value="email">Email</Radio>
                      <Radio value="phone">Phone</Radio>
                    </Stack>
                  </RadioGroup>
                  <FormControl mb={3}>
                    <FormLabel>{otpMethod === 'email' ? 'Email' : 'Phone'}</FormLabel>
                    <Input value={resetEmailOrPhone} onChange={e => setResetEmailOrPhone(e.target.value)} placeholder={otpMethod === 'email' ? 'Enter your registered email' : 'Enter your registered phone'} isDisabled={otpSent} />
                  </FormControl>
                  {!otpSent ? (
                    <Button colorScheme="primary" onClick={handleSendOtp} isLoading={otpLoading} w="100%">Send OTP</Button>
                  ) : (
                    <>
                      <FormControl mb={3} mt={3}>
                        <FormLabel>Enter OTP</FormLabel>
                        <Input value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter OTP" />
                      </FormControl>
                      <FormControl mb={3}>
                        <FormLabel>New Password</FormLabel>
                        <Input type="password" value={newResetPassword} onChange={e => setNewResetPassword(e.target.value)} placeholder="New Password" />
                      </FormControl>
                      <Button colorScheme="primary" onClick={handleVerifyOtpAndReset} isLoading={otpLoading} w="100%">Reset Password</Button>
                    </>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button onClick={onClose}>Close</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}

export default ProfilePage;
