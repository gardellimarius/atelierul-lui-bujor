import { useEffect, useState } from 'react'
import { Box, Flex, Heading, Text, SimpleGrid } from '@chakra-ui/react'
import { supabase } from '../lib/supabase'

const scheduleDays = [
  { key: 'schedule_luni', label: 'Luni' },
  { key: 'schedule_marti', label: 'Marți' },
  { key: 'schedule_miercuri', label: 'Miercuri' },
  { key: 'schedule_joi', label: 'Joi' },
  { key: 'schedule_vineri', label: 'Vineri' },
  { key: 'schedule_sambata', label: 'Sâmbătă' },
  { key: 'schedule_duminica', label: 'Duminică' },
]

const scheduleKeys = scheduleDays.map(d => d.key)

export default function LocationSection() {
  const [loc, setLoc] = useState({
    location_name: '', location_address: '', phone: '', contact_email: '', location_coords: '',
    ...Object.fromEntries(scheduleKeys.map(k => [k, '']))
  })

  useEffect(() => {
    supabase.from('settings').select('key, value')
      .in('key', ['location_name', 'location_address', 'phone', 'contact_email', 'location_coords', ...scheduleKeys])
      .then(({ data }) => {
        if (!data) return
        const map = {}
        data.forEach(s => { map[s.key] = s.value })
        setLoc(prev => ({ ...prev, ...map }))
      })
  }, [])

  const scheduleEntries = scheduleDays.filter(d => loc[d.key])
  const hasLocation = loc.location_name || loc.location_address || scheduleEntries.length > 0

  if (!hasLocation) return null

  return (
    <Box py={24} px={6} bg="white">
      <Box maxW="7xl" mx="auto">
        <Flex justify="center" mb={16}>
          <Box textAlign="center">
            <Text fontSize="xs" letterSpacing="0.25em" textTransform="uppercase" color="gray.400" mb={4}>
              Vizitează-ne
            </Text>
            <Heading fontFamily="heading" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="300" color="gray.900" lineHeight="1.2">
              {loc.location_name}
            </Heading>
          </Box>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 10, md: 16 }} maxW="5xl" mx="auto" alignItems="center">
          <Flex direction="column" gap={8}>
            {loc.location_address && (
              <Flex gap={4} align="flex-start">
                <Box as="svg" w={4} h={4} mt="3px" flexShrink={0} fill="none" stroke="currentColor" viewBox="0 0 24 24" color="gray.400">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </Box>
                <Box>
                  <Text fontSize="xs" letterSpacing="0.1em" textTransform="uppercase" color="gray.400" mb={1}>Adresă</Text>
                  <Text fontSize="sm" color="gray.700" lineHeight="1.7">{loc.location_address}</Text>
                </Box>
              </Flex>
            )}

            {scheduleEntries.length > 0 && (
              <Flex gap={4} align="flex-start">
                <Box as="svg" w={4} h={4} mt="3px" flexShrink={0} fill="none" stroke="currentColor" viewBox="0 0 24 24" color="gray.400">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </Box>
                <Box>
                  <Text fontSize="xs" letterSpacing="0.1em" textTransform="uppercase" color="gray.400" mb={3}>Program</Text>
                  <Flex direction="column" gap={1.5}>
                    {scheduleDays.map(({ key, label }) => (
                      <Flex key={key} gap={3} align="baseline">
                        <Text fontSize="xs" color="gray.400" w="20" flexShrink={0}>{label}</Text>
                        <Text fontSize="sm" color={loc[key] ? 'gray.700' : 'gray.300'}>
                          {loc[key] || 'Închis'}
                        </Text>
                      </Flex>
                    ))}
                  </Flex>
                </Box>
              </Flex>
            )}

            {loc.phone && (
              <Flex gap={4} align="flex-start">
                <Box as="svg" w={4} h={4} mt="3px" flexShrink={0} fill="none" stroke="currentColor" viewBox="0 0 24 24" color="gray.400">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </Box>
                <Box>
                  <Text fontSize="xs" letterSpacing="0.1em" textTransform="uppercase" color="gray.400" mb={1}>Telefon</Text>
                  <Text fontSize="sm" color="gray.700">{loc.phone}</Text>
                </Box>
              </Flex>
            )}

            {loc.contact_email && (
              <Flex gap={4} align="flex-start">
                <Box as="svg" w={4} h={4} mt="3px" flexShrink={0} fill="none" stroke="currentColor" viewBox="0 0 24 24" color="gray.400">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </Box>
                <Box>
                  <Text fontSize="xs" letterSpacing="0.1em" textTransform="uppercase" color="gray.400" mb={1}>Email</Text>
                  <Text fontSize="sm" color="gray.700">{loc.contact_email}</Text>
                </Box>
              </Flex>
            )}
          </Flex>

          {loc.location_coords && (
            <Box
              as="iframe"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(loc.location_coords)}&z=16&output=embed`}
              w="full"
              h={{ base: '280px', md: '360px' }}
              border="none"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sx={{ filter: 'grayscale(20%)' }}
            />
          )}
        </SimpleGrid>
      </Box>
    </Box>
  )
}
