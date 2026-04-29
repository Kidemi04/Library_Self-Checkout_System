import {
  AtSymbolIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';

export default function LoginForm() {
  return (
    <form className="space-y-3">
      <div className="flex-1 rounded-card bg-surface-card px-6 pb-4 pt-8 dark:bg-dark-surface-card">
        <h1 className="mb-3 font-display text-display-md text-ink dark:text-on-dark">
          Please log in to continue.
        </h1>
        <div className="w-full">
          <div>
            <label
              className="mb-3 mt-5 block font-sans text-caption-uppercase text-muted dark:text-on-dark-soft"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <input
                className="peer block h-10 w-full rounded-btn border border-hairline bg-canvas pl-10 pr-3 font-sans text-body-md text-ink placeholder:text-muted-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:placeholder:text-on-dark-soft dark:focus-visible:ring-offset-dark-canvas"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-soft peer-focus:text-ink dark:text-on-dark-soft dark:peer-focus:text-on-dark" />
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block font-sans text-caption-uppercase text-muted dark:text-on-dark-soft"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block h-10 w-full rounded-btn border border-hairline bg-canvas pl-10 pr-3 font-sans text-body-md text-ink placeholder:text-muted-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:placeholder:text-on-dark-soft dark:focus-visible:ring-offset-dark-canvas"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                minLength={6}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-soft peer-focus:text-ink dark:text-on-dark-soft dark:peer-focus:text-on-dark" />
            </div>
          </div>
        </div>
        <Button className="mt-4 w-full">
          Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-on-primary" />
        </Button>
        <div className="flex h-8 items-end space-x-1">
          {/* Add form errors here */}
        </div>
      </div>
    </form>
  );
}
