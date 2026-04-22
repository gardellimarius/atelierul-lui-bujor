import { Flex } from '@chakra-ui/react'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import CategoriesSection from '../components/CategoriesSection'
import BestsellerSection from '../components/BestsellerSection'
import ContactSection from '../components/ContactSection'
import LocationSection from '../components/LocationSection'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'

export default function HomePage() {
  return (
    <PageTransition>
      <Flex direction="column" minH="100vh">
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <BestsellerSection />
      <ContactSection />
      <LocationSection />
      <Footer />
      </Flex>
    </PageTransition>
  )
}
