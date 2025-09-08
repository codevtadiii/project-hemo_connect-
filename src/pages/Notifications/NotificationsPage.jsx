import {
  Container,
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  Badge,
  HStack,
  Icon,
  Button,
  Box,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiBell, FiTrash2, FiCheck } from 'react-icons/fi';
import { useSocket } from '../../context/SocketContext';

function NotificationsPage() {
  const { notifications, setNotifications } = useSocket();

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'blood_request':
        return FiBell;
      default:
        return FiBell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'blood_request':
        return 'red';
      case 'donor_response':
        return 'blue';
      case 'request_fulfilled':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between" align="start">
          <Box>
            <Heading size="lg" mb={2}>Notifications</Heading>
            <Text color="gray.600">
              Stay updated with blood requests and responses
            </Text>
          </Box>
          {notifications.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={clearAll}
              leftIcon={<Icon as={FiTrash2} />}
            >
              Clear All
            </Button>
          )}
        </HStack>

        {notifications.length > 0 ? (
          <VStack spacing={4}>
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                w="full"
                variant={notification.read ? "outline" : "elevated"}
                bg={notification.read ? "gray.50" : "white"}
              >
                <CardBody>
                  <HStack justify="space-between" align="start">
                    <HStack spacing={4} flex={1}>
                      <Icon
                        as={getNotificationIcon(notification.type)}
                        color={`${getNotificationColor(notification.type)}.500`}
                        w={6}
                        h={6}
                      />
                      <Box flex={1}>
                        <HStack spacing={2} mb={2}>
                          <Text fontWeight="medium">
                            {notification.title}
                          </Text>
                          {!notification.read && (
                            <Badge colorScheme="blue" size="sm">New</Badge>
                          )}
                          <Badge 
                            colorScheme={getNotificationColor(notification.type)}
                            size="sm"
                          >
                            {notification.type.replace('_', ' ')}
                          </Badge>
                        </HStack>
                        <Text color="gray.600" mb={2}>
                          {notification.message}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {new Date(notification.timestamp).toLocaleString()}
                        </Text>
                      </Box>
                    </HStack>
                    
                    <VStack spacing={2}>
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                          leftIcon={<Icon as={FiCheck} />}
                        >
                          Mark Read
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Icon as={FiTrash2} />
                      </Button>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        ) : (
          <Alert status="info">
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">No notifications</Text>
              <Text fontSize="sm">
                You're all caught up! New notifications will appear here.
              </Text>
            </Box>
          </Alert>
        )}
      </VStack>
    </Container>
  );
}

export default NotificationsPage;