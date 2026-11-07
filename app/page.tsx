import Navbar from "@/app/home/_components/Navbar";
import Hero from "@/app/home/_components/Hero";
import FeaturedWork from "@/app/home/_components/FeaturedWork";
import Services from "@/app/home/_components/Services";
import Team from "@/app/home/_components/Team";
import Process from "@/app/home/_components/Process";
import CTA from "@/app/home/_components/CTA";
import Footer from "./home/_components/Footer";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <Hero />
      <FeaturedWork />
      <Services />
      <Team />
      <Process />
      <CTA />
      <Footer />
    </main>
  );
}