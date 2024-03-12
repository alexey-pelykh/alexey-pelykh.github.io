import { Badge } from "@/components/ui/badge";
import CalButton from "../components/cal-button";

export default function Home() {
  const thisYear = new Date().getFullYear();

  return (
    <main className="font-sans flex flex-col items-center justify-between p-24 print:p-0 bg-white dark:bg-black print:bg-white">
      <div className="flex max-w-6xl w-full gap-8 print:gap-4">
        <div className="w-1/4 print:hidden">
          <img
            alt="Alexey Pelykh"
            className="rounded-md max-w-lg w-full"
            src="/photo.jpg"
            style={{
              aspectRatio: "1",
              objectFit: "cover",
            }}
          />
        </div>
        <div className="w-3/4 print:w-full">
          <h1 className="text-4xl print:text-xl font-bold">Alexey Pelykh</h1>
          <p className="mt-1 text-sm print:text-xs text-gray-500 print:hidden">
            Software architect | Solving challenges | Engineer of innovation | Actualizer of crazy ideas
          </p>
          <p className="mt-1 text-sm text-gray-500 print:text-black hidden print:block">
            <a href="https://www.linkedin.com/in/alexey-pelykh">https://www.linkedin.com/in/alexey-pelykh</a>
            &nbsp;•&nbsp;<a href="https://github.com/alexey-pelykh">https://github.com/alexey-pelykh</a>
            &nbsp;•&nbsp;<a href="mailto:alexey.pelykh@gmail.com">alexey.pelykh@gmail.com</a>
          </p>
          <p className="mt-4 text-gray-700 dark:text-gray-300 print:text-black">
            Alexey is a full-stack generalist and software industry expert, known for his exceptional issue-cracking
            skills and passion for creating innovative software. He excels in transforming complex challenges into
            tangible solutions, driven by a curiosity and commitment to innovation. Alexey thrives in collaborative
            environments, focusing on challenging software projects. His approach is centered on delivering impactful
            and practical results.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 print:hidden">
            <div>
              <CalButton />
            </div>
            <div>
              <a href="https://github.com/alexey-pelykh">
                <img
                  alt="GitHub"
                  className="rounded-md"
                  src="/github.svg"
                />
              </a>
            </div>
            <div>
              <a href="https://github.com/alexey-pelykh">
                <img
                  alt="GitHub stars"
                  className="rounded-md"
                  src="https://img.shields.io/github/stars/alexey-pelykh?style=for-the-badge&labelColor=%23181717"
                />
              </a>
            </div>
            <div>
              <a href="https://www.linkedin.com/in/alexey-pelykh">
                <img
                  alt="LinkedIn"
                  className="rounded-md"
                  src="/linkedin.svg"
                />
              </a>
            </div>
            <div>
              <a href="https://toptal.com/resume/alexey-pelykh">
                <img
                  alt="Toptal"
                  className="rounded-md"
                  src="/toptal.svg"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="flex max-w-4xl w-full gap-8 print:gap-4">
        <div className="w-full">
          <div className="mt-6 print:mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="text-md print:text-sm">Software Architecture</Badge>
            <Badge variant="outline" className="text-md print:text-sm">Tech Leadership</Badge>
            <Badge variant="outline" className="text-md print:text-sm">Full-stack Development</Badge>
            <Badge variant="outline" className="text-md print:text-sm">Back-end Development</Badge>
            <Badge variant="outline" className="text-md print:text-sm">Cloud Infrastructure</Badge>
            <Badge variant="outline" className="text-md print:text-sm">Research & Development</Badge>
            <Badge variant="outline" className="text-md print:text-sm">Machine Learning</Badge>
            <Badge variant="outline" className="text-md print:text-sm">Generative AI</Badge>
          </div>
        </div>
      </div>
      <div className="flex max-w-6xl w-full gap-8 print:gap-4">
        <div className="w-1/3">
          <h2 className="mt-6 print:mt-4 text-xl print:text-lg font-bold">Recent Portfolio</h2>
          <div>
            <h3 className="mt-2 print:mt-1 font-semibold print:text-sm">Yahoo!</h3>
            <p className="print:text-xs">Yahoo Immersive ecosystem, Yahoo Sports PlayAR, Content Summarization.</p>
            <h3 className="mt-4 print:mt-2 font-semibold print:text-sm">Private Investment Fund</h3>
            <p className="print:text-xs">A knowledge bot for private investment fund powered by LLMs and advanced RAG.</p>
            <h3 className="mt-4 print:mt-2 font-semibold print:text-sm">Genius Ventures</h3>
            <p className="print:text-xs">Software development workflow for software agencies.</p>
          </div>
        </div>
        <div className="w-2/3">
          <h2 className="mt-6 print:mt-4 text-xl print:text-lg font-bold">Core Expertise</h2>
          <div className="mt-2 print:mt-1 grid grid-cols-3 gap-4 print:gap-2">
            <div>
              <h3 className="font-semibold print:font-medium print:text-sm print:tracking-tighter">Full-Stack Development</h3>
              <p className="print:text-xs">{thisYear - 2004} years</p>
            </div>
            <div>
              <h3 className="font-semibold print:font-medium print:text-sm print:tracking-tighter">Software Architecture</h3>
              <p className="print:text-xs">{thisYear - 2005} years</p>
            </div>
            <div>
              <h3 className="font-semibold print:font-medium print:text-sm print:tracking-tighter">Tech Leadership</h3>
              <p className="print:text-xs">{thisYear - 2012} years</p>
            </div>
            <div>
              <h3 className="font-semibold print:font-medium print:text-sm print:tracking-tighter">C++</h3>
              <p className="print:text-xs">{thisYear - 2004} years</p>
            </div>
            <div>
              <h3 className="font-semibold print:font-medium print:text-sm print:tracking-tighter">Typescript</h3>
              <p className="print:text-xs">{thisYear - 2015} years</p>
            </div>
            <div>
              <h3 className="font-semibold print:font-medium print:text-sm print:tracking-tighter">Python</h3>
              <p className="print:text-xs">{thisYear - 2017} years</p>
            </div>
            <div>
              <h3 className="font-semibold print:font-medium print:text-sm print:tracking-tighter">Node.js</h3>
              <p className="print:text-xs">{thisYear - 2015} years</p>
            </div>
            <div>
              <h3 className="font-semibold print:font-medium print:text-sm print:tracking-tighter">React</h3>
              <p className="print:text-xs">{thisYear - 2016} years</p>
            </div>
            <div>
              <h3 className="font-semibold print:font-medium print:text-sm print:tracking-tighter">Odoo</h3>
              <p className="print:text-xs">{thisYear - 2017} years</p>
            </div>
            <div>
              <h3 className="font-semibold print:font-medium print:text-sm print:tracking-tighter">NestJS</h3>
              <p className="print:text-xs">{thisYear - 2018} years</p>
            </div>
            <div>
              <h3 className="font-semibold print:font-medium print:text-sm print:tracking-tighter">PyTorch</h3>
              <p className="print:text-xs">{thisYear - 2020} years</p>
            </div>
            <div>
              <h3 className="font-semibold print:font-medium print:text-sm">LangChain</h3>
              <p className="print:text-xs">{thisYear - 2022} years</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl w-full">
        <div className="w-full">
          <h2 className="mt-6 print:mt-4 text-xl print:text-lg font-bold">Professional Experience</h2>
        </div>
        <div className="mt-2 print:mt-1 flex w-full">
          <div className="w-1/3">
            <h3 className="text-md print:text-sm font-semibold">Senior Full-Stack Software Engineer</h3>
            <p className="text-sm print:text-xs">Yahoo! (Jan 2019 - Dec 2023)</p>
            <p className="text-sm print:text-xs text-gray-500">Los Angeles, CA (remote)</p>
          </div>
          <ul className="w-2/3 ml-8 print:ml-4 list-disc print:text-sm">
            <li>Co-developed an SDK for Yahoo&apos;s AR experiences.</li>
            <li>Built a 3D assets pipeline for AR authoring.</li>
            <li>Developed a method to stream UnrealEngine output to AR.</li>
            <li>Improved a rendering engine and a cloud-based rendering solution.</li>
            <li>Designed and developed software for Yahoo Sports PlayAR versions 1 and 2.</li>
          </ul>
        </div>
        <div className="mt-4 print:mt-2 flex w-full">
          <div className="w-1/3">
            <h3 className="text-md print:text-sm font-semibold">Software Engineering Consultant</h3>
            <p className="text-sm print:text-xs">Genius Ventures (Jul 2022 - Oct 2022)</p>
            <p className="text-sm print:text-xs text-gray-500">Los Angeles, CA (remote)</p>
          </div>
          <ul className="w-2/3 ml-8 print:ml-4 list-disc print:text-sm">
            <li>Reviewed and optimized Jira workflows to enhance issue tracking and management efficiency.</li>
            <li>Automated tasks and notifications in Jira, reducing errors and saving team time.</li>
            <li>Developed custom Jira reports and dashboards to improve project tracking and decision-making.</li>
            <li>Integrated Jira with other development tools to streamline processes.</li>
            <li>Conducted Jira training for team members, improving their efficiency by 30%.</li>
          </ul>
        </div>
        <div className="mt-4 print:mt-2 flex w-full">
          <div className="w-1/3">
            <h3 className="text-md print:text-sm font-semibold">Chief Technology Officer</h3>
            <p className="text-sm print:text-xs">Brainbean Apps (Jan 2015 - Mar 2019)</p>
            <p className="text-sm print:text-xs text-gray-500">Estonia (hybrid)</p>
          </div>
          <ul className="w-2/3 ml-8 print:ml-4 list-disc print:text-sm">
            <li>Grew the software engineering department from its original size by 500%.</li>
            <li>Mentored the engineering team, enhancing process efficiency by 20%.</li>
            <li>Developed a career roadmap strategy, increasing employee retention by 15%.</li>
            <li>Reduced onboarding time for new hires by 50%.</li>
            <li>Built a robust technical infrastructure to underpin operations.</li>
            <li>Crafted and executed a technical strategy that aligns with the organization&apos;s business objectives.</li>
            <li>Oversaw the recruitment and management of the engineering team.</li>
            <li>Provided technical leadership, influencing project direction and innovation.</li>
            <li>Secured system and data integrity through rigorous security practices.</li>
            <li>Established technical policies and maintenance protocols to ensure system longevity.</li>
            <li>Managed and nurtured relationships with key vendors and partners, ensuring mutual benefit.</li>
          </ul>
        </div>
        <div className="mt-4 print:mt-2 flex w-full">
          <div className="w-1/3">
            <h3 className="text-md print:text-sm font-semibold">Lead Full-Stack Software Engineer</h3>
            <p className="text-sm print:text-xs">OsmAND (Nov 2012 - May 2015)</p>
            <p className="text-sm print:text-xs text-gray-500">Netherlands (remote)</p>
          </div>
          <ul className="w-2/3 ml-8 print:ml-4 list-disc print:text-sm">
            <li>Directed the cross-platform initiative to launch OsmAnd on iOS, capturing a 40% larger user base.</li>
            <li>Boosted map rendering performance, enhancing user experience and raising customer retention by 25%.</li>
            <li>Enabled the release of an enhanced Android version of OsmAnd, featuring 3D rendering and terrain support, which boosted revenue.</li>
          </ul>
        </div>
        <div className="mt-4 print:mt-2 flex w-full">
          <div className="w-1/3">
            <h3 className="text-md print:text-sm font-semibold">Generalist Software Developer</h3>
            <p className="text-sm print:text-xs">Various companies (Jun 2004 - Oct 2012)</p>
          </div>
          <ul className="w-2/3 ml-8 print:ml-4 list-disc print:text-sm">
            <li>Conducted a security audit of Android OS sources, eliminating &quot;call-home&quot; injections and unauthorized TLS certificates, enhancing system security.</li>
            <li>Designed a user-centric Android Home UI, increasing engagement with telecom operator partners&apos; target audience.</li>
            <li>Integrated an OpenStreetMap-based navigation app with offline regional maps, boosting usability for telecom partners&apos; customers.</li>
            <li>Developed a cross-platform inertial motion capture engine, accelerating development and protecting intellectual property by leveraging a System-On-Module platform.</li>
            <li>Adapted the Linux Kernel for a System-On-Module platform, delivering a stable and updatable system.</li>
            <li>Improved Linux Kernel TTY driver, increasing throughput and enhancing motion capture quality.</li>
            <li>Upgraded Unreal Engine 3&apos;s decal rendering, improving visual dynamics in shootouts without sacrificing performance.</li>
            <li>Implemented a &quot;Local Realm&quot; subsystem for an MMORPG with caching and prediction, significantly reducing network traffic.</li>
            <li>Created a sophisticated UI for an MMO, managing complex interactions and user interface challenges.</li>
            <li>Built an Inertial Motion Capture System compatible with Autodesk MotionBuilder, tapping into the cost-effective motion capture market.</li>
            <li>Developed a real-time Motion Capture/VR integration proof-of-concept, informing strategic product adjustments.</li>
            <li>Advanced a R&D project by developing a movement approximation algorithm for 5-fiber MoCap gloves, blending real-time motion capture with VR.</li>
            <li>Created a PlayStation 2 CPU emulator, allowing to research sofrware loading efficiency.</li>
            <li>Developed specialized modeling and simulation software for dynamic systems with feedback, contributing to a significant inertial navigation project and aiding in a company acquisition.</li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl w-full">
        <div className="w-full">
          <h2 className="mt-6 print:mt-4 text-xl print:text-lg font-bold">Skills</h2>
        </div>
        <div className="mt-2 print:mt-1">
          <h3 className="font-semibold">Programming Languages</h3>
          <p className="mt-2 print:mt-1 text-sm print:text-xs print:tracking-tighter">
            {
              [
                "JavaScript",
                "C",
                "Embedded C++",
                "Java",
                "Kotlin",
                "HTML",
                "CSS",
                "SQL",
                "C#",
                "Swift",
                "Objective-C",
                "UnrealScript",
                "Ruby",
                "GraphQL",
              ]
                .sort()
                .map((value, index) => [(<span key={index} className="whitespace-nowrap">{value}</span>), (<>&nbsp;• </>)])
                .flat()
                .slice(0, -1)
            }
          </p>
        </div>
        <div className="mt-4 print:mt-2">
          <h3 className="font-semibold">Frameworks</h3>
          <p className="mt-2 print:mt-1 text-sm print:text-xs print:tracking-tighter">
            {
              [
                "React Native",
                "React.js",
                "Android SDK",
                "iOS SDK",
                "Unity",
                "Redux",
                "Django",
                "Selenium",
                "Scrapy",
                "Boost",
                "Next.js",
                "NestJS",
                "Tailwind",
                "Unity3D",
                "Unreal Engine",
                "Qt",
                "Chrome",
                "Jest",
                "Flux",
                "Unreal Engine 3",
                "Flutter",
                "NativeScript",
                "Unreal Engine 4",
                "Angular",
              ]
                .sort()
                .map((value, index) => [(<span key={index} className="whitespace-nowrap">{value}</span>), (<>&nbsp;• </>)])
                .flat()
                .slice(0, -1)
            }
          </p>
        </div>
        <div className="mt-4 print:mt-2">
          <h3 className="font-semibold">Libraries &amp; APIs</h3>
          <p className="mt-2 print:mt-1 text-sm print:text-xs print:tracking-tighter">
            {
              [
                "Android API",
                "Android OpenGL",
                "React",
                "Puppeteer",
                "React Redux",
                "Node.js",
                "Beautiful Soup",
                "REST APIs",
                "Slack API",
                "Mapbox API",
                "API Development",
                "OpenStreetMap API",
                "DirectX",
                "OpenGL",
                "Standard Template Library (STL)",
                "OpenGL ES",
                "Facebook SDK",
                "Chrome API",
                "FFmpeg",
                "Twitch API",
                "Chai",
                "Xamarin.iOS",
                "Xamarin.Android",
                "Redux-Saga",
                "Redux Form"
              ]
                .sort()
                .map((value, index) => [(<span key={index} className="whitespace-nowrap">{value}</span>), (<>&nbsp;• </>)])
                .flat()
                .slice(0, -1)
            }
          </p>
        </div>
        <div className="mt-4 print:mt-2">
          <h3 className="font-semibold">Tools</h3>
          <p className="mt-2 print:mt-1 text-sm print:text-xs print:tracking-tighter">
            {
              [
                "Microsoft Visual Studio",
                "GitHub",
                "Jira",
                "Android NDK",
                "GIS",
                "MQTT",
                "Android Studio",
                "Pytest",
                "pylint",
                "CLion",
                "PyCharm",
                "Bitbucket",
                "Subversion (SVN)",
                "Git",
                "GCC",
                "CMake",
                "Odoo",
                "AWS SDK",
                "SWIG",
                "Celery",
                "Blender",
                "Apache Maven",
                "Gradle",
                "NPM",
                "Travis CI",
                "MATLAB",
                "Babel",
                "Mocha",
                "Autodesk FBX SDK",
                "Jenkins",
                "Atlassian",
                "Confluence",
                "Auth0"
              ]
                .sort()
                .map((value, index) => [(<span key={index} className="whitespace-nowrap">{value}</span>), (<>&nbsp;• </>)])
                .flat()
                .slice(0, -1)
            }
          </p>
        </div>
        <div className="mt-4 print:mt-2">
          <h3 className="font-semibold">Paradigms</h3>
          <p className="mt-2 print:mt-1 text-sm print:text-xs print:tracking-tighter">
            {
              [
                "Reactive Programming",
                "Object-oriented Programming (OOP)",
                "Agile Software Development",
                "Microservices",
                "REST",
                "Serverless Architecture",
                "Lambda Architecture",
                "Continuous Integration (CI)",
                "Unit Testing",
                "Data Science",
                "DevOps"
              ]
                .sort()
                .map((value, index) => [(<span key={index} className="whitespace-nowrap">{value}</span>), (<>&nbsp;• </>)])
                .flat()
                .slice(0, -1)
            }
          </p>
        </div>
        <div className="mt-4 print:mt-2">
          <h3 className="font-semibold">Platforms</h3>
          <p className="mt-2 print:mt-1 text-sm print:text-xs print:tracking-tighter">
            {
              [
                "ARCore",
                "Android",
                "Windows",
                "AWS IoT Core",
                "Amazon EC2",
                "Firebase",
                "Google Cloud Platform (GCP)",
                "AWS Lambda",
                "iOS",
                "Linux",
                "Embedded Linux",
                "AWS IoT",
                "Docker",
                "Amazon Web Services (AWS)",
                "Kubernetes",
                "Databricks",
                "MacOS",
                "Visual Studio Code (VS Code)",
                "Visual Studio 2017",
                "Windows Phone",
                "PlayStation",
                "Android TV",
                "Xamarin"
              ]
                .sort()
                .map((value, index) => [(<span key={index} className="whitespace-nowrap">{value}</span>), (<>&nbsp;• </>)])
                .flat()
                .slice(0, -1)
            }
          </p>
        </div>
        <div className="mt-4 print:mt-2">
          <h3 className="font-semibold">Storage</h3>
          <p className="mt-2 print:mt-1 text-sm print:text-xs print:tracking-tighter">
            {
              [
                "PostgreSQL",
                "NoSQL",
                "SQLite",
                "Amazon S3 (AWS S3)",
                "Amazon DynamoDB",
                "Amazon RDS",
                "Databricks"
              ]
                .sort()
                .map((value, index) => [(<span key={index} className="whitespace-nowrap">{value}</span>), (<>&nbsp;• </>)])
                .flat()
                .slice(0, -1)
            }
          </p>
        </div>
        <div className="mt-4 print:mt-2">
          <h3 className="font-semibold">Other</h3>
          <p className="mt-2 print:mt-1 text-sm print:text-xs print:tracking-tighter">
            {
              [
                "Multithreading",
                "CI/CD Pipelines",
                "Artificial Intelligence (AI)",
                "OpenAI GPT-3 API",
                "OpenAI GPT-4 API",
                "Language Models",
                "Prompt Engineering",
                "Generative Pre-trained Transformers (GPT)",
                "Hugging Face",
                "Chatbots",
                "Lambda Functions",
                "Infrastructure as Code (IaC)",
                "ChatGPT",
                "FastAPI",
                "Data Scraping",
                "Web Scraping",
                "JSON REST APIs",
                "Digital Elevation Models",
                "Machine Learning",
                "Satellite Images",
                "Bots",
                "WebSockets",
                "TCP/IP",
                "Internet of Things (IoT)",
                "Retrieval-augmented Generation (RAG)",
                "Algorithms",
                "Vector Databases",
                "Telegram Bots",
                "Pub/Sub",
                "Front-end Architecture",
                "Technical Architecture",
                "Embedded Systems",
                "Natural Language Processing (NLP)",
                "Natural Language Understanding (NLU)",
                "Data Analytics",
                "Screwdriver",
                "Device Firmware Updates (DFU)",
                "Firmware over the Air (FOTA)",
                "Enterprise Resource Planning (ERP)",
                "Push Notifications",
                "Chromium",
                "Reverse Engineering",
                "Virtual Reality (VR)",
                "Linux Kernel Programming",
                "Linux Device Driver",
                "Augmented Reality (AR)",
                "Remote Team Leadership",
                "Team Mentoring",
                "Software Development Lifecycle (SDLC)",
                "GL Transmission Format (glTF)",
                "OpenAI",
                "Pinecone",
                "3D Rendering"
              ]
                .sort()
                .map((value, index) => [(<span key={index} className="whitespace-nowrap">{value}</span>), (<>&nbsp;• </>)])
                .flat()
                .slice(0, -1)
            }
          </p>
        </div>
      </div>
      <div className="flex basis-1/2 print:basis-full print:flex-wrap max-w-6xl w-full gap-8 print:gap-4">
        <div>
          <h2 className="mt-6 print:mt-4 text-xl print:text-lg font-bold">Education</h2>
          <div className="mt-4 print:mt-2">
            <h3 className="font-semibold print:text-sm">National Technical University of Ukraine &quot;Kyiv Polytechnic Institute&quot;</h3>
            <p className="print:text-xs">Master&apos;s Degree in Computer Engineering</p>
          </div>
          <div className="mt-4 print:mt-2">
            <h3 className="font-semibold print:text-sm">National Technical University of Ukraine &quot;Kyiv Polytechnic Institute&quot;</h3>
            <p className="print:text-xs">Bachelor&apos;s Degree in Computer Engineering</p>
          </div>
        </div>
        <div>
          <h2 className="mt-6 print:mt-4 text-xl print:text-lg font-bold">Professional Affiliations</h2>
          <div className="mt-4 print:mt-2">
            <h3 className="font-semibold print:text-sm">Odoo Community Association</h3>
            <p className="print:text-xs">Member of multiple Project Steering Committees</p>
          </div>
        </div>
      </div>
    </main>
  );
}
