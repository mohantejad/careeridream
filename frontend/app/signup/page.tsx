'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Link from 'next/link';

import { sora, space } from '@/app/fonts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';
const GOOGLE_REDIRECT_URI =
  process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ??
  'http://localhost:3000/auth/google';
const GOOGLE_OAUTH_URL =
  process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL ??
  `${API_BASE_URL}/auth/o/google-oauth2/?redirect_uri=${encodeURIComponent(
    GOOGLE_REDIRECT_URI
  )}`;

type SignupFormData = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  re_password: string;
};

const SignupPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'idle' | 'error' | 'success';
    message: string;
  }>({ type: 'idle', message: '' });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      re_password: '',
    },
    mode: 'onBlur',
  });

  const onSubmit: SubmitHandler<SignupFormData> = async (data) => {
    setIsSubmitting(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let message = 'Unable to create your account. Please try again.';
        try {
          const errorData = JSON.parse(errorText) as Record<string, string[]>;
          message = Object.values(errorData)[0]?.[0] ?? message;
        } catch {
          if (errorText) message = errorText;
        }
        console.error('Signup error:', response.status, errorText);
        setStatus({ type: 'error', message });
        return;
      }

      setStatus({
        type: 'success',
        message:
          'Account created! Check your email to activate your account before logging in.',
      });
      reset();
    } catch {
      setStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch(GOOGLE_OAUTH_URL, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        setStatus({
          type: 'error',
          message: 'Unable to start Google signup. Please try again.', 
        });
        return;
      }

      const data = (await response.json()) as { authorization_url?: string };
      if (!data.authorization_url) {
        setStatus({
          type: 'error',
          message: 'Google authorization URL was not returned.',
        });
        return;
      }

      window.location.href = data.authorization_url;
    } catch {
      setStatus({
        type: 'error',
        message: 'Network error. Please try again.',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={`${sora.className} min-h-screen bg-[#212223] text-white`}>
      <main className='relative overflow-hidden'>
        <div className='hero-grid absolute inset-0' />
        <div className='absolute -left-24 top-6 h-64 w-64 rounded-full bg-[#102b2a] blur-3xl' />
        <div className='absolute right-8 top-16 h-72 w-72 rounded-full bg-[#18253b] blur-3xl' />
        <div className='relative mx-auto flex min-h-[80vh] max-w-6xl flex-col px-6 pb-16 pt-8'>
          <Header showNavLinks={false} showAuthButtons={false} />
          <section className='mx-auto mt-14 w-full max-w-xl'>
            <div className='rounded-3xl border border-white/10 bg-[#0f1720]/85 p-8 shadow-2xl shadow-black/40'>
              <div className='space-y-2 text-center'>
                <p className='text-xs uppercase tracking-[0.3em] text-white/50'>
                  Get started
                </p>
                <h1 className={`${space.className} text-3xl`}>
                  Create your careerIDream account
                </h1>
                <p className='text-sm text-white/70'>
                  Use your email and we will send you a verification link.
                </p>
              </div>

              {status.type !== 'idle' ? (
                <div
                  className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
                    status.type === 'success'
                      ? 'border-[#6de5c1]/40 bg-[#6de5c1]/10 text-[#b6f6df]'
                      : 'border-[#ff7a6b]/40 bg-[#ff7a6b]/10 text-[#ffb0a8]'
                  }`}
                >
                  {status.message}
                </div>
              ) : null}

              <form className='mt-8 space-y-4' onSubmit={handleSubmit(onSubmit)}>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <label className='text-xs text-white/60' htmlFor='first_name'>
                      First name
                    </label>
                    <input
                      id='first_name'
                      type='text'
                      className='w-full rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-3 text-sm text-white/90 outline-none transition focus:border-[#6de5c1]/60'
                      placeholder='Jane'
                      autoComplete='given-name'
                      {...register('first_name', {
                        required: 'First name is required.',
                        maxLength: {
                          value: 155,
                          message: 'First name must be under 155 characters.',
                        },
                      })}
                    />
                    {errors.first_name ? (
                      <p className='text-xs text-[#ffb0a8]'>
                        {errors.first_name.message}
                      </p>
                    ) : null}
                  </div>
                  <div className='space-y-2'>
                    <label className='text-xs text-white/60' htmlFor='last_name'>
                      Last name
                    </label>
                    <input
                      id='last_name'
                      type='text'
                      className='w-full rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-3 text-sm text-white/90 outline-none transition focus:border-[#6de5c1]/60'
                      placeholder='Doe'
                      autoComplete='family-name'
                      {...register('last_name', {
                        required: 'Last name is required.',
                        maxLength: {
                          value: 155,
                          message: 'Last name must be under 155 characters.',
                        },
                      })}
                    />
                    {errors.last_name ? (
                      <p className='text-xs text-[#ffb0a8]'>
                        {errors.last_name.message}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className='space-y-2'>
                  <label className='text-xs text-white/60' htmlFor='email'>
                    Email address
                  </label>
                  <input
                    id='email'
                    type='email'
                    className='w-full rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-3 text-sm text-white/90 outline-none transition focus:border-[#6de5c1]/60'
                    placeholder='you@company.com'
                    autoComplete='email'
                    {...register('email', {
                      required: 'Email is required.',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Please enter a valid email address.',
                      },
                    })}
                  />
                  {errors.email ? (
                    <p className='text-xs text-[#ffb0a8]'>
                      {errors.email.message}
                    </p>
                  ) : null}
                </div>
                <div className='space-y-2'>
                  <label className='text-xs text-white/60' htmlFor='password'>
                    Password
                  </label>
                  <input
                    id='password'
                    type='password'
                    className='w-full rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-3 text-sm text-white/90 outline-none transition focus:border-[#6de5c1]/60'
                    placeholder='Create a secure password'
                    autoComplete='new-password'
                    {...register('password', {
                      required: 'Password is required.',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters.',
                      },
                    })}
                  />
                  {errors.password ? (
                    <p className='text-xs text-[#ffb0a8]'>
                      {errors.password.message}
                    </p>
                  ) : null}
                </div>
                <div className='space-y-2'>
                  <label className='text-xs text-white/60' htmlFor='re_password'>
                    Confirm password
                  </label>
                  <input
                    id='re_password'
                    type='password'
                    className='w-full rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-3 text-sm text-white/90 outline-none transition focus:border-[#6de5c1]/60'
                    placeholder='Re-enter your password'
                    autoComplete='new-password'
                    {...register('re_password', {
                      required: 'Please confirm your password.',
                      validate: (value) =>
                        value === watch('password') ||
                        'Passwords do not match.',
                    })}
                  />
                  {errors.re_password ? (
                    <p className='text-xs text-[#ffb0a8]'>
                      {errors.re_password.message}
                    </p>
                  ) : null}
                </div>
                <button
                  type='submit'
                  className='cursor-pointer mt-2 w-full rounded-full bg-[#6de5c1] px-6 py-3 text-sm font-semibold text-[#0c1116] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                </button>
              </form>

              <div className='my-8 flex items-center gap-4 text-xs text-white/40'>
                <span className='h-px flex-1 bg-white/10' />
                or sign up with Google
                <span className='h-px flex-1 bg-white/10' />
              </div>

              <div>
                <button
                  type='button'
                  onClick={handleGoogleSignup}
                  className='flex w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-60'
                  disabled={isGoogleLoading}
                >
                  <svg
                    aria-hidden='true'
                    className='h-4 w-4'
                    viewBox='0 0 24 24'
                  >
                    <path
                      fill='#EA4335'
                      d='M12 10.2v3.9h5.4c-.2 1.2-1.4 3.4-5.4 3.4-3.2 0-5.8-2.6-5.8-5.8S8.8 5.9 12 5.9c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.7 3.4 14.5 2.5 12 2.5 6.9 2.5 2.8 6.6 2.8 11.7S6.9 20.9 12 20.9c6.9 0 8.6-4.9 8.6-7.4 0-.5-.1-.9-.2-1.3H12Z'
                    />
                    <path
                      fill='#34A853'
                      d='M3.9 7.1 7 9.4c.8-1.9 2.7-3.2 5-3.2 1.8 0 3 .8 3.7 1.5l2.5-2.4C16.7 3.4 14.5 2.5 12 2.5c-3.5 0-6.5 2-8.1 4.6Z'
                    />
                    <path
                      fill='#FBBC05'
                      d='M12 20.9c2.3 0 4.2-.8 5.6-2l-2.7-2.2c-.7.5-1.6.8-2.9.8-2.1 0-3.9-1.4-4.6-3.4l-3.1 2.4c1.6 2.8 4.6 5 7.7 5Z'
                    />
                    <path
                      fill='#4285F4'
                      d='M20.4 12.2c0-.5-.1-.9-.2-1.3H12v3.9h5.4c-.3 1.5-1.5 2.7-2.7 3.4l2.7 2.2c1.6-1.5 2.5-3.6 2.5-6.2Z'
                    />
                  </svg>
                  {isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}
                </button>
                <p className='mt-3 text-center text-xs text-white/50'>
                  We will redirect you to Google to finish sign up.
                </p>
              </div>

              <p className='mt-6 text-center text-xs text-white/60'>
                Already have an account?{' '}
                <Link className='text-[#6de5c1] hover:text-[#a8f0d8]' href='/login'>
                  Log in
                </Link>
              </p>
              {status.type === 'success' ? (
                <p className='mt-3 text-center text-xs text-white/40'>
                  Activation link is sent via email.
                </p>
              ) : null}
            </div>
          </section>
        </div>
        <Footer variant="minimal" />
      </main>
    </div>
  );
};

export default SignupPage;
