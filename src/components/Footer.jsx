import { Link as RouterLink } from 'react-router-dom'
import { Box, Flex, Text } from '@chakra-ui/react'

export default function Footer() {
  return (
    <Box bg="black" px={6} py={10} borderTop="1px solid" borderColor="gray.900">
      <Flex maxW="7xl" mx="auto" direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'flex-start', md: 'center' }} gap={4}>
        <Text fontFamily="heading" fontSize="lg" fontWeight="400" color="gray.600" letterSpacing="0.04em">
          Atelierul lui Bujor
        </Text>
        <Text fontSize="xs" letterSpacing="0.08em" color="gray.700">
          © {new Date().getFullYear()} · Toate drepturile rezervate
        </Text>
        <Box as={RouterLink} to="/admin/login" fontSize="xs" letterSpacing="0.08em" color="gray.800" _hover={{ color: 'gray.500', textDecoration: 'none' }} transition="color 0.2s">
          Admin
        </Box>
      </Flex>
    </Box>
  )
}
