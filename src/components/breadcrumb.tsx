import { Fragment } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const SITE_NAME = "Alexey Pelykh";

interface BreadcrumbItem {
  label: string;
  href: string;
}

export function Breadcrumb({
  items,
  current,
}: {
  items: BreadcrumbItem[];
  current?: string;
}) {
  return (
    <nav className="mb-8 print:hidden" aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 min-w-0">
        <li>
          <Link
            href="/"
            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {SITE_NAME}
          </Link>
        </li>
        {items.map((item) => (
          <Fragment key={item.href}>
            <li
              className="text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            >
              <ChevronRight className="w-3 h-3" />
            </li>
            <li>
              <Link
                href={item.href}
                className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                {item.label}
              </Link>
            </li>
          </Fragment>
        ))}
        <li className="text-gray-400 dark:text-gray-500" aria-hidden="true">
          <ChevronRight className="w-3 h-3" />
        </li>
        {current && (
          <li className="min-w-0">
            <span
              className="text-gray-700 dark:text-gray-300 truncate block"
              aria-current="page"
              title={current}
            >
              {current}
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
}
