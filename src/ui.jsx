import { Button as HButton } from '@headlessui/react'

export function Button({className, ...props}) {
  className = `${className} rounded py-2 px-4 text-sm text-white data-[hover]:outline outline-1 font-bold  data-[active]:outline-gray-700 data-[disabled]:bg-gray-500`
  return (
    <HButton className={className} {...props} />
  )
}
