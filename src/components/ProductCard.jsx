import { Link as RouterLink } from 'react-router-dom'
import { Box, Image, Text } from '@chakra-ui/react'

export default function ProductCard({ product }) {
  return (
    <Box
      as={RouterLink}
      to={`/products/${product.id}`}
      display="flex"
      flexDir="column"
      _hover={{ textDecoration: 'none' }}
      role="group"
    >
      {/* Padding-bottom trick: 133.33% = 4/3 ratio → portrait 3:4 */}
      <Box position="relative" w="full" paddingBottom="133.33%" overflow="hidden" bg="gray.100" flexShrink={0}>
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            position="absolute"
            top={0}
            left={0}
            w="full"
            h="full"
            objectFit="cover"
            transition="transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)"
            _groupHover={{ transform: 'scale(1.04)' }}
          />
        ) : (
          <Box position="absolute" top={0} left={0} w="full" h="full" bg="gray.100" />
        )}

        {product.bestseller && (
          <Box
            position="absolute"
            top={3}
            left={3}
            bg="white"
            fontSize="2xs"
            letterSpacing="0.15em"
            textTransform="uppercase"
            color="gray.600"
            px={2}
            py={1}
          >
            Recomandat
          </Box>
        )}
      </Box>

      <Box pt={3} pb={1} minH="60px">
        <Text
          fontFamily="heading"
          fontSize="lg"
          fontWeight="400"
          color="gray.900"
          lineHeight="1.3"
          noOfLines={2}
          _groupHover={{ color: 'gray.600' }}
          transition="color 0.2s"
        >
          {product.name}
        </Text>
        {product.category && (
          <Text fontSize="xs" letterSpacing="0.1em" textTransform="uppercase" color="gray.400" mt={1}>
            {product.category}
          </Text>
        )}
      </Box>
    </Box>
  )
}
