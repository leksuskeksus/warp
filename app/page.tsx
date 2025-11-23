import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

const includedFeatures = [
  "W-2 payroll in 3 states",
  "Health and 401k benefits",
  "1:1 customer support",
];

const otherFeatures = [
  "US contractors in all 50 states",
  "Global contractors in 150+ countries",
  "Full compliance in 3 states",
];

export default function Home() {
  const seats = 5;
  const seatPrice = 35;
  const planPrice = 79;
  const seatTotal = seats * seatPrice;
  const monthlyTotal = planPrice + seatTotal;

  return (
    <div className="scrollbar-hide bg-bg inset-0 flex h-screen fixed overflow-y-scroll text-g8 force-light">
      {/* Sidebar */}
      <div className="max-tablet:hidden sticky inset-0 right-auto flex h-screen min-w-[250px] flex-col justify-between p-[20px]">
        <div>
          <Image
            src="/warp-logo@512w.webp"
            alt="Warp logo"
            className="h-[30px] w-auto"
            width={0}
            height={0}
            sizes="100vw"
            priority
          />
        </div>
        <div className="flex flex-col gap-[15px]">
          <div className="flex items-center gap-[7px]">
            <div className="bg-g96 outline outline-border relative size-[30px] flex-none overflow-clip rounded-full">
              {/* Placeholder avatar */}
            </div>
            <div className="flex flex-1 flex-col">
              <p className="text-caption line-clamp-1 text-left">Alexey Primechaev</p>
              <p className="text-tag text-fg3 line-clamp-1 text-left font-medium">
                primall96@gmail.com
              </p>
            </div>
          </div>
          <div className="text-caption text-fg3 transition-default *:hover:text-fg flex gap-[10px] has-[a]:underline">
            <a href="/auth/logout">Log Out</a>
            <a target="_blank" href="https://www.joinwarp.com/privacy">
              Privacy
            </a>
            <a target="_blank" href="https://www.joinwarp.com/terms">
              Terms
            </a>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-bg border-border relative box-border flex size-full flex-col items-center overflow-y-scroll border">
        <div className="flex w-full flex-col gap-[30px] px-[70px] pb-[66svh] pt-[100px] max-tablet:px-[30px] max-mobile-h:px-[15px] items-center">
          <div className="flex flex-col w-full pb-[30svh] [div[data-slot='vtab-layout']_&]:pb-0 max-w-[700px] gap-[50px]">
            <div className="flex gap-[50px] max-tablet:flex-col">
              {/* Left column - Main form */}
              <section className="group/checkout flex-1 flex flex-col gap-[20px]">
                <div className="flex-1 flex flex-col gap-[20px]">
                  <h1 className="mb-[20px]">Start using Warp</h1>

                  <div className="flex flex-col gap-[30px] text-body-1">
                    {/* Plan price */}
                    <div className="flex gap-[10px]">
                      <span className="flex-1">Warp Pro</span>
                      <div className="flex-1 h-fit flex justify-end relative">
                        <span>${planPrice.toFixed(2)}</span>
                        <span className="absolute top-full right-0 text-tag font-medium text-fg3">
                          per month
                        </span>
                      </div>
                    </div>

                    {/* Team size input */}
                    <div className="flex gap-[10px]">
                      <div className="flex-1 flex flex-col">
                        <label className="mb-[7px]" htmlFor="seats">
                          Team Size
                        </label>
                        <div className="flex flex-col">
                          <div className="relative">
                            <Input
                              id="seats"
                              type="number"
                              min={1}
                              max={50}
                              defaultValue={seats}
                              placeholder="Enter a number"
                            />
                          </div>
                          <p className="text-caption pb-[5px] pt-[5px] text-fg-error empty:hidden"></p>
                        </div>
                        <span className="text-tag font-book text-fg3 mt-[5px] whitespace-pre-line">
                          ${seatPrice.toFixed(2)} per month per seat
                        </span>
                      </div>
                      <div className="flex-1 h-fit flex justify-end relative">
                        <span className="text-right">${seatTotal.toFixed(2)}</span>
                        <span className="absolute top-full right-0 text-tag font-medium text-fg3">
                          per month
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="h-[1px] bg-divider" />
                </div>

                {/* Totals */}
                <div className="flex-1 flex flex-col gap-[20px]" data-slot="totals">
                  <div className="flex flex-col gap-[10px] text-caption text-fg3">
                    <div className="flex gap-[10px]">
                      <span className="flex-1">Subtotal (monthly)</span>
                      <span>${monthlyTotal.toFixed(2)}</span>
                    </div>
                    <button className="text-left underline hover:text-fg">
                      Apply Promo Code
                    </button>
                  </div>
                  <div className="flex gap-[10px] text-body-1 font-semibold p-[15px] -mx-[15px] bg-bg2 rounded-md max-tablet:mx-0">
                    <span className="flex-1">Due Today</span>
                    <span>${monthlyTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Loading placeholder (hidden when totals are present) */}
                <div className="flex-col gap-[20px] animate-pulse hidden group-[&:not(:has([data-slot='totals']))]/checkout:flex">
                  <div className="flex flex-col gap-[10px] text-caption">
                    <div className="flex justify-between">
                      <div className="w-1/2 bg-loading rounded-sm">&nbsp;</div>
                      <div className="w-1/5 bg-loading rounded-sm">&nbsp;</div>
                    </div>
                    <div className="flex justify-between">
                      <div className="w-1/2 bg-loading rounded-sm">&nbsp;</div>
                      <div className="w-1/5 bg-loading rounded-sm">&nbsp;</div>
                    </div>
                  </div>
                  <div className="-mx-[15px] p-[15px] text-body-1 bg-bg2 rounded-md max-tablet:mx-0">
                    &nbsp;
                  </div>
                </div>
              </section>

              {/* Right column - Features */}
              <aside className="basis-1/3 bg-bg2 flex flex-col gap-[20px] p-[20px] rounded-md">
                <span className="text-caption font-medium text-fg2">
                  Warp Pro includes:
                </span>
                <div className="flex flex-col gap-[15px] max-tablet:gap-[10px]">
                  {includedFeatures.map((feature) => (
                    <div className="flex gap-[7px]" key={feature}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="var(--fg-success)"
                        stroke="none"
                        className="tabler-icon tabler-icon-circle-check-filled mt-[2px]"
                      >
                        <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" />
                      </svg>
                      <span className="text-body-2 flex-1 max-tablet:text-caption">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="h-[1px] bg-divider" />
                <div className="text-tag font-book text-fg3 leading-relaxed flex flex-col space-y-[5px]">
                  <span>Other features:</span>
                  <ul className="list-disc list-outside pl-[1.5em]">
                    {otherFeatures.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col text-tag font-book text-fg3 leading-relaxed space-y-[5px]">
                  <span>
                    Need to make changes?{" "}
                    <button className="cursor-pointer font-inherit tracking-inherit underline transition-default hover:opacity-60">
                      Change plan
                    </button>
                  </span>
                  <span>
                    Looking to compare plans?{" "}
                    <a
                      className="underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://joinwarp.com/demo"
                    >
                      See a Demo ↗
                    </a>
                  </span>
                </div>
              </aside>
            </div>

            <div className="h-[1px] bg-divider" />

            <div className="flex flex-col gap-[30px]">
              <Button disabled>Continue to payment</Button>
              <p className="text-caption text-fg3">
                By signing up, you agree to our{" "}
                <a
                  href="https://www.joinwarp.com/terms"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline"
                >
                  Terms of Service ↗
                </a>{" "}
                and{" "}
                <a
                  href="https://www.joinwarp.com/privacy"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline"
                >
                  Privacy Policy ↗
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial sidebar (right) */}
      <div className="max-laptop:hidden pointer-events-none sticky inset-0 left-auto flex w-1/2 max-w-[350px] flex-col">
        <div className="relative flex flex-col p-[20px] pb-0">
          <div className="bg-bg2 relative aspect-3/4 overflow-clip rounded-md">
            <div className="absolute inset-0 flex items-center justify-center text-caption text-fg3">
              Customer testimonial
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-[20px] p-[20px] py-[30px]">
          <p className="text-h4 font-medium text-fg">
            "Warp gives me peace of mind, I don&apos;t have to worry about
            compliance or tax notices. I&apos;ve gotten back so much time from not
            having to worry about different state tax agencies or changes in
            regulations."
          </p>
          <div className="flex items-center gap-[10px]">
            <div className="size-[40px] rounded-full bg-divider" />
            <div className="flex flex-col">
              <div className="text-caption font-semibold text-fg">Rahul Sonwalkar</div>
              <div className="text-tag text-fg3">Founder, Julius</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
