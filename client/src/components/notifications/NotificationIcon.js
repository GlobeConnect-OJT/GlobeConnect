import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverCloseButton,
  VStack,
  Text,
  Button,
  Box,
  Flex,
  Spinner,
  useColorMode,
} from '@chakra-ui/react';
import { BellIcon } from '@chakra-ui/icons';
import { useNotifications } from '../../context/NotificationContext';
import NotificationItem from './NotificationItem';

const NotificationIcon = () => {
  const { notifications, unreadCount, loading, markAllAsRead } = useNotifications();
  const { colorMode } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} placement="bottom-end">
      <PopoverTrigger>
        <Box position="relative" display="inline-block">
          <IconButton
            aria-label="Notifications"
            icon={<BellIcon />}
            variant="ghost"
            onClick={() => setIsOpen(!isOpen)}
            size="md"
          />
          {unreadCount > 0 && (
            <Badge
              colorScheme="red"
              variant="solid"
              borderRadius="full"
              position="absolute"
              top="-1"
              right="-1"
              fontSize="xs"
              minW="20px"
              h="20px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent
        w="400px"
        maxH="500px"
        bg={colorMode === 'dark' ? 'gray.800' : 'white'}
        borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
      >
        <PopoverCloseButton />
        <PopoverHeader fontWeight="bold" fontSize="lg">
          <Flex justify="space-between" align="center">
            <Text>Notifications</Text>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                colorScheme="blue"
                onClick={handleMarkAllAsRead}
              >
                Mark all read
              </Button>
            )}
          </Flex>
        </PopoverHeader>
        <PopoverBody p={0}>
          {loading ? (
            <Flex justify="center" align="center" h="100px">
              <Spinner />
            </Flex>
          ) : notifications.length === 0 ? (
            <Flex justify="center" align="center" h="100px">
              <Text color="gray.500">No notifications yet</Text>
            </Flex>
          ) : (
            <VStack spacing={0} align="stretch" maxH="400px" overflowY="auto">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification._id || notification.id}
                  notification={notification}
                />
              ))}
            </VStack>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationIcon;
