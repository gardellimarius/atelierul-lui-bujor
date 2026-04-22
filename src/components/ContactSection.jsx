import { useState, useEffect } from 'react'
import { Box, SimpleGrid, Heading, Text, Input, Textarea, Button, Flex } from '@chakra-ui/react'
import { supabase } from '../lib/supabase'

const inputStyles = {
  bg: 'transparent',
  border: 'none',
  borderBottom: '1px solid',
  borderColor: 'gray.600',
  color: 'white',
  fontSize: 'sm',
  borderRadius: '0',
  px: 0,
  py: 2,
  _placeholder: { color: 'gray.600' },
  _focus: { borderColor: 'gray.300', boxShadow: 'none', outline: 'none' },
}

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [contactEmail, setContactEmail] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    supabase.from('settings').select('key, value').in('key', ['contact_email', 'phone'])
      .then(({ data }) => {
        if (!data) return
        data.forEach(s => {
          if (s.key === 'contact_email' && s.value) setContactEmail(s.value)
          if (s.key === 'phone' && s.value) setPhone(s.value)
        })
      })
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    window.location.href = `mailto:${contactEmail}?subject=Mesaj de la ${encodeURIComponent(form.name)}&body=${encodeURIComponent(form.message + '\n\nEmail: ' + form.email)}`
    setSent(true)
  }

  return (
    <Box id="contact" py={24} px={6} bg="gray.900">
      <Box maxW="7xl" mx="auto">
        <Flex justify="center" mb={16}>
          <Box textAlign="center">
            <Text fontSize="xs" letterSpacing="0.25em" textTransform="uppercase" color="gray.500" mb={4}>
              Scrie-ne
            </Text>
            <Heading fontFamily="heading" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="300" color="white" lineHeight="1.2">
              Interesează-te de o lucrare
            </Heading>
          </Box>
        </Flex>

        <SimpleGrid maxW="4xl" mx="auto" columns={{ base: 1, md: 2 }} gap={{ base: 12, md: 20 }}>
          <Flex direction="column" justify="center" gap={6}>
            <Text color="gray.400" fontSize="sm" lineHeight="1.9">
              Fiecare lucrare este disponibilă într-un singur exemplar.
              Contactează-ne pentru detalii despre dimensiuni, livrare sau comenzi personalizate.
            </Text>

            <Flex direction="column" gap={4} fontSize="sm" color="gray.400">
              {contactEmail && (
              <Flex align="center" gap={3}>
                <Box as="svg" w={4} h={4} flexShrink={0} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </Box>
                <Text>{contactEmail}</Text>
              </Flex>
              )}
              {phone && (
              <Flex align="center" gap={3}>
                <Box as="svg" w={4} h={4} flexShrink={0} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </Box>
                <Text>{phone}</Text>
              </Flex>
              )}
            </Flex>
          </Flex>

          <Box>
            {sent ? (
              <Flex h="full" align="center">
                <Box>
                  <Heading fontFamily="heading" fontSize="2xl" fontWeight="300" color="white" mb={3}>Mulțumim!</Heading>
                  <Text color="gray.400" fontSize="sm">Te contactăm în curând cu toate detaliile.</Text>
                </Box>
              </Flex>
            ) : (
              <Flex as="form" onSubmit={handleSubmit} direction="column" gap={6}>
                <Input placeholder="Numele tău" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required {...inputStyles} />
                <Input placeholder="Adresa de email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required {...inputStyles} />
                <Textarea placeholder="Mesajul tău..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} required resize="none" {...inputStyles} />
                <Button
                  type="submit"
                  bg="transparent"
                  border="1px solid"
                  borderColor="gray.500"
                  color="gray.300"
                  fontSize="xs"
                  letterSpacing="0.15em"
                  textTransform="uppercase"
                  borderRadius="0"
                  py={6}
                  _hover={{ borderColor: 'white', color: 'white' }}
                  transition="all 0.2s"
                  mt={2}
                >
                  Trimite mesajul
                </Button>
              </Flex>
            )}
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  )
}
