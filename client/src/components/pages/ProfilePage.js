import React, { useState, useEffect } from "react";
import {
	Box,
	Flex,
	Text,
	VStack,
	HStack,
	Card,
	CardHeader,
	CardBody,
	IconButton,
	Avatar,
	Heading,
	Button,
	useToast,
	Image,
	Badge,
	Spinner,
	Center,
	Icon,
} from "@chakra-ui/react";
import {
	EditIcon,
	DeleteIcon,
	ArrowBackIcon,
} from "@chakra-ui/icons";
import { FaGlobeAfrica, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { logout } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import EditPostModal from "../../comp/screen/post/EditPostModal";

const ProfilePage = () => {
	const [userPosts, setUserPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [editingPost, setEditingPost] = useState(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [imageErrors, setImageErrors] = useState({}); // Track image loading errors
	const toast = useToast();
	const navigate = useNavigate();

	const { user, logout: authLogout } = useAuth() || { user: null, logout: () => {} };

	// Debug state changes
	useEffect(() => {
		console.log("Modal state changed:", {
			isEditModalOpen,
			editingPost: editingPost ? editingPost._id : null
		});
	}, [isEditModalOpen, editingPost]);

	// Fetch user posts on component mount
	useEffect(() => {
		fetchUserPosts();
	}, []);

	const fetchUserPosts = async () => {
		try {
			setIsLoading(true);
			const token = localStorage.getItem("token");
			
			if (!token) {
				throw new Error("Authentication token not found");
			}

			const response = await fetch("http://localhost:5000/api/posts/user", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch posts");
			}

			const data = await response.json();
			console.log("Fetched posts:", data.posts);
			setUserPosts(data.posts || []);
		} catch (error) {
			console.error("Error fetching user posts:", error);
			toast({
				title: "Error",
				description: "Failed to load your posts",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogout = async () => {
		try {
			await logout();
			authLogout();
			navigate("/");
			toast({
				title: "Logged out successfully",
				status: "success",
				duration: 3000,
				isClosable: true,
			});
		} catch (error) {
			console.error("Logout failed:", error);
			toast({
				title: "Logout failed",
				description: error.message,
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		}
	};

	const handleBackToHome = () => {
		navigate("/");
	};

	const handleEditPost = (post) => {
		console.log("🔧 Edit button clicked!");
		console.log("📝 Post data:", post);
		console.log("🆔 Post ID:", post._id || post.id);
		
		// Validation
		if (!post) {
			console.error("❌ No post data provided");
			toast({
				title: "Error",
				description: "No post data found",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		// Set the editing post
		console.log("🎯 Setting editing post...");
		setEditingPost(post);
		
		// Open the modal
		console.log("🚪 Opening modal...");
		setIsEditModalOpen(true);
		
		console.log("✅ Edit post handler completed");
	};

	const handleCloseEditModal = () => {
		console.log("🚪 Closing edit modal...");
		setIsEditModalOpen(false);
		setEditingPost(null);
		console.log("✅ Modal closed");
	};

	const handlePostUpdated = () => {
		console.log("🔄 Post updated, refreshing list...");
		// Refresh the posts list after successful update
		fetchUserPosts();
	};

	const handleDeletePost = async (postId) => {
		if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
			return;
		}

		try {
			const token = localStorage.getItem("token");
			
			const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error("Failed to delete post");
			}

			// Remove post from local state
			setUserPosts(prev => prev.filter(post => post._id !== postId));
			
			toast({
				title: "Post deleted",
				description: "Your post has been deleted successfully",
				status: "success",
				duration: 3000,
				isClosable: true,
			});
		} catch (error) {
			console.error("Error deleting post:", error);
			toast({
				title: "Error",
				description: "Failed to delete post",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		}
	};

	// Helper function to construct proper image URL
	const getImageUrl = (imagePath) => {
		if (!imagePath) return null;
		
		// If it's already a full URL (like Cloudinary), return as is
		if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
			return imagePath;
		}
		
		// If it starts with /, it's a local server path
		if (imagePath.startsWith('/')) {
			return `http://localhost:5000${imagePath}`;
		}
		
		// Otherwise, assume it needs the uploads prefix
		return `http://localhost:5000/uploads/${imagePath}`;
	};

	// Handle image loading errors
	const handleImageError = (imageUrl, postId, imageIndex) => {
		console.error(`Failed to load image: ${imageUrl}`);
		setImageErrors(prev => ({
			...prev,
			[`${postId}-${imageIndex}`]: true
		}));
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const renderNavBar = () => {
		return (
			<Flex
				flexDirection={"row"}
				justifyContent={"space-between"}
				alignItems={"center"}
				boxShadow="md"
				p={"10px"}
				zIndex={10}
				bg="white"
				_dark={{ bg: "gray.800" }}
			>
				<Flex
					flexDirection={"row"}
					justifyContent="flex-start"
					alignItems="center"
					paddingY={1}
				>
					<IconButton
						aria-label="Back to home"
						icon={<ArrowBackIcon />}
						variant="ghost"
						mr={2}
						onClick={handleBackToHome}
					/>
					<Icon
						alignSelf={"center"}
						as={FaGlobeAfrica}
						boxSize={"25px"}
						mr={2}
					/>
					<Heading size={"md"}>Profile</Heading>
				</Flex>
				<Button
					variant="ghost"
					onClick={handleLogout}
					colorScheme="red"
				>
					Logout
				</Button>
			</Flex>
		);
	};

	if (isLoading) {
		return (
			<Box minH="100vh">
				{renderNavBar()}
				<Center h="50vh">
					<Spinner size="xl" />
				</Center>
			</Box>
		);
	}

	return (
		<Box minH="100vh" bg="gray.50" _dark={{ bg: "gray.900" }}>
			{renderNavBar()}
			
			<Box p={6} maxW="800px" mx="auto">
				<VStack spacing={6} align="stretch">
					{/* Profile Header */}
					<Card>
						<CardHeader>
							<HStack spacing={4}>
								<Avatar 
									size="xl" 
									name={user?.name || user?.email} 
									bg="blue.500"
								/>
								<VStack align="start" spacing={1}>
									<Text fontSize="2xl" fontWeight="bold">
										{user?.name || user?.email || "User"}
									</Text>
									<HStack>
										<Icon as={FaCalendarAlt} color="gray.500" />
										<Text color="gray.500">
											Member since {new Date().getFullYear()}
										</Text>
									</HStack>
									<Badge colorScheme="blue" variant="subtle">
										{userPosts.length} {userPosts.length === 1 ? 'post' : 'posts'} created
									</Badge>
								</VStack>
							</HStack>
						</CardHeader>
					</Card>

					{/* Posts Section */}
					<Box>
						<Heading size="lg" mb={4}>My Posts</Heading>
						{userPosts.length === 0 ? (
							<Card>
								<CardBody>
									<Center py={8}>
										<VStack spacing={3}>
											<Text color="gray.500" fontSize="lg">
												You haven't created any posts yet
											</Text>
											<Text color="gray.400" fontSize="sm">
												Start sharing your experiences with the world!
											</Text>
											<Button 
												colorScheme="blue" 
												onClick={handleBackToHome}
												mt={2}
											>
												Create Your First Post
											</Button>
										</VStack>
									</Center>
								</CardBody>
							</Card>
						) : (
							<VStack spacing={4} align="stretch">
								{userPosts.map((post) => (
									<Card key={post._id || post.id}>
										<CardHeader>
											<HStack justify="space-between" align="start">
												<VStack align="start" spacing={2} flex={1}>
													<Text fontSize="lg" fontWeight="semibold">
														{post.title}
													</Text>
													<HStack spacing={4} fontSize="sm" color="gray.500">
														{post.stateName && (
															<HStack spacing={1}>
																<Icon as={FaMapMarkerAlt} />
																<Text>{post.stateName}</Text>
															</HStack>
														)}
														<HStack spacing={1}>
															<Icon as={FaCalendarAlt} />
															<Text>{formatDate(post.createdAt)}</Text>
														</HStack>
													</HStack>
												</VStack>
												<HStack spacing={2}>
													<IconButton
														aria-label="Edit post"
														icon={<EditIcon />}
														size="sm"
														variant="ghost"
														onClick={(e) => {
															console.log("🖱️ IconButton clicked");
															console.log("📦 Event:", e);
															console.log("📝 Post object:", post);
															e.preventDefault();
															e.stopPropagation();
															handleEditPost(post);
														}}
														cursor="pointer"
														_hover={{ bg: "gray.100" }}
													/>
													<IconButton
														aria-label="Delete post"
														icon={<DeleteIcon />}
														size="sm"
														variant="ghost"
														colorScheme="red"
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															handleDeletePost(post._id || post.id);
														}}
														cursor="pointer"
														_hover={{ bg: "red.100" }}
													/>
												</HStack>
											</HStack>
										</CardHeader>
										<CardBody pt={0}>
											<Text mb={4}>{post.description}</Text>
											{post.images && post.images.length > 0 && (
												<HStack spacing={2} overflowX="auto">
													{post.images.map((image, index) => {
														const imageUrl = getImageUrl(image);
														const errorKey = `${post._id || post.id}-${index}`;
														const hasError = imageErrors[errorKey];

														if (!imageUrl || hasError) {
															return (
																<Box
																	key={index}
																	minW="200px"
																	h="200px"
																	bg="gray.100"
																	borderRadius="md"
																	display="flex"
																	alignItems="center"
																	justifyContent="center"
																	border="1px solid"
																	borderColor="gray.200"
																>
																	<Text color="gray.500" fontSize="sm">
																		{hasError ? "Failed to load" : "No image"}
																	</Text>
																</Box>
															);
														}

														return (
															<Image
																key={index}
																src={imageUrl}
																alt={`Post image ${index + 1}`}
																maxH="200px"
																minW="200px"
																borderRadius="md"
																objectFit="cover"
																onError={() => handleImageError(imageUrl, post._id || post.id, index)}
																fallback={
																	<Box
																		minW="200px"
																		h="200px"
																		bg="gray.100"
																		borderRadius="md"
																		display="flex"
																		alignItems="center"
																		justifyContent="center"
																	>
																		<Spinner size="md" />
																	</Box>
																}
															/>
														);
													})}
												</HStack>
											)}
										</CardBody>
									</Card>
								))}
							</VStack>
						)}
					</Box>
				</VStack>
			</Box>

			{/* Edit Post Modal */}
			{console.log("🎭 Rendering EditPostModal with:", { 
				isOpen: isEditModalOpen, 
				hasPost: !!editingPost,
				postId: editingPost?._id || editingPost?.id 
			})}
			<EditPostModal
				isOpen={isEditModalOpen}
				onClose={handleCloseEditModal}
				post={editingPost}
				onPostUpdated={handlePostUpdated}
			/>
		</Box>
	);
};

export default ProfilePage;