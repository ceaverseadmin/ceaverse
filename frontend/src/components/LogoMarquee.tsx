const logos = [
  { src: '/cea-logo.png', name: 'College of Engineering and Architecture' },
  { src: '/eacsc.png', name: 'Engineering and Architecture Student Council' },
  { src: '/icpep.png', name: 'Institute of Computer Engineers of the Philippines' },
  {
    src: '/iecep.jpg',
    name: 'Institute of Electronics Engineers of the Philippines',
  },
  { src: '/pice.jpg', name: 'Philippine Institute of Civil Engineers' },
  { src: '/uapsa.jpg', name: 'United Architects of the Philippines Student Auxiliary' },
  {
    src: '/fyesa.jpg',
    name: 'Fourth Year Engineering and Architecture Student Association',
  },
  { src: '/cornerstone.jpg', name: 'The Cornerstone' },
]

export function LogoMarquee() {
  return (
    <div className="relative mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <ul className="flex w-max animate-marquee items-center hover:[animation-play-state:paused] motion-reduce:animate-none">
        {[...logos, ...logos].map((logo, index) => (
          <li
            key={`${logo.src}-${index}`}
            aria-hidden={index >= logos.length}
            className="mr-8 shrink-0"
          >
            <div className="h-20 w-20 overflow-hidden rounded-full border border-slate-200 bg-white shadow-card sm:h-24 sm:w-24">
              <img
                src={logo.src}
                alt={index < logos.length ? logo.name : ''}
                className="h-full w-full object-cover"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
