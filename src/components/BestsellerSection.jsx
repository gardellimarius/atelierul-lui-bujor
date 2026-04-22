import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Flex, SimpleGrid, Heading, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import ProductCard from './ProductCard'

const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const gridItem = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function BestsellerSection() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('bestseller', true)
      .limit(8)
      .then(({ data }) => setProducts(data || []))
  }, [])

  if (products.length === 0) return null

  return (
    <Box py={20} px={6} bg="gray.50">
      <Box maxW="7xl" mx="auto">
        <Flex align="flex-end" justify="space-between" mb={10}>
          <Box>
            <Text fontSize="xs" letterSpacing="0.2em" textTransform="uppercase" color="gray.400" mb={3}>
              Selecție
            </Text>
            <Heading fontFamily="heading" fontSize="3xl" fontWeight="300" color="gray.900" lineHeight="1.2">
              Lucrări recomandate
            </Heading>
          </Box>
          <Box
            as={RouterLink}
            to="/products"
            fontSize="xs"
            letterSpacing="0.12em"
            textTransform="uppercase"
            color="gray.400"
            _hover={{ color: 'gray.900', textDecoration: 'none' }}
            transition="color 0.2s"
            display={{ base: 'none', sm: 'block' }}
          >
            Galerie completă →
          </Box>
        </Flex>

        <motion.div
          variants={gridContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gap={{ base: 5, md: 8 }}>
            {products.map(product => (
              <motion.div key={product.id} variants={gridItem}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </SimpleGrid>
        </motion.div>
      </Box>
    </Box>
  )
}
