import { useEffect, useState } from 'react'
import { useSearchParams, Link as RouterLink } from 'react-router-dom'
import { Box, Flex, SimpleGrid, Text, Heading } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import Navbar from '../components/Navbar'
import ContactSection from '../components/ContactSection'
import LocationSection from '../components/LocationSection'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'

const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const gridItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const type = searchParams.get('type')

  useEffect(() => {
    setLoading(true)
    let query = supabase.from('products').select('*').order('created_at', { ascending: false })
    if (type) query = query.eq('type', type)
    if (category) query = query.eq('category', category)
    if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    query.then(({ data }) => {
      setProducts(data || [])
      setLoading(false)
    })
  }, [category, search, type])

  const typeLabels = { painting: 'Picturi', frame: 'Rame' }
  const title = type ? (typeLabels[type] || type) : category ? category : search ? `"${search}"` : 'Galerie'

  return (
    <PageTransition>
      <Flex direction="column" minH="100vh">
        <Navbar />

        <Box flex={1} maxW="7xl" mx="auto" w="full" px={6} py={14}>
          <Box mb={12}>
            <Text fontSize="xs" letterSpacing="0.2em" textTransform="uppercase" color="gray.400" mb={3}>
              {type ? 'Tip' : category ? 'Colecție' : search ? 'Rezultate căutare' : 'Toate lucrările'}
            </Text>
            <Flex align="center" gap={5}>
              <Heading fontFamily="heading" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="300" color="gray.900" lineHeight="1.1">
                {title}
              </Heading>
              {(category || search || type) && (
                <Box
                  as={RouterLink}
                  to="/products"
                  fontSize="xs"
                  letterSpacing="0.1em"
                  color="gray.400"
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  pb={0.5}
                  _hover={{ color: 'gray.700', borderColor: 'gray.500', textDecoration: 'none' }}
                  transition="color 0.2s"
                >
                  × Șterge filtrul
                </Box>
              )}
            </Flex>
          </Box>

          {loading ? (
            <Box minH="60vh" />
          ) : products.length === 0 ? (
            <Box py={20} textAlign="center">
              <Text fontFamily="heading" fontSize="2xl" fontWeight="300" color="gray.300" mb={3}>
                Nicio lucrare găsită
              </Text>
              <Text fontSize="sm" color="gray.400">Încearcă să modifici filtrele de căutare.</Text>
            </Box>
          ) : (
            <motion.div
              key={`${type}-${category}-${search}`}
              variants={gridContainer}
              initial="hidden"
              animate="show"
            >
              <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gap={{ base: 5, md: 8 }}>
                {products.map(product => (
                  <motion.div key={product.id} variants={gridItem}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </SimpleGrid>
            </motion.div>
          )}
        </Box>

        <ContactSection />
        <LocationSection />
        <Footer />
      </Flex>
    </PageTransition>
  )
}
