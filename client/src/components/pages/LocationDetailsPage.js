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
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import NavBarView from "../../comp/screen/navbar";
import { getLocationFromCoordinates } from "../../comp/utils/geocoding";

const LocationDetailsPage = ({ setIsMasterAppLoading }) => {
  const { lat, lng } = useParams();
  const [locationInfo, setLocationInfo] = useState(null);
  const [posts, setPosts] = useState([]);

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
      width="100%"
      minHeight="100vh"
      position="relative"
      overflowY="auto"
      bg={useColorModeValue("gray.50", "gray.900")}
    >
      <NavBarView />
      <Box py={8}>
        <Container maxW="container.xl">
          {/* Location Info Card */}
          <Flex
            direction="column"
            align="center"
            mb={8}
            p={6}
            bg={bgColor}
            borderRadius="lg"
            boxShadow="sm"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Heading size="lg" mb={3}>
              {locationInfo?.city ||
                locationInfo?.state ||
                locationInfo?.country ||
                "Location"}
            </Heading>
            <Text
              fontSize="md"
              color={useColorModeValue("gray.600", "gray.400")}
              textAlign="center"
            >
              {locationInfo?.displayName}
            </Text>
            <Flex mt={4} gap={2}>
              <Badge colorScheme="blue">Lat: {lat}</Badge>
              <Badge colorScheme="green">Lng: {lng}</Badge>
            </Flex>
          </Flex>

          {/* Tabs Container */}
          <Box
            bg={bgColor}
            borderRadius="lg"
            boxShadow="sm"
            borderWidth="1px"
            borderColor={borderColor}
            mb={8} // Add bottom margin
          >
            <Tabs isFitted variant="enclosed">
              <TabList>
                <Tab
                  _selected={{
                    bg: activeTabBg,
                    borderBottom: "2px solid",
                    borderColor: "blue.500",
                    mb: "-1px",
                  }}
                  fontWeight="medium"
                >
                  Posts
                </Tab>
                <Tab
                  _selected={{
                    bg: activeTabBg,
                    borderBottom: "2px solid",
                    borderColor: "blue.500",
                    mb: "-1px",
                  }}
                  fontWeight="medium"
                >
                  History
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Box p={6}>
                    <Heading size="md" mb={4}>
                      Recent Posts ({posts.length})
                    </Heading>
                    {posts.length > 0 ? (
                      <VStack spacing={4} align="stretch">
                        {posts.map((post) => (
                          <PostCard key={post._id} post={post} />
                        ))}
                      </VStack>
                    ) : (
                      <Text color={useColorModeValue("gray.600", "gray.400")}>
                        No posts found for this location.
                      </Text>
                    )}
                  </Box>
                </TabPanel>
                <TabPanel>
                  <Box p={6}>
                    <Heading size="md" mb={4}>
                      Location History
                    </Heading>
                    {/* Example history item */}
                    <Box
                      p={4}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor={borderColor}
                      _hover={{ boxShadow: "sm" }}
                      transition="all 0.2s"
                      mb={4}
                    >
                      <Flex justify="space-between" align="center">
                        <Text fontSize="lg" fontWeight="medium">
                          Historical Event
                        </Text>
                        <Badge>2023</Badge>
                      </Flex>
                      <Text
                        mt={2}
                        color={useColorModeValue("gray.600", "gray.400")}
                      >
                        This is an example historical event. Add your actual
                        history data here.
                      </Text>
                    </Box>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

const mapDispatchToProps = (dispatch) => ({
  setIsMasterAppLoading: (loading) =>
    dispatch(Actions.setIsMasterAppLoading(loading)),
});

export default connect(null, mapDispatchToProps)(LocationDetailsPage);
