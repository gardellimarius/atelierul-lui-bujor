import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Flex, SimpleGrid, Heading, Text, Image } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.52, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

export default function CategoriesSection() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: products }] = await Promise.all([
        supabase.from('categories').select('name').order('name'),
        supabase.from('products').select('category, image_url').neq('category', '').neq('category', null),
      ])
      if (!cats) { setLoading(false); return }
      const imageMap = {}
      ;(products || []).forEach(p => {
        if (p.category && p.image_url && !imageMap[p.category]) imageMap[p.category] = p.image_url
      })
      setCategories(cats.map(c => ({ name: c.name, image_url: imageMap[c.name] || null })))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <Box minH="520px" bg="white" />
  if (categories.length === 0) return null

  return (
    <Box py={20} px={6} bg="white">
      <Box maxW="7xl" mx="auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
          <Flex align="flex-end" justify="space-between" mb={10}>
            <Box>
              <Text fontSize="xs" letterSpacing="0.2em" textTransform="uppercase" color="gray.400" mb={3}>
                Colecții
              </Text>
              <Heading fontFamily="heading" fontSize="3xl" fontWeight="300" color="gray.900" lineHeight="1.2">
                Explorează după stil
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
              Vezi toate →
            </Box>
          </Flex>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: categories.length >= 4 ? 4 : categories.length }} gap={{ base: 4, md: 5 }}>
            {categories.map(cat => (
              <motion.div key={cat.name} variants={fadeUp}>
                <Box
                  as={RouterLink}
                  to={`/products?category=${encodeURIComponent(cat.name)}`}
                  position="relative"
                  w="full"
                  paddingBottom="133.33%"
                  overflow="hidden"
                  bg="gray.100"
                  _hover={{ textDecoration: 'none' }}
                  role="group"
                  display="block"
                >
                  {cat.image_url && (
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      position="absolute"
                      top={0} left={0}
                      w="full"
                      h="full"
                      objectFit="cover"
                      transition="transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)"
                      _groupHover={{ transform: 'scale(1.06)' }}
                    />
                  )}
                  <Box
                    position="absolute"
                    inset="0"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }}
                  />
                  <Box position="absolute" bottom="0" left="0" right="0" p={5}>
                    <Text fontSize="xs" letterSpacing="0.18em" textTransform="uppercase" color="whiteAlpha.700" mb={1}>
                      Colecție
                    </Text>
                    <Text fontFamily="heading" fontSize="xl" fontWeight="400" color="white" lineHeight="1.2">
                      {cat.name}
                    </Text>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </SimpleGrid>
        </motion.div>
      </Box>
    </Box>
  )
}
