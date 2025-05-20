import React, { useEffect, useState } from 'react';
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
  useColorModeValue
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import NavBarView from '../../comp/screen/navbar';
import { getLocationFromCoordinates } from '../../comp/utils/geocoding';

const LocationDetailsPage = () => {
  const { lat, lng } = useParams();
  const [locationInfo, setLocationInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocationInfo = async () => {
      try {
        const data = await getLocationFromCoordinates({
          latitude: parseFloat(lat),
          longitude: parseFloat(lng)
        });
        setLocationInfo(data);
      } catch (error) {
        console.error('Error fetching location:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocationInfo();
  }, [lat, lng]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tabBg = useColorModeValue('gray.100', 'gray.700');
  const activeTabBg = useColorModeValue('white', 'gray.800');

  return (
    <Box 
      width="100vw"
      height="100vh"
      position="absolute"
      top="0"
      left="0"
      right="0"
      bottom="0"
      overflow="hidden"
      bg={useColorModeValue('gray.50', 'gray.900')}
    >
      <Container maxW="100%" p={0} h="100%">
        <NavBarView />
        <Container maxW="container.xl" py={8}>
          {isLoading ? (
            <Flex justify="center" align="center" minH="300px">
              <Spinner 
                size="xl" 
                thickness="4px"
                speed="0.65s"
                color={useColorModeValue('blue.500', 'blue.200')}
              />
            </Flex>
          ) : (
            <>
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
                  {locationInfo?.city || locationInfo?.state || locationInfo?.country || 'Location'}
                </Heading>
                <Text 
                  fontSize="md" 
                  color={useColorModeValue('gray.600', 'gray.400')}
                  textAlign="center"
                >
                  {locationInfo?.displayName}
                </Text>
                <Flex mt={4} gap={2}>
                  <Badge colorScheme="blue">Lat: {lat}</Badge>
                  <Badge colorScheme="green">Lng: {lng}</Badge>
                </Flex>
              </Flex>

              <Box
                bg={bgColor}
                borderRadius="lg"
                boxShadow="sm"
                borderWidth="1px"
                borderColor={borderColor}
                overflow="hidden"
              >
                <Tabs isFitted variant="enclosed">
                  <TabList>
                    <Tab
                      _selected={{ 
                        bg: activeTabBg,
                        borderBottom: "2px solid",
                        borderColor: "blue.500",
                        mb: "-1px"
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
                        mb: "-1px"
                      }}
                      fontWeight="medium"
                    >
                      History
                    </Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <Box p={6}>
                        <Heading size="md" mb={4}>Recent Posts</Heading>
                        {/* Example post structure */}
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
                            Example Post Title
                          </Text>
                          <Text color={useColorModeValue('gray.600', 'gray.400')}>
                            This is an example post content. Add your actual posts here.
                          </Text>
                        </Box>
                      </Box>
                    </TabPanel>
                    <TabPanel>
                      <Box p={6}>
                        <Heading size="md" mb={4}>Location History</Heading>
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
                          <Text mt={2} color={useColorModeValue('gray.600', 'gray.400')}>
                            This is an example historical event. Add your actual history data here.
                          </Text>
                        </Box>
                      </Box>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </>
          )}
        </Container>
      </Container>
    </Box>
  );
};

export default LocationDetailsPage;
