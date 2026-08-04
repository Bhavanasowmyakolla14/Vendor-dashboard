import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Occasions from '../components/Occasions';
import FeaturedVendors from '../components/FeaturedVendors';
import Stats from '../components/Stats';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import AppCTA from '../components/AppCTA';
import Footer from '../components/Footer';
import BudgetPlannerCTA from '../components/BudgetPlannerCTA';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Stats />
      <Services />
      <FeaturedVendors />
      <Occasions />
      <BudgetPlannerCTA />
      <HowItWorks />
      <Testimonials />
      <AppCTA />
      <Footer />
    </>
  );
}
