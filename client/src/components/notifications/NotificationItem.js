import React from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  useColorMode,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { DeleteIcon, CheckIcon } from '@chakra-ui/icons';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationItem = ({ notification }) => {
  const { markAsRead, deleteNotification } = useNotifications();
  const { colorMode } = useColorMode();

  const handleMarkAsRead = async (e) => {
    e.stopPropagation();
    if (!notification.read) {
      await markAsRead(notification._id || notification.id);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    await deleteNotification(notification._id || notification.id);
  };

  const formatTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };

  return (
    <Box
      p={3}
      borderBottom="1px"
      borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
      bg={
        notification.read
          ? 'transparent'
          : colorMode === 'dark'
          ? 'blue.900'
          : 'blue.50'
      }
      _hover={{
        bg: colorMode === 'dark' ? 'gray.700' : 'gray.50',
      }}
      cursor="pointer"
      position="relative"
    >
      <Flex justify="space-between" align="flex-start">
        <Box flex="1" mr={2}>
          <Flex align="center" mb={1}>
            <Text fontWeight="semibold" fontSize="sm" mr={2}>
              {notification.title}
            </Text>
            {!notification.read && (
              <Badge colorScheme="blue" size="sm">
                New
              </Badge>
            )}
          </Flex>
          <Text fontSize="sm" color="gray.600" mb={2}>
            {notification.message}
          </Text>
          {notification.location && (
            <Text fontSize="xs" color="gray.500" mb={1}>
              📍 {notification.location.stateName}
            </Text>
          )}
          <Text fontSize="xs" color="gray.500">
            {formatTime(notification.createdAt)}
          </Text>
        </Box>
        <Flex direction="column" gap={1}>
          {!notification.read && (
            <Tooltip label="Mark as read">
              <IconButton
                aria-label="Mark as read"
                icon={<CheckIcon />}
                size="xs"
                variant="ghost"
                colorScheme="green"
                onClick={handleMarkAsRead}
              />
            </Tooltip>
          )}
          <Tooltip label="Delete">
            <IconButton
              aria-label="Delete notification"
              icon={<DeleteIcon />}
              size="xs"
              variant="ghost"
              colorScheme="red"
              onClick={handleDelete}
            />
          </Tooltip>
        </Flex>
      </Flex>
    </Box>
  );
};

export default NotificationItem; 