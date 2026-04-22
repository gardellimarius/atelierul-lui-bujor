import { useState, useEffect } from 'react'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import { Box, Flex, Input } from '@chakra-ui/react'
import { supabase } from '../lib/supabase'
import { useWishlist } from '../context/WishlistContext'

export default function Navbar() {
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { wishlist } = useWishlist()

  function handleSamePageClick(e, to) {
    if (location.pathname + location.search === to) {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    supabase.from('categories').select('name, show_in_navbar').order('name')
      .then(({ data }) => {
        if (data) setCategories(data.filter(c => c.show_in_navbar !== false).map(c => c.name))
      })
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`)
      setSearch('')
      setSearchOpen(false)
      setMenuOpen(false)
    }
  }

  const navLink = {
    fontSize: 'xs',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'gray.500',
    whiteSpace: 'nowrap',
    transition: 'color 0.2s',
    _hover: { color: 'gray.900', textDecoration: 'none' },
  }

  return (
    <Box position="sticky" top="0" zIndex={50} bg="white" borderBottom="1px solid" borderColor="gray.100">
      <Flex maxW="7xl" mx="auto" px={6} h="16" align="center" gap={8}>
        <Box
          as={RouterLink}
          to="/"
          fontFamily="heading"
          fontSize="xl"
          fontWeight="400"
          color="gray.900"
          letterSpacing="0.04em"
          flexShrink={0}
          _hover={{ textDecoration: 'none' }}
        >
          Atelierul lui Bujor
        </Box>

        <Flex display={{ base: 'none', md: 'flex' }} align="center" gap={7} flex={1}>
          <Box as={RouterLink} to="/products?type=painting" onClick={e => handleSamePageClick(e, '/products?type=painting')} {...navLink}>Picturi</Box>
          <Box as={RouterLink} to="/products?type=frame" onClick={e => handleSamePageClick(e, '/products?type=frame')} {...navLink}>Rame</Box>
          {categories.map(cat => {
            const to = `/products?category=${encodeURIComponent(cat)}`
            return (
              <Box key={cat} as={RouterLink} to={to} onClick={e => handleSamePageClick(e, to)} {...navLink}>
                {cat}
              </Box>
            )
          })}
          <Box as="a" href="#contact" {...navLink}>Contact</Box>
        </Flex>

        <Box
          as={RouterLink}
          to="/wishlist"
          display={{ base: 'none', md: 'flex' }}
          alignItems="center"
          position="relative"
          color="gray.400"
          ml="auto"
          _hover={{ color: 'gray.900', textDecoration: 'none' }}
          transition="color 0.2s"
        >
          <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {wishlist.length > 0 && (
            <Box
              position="absolute"
              top="-6px"
              right="-7px"
              bg="gray.900"
              color="white"
              fontSize="9px"
              fontWeight="700"
              lineHeight="1"
              minW="15px"
              h="15px"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              px="2px"
            >
              {wishlist.length}
            </Box>
          )}
        </Box>

        <Flex align="center" gap={4} display={{ base: 'none', md: 'flex' }}>
          {searchOpen ? (
            <Flex as="form" onSubmit={handleSearch} align="center" borderBottom="1px solid" borderColor="gray.300" pb={1} gap={2}>
              <Input
                border="none"
                fontSize="xs"
                placeholder="Caută lucrări..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                w="44"
                p={0}
                h="auto"
                autoFocus
                _focus={{ boxShadow: 'none' }}
              />
              <Box as="button" type="button" color="gray.400" onClick={() => setSearchOpen(false)}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Box>
            </Flex>
          ) : (
            <Box as="button" color="gray.400" _hover={{ color: 'gray.900' }} transition="color 0.2s" onClick={() => setSearchOpen(true)}>
              <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Box>
          )}
        </Flex>

        <Box
          as="button"
          ml="auto"
          display={{ base: 'flex', md: 'none' }}
          color="gray.600"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </Box>
      </Flex>

      {menuOpen && (
        <Box display={{ md: 'none' }} borderTop="1px solid" borderColor="gray.100" bg="white" px={6} py={6}>
          <Flex as="form" onSubmit={handleSearch} align="center" borderBottom="1px solid" borderColor="gray.200" pb={3} gap={2} mb={5}>
            <Input
              border="none"
              fontSize="sm"
              placeholder="Caută lucrări..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              flex={1}
              p={0}
              h="auto"
              _focus={{ boxShadow: 'none' }}
            />
            <Box as="button" type="submit" color="gray.400">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Box>
          </Flex>
          <Flex direction="column" gap={4}>
            <Box as={RouterLink} to="/products?type=painting" fontSize="xs" letterSpacing="0.12em" textTransform="uppercase" color="gray.600" _hover={{ color: 'gray.900', textDecoration: 'none' }} onClick={e => { handleSamePageClick(e, '/products?type=painting'); setMenuOpen(false) }}>
              Picturi
            </Box>
            <Box as={RouterLink} to="/products?type=frame" fontSize="xs" letterSpacing="0.12em" textTransform="uppercase" color="gray.600" _hover={{ color: 'gray.900', textDecoration: 'none' }} onClick={e => { handleSamePageClick(e, '/products?type=frame'); setMenuOpen(false) }}>
              Rame
            </Box>
            {categories.map(cat => {
              const to = `/products?category=${encodeURIComponent(cat)}`
              return (
                <Box key={cat} as={RouterLink} to={to} fontSize="xs" letterSpacing="0.12em" textTransform="uppercase" color="gray.600" _hover={{ color: 'gray.900', textDecoration: 'none' }} onClick={e => { handleSamePageClick(e, to); setMenuOpen(false) }}>
                  {cat}
                </Box>
              )
            })}
            <Box as="a" href="#contact" fontSize="xs" letterSpacing="0.12em" textTransform="uppercase" color="gray.600" _hover={{ color: 'gray.900', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
              Contact
            </Box>
            <Box as={RouterLink} to="/wishlist" fontSize="xs" letterSpacing="0.12em" textTransform="uppercase" color="gray.600" _hover={{ color: 'gray.900', textDecoration: 'none' }} onClick={() => setMenuOpen(false)} display="flex" alignItems="center" gap={2}>
              Lista mea
              {wishlist.length > 0 && (
                <Box as="span" bg="gray.900" color="white" fontSize="9px" fontWeight="700" lineHeight="1" minW="15px" h="15px" borderRadius="full" display="inline-flex" alignItems="center" justifyContent="center" px="2px">
                  {wishlist.length}
                </Box>
              )}
            </Box>
          </Flex>
        </Box>
      )}
    </Box>
  )
}
