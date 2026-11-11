import { Cormorant_Garamond } from 'next/font/google'
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
        <p>I'm currently <Link href="/blog/problems-im-thinking-about">exploring</Link> at Stanford. I spent the past two summers building performant large-scale systems at <Link href="https://www.cartesia.ai/">Cartesia</Link>. I recently wrapped up <Link href="/blog/west-lafayette">four awesome years</Link> at Purdue.</p>
        <br />
        <p>My past work includes GPU benchmarking systems at <Link href="https://tensara.org">Tensara</Link>, research on <Link href="https://sarthakmangla.com/blog/bam/">optimizer dynamics</Link>, self-supervised representation learning at the <Link href="https://engineering.purdue.edu/cvirl">CVIRL</Link> and <Link href="https://engineering.purdue.edu/HeinzLab/people">Heinz</Link> labs, and <Link href="https://boilerclasses.com/">BoilerClasses</Link>. </p>
        <br />
        <p>I grew up playing cricket and practicing karate in Delhi. I spent most of my time in high-school on <Link href="https://www.iarcs.org.in/inoi/2022/inoi2022/results_inoi2022.php#gold">competitive programming</Link> and <Link href="https://ioling.org/participants/IND">linguistics</Link>. Outside all of this, I love a good whodunit, listen to way too&nbsp;much&nbsp;<Link href="https://open.spotify.com/artist/56ZTgzPBDge0OvCGgMO3OY?si=CmShmmRqT5usCuxf4Xr3Yw">Beach House</Link>, and <Link href="/photos">pick up my camera</Link> sometimes.</p>  
      </section>
      <Footer></Footer>
    </>
  )
}
