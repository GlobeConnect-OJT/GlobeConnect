import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Actions from "../../comp/redux/action";
import {
  Box,
  Container,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Flex,
  Text,
  Spinner,
  Badge,
  useColorModeValue,
  VStack,
  Image,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  IconButton,
  useToast,
  Tooltip,
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";
import { useParams } from "react-router-dom";
import NavBarView from "../../comp/screen/navbar";
import { getLocationFromCoordinates } from "../../comp/utils/geocoding";
import { useLocationHistory } from "../../hooks/useLocationHistory";
import { useAuth } from "../../context/AuthContext";
import {
  addToFavorites,
  removeFromFavorites,
  checkFavoriteByState,
} from "../../services/favoritesService";

const LocationDetailsPage = ({ setIsMasterAppLoading }) => {
  const { lat, lng } = useParams();
  const [locationInfo, setLocationInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  
  const { user } = useAuth();
  const toast = useToast();

  // Fetch location info
  useEffect(() => {
    const fetchLocationInfo = async () => {
      try {
        const data = await getLocationFromCoordinates({
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
        });
        setLocationInfo(data);
        if (data.state) {
          await fetchPosts(data.state.toLowerCase());
        }
        // Set loading to false after everything is loaded
        setIsMasterAppLoading(false);
      } catch (error) {
        console.error("Error fetching location:", error);
        setIsMasterAppLoading(false);
      }
    };

    fetchLocationInfo();
  }, [lat, lng, setIsMasterAppLoading]);

  // Check if state is in favorites when user is logged in and location info is available
  useEffect(() => {
    const checkIfFavorite = async () => {
      if (user && locationInfo && locationInfo.state) {
        try {
          setIsLoadingFavorite(true);
          const response = await checkFavoriteByState(locationInfo.state);
          setIsFavorite(response.data.isFavorite);
          if (response.data.favorite) {
            setFavoriteId(response.data.favorite._id);
          }
        } catch (error) {
          console.error("Error checking favorite status:", error);
        } finally {
          setIsLoadingFavorite(false);
        }
      }
    };

    checkIfFavorite();
  }, [user, locationInfo]);

  // Function to fetch posts
  const fetchPosts = async (stateName) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/state/${encodeURIComponent(stateName)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success" && Array.isArray(data.data.posts)) {
        // Ensure we're setting the entire posts array
        setPosts(data.data.posts);
        // Set loading to false after posts are loaded
        setIsMasterAppLoading(false);
      } else {
        setPosts([]);
        console.error("API returned unexpected data structure:", data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    }
  };

  // Handle adding/removing from favorites
  const handleFavoriteToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add locations to favorites",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!locationInfo || !locationInfo.state) {
      toast({
        title: "Error",
        description: "State information not available for this location",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoadingFavorite(true);

      if (isFavorite && favoriteId) {
        // Remove from favorites
        await removeFromFavorites(favoriteId);
        setIsFavorite(false);
        setFavoriteId(null);
        toast({
          title: "Removed from favorites",
          description: `${locationInfo.state} has been removed from your favorite states`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Add to favorites
        const favoriteData = {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          city: locationInfo.city,
          state: locationInfo.state,
          country: locationInfo.country,
          displayName: locationInfo.displayName,
        };

        const response = await addToFavorites(favoriteData);
        setIsFavorite(true);
        setFavoriteId(response.data.favorite._id);
        toast({
          title: "Added to favorites",
          description: `${locationInfo.state} has been added to your favorite states`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update favorites",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const {
    history,
    isLoading: isHistoryLoading,
    error: historyError,
  } = useLocationHistory(
    locationInfo?.city || locationInfo?.state || locationInfo?.country
  );

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const tabBg = useColorModeValue("gray.100", "gray.700");
  const activeTabBg = useColorModeValue("white", "gray.800");

  // Post card component
  const PostCard = ({ post }) => (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="md"
      borderColor={borderColor}
      _hover={{ boxShadow: "sm" }}
      transition="all 0.2s"
      mb={4}
    >
      <Text fontSize="lg" fontWeight="medium" mb={2}>
        {post.title}
      </Text>
      <Text color={useColorModeValue("gray.600", "gray.400")} mb={3}>
        {post.description}
      </Text>
      {post.images && post.images.length > 0 && (
        <Image
          src={post.images[0]}
          alt={post.title}
          borderRadius="md"
          maxH="200px"
          objectFit="cover"
        />
      )}
      <Flex mt={2} justify="space-between" align="center">
        <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")}>
          By {post.author?.username || "Unknown"}
        </Text>
        <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")}>
          {new Date(post.createdAt).toLocaleDateString()}
        </Text>
      </Flex>
    </Box>
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      position="fixed"
      bg={useColorModeValue("gray.50", "gray.900")}
    >
      <NavBarView />
      <Flex direction="column" h="calc(100vh - 64px)">
        <Box
          py={6}
          px={4}
          bg={bgColor}
          borderBottomWidth="1px"
          borderColor={borderColor}
        >
          <Container maxW="container.xl">
            <Flex direction="column" align="center">
              <Flex align="center" gap={4} mb={2}>
                <Heading size="lg">
                  {locationInfo?.city ||
                    locationInfo?.state ||
                    locationInfo?.country ||
                    "Location"}
                </Heading>
                {user && (
                  <Tooltip
                    label={
                      isFavorite ? "Remove from favorites" : "Add to favorites"
                    }
                  >
                    <IconButton
                      icon={<StarIcon />}
                      colorScheme={isFavorite ? "yellow" : "gray"}
                      variant={isFavorite ? "solid" : "outline"}
                      size="md"
                      isLoading={isLoadingFavorite}
                      onClick={handleFavoriteToggle}
                      aria-label={
                        isFavorite ? "Remove from favorites" : "Add to favorites"
                      }
                    />
                  </Tooltip>
                )}
              </Flex>
              <Text
                fontSize="md"
                color={useColorModeValue("gray.600", "gray.400")}
                textAlign="center"
              >
                {locationInfo?.displayName}
              </Text>
            </Flex>
          </Container>
        </Box>

        <Box flex="1" position="relative" overflow="hidden">
          <Container maxW="container.xl" h="100%" py={4}>
            <Tabs
              isFitted
              variant="enclosed"
              display="flex"
              flexDirection="column"
              h="100%"
            >
              <TabList>
                <Tab
                  _selected={{
                    bg: activeTabBg,
                    borderBottom: "2px solid",
                    borderColor: "blue.500",
                  }}
                >
                  Posts
                </Tab>
                <Tab
                  _selected={{
                    bg: activeTabBg,
                    borderBottom: "2px solid",
                    borderColor: "blue.500",
                  }}
                >
                  History
                </Tab>
              </TabList>

              <TabPanels flex="1" overflow="hidden">
                <TabPanel h="100%" p={0}>
                  <Box
                    h="100%"
                    overflowY="auto"
                    pt={4}
                    sx={{
                      "&::-webkit-scrollbar": { width: "4px" },
                      "&::-webkit-scrollbar-track": { width: "6px" },
                      "&::-webkit-scrollbar-thumb": {
                        background: useColorModeValue("gray.300", "gray.600"),
                        borderRadius: "24px",
                      },
                    }}
                  >
                    <VStack spacing={4} align="stretch" pb={4}>
                      {posts.length > 0 ? (
                        posts.map((post) => <PostCard key={post._id} post={post} />)
                      ) : (
                        <Flex
                          direction="column"
                          align="center"
                          justify="center"
                          py={10}
                          bg={bgColor}
                          borderRadius="lg"
                          borderWidth="1px"
                          borderColor={borderColor}
                        >
                          <Text color={useColorModeValue("gray.600", "gray.400")}>
                            No posts found for this location.
                          </Text>
                        </Flex>
                      )}
                    </VStack>
                  </Box>
                </TabPanel>

                <TabPanel h="100%" p={0}>
                  <Box
                    h="100%"
                    overflowY="auto"
                    pt={4}
                    sx={{
                      "&::-webkit-scrollbar": { width: "4px" },
                      "&::-webkit-scrollbar-track": { width: "6px" },
                      "&::-webkit-scrollbar-thumb": {
                        background: useColorModeValue("gray.300", "gray.600"),
                        borderRadius: "24px",
                      },
                    }}
                  >
                    <VStack spacing={4} align="stretch" pb={4}>
                      {isHistoryLoading ? (
                        <Flex justify="center" p={8}>
                          <Spinner size="xl" />
                        </Flex>
                      ) : historyError ? (
                        <Alert status="error">
                          <AlertIcon />
                          <AlertTitle>Error loading history</AlertTitle>
                          <AlertDescription>{historyError}</AlertDescription>
                        </Alert>
                      ) : history ? (
                        <Box
                          bg={bgColor}
                          p={6}
                          borderRadius="lg"
                          borderWidth="1px"
                          borderColor={borderColor}
                          shadow="sm"
                        >
                          {history.thumbnail && (
                            <Image
                              src={history.thumbnail}
                              alt={history.title}
                              maxH="200px"
                              objectFit="cover"
                              borderRadius="md"
                            />
                          )}
                          <Heading size="md" mt={4}>
                            {history.title}
                          </Heading>
                          <Text
                            color={useColorModeValue("gray.600", "gray.300")}
                            mt={2}
                          >
                            {history.extract}
                          </Text>
                        </Box>
                      ) : (
                        <Text color="gray.500" textAlign="center">
                          No historical information available
                        </Text>
                      )}
                    </VStack>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Container>
        </Box>
      </Flex>
    </Box>
  );
};

const mapDispatchToProps = (dispatch) => ({
  setIsMasterAppLoading: (loading) =>
    dispatch(Actions.setIsMasterAppLoading(loading)),
});

export default connect(null, mapDispatchToProps)(LocationDetailsPage);
