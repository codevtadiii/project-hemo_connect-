import React, { useState } from 'react';
import { Container, VStack, Heading, Text, FormControl, FormLabel, Input, Button, RadioGroup, Radio, Stack, useToast, Card, CardBody, Link } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

function ForgotPasswordPage() {
  const [method, setMethod] = useState('email');
  const [value, setValue] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const sendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, value }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        toast({ title: 'OTP sent', status: 'success', duration: 3000 });
      } else {
        toast({ title: 'Failed to send OTP', description: data?.message, status: 'error', duration: 4000 });
      }
    } catch (e) {
      toast({ title: 'Network error', status: 'error', duration: 4000 });
    }
    setLoading(false);
  };

  const resetPassword = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, value, otp, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Password reset successful', status: 'success', duration: 3000 });
        setOtpSent(false);
        setOtp('');
        setNewPassword('');
      } else {
        toast({ title: 'Failed to reset', description: data?.message, status: 'error', duration: 4000 });
      }
    } catch (e) {
      toast({ title: 'Network error', status: 'error', duration: 4000 });
    }
    setLoading(false);
  };

  return (
    <Container maxW="md" py={12}>
      <VStack spacing={8}>
        <VStack spacing={2} textAlign="center">
          <Heading size="lg">Forgot Password</Heading>
          <Text color="gray.600">Reset your password using an OTP</Text>
        </VStack>
        <Card w="full">
          <CardBody p={8}>
            <VStack spacing={5} align="stretch">
              <RadioGroup value={method} onChange={setMethod}>
                <Stack direction="row">
                  <Radio value="email">Email</Radio>
                  <Radio value="phone">Phone</Radio>
                </Stack>
              </RadioGroup>
              <FormControl>
                <FormLabel>{method === 'email' ? 'Email' : 'Phone'}</FormLabel>
                <Input placeholder={method === 'email' ? 'Enter your registered email' : 'Enter your registered phone'} value={value} onChange={e => setValue(e.target.value)} isDisabled={otpSent} />
              </FormControl>
              {!otpSent ? (
                <Button colorScheme="primary" onClick={sendOtp} isLoading={loading}>Send OTP</Button>
              ) : (
                <>
                  <FormControl>
                    <FormLabel>OTP</FormLabel>
                    <Input placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>New Password</FormLabel>
                    <Input type="password" placeholder="Enter new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  </FormControl>
                  <Button colorScheme="primary" onClick={resetPassword} isLoading={loading}>Reset Password</Button>
                </>
              )}
              <Text>
                Remembered your password? <Link as={RouterLink} to="/login" color="primary.500">Back to login</Link>
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}

export default ForgotPasswordPage;


