import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Flex, Heading, Text, Image } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const imageVariant = {
  hidden: { opacity: 0, scale: 1.03 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 } },
}

export default function HeroSection() {
  const [featured, setFeatured] = useState([])
  const [heroTitle, setHeroTitle] = useState('')
  const [heroTitleItalic, setHeroTitleItalic] = useState('')
  const [heroSubtitle, setHeroSubtitle] = useState('')

  useEffect(() => {
    supabase.from('products').select('id, name, image_url').eq('type', 'painting').eq('bestseller', true).not('image_url', 'is', null).order('created_at', { ascending: false }).limit(1)
      .then(({ data }) => {
        if (data?.length) { setFeatured(data); return }
        supabase.from('products').select('id, name, image_url').eq('type', 'painting').not('image_url', 'is', null).order('created_at', { ascending: false }).limit(1)
          .then(({ data: d }) => setFeatured(d || []))
      })

    supabase.from('settings').select('key, value').in('key', ['hero_title', 'hero_title_italic', 'hero_subtitle'])
      .then(({ data }) => {
        if (!data) return
        data.forEach(s => {
          if (s.key === 'hero_title' && s.value) setHeroTitle(s.value)
          if (s.key === 'hero_title_italic' && s.value) setHeroTitleItalic(s.value)
          if (s.key === 'hero_subtitle' && s.value) setHeroSubtitle(s.value)
        })
      })
  }, [])

  return (
    <Box minH={{ base: 'auto', md: '90vh' }} bg="gray.50" display="flex" alignItems="center" overflow="hidden">
      <Flex
        maxW="7xl"
        mx="auto"
        px={6}
        py={{ base: 16, md: 0 }}
        w="full"
        align="center"
        gap={{ base: 10, lg: 20 }}
        direction={{ base: 'column', md: 'row' }}
      >
        <Box flex="1" maxW={{ base: 'full', md: 'lg' }}>
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.div variants={item}>
              <Text fontSize="xs" letterSpacing="0.25em" textTransform="uppercase" color="gray.400" mb={6}>
                Pictură originală · România
              </Text>
            </motion.div>

            {(heroTitle || heroTitleItalic) && (
              <motion.div variants={item}>
                <Heading
                  as="h1"
                  fontFamily="heading"
                  fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                  fontWeight="300"
                  color="gray.900"
                  lineHeight="1.1"
                  mb={6}
                >
                  {heroTitle}
                  {heroTitleItalic && (
                    <>
                      {heroTitle && <br />}
                      <Box as="em" fontStyle="italic" color="gray.600">
                        {heroTitleItalic}
                      </Box>
                    </>
                  )}
                </Heading>
              </motion.div>
            )}

            {heroSubtitle && (
              <motion.div variants={item}>
                <Text color="gray.500" fontSize="sm" lineHeight="1.9" mb={10} maxW="sm">
                  {heroSubtitle}
                </Text>
              </motion.div>
            )}

            <motion.div variants={item}>
              <Flex gap={4} flexDir={{ base: 'column', sm: 'row' }}>
                <Box
                  as={RouterLink}
                  to="/products"
                  bg="gray.900"
                  color="white"
                  fontSize="xs"
                  letterSpacing="0.15em"
                  textTransform="uppercase"
                  px={8}
                  py={4}
                  _hover={{ bg: 'gray.700', textDecoration: 'none' }}
                  transition="background 0.2s"
                >
                  Explorează galeria
                </Box>
                <Box
                  as="a"
                  href="#contact"
                  border="1px solid"
                  borderColor="gray.300"
                  color="gray.600"
                  fontSize="xs"
                  letterSpacing="0.15em"
                  textTransform="uppercase"
                  px={8}
                  py={4}
                  _hover={{ borderColor: 'gray.900', color: 'gray.900', textDecoration: 'none' }}
                  transition="all 0.2s"
                >
                  Contactează artistul
                </Box>
              </Flex>
            </motion.div>
          </motion.div>
        </Box>

        {featured.length > 0 && (
          <Box flex="1" display={{ base: 'none', md: 'block' }} maxH="75vh" overflow="hidden">
            <motion.div variants={imageVariant} initial="hidden" animate="show">
              <Box
                as={RouterLink}
                to={`/products/${featured[0].id}`}
                display="block"
                overflow="hidden"
                _hover={{ textDecoration: 'none', opacity: 0.95 }}
                transition="opacity 0.3s"
              >
                <Image
                  src={featured[0].image_url}
                  alt={featured[0].name}
                  w="full"
                  objectFit="cover"
                  sx={{ aspectRatio: '3/4' }}
                  maxH="75vh"
                />
              </Box>
            </motion.div>
          </Box>
        )}
      </Flex>
    </Box>
  )
}
