import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'rounded-sm transition-colors whitespace-nowrap',
    'font-semibold',
    'disabled:pointer-events-none',
    '[&_svg]:size-4 [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: `
        bg-orange-600 text-white
        hover:bg-orange-500
        active:bg-orange-700
        disabled:bg-gray-300 disabled:text-gray-600
      `,

        secondary: `
        bg-white border border-orange-500 text-orange-500
        hover:border-orange-400 hover:text-orange-400
        active:border-orange-600 active:text-orange-600
        disabled:border-gray-400 disabled:text-gray-400
      `,

        ghost: `
        text-orange-500
        hover:text-orange-400
        active:text-orange-600
        disabled:text-gray-500
      `,
      },

      size: {
        default: 'px-[32px] py-[16px]',
        ghost: 'px-[8px] py-[4px]',
      },
    },

    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
