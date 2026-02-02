import { space } from '@/app/fonts';

type FooterProps = {
  variant?: 'full' | 'minimal';
};

const Footer = ({ variant = 'full' }: FooterProps) => {

  const socialLinks = [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com',
      path: 'M4.98 3.5C4.98 4.88 3.85 6 2.48 6S0 4.88 0 3.5 1.11 1 2.48 1s2.5 1.12 2.5 2.5ZM.5 8h4v13h-4V8Zm7 0h3.8v1.8h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.3c0-1.26-.02-2.88-1.76-2.88-1.76 0-2.03 1.37-2.03 2.79V21h-4V8Z',
    },
    {
      label: 'X',
      href: 'https://x.com',
      path: 'M18.2 2H21l-6.4 7.3L22 22h-6.2l-4.9-6.4L4.9 22H2l6.9-7.9L2 2h6.3l4.5 5.8L18.2 2Zm-1.1 18h1.7L7 3.9H5.2l11.9 16.1Z',
    },
    {
      label: 'GitHub',
      href: 'https://github.com',
      path: 'M12 .5C5.6.5.5 5.6.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2.2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.9 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.3.8 1 .8 2.1v3.1c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.6 18.4.5 12 .5Z',
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com',
      path: 'M7 2.5h10A4.5 4.5 0 0 1 21.5 7v10A4.5 4.5 0 0 1 17 21.5H7A4.5 4.5 0 0 1 2.5 17V7A4.5 4.5 0 0 1 7 2.5Zm0 2A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5h10a2.5 2.5 0 0 0 2.5-2.5V7A2.5 2.5 0 0 0 17 4.5H7Zm5 3.5A5 5 0 1 1 7 13a5 5 0 0 1 5-5Zm0 2a3 3 0 1 0 3 3 3 3 0 0 0-3-3Zm5.5-3.9a1.1 1.1 0 1 1-1.1-1.1 1.1 1.1 0 0 1 1.1 1.1Z',
    },
  ];

  const footerProductLinks = [
    { label: 'Features', href: '#product' },
    { label: 'Workflow', href: '#workflow' },
    { label: 'Templates', href: '#templates' },
    { label: 'Pricing', href: '#pricing' },
  ];

  const footerCompanyLinks = [
    { label: 'About', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
    { label: 'Contact', href: '#' },
  ];

  const footerLegalLinks = [
    { label: 'Terms', href: '#' },
    { label: 'Privacy', href: '#' },
    { label: 'Cookies', href: '#' },
    { label: 'Security', href: '#' },
  ];

  if (variant === 'minimal') {
    return (
      <footer className='mt-16 bg-[#0a0f14] py-8 text-xs text-white/50'>
        <div className='mx-auto flex max-w-6xl flex-col gap-3 px-6 text-center md:flex-row md:items-center md:justify-between md:text-left'>
          <p>© 2026 careerIDream. All rights reserved.</p>
          <div className='flex flex-wrap justify-center gap-4 md:justify-end'>
            {footerLegalLinks.map((link) => (
              <a key={link.label} className='hover:text-white' href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className='mt-16 bg-[#0a0f14] py-12 text-sm text-white/60'>
      <div className='mx-auto max-w-6xl px-6'>
        <div className='grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]'>
          <div className='space-y-4'>
            <div>
              <p className={`${space.className} text-lg text-white`}>
                careerIDream
              </p>
              <p className='text-xs text-white/50'>
                AI-driven job application studio
              </p>
            </div>
            <p className='text-sm text-white/60'>
              Build resumes and cover letters that are aligned with the roles
              you want—faster, smarter, and more confident.
            </p>
            <div className='flex items-center gap-3'>
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  className='rounded-full border border-white/15 p-2 text-white/70 transition hover:border-white/40 hover:text-white'
                  href={link.href}
                  aria-label={link.label}
                >
                  <svg
                    viewBox='0 0 24 24'
                    className='h-4 w-4'
                    fill='currentColor'
                    aria-hidden='true'
                  >
                    <path d={link.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          <div className='space-y-3'>
            <p className='text-xs uppercase tracking-[0.2em] text-white/40'>
              Product
            </p>
            <div className='flex flex-col gap-2 text-sm'>
              {footerProductLinks.map((link) => (
                <a
                  key={link.label}
                  className='hover:text-white'
                  href={link.href}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className='space-y-3'>
            <p className='text-xs uppercase tracking-[0.2em] text-white/40'>
              Company
            </p>
            <div className='flex flex-col gap-2 text-sm'>
              {footerCompanyLinks.map((link) => (
                <a
                  key={link.label}
                  className='hover:text-white'
                  href={link.href}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className='space-y-3'>
            <p className='text-xs uppercase tracking-[0.2em] text-white/40'>
              Office
            </p>
            <div className='text-sm text-white/70'>
              <p>careerIDream HQ</p>
              <p>748 Market Street</p>
              <p>San Francisco, CA 94103</p>
              <p className='mt-3 text-xs text-white/50'>
                hello@careeridream.ai
              </p>
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-4  border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between'>
          <p>© 2026 careerIDream. All rights reserved.</p>
          <div className='flex flex-wrap gap-4'>
            {footerLegalLinks.map((link) => (
              <a key={link.label} className='hover:text-white' href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
