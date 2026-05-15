# CLAUDE.md

Guidance for agents working on this frontend.

## Project Context

This is a Next.js 16 app using the App Router. Read `AGENTS.md` before making framework-level changes because this Next version may differ from older assumptions.

Primary public pages live under:

- `src/app/(main)`
- `src/app/(main)/services`
- `src/app/(main)/process`
- `src/app/(main)/promotions`
- `src/app/(main)/contact`

Admin/dashboard pages live under:

- `src/app/home`

## Current Visual Direction

The public site now follows a clean shadcn-inspired layout with a blue primary accent.

Use this visual language by default:

- Section shell: `flex min-h-screen items-center px-4 py-24 sm:px-6 lg:px-8`
- Inner width: `mx-auto w-full max-w-6xl`
- Header block: `mx-auto mb-12 flex max-w-2xl flex-col items-center text-center sm:mb-16`
- Heading: `text-3xl font-bold tracking-tight sm:text-4xl`
- Body copy: `text-base leading-7 text-muted-foreground sm:text-lg`
- Accent colors:
  - `border-blue-100`
  - `hover:border-blue-300`
  - `bg-blue-50`
  - `text-blue-600`
  - `text-blue-700`
  - `ring-blue-200`
  - button primary: `bg-blue-600 text-white hover:bg-blue-700`

Avoid returning to the older style:

- Avoid `text-gray-*`, `border-gray-*`, `bg-purple-*`, `bg-green-*`, `bg-amber-*` for primary UI accents unless the feature specifically needs a semantic status color.
- Avoid large custom `div` cards when shadcn `Card` can express the same layout.
- Avoid inconsistent rounded values such as `rounded-2xl` everywhere; current cards use shadcn defaults plus blue borders.

## Components

Prefer shadcn components from:

- `@/components/ui/card`
- `@/components/ui/badge`
- `@/components/ui/button`
- `@/components/ui/table`
- `@/components/ui/input`
- `@/components/ui/label`
- `@/components/ui/textarea`

Use `GradientText` for public section headings:

```tsx
import { GradientText } from "@/src/components/ui/gradient-text";
```

Use Lucide icons. For typed data arrays with dynamic icons:

```tsx
import type { LucideIcon } from "lucide-react";

type Item = {
  icon: LucideIcon;
  title: string;
};
```

## Card Pattern

Use this pattern for grid cards:

```tsx
<Card className="border-blue-100 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
  <CardHeader className="gap-4 pb-2">
    <div className="flex items-start justify-between gap-3">
      <div className="flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-200">
        <Icon className="size-6" />
      </div>
      <Badge variant="secondary" className="rounded-full bg-blue-50 text-blue-700">
        Label
      </Badge>
    </div>
    <CardTitle className="text-lg">Title</CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    ...
  </CardContent>
  <CardFooter className="border-t bg-muted/30 text-xs font-medium text-muted-foreground">
    Footer text
  </CardFooter>
</Card>
```

For checklist rows:

```tsx
<div className="flex items-start gap-2 text-sm">
  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
    <Check className="size-3.5" />
  </span>
  <span className="leading-5 text-foreground/80">Text</span>
</div>
```

## Table Pattern

Use compact tables for dense information such as rates, coupons, hours, turnaround, workflow, referrals.

Wrapper:

```tsx
<Card className="overflow-hidden border-blue-100 bg-card shadow-sm">
  <CardHeader className="gap-2 border-b bg-card">...</CardHeader>
  <CardContent className="px-0">
    <Table className="min-w-[820px]">...</Table>
  </CardContent>
  <CardFooter className="justify-center border-t bg-muted/30 text-center text-xs text-muted-foreground">
    ...
  </CardFooter>
</Card>
```

Table rows:

- Header row: `bg-muted/20 hover:bg-muted/20`
- Body row: `bg-card transition-colors hover:bg-muted/20`
- Borders: `TableHeader` and `TableBody` with `[&_tr]:border-border/60`
- First cell left padding: `pl-4 md:pl-8`
- Last action cell right padding: `pr-4 md:pr-8`
- Use `min-w-[...]` so mobile scrolls horizontally rather than crushing the table.

## Header And Footer

`src/components/common/header.tsx` and `footer.tsx` are data-driven and should remain that way.

Header style:

- Fixed top header with `border-blue-100 bg-white/95 backdrop-blur`
- Dropdown items use icon boxes: `bg-blue-50 text-blue-600`
- Auth buttons: login blue-light, register blue-solid
- Do not reintroduce `useRef` for static icon sizes; it caused React refs lint errors.

Footer style:

- Four-column desktop layout
- Blue contact icon boxes
- Link groups for services and promotions
- Bottom bar with muted text and blue hover

## Forms

Forms should use shadcn primitives:

- `Label`
- `Input`
- `Textarea`
- `Button`

For blue focus:

```tsx
className="h-10 focus-visible:border-blue-500 focus-visible:ring-blue-500/30"
```

Primary submit buttons:

```tsx
className="h-10 bg-blue-600 text-white hover:bg-blue-700"
```

## Build And Type Notes

Run targeted lint after edits:

```bash
npx eslint 'src/app/(main)/path/file.tsx'
```

Run full build before shipping larger changes:

```bash
npm run build
```

Known fixes already applied:

- `components/ui/calendar.tsx` must use `month_grid`, not `table`, for `react-day-picker@10`.
- Recharts `Tooltip formatter` receives `ValueType | undefined`; do not type its value parameter as `number`.
- `BarChart` does not accept `radius`; put `radius` on `Bar`.
- Some Recharts pages may emit prerender warnings about chart dimensions, but the build can still pass.

If build complains about missing D3 type definitions, install the missing `@types/d3-*` package rather than bypassing TypeScript.

## Content And Naming

Use Vietnamese display text. Keep capitalization natural, for example:

- `Bảng giá dịch vụ`
- `Giờ hoạt động`
- `Mã giảm giá`

Avoid all-caps badges unless they are intentionally short labels. Current badge style is sentence/title case.

## What To Avoid

- Do not mix unrelated accent palettes in one section.
- Do not use large marketing hero layouts for operational sections.
- Do not put nested cards inside cards unless there is a clear semantic reason.
- Do not add decorative gradient blobs/orbs.
- Do not revert unrelated user edits.
