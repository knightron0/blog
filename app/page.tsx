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
        <p>I'm currently an MSCS student at Stanford. I spent the past two summers building performant large-scale systems at <Link href="https://www.cartesia.ai/">Cartesia</Link>. I also recently wrapped up <Link href="/blog/west-lafayette">four awesome years</Link> at Purdue. </p>
        <br />
        <p>Here are a few questions that I care about these days (and hope to contribute to!):</p>
        <ul className="mt-1 ml-4 list-disc space-y-1 pl-6">
          <li>Since high-performance code is becoming cheap now, what does the future systems stack look like? Can we <Link href="https://hazyresearch.stanford.edu/blog/2026-08-05-retire-the-abstractions">retire the intermediate abstractions</Link>, keep a high-level <Link href="https://docs.pytorch.org/devlogs/compiler/2026-07-25-pytorch-a-reference-language/">spec</Link> as the source of truth, and generate optimized code? Do we need to <Link href="https://gimletlabs.ai/blog/formally-verifying-ai-generated-kernels">formally</Link> <Link href="https://www.youtube.com/watch?v=YquydxO9Gzk">verify</Link> <Link href="https://srush.github.io/lean-transformer/#System-Optimization">against</Link> <Link href="https://arxiv.org/abs/2602.22631">the spec</Link>?</li>
          <li>What does the next generation of interfaces look like? How can we make <Link href="https://www.inkandswitch.com/malleable-software/">malleable software</Link> ubiquitous? Are current efforts (<Link href="https://thinkingmachines.ai/blog/interaction-models/">one</Link> and <Link href="https://runway.com/news/research/introducing-solaris">two</Link>) steps in the right direction? What if we augment all deterministic workflows with intelligence?</li>
          <li>How can we improve <Link href="https://www.intelligence-per-watt.ai/">intelligence per dollar (or watt)</Link>? We seem to be making progress on the frontier by biting the bullet on <Link href="https://willdepue.substack.com/p/a-stargate-for-data">ridiculous orders of scaling</Link>; it is time for efficiency to follow. Does this come from <Link href="https://pytorch.org/blog/paretoq-scaling-laws-in-extremely-low-bit-llm-quantization/">better</Link> <Link href="https://arxiv.org/pdf/2502.08606">algorithms</Link>, <Link href="https://www.maartengrootendorst.com/blog/mamba/#hardware-aware-algorithm">better hardware-architecture</Link> <Link href="https://tridao.me/blog/2026/flash4/">co-design</Link>, or <Link href="https://geohot.github.io//blog/jekyll/update/2023/05/24/the-tiny-corp-raised-5M.html">cheaper compute</Link>?</li>
        </ul>
        <br />
        <p>My past work includes GPU benchmarking systems at <Link href="https://tensara.org">Tensara</Link>, research on <Link href="https://sarthakmangla.com/blog/bam/">optimizer dynamics</Link>, and self-supervised representation learning for healthcare at the <Link href="https://engineering.purdue.edu/cvirl">CVIRL</Link> and <Link href="https://engineering.purdue.edu/HeinzLab/people">Heinz</Link> labs. I also built <Link href="https://boilerclasses.com/">BoilerClasses</Link> and <Link href="https://chromewebstore.google.com/detail/tempus/bpdhbpeecmmglmkjfmigehaebpndmceh">Tempus</Link>. Even before that, I was really into <Link href="https://www.iarcs.org.in/inoi/2022/inoi2022/results_inoi2022.php#gold">competitive programming</Link> and <Link href="https://ioling.org/participants/IND">linguistics</Link>.</p>
        <br />
        <p>Outside of all this, I love a 🌿 good pesto dish, 🚗 roadtrips, minimalist design and 🔪 whodunits. I also sometimes try to <Link href="https://x.com/msarthak29/status/2097090501694619777?s=20">pick</Link> <Link href="https://x.com/msarthak29/status/2094207297673470186?s=20">up</Link> <Link href="https://x.com/msarthak29/status/2071608638821843318?s=20">my camera.</Link></p>
      </section>
      <Footer></Footer>
    </>
  )
}
