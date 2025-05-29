import React, { useState } from "react";
import {
  Box,
  Image,
  Text,
  Heading,
  Stack,
  HStack,
  VStack,
  Avatar,
  IconButton,
  useColorModeValue,
  Flex,
  Spacer,
  Badge,
  useDisclosure,
} from "@chakra-ui/react";
import { FaComment, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import LikeButton from "../likes/LikeButton";
import CommentSection from "../comments/CommentSection";
import { joinPostRoom, leavePostRoom } from "../../utils/socket";

const PostCard = ({ post, columnWidth = "300px" }) => {
  const { isOpen, onToggle } = useDisclosure();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");

  // Join post room when comments are opened
  const handleToggleComments = () => {
    if (!isOpen) {
      joinPostRoom(post._id);
    } else {
      leavePostRoom(post._id);
    }
    onToggle();
  };

  return (
    <Box
      w={columnWidth}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={bgColor}
      borderColor={borderColor}
      boxShadow="sm"
      transition="all 0.3s"
      _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
      mb={4}
    >
      {/* Post Image */}
      {post.images && post.images.length > 0 && (
        <Box position="relative" h="200px">
          <Image
            src={post.images[0]}
            alt={post.title}
            objectFit="cover"
            w="100%"
            h="100%"
            fallbackSrc="https://via.placeholder.com/300x200?text=No+Image"
          />
        </Box>
      )}

      {/* Post Content */}
      <Box p={4}>
        <Stack spacing={2}>
          {/* Title and Location */}
          <Heading as="h3" size="md" noOfLines={2}>
            {post.title}
          </Heading>

          {/* Location Badge */}
          {post.stateName && (
            <HStack spacing={1}>
              <FaMapMarkerAlt size="0.8em" color="gray" />
              <Text fontSize="sm" color="gray.500" noOfLines={1}>
                {post.stateName}
              </Text>
            </HStack>
          )}

          {/* Post Description */}
          <Text fontSize="sm" color={textColor} noOfLines={3}>
            {post.description}
          </Text>

          {/* Author and Date */}
          <HStack mt={2} spacing={2}>
            <Avatar
              size="xs"
              name={post.author?.username || post.user?.name}
              src={post.author?.avatar || post.user?.avatar}
            />
            <Text fontSize="xs" color="gray.500">
              {post.author?.username || post.user?.name || "Anonymous"}
            </Text>
            <Spacer />
            <HStack spacing={1}>
              <FaCalendarAlt size="0.7em" />
              <Text fontSize="xs" color="gray.500">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </Text>
            </HStack>
          </HStack>

          {/* Like and Comment Actions */}
          <Flex mt={2} align="center" justify="space-between">
            <LikeButton postId={post._id} initialLikes={post.likes} />

            <HStack spacing={1} onClick={handleToggleComments} cursor="pointer">
              <IconButton
                icon={<FaComment />}
                aria-label="Comments"
                variant="ghost"
                size="sm"
              />
              <Text fontSize="sm">{post.comments?.length || 0}</Text>
            </HStack>
          </Flex>
        </Stack>
      </Box>

      {/* Comment Section (Collapsible) */}
      <CommentSection
        postId={post._id}
        initialComments={post.comments}
        initialLikes={post.likes}
        isOpen={isOpen}
        onToggle={handleToggleComments}
      />
    </Box>
  );
};

export default PostCard;
