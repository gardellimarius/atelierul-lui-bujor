import { Link as RouterLink } from 'react-router-dom'
import { Box, Flex, Heading, Text, Image, SimpleGrid } from '@chakra-ui/react'
import Navbar from '../components/Navbar'
import ContactSection from '../components/ContactSection'
import LocationSection from '../components/LocationSection'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'
import { useWishlist } from '../context/WishlistContext'

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist()

  return (
    <PageTransition>
      <Flex direction="column" minH="100vh">
        <Navbar />

        <Box flex={1} maxW="7xl" mx="auto" w="full" px={6} py={14}>
          <Box mb={12}>
            <Text fontSize="xs" letterSpacing="0.25em" textTransform="uppercase" color="gray.400" mb={3}>
              Lista ta
            </Text>
            <Heading fontFamily="heading" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="300" color="gray.900" lineHeight="1.2">
              Lucrări salvate
            </Heading>
          </Box>

          {wishlist.length === 0 ? (
            <Flex direction="column" align="center" justify="center" py={24} gap={5}>
              <Box color="gray.200">
                <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Box>
              <Text fontFamily="heading" fontSize="xl" fontWeight="300" color="gray.400">
                Nicio lucrare salvată încă
              </Text>
              <Box
                as={RouterLink}
                to="/products"
                fontSize="xs"
                letterSpacing="0.15em"
                textTransform="uppercase"
                color="gray.500"
                borderBottom="1px solid"
                borderColor="gray.300"
                pb={0.5}
                _hover={{ color: 'gray.900', borderColor: 'gray.900', textDecoration: 'none' }}
                transition="all 0.2s"
              >
                Explorează galeria
              </Box>
            </Flex>
          ) : (
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} gap={{ base: 4, md: 6 }}>
              {wishlist.map(product => (
                <Box key={product.id} position="relative" role="group">
                  <Box
                    as={RouterLink}
                    to={`/products/${product.id}`}
                    display="flex"
                    flexDir="column"
                    _hover={{ textDecoration: 'none' }}
                  >
                    <Box position="relative" w="full" paddingBottom="133.33%" overflow="hidden" bg="gray.100">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          position="absolute"
                          top={0} left={0}
                          w="full"
                          h="full"
                          objectFit="cover"
                          transition="transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)"
                          _groupHover={{ transform: 'scale(1.04)' }}
                        />
                      ) : (
                        <Box position="absolute" top={0} left={0} w="full" h="full" bg="gray.100" />
                      )}
                    </Box>
                    <Box pt={3}>
                      <Text fontFamily="heading" fontSize="md" fontWeight="400" color="gray.900" lineHeight="1.3" _groupHover={{ color: 'gray.600' }} transition="color 0.2s">
                        {product.name}
                      </Text>
                      {product.category && (
                        <Text fontSize="xs" letterSpacing="0.1em" textTransform="uppercase" color="gray.400" mt={1}>
                          {product.category}
                        </Text>
                      )}
                    </Box>
                  </Box>

                  <Box
                    as="button"
                    onClick={() => removeFromWishlist(product.id)}
                    position="absolute"
                    top={2}
                    right={2}
                    w={7}
                    h={7}
                    bg="white"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="gray.400"
                    _hover={{ color: 'red.500', bg: 'red.50' }}
                    transition="all 0.2s"
                    shadow="sm"
                    title="Elimină din listă"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>

        <ContactSection />
        <LocationSection />
        <Footer />
      </Flex>
    </PageTransition>
  )
}
