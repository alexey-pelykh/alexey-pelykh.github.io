import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import CalButton from "../components/cal-button";
import { Badge } from "../components/ui/badge";
import githubBadge from "./github-badge.svg";
import linkedinBadge from "./linkedin-badge.svg";
import profilePhoto from "./profile-photo.jpg";
import toptalBadge from "./toptal-badge.svg";

export const metadata: Metadata = {
  title: "Alexey Pelykh",
  description: "Software architect | Solving challenges | Engineer of innovation | Actualizer of crazy ideas",
  other: {
    "me": "https://mastodon.social/@alexey_pelykh",
  }
};

export default function HomePage() {
  return (
    <main className="font-sans text-base print:text-sm print:tracking-tight leading-normal print:leading-snug flex flex-col items-center justify-between px-6 py-12 md:py-16 lg:p-24 print:p-0 bg-white dark:bg-black print:bg-white">
      <div className="flex flex-col lg:flex-row max-w-6xl w-full gap-8 print:gap-4">
        <div className="hidden lg:block lg:w-1/4 flex-shrink-0 print:hidden">
          <Image
            alt="Alexey Pelykh"
            className="rounded-md max-w-lg w-full"
            src={profilePhoto}
            priority={true}
            style={{
              aspectRatio: "1",
              objectFit: "cover",
            }}
          />
          <div className="mt-4 flex flex-wrap place-content-center gap-4">
            <div>
              <CalButton />
            </div>
            <div>
              <a href="/resume.pdf" download={"Alexey Pelykh resume.pdf"}>
                <Button variant="outline" size="sm" className="h-7 px-3 py-2">
                  Get CV
                </Button>
              </a>
            </div>
            <div>
              <a href="https://github.com/alexey-pelykh" target="_blank">
                <Image
                  alt="GitHub"
                  className="rounded-md"
                  src={githubBadge}
                />
              </a>
            </div>
            <div>
              <a href="https://github.com/alexey-pelykh" target="_blank">
                <Image
                  alt="GitHub stars"
                  className="rounded-md"
                  src="https://img.shields.io/github/stars/alexey-pelykh?style=for-the-badge&labelColor=%23181717"
                  height={0}
                  width={0}
                  // Desktop: width fills container, height auto-scales (sidebar flex layout)
                  style={{ width: '100%', height: 'auto' }}
                />
              </a>
            </div>
            <div>
              <a href="https://linkedin.com/in/alexey-pelykh" target="_blank">
                <Image
                  alt="LinkedIn"
                  className="rounded-md"
                  src={linkedinBadge}
                />
              </a>
            </div>
            <div>
              <a href="https://toptal.com/resume/alexey-pelykh" target="_blank">
                <Image
                  alt="Toptal"
                  className="rounded-md"
                  src={toptalBadge}
                />
              </a>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-3/4 print:w-full">
          <div className="flex flex-col print:flex-row">
            <h1 className="text-4xl print:text-xl font-bold tracking-tight print:tracking-tighter">Alexey Pelykh</h1>
            <div className="mt-1 text-sm text-gray-500 print:hidden">
              Software&nbsp;architect&nbsp;| Solving&nbsp;challenges&nbsp;| Engineer&nbsp;of&nbsp;innovation&nbsp;| Actualizer&nbsp;of&nbsp;crazy&nbsp;ideas
            </div>
            <div className="mt-1 text-sm tracking-tighter text-black grow flex flex-row content-center hidden print:block">
              &nbsp;•&nbsp;<a href="https://linkedin.com/in/alexey-pelykh">linkedin.com/in/alexey-pelykh</a>
              &nbsp;•&nbsp;<a href="https://github.com/alexey-pelykh">github.com/alexey-pelykh</a>
              &nbsp;•&nbsp;<a href="mailto:alexey.pelykh@gmail.com">alexey.pelykh@gmail.com</a>
            </div>
          </div>
          <p className="mt-2 print:mt-1 text-gray-700 dark:text-gray-300 print:text-black">
            👋 Hello there! I&apos;m Alexey and I started my software engineering journey more than 20 years ago.
            The selected greatest and craziest adventures thus far are:
          </p>
          <ul className="mt-2 print:mt-1 text-gray-700 dark:text-gray-300 print:text-black list-disc ml-10 print:ml-5">
            <li>
              expanding the media tech frontier at Verizon Media / Yahoo Ryot Lab by building <a href="https://www.verizon.com/about/news/verizon-media-nfl-fan-experience" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">PlayAR</a>,
              Yahoo Immersive, and internal cloud rendering cluster with Unreal Engine with Pixel Streaming, SideFX Houdini, Adobe AfterEffects and Remotion;
            </li>
            <li>
              building <a href="https://clutch.co/profile/brainbean-apps" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">a software agency</a> that
              earned <a href="https://clutch.co/press-releases/recognizes-top-b2b-companies-estonia" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">a 2020 recognition award</a>;
            </li>
            <li>
              contributing <a href="https://odoo-community.org/shop?&search=CorporateHub" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">almost 100 Odoo Community modules</a> that
              help operating hundreds of service companies and getting assignment to <a href="https://github.com/orgs/OCA/teams?query=%40alexey-pelykh" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">the project steering committees</a> as a recognition;
            </li>
            <li>
              opening <a href="https://osmand.net" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">OsmAnd</a> to the iOS market and 3D maps & cartography league by delivering
              a brand-new <a href="https://github.com/osmandapp/OsmAnd-core/graphs/contributors" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">OpenGLES-based core</a> that
              got me <a href="https://en.wikipedia.org/wiki/OsmAnd" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">a Wikipedia mention</a><span className="print:hidden"> 😎</span> as OsmAnd&apos;s developer;
            </li>
            <li>
              building <a href="https://www.youtube.com/@3DSuit" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">an inertial motion capture system</a> at <a href="https://inertiallabs.com/" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">Inertial Labs</a> and
              contributing to the <a href="https://github.com/search?q=repo%3Atorvalds%2Flinux+Alexey+Pelykh&type=commits" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">Linux Kernel</a> to make it possible;
            </li>
            <li>
              expanding the AR/VR tech frontier at <a href="https://www.innalabs.com/" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">Innalabs</a> with
              MEMS-based 6DOF &ldquo;mouse&rdquo;, motion-capture VR training systems with stereo vision;
            </li>
            <li>
              authoring a MIPS III R5900-based &ldquo;<a href="https://en.wikipedia.org/wiki/Emotion_Engine" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">Emotion Engine</a>&rdquo;
              CPU emulator for the company&apos;s security research enabling it to detect and verify the signatures and watermarks on the bootloader.
            </li>
          </ul>
          <p className="mt-2 print:mt-1 text-gray-700 dark:text-gray-300 print:text-black">
            My passion lies in the hands-on exploration of software engineering frontiers.
          </p>
          <p className="mt-4 font-semibold text-gray-700 dark:text-gray-300 print:hidden">
            <span className="italic">Challenges welcomed. Complexity conquered.</span> 🚀
          </p>
          {/* Mobile CTAs - visible on mobile and tablet only.
              min-h-[44px] ensures WCAG touch target compliance (44px minimum),
              overriding the desktop size="sm" (28px) used in sidebar. */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 lg:hidden print:hidden">
            <CalButton className="min-h-[44px]" />
            <a href="/resume.pdf" download={"Alexey Pelykh resume.pdf"}>
              <Button variant="outline" className="w-full sm:w-auto min-h-[44px] px-4">
                Get CV
              </Button>
            </a>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 lg:hidden print:hidden">
            <a href="https://github.com/alexey-pelykh" target="_blank" className="min-h-[44px] flex items-center">
              <Image
                alt="GitHub"
                className="rounded-md"
                src={githubBadge}
              />
            </a>
            <a href="https://github.com/alexey-pelykh" target="_blank" className="min-h-[44px] flex items-center">
              <Image
                alt="GitHub stars"
                className="rounded-md"
                src="https://img.shields.io/github/stars/alexey-pelykh?style=for-the-badge&labelColor=%23181717"
                height={0}
                width={0}
                // Mobile: height constrained to match sibling badges, width auto-scales (horizontal row)
                style={{ width: 'auto', height: '28px' }}
              />
            </a>
            <a href="https://linkedin.com/in/alexey-pelykh" target="_blank" className="min-h-[44px] flex items-center">
              <Image
                alt="LinkedIn"
                className="rounded-md"
                src={linkedinBadge}
              />
            </a>
            <a href="https://toptal.com/resume/alexey-pelykh" target="_blank" className="min-h-[44px] flex items-center">
              <Image
                alt="Toptal"
                className="rounded-md"
                src={toptalBadge}
              />
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-6xl w-full mt-4 print:mt-2">
        <div className="flex flex-row gap-2">
          <h2 className="text-xl print:text-base font-bold">Top Skills</h2>
          {
            [
              "Software Architecture",
              "Tech Leadership",
              "Software Engineering",
              "Research & Development",
            ]
              .map((value) => (
                <Badge key={value} variant="outline" className="text-sm print:text-xs tracking-tight print:tracking-tighter self-center">{value}</Badge>
              ))
          }
        </div>
        <div className="grid grid-flow-row grid-cols-1 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-1 gap-4 md:gap-1 print:gap-0">
          {
            Object.entries({
              "Platforms": [
                "Linux",
                "Embedded Linux",
                "Android",
                "iOS",
                "Windows",
                "MacOS",
                "AWS",
                "GCP",
                "Docker",
                "Kubernetes"
              ],
              "Languages": [
                "C++",
                "Python",
                "Java",
                "Kotlin",
                "JavaScript",
                "TypeScript",
                "Objective-C",
                "Swift",
              ],
              "Frameworks": [
                "Qt",
                "Flask",
                "Django",
                "Android",
                "iOS",
                "Unreal Engine",
                "React.js",
                "React Native",
                "Next.js",
                "NestJS",
              ],
              "Libraries & APIs": [
                "Standard Template Library (STL)",
                "Boost",
                "OpenGL",
                "OpenGLES",
                "Vulkan",
                "Redux",
                "Redux-Saga",
              ],
              "Tools": [
                "Visual Studio",
                "IntelliJ IDEA",
                "GitHub",
                "Jira",
                "CMake",
                "Bazel",
                "Gradle",
                "NPM",
              ],
              "Paradigms": [
                "Reactive Programming",
                "Object-Oriented Programming",
                "Microservices",
                "Serverless",
                "CI/CD",
                "IaC",
              ]
            })
              .map(([category, skills]) => (
                <div key={category} className="mt-1 print:mt-1 text-sm print:text-xs flex flex-col print:flex-row gap-1 print:tracking-tighter">
                  <div className="font-semibold">{category}<span className="hidden print:inline-block">:</span></div>
                  <div className="tracking-tight print:tracking-tighter">
                    {
                      skills
                        .map((value, index) => [
                          (<span key={`skill-${index}`} className="whitespace-nowrap">{value}</span>),
                          (<Fragment key={`dot-${index}`}> •&nbsp;</Fragment>),
                        ])
                        .flat()
                        .slice(0, -1)
                    }
                  </div>
                </div>
              ))
          }
        </div>
      </div>
      <div className="max-w-6xl w-full mt-4 print:mt-2">
        <h2 className="text-xl print:text-base font-bold">
          Notable <Link href="/open-source-contributions" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">Open-Source Contributions</Link>
        </h2>
        <div className="mt-1 columns-1 md:columns-2">
          <ul className="ml-10 print:ml-5 list-disc">
            <li><a href="https://pcre4j.org/" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">PCRE4J</a> &ndash; a Perl-compatible regular expressions for Java;</li>
            <li><a href="https://pptr-capture.org/" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">Puppeteer-Capture</a> &ndash; a pixel-perfect stream capture for Chromium;</li>
            <li><a href="https://github.com/search?q=repo%3Atorvalds%2Flinux+Alexey+Pelykh&type=commits" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">Linux Kernel</a> &ndash; a 1MBaud+ serial port speed support for <a href="https://en.wikipedia.org/wiki/OMAP" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">OMAP</a> platform;</li>
            <li><a href="https://github.com/pylint-dev/pylint/pulls?q=is%3Apr+author%3Aalexey-pelykh" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">Pylint</a> &ndash; Implicit Namespace Packages (PEP 420) support;</li>
            <li><a href="https://github.com/google/yapf/pulls?q=is%3Apr+author%3Aalexey-pelykh" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">Google Yapf</a> &ndash; fixes for lambdas, dictionaries and argument lists;</li>
            <li><a href="https://github.com/google/filament/pulls?q=is%3Apr+author%3Aalexey-pelykh" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">Google Filament</a> &ndash; GLTF extras support, build improvements;</li>
            <li><a href="https://github.com/apache/commons-collections/pulls?q=is%3Apr+author%3Aalexey-pelykh" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">Apache Commons Collections</a> &ndash; Cartesian product iterator;</li>
            <li><a href="https://github.com/OCA/project/pulls?q=is%3Apr+author%3Aalexey-pelykh" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">OCA&apos;s Project</a> &ndash; project roles support and related modules;</li>
            <li><a href="https://github.com/OCA/timesheet/pulls?q=is%3Apr+author%3Aalexey-pelykh" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">OCA&apos;s Timesheet</a> &ndash; utilization analysis and report, granular billing control, timesheet approval strategies;</li>
            <li><a href="https://github.com/OCA/connector-jira/pulls?q=is%3Apr+author%3Aalexey-pelykh" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">OCA&apos;s Jira Connector</a> &ndash; Tempo Timesheets support;</li>
            <li><a href="https://github.com/OCA/hr/pulls?q=is%3Apr+author%3Aalexey-pelykh" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">OCA&apos;s HR</a> &ndash; advanced accrual time-off module, multi-currency contracts;</li>
            <li><a href="https://github.com/OCA/bank-statement-import/pulls?q=is%3Apr+author%3Aalexey-pelykh" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline">OCA&apos;s Bank Statements</a> &ndash; online bank statements support for PayPal, Wise.com, Braintree, statements auto-split module, etc;</li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl w-full mt-4 print:mt-2">
        <div className="w-full">
          <h2 className="text-xl print:text-base font-bold">Recent Professional Experience</h2>
        </div>
        <div className="mt-2 print:mt-1 flex flex-col md:flex-row print:flex-row w-full gap-2 md:gap-0 print:gap-0">
          <div className="w-full md:w-1/3 print:w-2/5">
            <h3 className="text-base print:text-sm font-semibold">Senior Full-Stack Software Engineer</h3>
            <p className="text-sm print:text-xs">Yahoo! (Jan 2019 &ndash; Dec 2023)</p>
            <p className="text-sm text-gray-500 print:hidden">Los Angeles, CA (remote from Europe)</p>
          </div>
          <div className="w-full md:w-2/3 print:w-3/5 print:text-sm">
            Engineered immersive content production-to-presentation software serving millions of unique users daily.
          </div>
        </div>
        <div className="mt-4 md:mt-2 print:mt-1 flex flex-col md:flex-row print:flex-row w-full gap-2 md:gap-0 print:gap-0">
          <div className="w-full md:w-1/3 print:w-2/5">
            <h3 className="text-base print:text-sm font-semibold">Chief Technology Officer</h3>
            <p className="text-sm print:text-xs">Brainbean Apps (Mar 2015 &ndash; Dec 2018)</p>
            <p className="text-sm text-gray-500 print:hidden">Estonia (hybrid from Europe)</p>
          </div>
          <div className="w-full md:w-2/3 print:w-3/5 print:text-sm">
            Scaled the company from a one-man-band startup to a team of 50 with a turnover of &euro;1.6M.
          </div>
        </div>
        <div className="mt-4 md:mt-2 print:mt-1 flex flex-col md:flex-row print:flex-row w-full gap-2 md:gap-0 print:gap-0">
          <div className="w-full md:w-1/3 print:w-2/5">
            <h3 className="text-base print:text-sm font-semibold">Lead Mobile Software Engineer</h3>
            <p className="text-sm print:text-xs">OsmAnd (Nov 2012 &ndash; May 2015)</p>
            <p className="text-sm text-gray-500 print:hidden">Netherlands (remote from Europe)</p>
          </div>
          <div className="w-full md:w-2/3 print:w-3/5 print:text-sm">
            Paved the way to the iOS users, allowing the product to have an extra 240k MAU today.
          </div>
        </div>
      </div>
      <div className="max-w-6xl w-full mt-4 print:hidden">
        <h2 className="text-xl font-bold">Recent Feedback</h2>
        <div className="mt-2 w-full flex flex-col md:flex-row gap-6 md:gap-8 justify-center">
          <div className="flex flex-col shrink">
            <div className="self-start text-sm italic leading-tight">
              <div>
                &hellip; is a remarkably versatile engineer &hellip;
              </div>
              <div>
                &hellip; holds the rare distinction of finding a neat solution to every problem &hellip;
              </div>
              <div>
                &hellip; how profoundly kind he is and how he elevates any team to reach beyond &hellip;
              </div>
            </div>
            <div className="self-end mt-2 lg:mt-0">
              <a href="https://www.linkedin.com/in/seanemccall/" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline min-h-[44px] lg:min-h-0 inline-flex items-center">
                Sean McCall, Product Mgmt Director @ Yahoo
              </a>
            </div>
          </div>
          <div className="flex flex-col shrink">
            <div className="self-start text-sm italic leading-tight">
              <div>
                &hellip; his technical knowledge and perspective were invaluable at Yahoo &hellip;
              </div>
              <div>
                &hellip; has a deep and lively knowledge of almost every software stack &hellip;
              </div>
              <div>
                &hellip; without any complaint he was always willing to dive into &hellip;
              </div>
            </div>
            <div className="self-end mt-2 lg:mt-0">
              <a href="https://www.linkedin.com/in/benjamin-j-skinner/" target="_blank" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline min-h-[44px] lg:min-h-0 inline-flex items-center">
                Ben Skinner, Director of Product & Engineering @ Yahoo
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl w-full mt-4 print:hidden">
        <div className="flex flex-row gap-1">
          <h2 className="text-xl font-bold">CliftonStrengths&reg; by Gallup</h2>
          <div className="text-base grow self-center">
            (
            <a href="/clifton-strengths.pdf" className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline" download={"Alexey Pelykh CliftonStrengths.pdf"}>
              report
            </a>
            )
          </div>
        </div>
        <div className="flex flex-row justify-center">
          {
            [
              "Achiever",
              "Strategic",
              "Futuristic",
              "Deliberative",
              "Intellection",
            ]
              .map((value, index) => [
                (<span key={value} className="text-lg font-medium whitespace-nowrap">{value}</span>),
                (<span key={`dot-${index}`} className="pr-2 pl-2">•</span>),
              ])
              .flat()
              .slice(0, -1)
          }
        </div>
      </div>
      <div className="max-w-6xl w-full mt-4 print:mt-2">
        <div className="flex flex-row gap-1">
          <h2 className="text-xl print:text-base font-bold">Education</h2>
          <div className="text-base print:text-sm print:tracking-tighter grow self-center">
            @ Applied&nbsp;Mathematics faculty @ National&nbsp;Technical&nbsp;University&nbsp;of&nbsp;Ukraine &ldquo;Kyiv&nbsp;Polytechnic&nbsp;Institute&rdquo;
          </div>
        </div>
        <div className="mt-1 w-full flex flex-col md:flex-row print:flex-row gap-4 md:gap-0 print:gap-0">
          <div className="w-full md:w-1/2 print:w-1/2">
            <h3 className="text-base print:text-sm"><span className="font-semibold">Master&apos;s&nbsp;degree</span> in Specialized&nbsp;Computer&nbsp;Systems</h3>
            <p className="text-sm print:text-xs">(2009 &ndash; 2011)</p>
          </div>
          <div className="w-full md:w-1/2 print:w-1/2">
            <h3 className="text-base print:text-sm"><span className="font-semibold">Bachelor&apos;s&nbsp;degree</span> in Computer&nbsp;Engineering</h3>
            <p className="text-sm print:text-xs">(2005 &ndash; 2009)</p>
          </div>
        </div>
      </div>
    </main>
  );
}
