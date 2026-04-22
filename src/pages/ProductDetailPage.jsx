import { useEffect, useState, useCallback } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { Box, Flex, Heading, Text, Image, SimpleGrid } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import ContactSection from '../components/ContactSection'
import LocationSection from '../components/LocationSection'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'
import ProductCard from '../components/ProductCard'
import { useWishlist } from '../context/WishlistContext'

const MotionBox = motion(Box)

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [galleryImages, setGalleryImages] = useState([])
  const [activeImage, setActiveImage] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('about')
  const [related, setRelated] = useState([])

  useEffect(() => {
    setActiveTab('about')
    async function load() {
      const [{ data: prod }, { data: imgs }] = await Promise.all([
        supabase.from('products').select('*').eq('id', id).single(),
        supabase.from('product_images').select('*').eq('product_id', id).order('sort_order'),
      ])

      setProduct(prod)

      if (imgs && imgs.length > 0) {
        setGalleryImages(imgs)
        const mainIdx = imgs.findIndex(i => i.image_url === prod?.image_url)
        const idx = mainIdx >= 0 ? mainIdx : 0
        setActiveIndex(idx)
        setActiveImage(imgs[idx].image_url)
      } else if (prod?.image_url) {
        setGalleryImages([{ id: 'main', image_url: prod.image_url }])
        setActiveImage(prod.image_url)
        setActiveIndex(0)
      }

      if (prod) {
        const { data: rel } = await supabase
          .from('products')
          .select('*')
          .eq('type', prod.type || 'painting')
          .neq('id', prod.id)
          .not('image_url', 'is', null)
          .order('created_at', { ascending: false })
          .limit(8)
        setRelated(rel || [])
      }

      setLoading(false)
    }
    load()
  }, [id])

  function selectImage(img, idx) {
    setActiveImage(img.image_url)
    setActiveIndex(idx)
  }

  const goNext = useCallback(() => {
    if (!galleryImages.length) return
    const next = (activeIndex + 1) % galleryImages.length
    setActiveIndex(next)
    setActiveImage(galleryImages[next].image_url)
  }, [activeIndex, galleryImages])

  const goPrev = useCallback(() => {
    if (!galleryImages.length) return
    const prev = (activeIndex - 1 + galleryImages.length) % galleryImages.length
    setActiveIndex(prev)
    setActiveImage(galleryImages[prev].image_url)
  }, [activeIndex, galleryImages])

  useEffect(() => {
    if (!lightboxOpen) return
    function onKey(e) {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, goNext, goPrev])

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const inWishlist = product ? isInWishlist(product.id) : false

  const showThumbs = galleryImages.length > 1
  const hasAbout = !!(product?.description || product?.year_created || product?.subject)
  const hasDetails = !!(product?.dimensions || product?.medium || product?.details)
  const showTabs = hasAbout || hasDetails

  return (
    <PageTransition>
      <Flex direction="column" minH="100vh">
        <Navbar />

        <Box flex={1} maxW="7xl" mx="auto" w="full" px={6} py={10}>
          <Flex
            as={RouterLink}
            to="/products"
            align="center"
            gap={2}
            fontSize="xs"
            letterSpacing="0.1em"
            textTransform="uppercase"
            color="gray.400"
            mb={10}
            w="fit-content"
            _hover={{ color: 'gray.900', textDecoration: 'none' }}
            transition="color 0.2s"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Înapoi la galerie
          </Flex>

          {loading ? (
            <Text fontSize="sm" color="gray.400">Se încarcă...</Text>
          ) : !product ? (
            <Box py={20} textAlign="center">
              <Text fontFamily="heading" fontSize="2xl" fontWeight="300" color="gray.300">Lucrarea nu a fost găsită.</Text>
            </Box>
          ) : (
            <>
              <Flex gap={{ base: 0, lg: 16 }} direction={{ base: 'column', lg: 'row' }} align="flex-start" mb={16}>

                <Flex flex="1.3" gap={3} direction={{ base: 'column', sm: 'row' }} maxW={{ base: 'full', lg: '58%' }}>
                  {showThumbs && (
                    <Flex direction="column" gap={2} display={{ base: 'none', sm: 'flex' }} w="72px" flexShrink={0}>
                      {galleryImages.map((img, idx) => (
                        <Box
                          key={img.id}
                          onClick={() => selectImage(img, idx)}
                          cursor="pointer"
                          overflow="hidden"
                          bg="gray.100"
                          sx={{ aspectRatio: '1' }}
                          outline={activeIndex === idx ? '2px solid' : '2px solid transparent'}
                          outlineColor={activeIndex === idx ? 'gray.900' : 'transparent'}
                          outlineOffset="1px"
                          transition="outline-color 0.15s, opacity 0.15s"
                          opacity={activeIndex === idx ? 1 : 0.55}
                          _hover={{ opacity: 1 }}
                        >
                          <Image src={img.image_url} alt="" w="full" h="full" objectFit="cover" />
                        </Box>
                      ))}
                    </Flex>
                  )}

                  <Box
                    flex={1}
                    bg="gray.50"
                    overflow="hidden"
                    position="relative"
                    cursor="zoom-in"
                    onClick={() => setLightboxOpen(true)}
                    minH={{ base: '260px', sm: '400px' }}
                  >
                    <AnimatePresence mode="wait">
                      <MotionBox
                        key={activeImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                        w="full"
                        h="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Image
                          src={activeImage}
                          alt={product.name}
                          w="full"
                          objectFit="contain"
                          maxH={{ base: '60vw', sm: '70vh' }}
                          minH={{ base: '260px', sm: '400px' }}
                          pointerEvents="none"
                        />
                      </MotionBox>
                    </AnimatePresence>
                    <Box position="absolute" bottom={3} right={3} color="gray.400" opacity={0.6} pointerEvents="none">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zm-4 0v4m-2-2h4" />
                      </svg>
                    </Box>
                  </Box>

                  {showThumbs && (
                    <Flex gap={2} display={{ base: 'flex', sm: 'none' }} overflowX="auto" pb={1} mt={1}>
                      {galleryImages.map((img, idx) => (
                        <Box
                          key={img.id}
                          onClick={() => selectImage(img, idx)}
                          cursor="pointer"
                          flexShrink={0}
                          w="64px"
                          h="64px"
                          overflow="hidden"
                          bg="gray.100"
                          outline={activeIndex === idx ? '2px solid' : '2px solid transparent'}
                          outlineColor={activeIndex === idx ? 'gray.900' : 'transparent'}
                          outlineOffset="1px"
                          opacity={activeIndex === idx ? 1 : 0.5}
                          transition="opacity 0.15s"
                        >
                          <Image src={img.image_url} alt="" w="full" h="full" objectFit="cover" />
                        </Box>
                      ))}
                    </Flex>
                  )}
                </Flex>

                <Box flex="1" pt={{ base: 8, lg: 4 }} position={{ lg: 'sticky' }} top="96px">
                  {product.category && (
                    <Box
                      as={RouterLink}
                      to={`/products?category=${encodeURIComponent(product.category)}`}
                      fontSize="xs"
                      letterSpacing="0.2em"
                      textTransform="uppercase"
                      color="gray.400"
                      mb={4}
                      display="block"
                      _hover={{ color: 'gray.700', textDecoration: 'none' }}
                      transition="color 0.2s"
                    >
                      {product.category}
                    </Box>
                  )}

                  <Heading fontFamily="heading" as="h1" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="300" color="gray.900" lineHeight="1.15" mb={6}>
                    {product.name}
                  </Heading>

                  {showTabs && (
                    <Box mb={8}>
                      <Flex borderBottom="1px solid" borderColor="gray.200" mb={5} gap={0}>
                        {hasAbout && (
                          <Box
                            onClick={() => setActiveTab('about')}
                            cursor="pointer"
                            pb={3}
                            mr={7}
                            fontSize="xs"
                            letterSpacing="0.12em"
                            textTransform="uppercase"
                            color={activeTab === 'about' ? 'gray.900' : 'gray.400'}
                            borderBottom="2px solid"
                            borderColor={activeTab === 'about' ? 'gray.900' : 'transparent'}
                            transition="all 0.2s"
                            _hover={{ color: 'gray.700' }}
                          >
                            Despre lucrare
                          </Box>
                        )}
                        {hasDetails && (
                          <Box
                            onClick={() => setActiveTab('details')}
                            cursor="pointer"
                            pb={3}
                            fontSize="xs"
                            letterSpacing="0.12em"
                            textTransform="uppercase"
                            color={activeTab === 'details' ? 'gray.900' : 'gray.400'}
                            borderBottom="2px solid"
                            borderColor={activeTab === 'details' ? 'gray.900' : 'transparent'}
                            transition="all 0.2s"
                            _hover={{ color: 'gray.700' }}
                          >
                            Detalii & Dimensiuni
                          </Box>
                        )}
                      </Flex>

                      <AnimatePresence mode="wait">
                        <MotionBox
                          key={activeTab}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.18 }}
                        >
                          {activeTab === 'about' && (
                            <Flex direction="column" gap={5}>
                              {product.description && (
                                <Text color="gray.500" fontSize="sm" lineHeight="1.9" whiteSpace="pre-line">
                                  {product.description}
                                </Text>
                              )}
                              {(product.year_created || product.subject) && (
                                <Flex direction="column" gap={3} borderTop="1px solid" borderColor="gray.100" pt={5}>
                                  {product.year_created && (
                                    <Flex gap={4} fontSize="sm">
                                      <Text color="gray.400" minW="120px" fontSize="xs" letterSpacing="0.08em" textTransform="uppercase">An creație</Text>
                                      <Text color="gray.700">{product.year_created}</Text>
                                    </Flex>
                                  )}
                                  {product.subject && (
                                    <Flex gap={4} fontSize="sm">
                                      <Text color="gray.400" minW="120px" fontSize="xs" letterSpacing="0.08em" textTransform="uppercase">Subiect</Text>
                                      <Text color="gray.700">{product.subject}</Text>
                                    </Flex>
                                  )}
                                </Flex>
                              )}
                            </Flex>
                          )}
                          {activeTab === 'details' && (
                            <Flex direction="column" gap={0}>
                              {[
                                { label: 'Dimensiuni', value: product.dimensions },
                                { label: 'Mediu', value: product.medium },
                                { label: 'Alte detalii', value: product.details },
                              ].filter(r => r.value).map((row, i, arr) => (
                                <Flex
                                  key={row.label}
                                  gap={4}
                                  py={3}
                                  borderBottom={i < arr.length - 1 ? '1px solid' : 'none'}
                                  borderColor="gray.100"
                                  align="flex-start"
                                >
                                  <Text color="gray.400" minW="120px" fontSize="xs" letterSpacing="0.08em" textTransform="uppercase" pt="1px">
                                    {row.label}
                                  </Text>
                                  <Text color="gray.700" fontSize="sm" lineHeight="1.7" whiteSpace="pre-line">{row.value}</Text>
                                </Flex>
                              ))}
                            </Flex>
                          )}
                        </MotionBox>
                      </AnimatePresence>
                    </Box>
                  )}

                  {product.bestseller && (
                    <Flex align="center" gap={2} mb={6}>
                      <Box w={1} h={1} borderRadius="full" bg="gray.400" />
                      <Text fontSize="xs" letterSpacing="0.18em" textTransform="uppercase" color="gray.400">
                        Lucrare recomandată
                      </Text>
                    </Flex>
                  )}

                  <Box
                    as="a"
                    href="#contact"
                    bg="gray.900"
                    color="white"
                    fontSize="xs"
                    letterSpacing="0.15em"
                    textTransform="uppercase"
                    px={8}
                    py={4}
                    display="block"
                    textAlign="center"
                    _hover={{ bg: 'gray.700', textDecoration: 'none' }}
                    transition="background 0.2s"
                    mb={3}
                  >
                    Mă interesează această lucrare
                  </Box>

                  <Box
                    as="button"
                    onClick={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product)}
                    w="full"
                    border="1px solid"
                    borderColor={inWishlist ? 'gray.900' : 'gray.200'}
                    bg={inWishlist ? 'gray.50' : 'transparent'}
                    color={inWishlist ? 'gray.900' : 'gray.400'}
                    fontSize="xs"
                    letterSpacing="0.15em"
                    textTransform="uppercase"
                    px={8}
                    py={4}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={2}
                    _hover={{ borderColor: 'gray.900', color: 'gray.900' }}
                    transition="all 0.2s"
                    mb={4}
                  >
                    <svg width="14" height="14" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {inWishlist ? 'Salvată în lista ta' : 'Adaugă în lista ta'}
                  </Box>

                  <Text fontSize="xs" color="gray.400" textAlign="center" lineHeight="1.8">
                    Lucrare originală, unicat · Livrare gratuită în România
                  </Text>
                </Box>
              </Flex>

              {related.length > 0 && (
                <Box borderTop="1px solid" borderColor="gray.100" pt={14}>
                  <Flex align="flex-end" justify="space-between" mb={8}>
                    <Box>
                      <Text fontSize="xs" letterSpacing="0.2em" textTransform="uppercase" color="gray.400" mb={2}>
                        S-ar putea să îți placă
                      </Text>
                      <Heading fontFamily="heading" fontSize="2xl" fontWeight="300" color="gray.900">
                        {product.type === 'frame' ? 'Mai multe rame' : 'Mai multe picturi'}
                      </Heading>
                    </Box>
                    <Box
                      as={RouterLink}
                      to={`/products?type=${product.type || 'painting'}`}
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

                  <Box
                    overflowX="auto"
                    mx={{ base: -6, lg: 0 }}
                    px={{ base: 6, lg: 0 }}
                    sx={{
                      '&::-webkit-scrollbar': { height: '3px' },
                      '&::-webkit-scrollbar-track': { background: 'transparent' },
                      '&::-webkit-scrollbar-thumb': { background: 'var(--chakra-colors-gray-200)', borderRadius: '99px' },
                      scrollSnapType: 'x mandatory',
                    }}
                    pb={3}
                  >
                    <Flex gap={{ base: 4, md: 6 }} w="max-content">
                      {related.map(p => (
                        <Box
                          key={p.id}
                          w={{ base: '160px', sm: '200px', md: '240px' }}
                          flexShrink={0}
                          sx={{ scrollSnapAlign: 'start' }}
                        >
                          <ProductCard product={p} />
                        </Box>
                      ))}
                    </Flex>
                  </Box>
                </Box>
              )}
            </>
          )}
        </Box>

        <ContactSection />
        <LocationSection />
        <Footer />
      </Flex>

      <AnimatePresence>
        {lightboxOpen && (
          <MotionBox
            key="lightbox"
            position="fixed"
            inset="0"
            zIndex={1000}
            display="flex"
            alignItems="center"
            justifyContent="center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ background: 'rgba(0,0,0,0.92)' }}
            onClick={() => setLightboxOpen(false)}
          >
            <Box
              position="absolute"
              top={5}
              right={5}
              color="white"
              opacity={0.6}
              _hover={{ opacity: 1 }}
              cursor="pointer"
              onClick={() => setLightboxOpen(false)}
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Box>

            {showThumbs && (
              <>
                <Box position="absolute" left={5} color="white" opacity={0.6} _hover={{ opacity: 1 }} cursor="pointer" p={2} onClick={e => { e.stopPropagation(); goPrev() }}>
                  <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </Box>
                <Box position="absolute" right={5} color="white" opacity={0.6} _hover={{ opacity: 1 }} cursor="pointer" p={2} onClick={e => { e.stopPropagation(); goNext() }}>
                  <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Box>
              </>
            )}

            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                src={activeImage}
                alt={product?.name}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }}
                onClick={e => e.stopPropagation()}
              />
            </AnimatePresence>

            {showThumbs && (
              <Box position="absolute" bottom={5} color="white" opacity={0.4} fontSize="xs" letterSpacing="0.1em">
                {activeIndex + 1} / {galleryImages.length}
              </Box>
            )}
          </MotionBox>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
