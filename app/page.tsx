import { Cormorant_Garamond } from 'next/font/google'
import Image from 'next/image'
import Link from "next/link";
import Footer from './components/footer';
import { baseUrl } from './sitemap';

export const metadata = {
  alternates: { canonical: baseUrl },
};

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: "400"
})

export default function Page() {
  return (
    <>
      <section className='mb-10'>
        <div className="text-2xl md:text-3xl font-semibold pb-5" style={{ fontFamily: cormorantGaramond.style.fontFamily }}>Sarthak Mangla</div>
        <p>I study Computer Science at Stanford. I spent the past two summers building performant large-scale systems at <Link href="https://www.cartesia.ai/">Cartesia</Link>. I also recently wrapped up <Link href="/blog/west-lafayette">four awesome years</Link> at Purdue. </p>
        <br />
        <p>Currently, I spend most of my time thinking about what will be important to </p>
        <br />
        <p>My past work includes GPU benchmarking systems at <Link href="https://tensara.org">Tensara</Link>, research on <Link href="https://sarthakmangla.com/blog/bam/">optimizer dynamics</Link>, and self-supervised representation learning for healthcare at the <Link href="https://engineering.purdue.edu/cvirl">CVIRL</Link> and <Link href="https://engineering.purdue.edu/HeinzLab/people">Heinz</Link> labs. I also built <Link href="https://boilerclasses.com/">BoilerClasses</Link> and <Link href="https://chromewebstore.google.com/detail/tempus/bpdhbpeecmmglmkjfmigehaebpndmceh">Tempus</Link>. Even before that, I was really into <Link href="https://www.iarcs.org.in/inoi/2022/inoi2022/results_inoi2022.php#gold">competitive programming</Link> and <Link href="https://ioling.org/participants/IND">linguistics</Link>.</p>
        <br />
        <p>Outside of all this, I love a 🌿 good pesto dish, 🚗 roadtrips, minimalist design and 🔪 whodunits. I also sometimes try to <Link href="https://x.com/msarthak29/status/2097090501694619777?s=20">pick</Link> <Link href="https://x.com/msarthak29/status/2094207297673470186?s=20">up</Link> <Link href="https://x.com/msarthak29/status/2071608638821843318?s=20">my camera.</Link></p>
      </section>
      <Footer></Footer>
    </>
  )
}
