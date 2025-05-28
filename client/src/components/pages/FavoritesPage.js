import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Card,
  CardBody,
  Text,
  IconButton,
  useToast,
  Spinner,
  Center,
  Flex,
  Badge,
  useColorModeValue,
  Button,
} from "@chakra-ui/react";
import { StarIcon, DeleteIcon, ViewIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getFavorites, removeFromFavorites } from "../../services/favoritesService";
import NavBarView from "../../comp/screen/navbar";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    fetchFavorites();
  }, [user, navigate]);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const response = await getFavorites();
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast({
        title: "Error",
        description: "Failed to load favorites",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      setDeletingId(favoriteId);
      await removeFromFavorites(favoriteId);
      setFavorites(favorites.filter(fav => fav._id !== favoriteId));
      toast({
        title: "Removed from favorites",
        description: "State has been removed from your favorites",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewLocation = (favorite) => {
    navigate(`/location/${favorite.latitude}/${favorite.longitude}`);
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <Box width="100vw" height="100vh" position="fixed" bg={useColorModeValue("gray.50", "gray.900")}>
        <NavBarView />
        <Center h="calc(100vh - 64px)">
          <Spinner size="xl" />
        </Center>
      </Box>
    );
  }

  return (
    <Box width="100vw" height="100vh" position="fixed" bg={useColorModeValue("gray.50", "gray.900")}>
      <NavBarView />
      <Box h="calc(100vh - 64px)" overflowY="auto">
        <Container maxW="container.xl" py={8}>
          <Flex align="center" mb={6}>
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="ghost"
              onClick={handleBackToHome}
              mr={4}
            >
              Back to Home
            </Button>
            <Heading size="lg">My Favorite States</Heading>
            <Badge ml={3} colorScheme="blue" fontSize="md">
              {favorites.length}
            </Badge>
          </Flex>

          {favorites.length === 0 ? (
            <Center>
              <VStack spacing={4} textAlign="center">
                <StarIcon boxSize={12} color="gray.400" />
                <Heading size="md" color="gray.500">
                  No favorite states yet
                </Heading>
                <Text color="gray.500">
                  Start exploring states and add them to your favorites!
                </Text>
                <Button colorScheme="blue" onClick={handleBackToHome}>
                  Explore States
                </Button>
              </VStack>
            </Center>
          ) : (
            <VStack spacing={4} align="stretch">
              {favorites.map((favorite) => (
                <Card
                  key={favorite._id}
                  bg={bgColor}
                  borderColor={borderColor}
                  borderWidth="1px"
                  _hover={{ boxShadow: "md" }}
                  transition="all 0.2s"
                >
                  <CardBody>
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={2} flex={1}>
                        <Heading size="md">
                          {favorite.state || favorite.city || favorite.country || "Unknown Location"}
                        </Heading>
                        {favorite.displayName && (
                          <Text color={useColorModeValue("gray.600", "gray.400")} fontSize="sm">
                            {favorite.displayName}
                          </Text>
                        )}
                        <HStack spacing={4}>
                          {favorite.state && (
                            <Text fontSize="xs" color="gray.500">
                              State: {favorite.state}
                            </Text>
                          )}
                          {favorite.country && (
                            <Text fontSize="xs" color="gray.500">
                              Country: {favorite.country}
                            </Text>
                          )}
                          <Text fontSize="xs" color="gray.500">
                            Added: {new Date(favorite.addedAt).toLocaleDateString()}
                          </Text>
                        </HStack>
                      </VStack>
                      <HStack spacing={2}>
                        <IconButton
                          icon={<ViewIcon />}
                          colorScheme="blue"
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewLocation(favorite)}
                          aria-label="View location"
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          variant="outline"
                          size="sm"
                          isLoading={deletingId === favorite._id}
                          onClick={() => handleRemoveFavorite(favorite._id)}
                          aria-label="Remove from favorites"
                        />
                      </HStack>
                    </Flex>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default FavoritesPage; 