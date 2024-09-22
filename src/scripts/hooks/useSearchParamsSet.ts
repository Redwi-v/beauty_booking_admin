import { usePathname, useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"

export const useSearchPramsSet = () => {

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()


  const setSearchParam = (name: string, value: string | number) => {

    const params = new URLSearchParams(searchParams.toString())
    params.set(name, String( value ))

    router.push(pathname + '?' + params.toString())

  }

  const deleteSearchParam = (name: string ) => {
    
    const params = new URLSearchParams(searchParams.toString())
    params.delete( name )

    router.push(pathname + '?' + params.toString())
    
  }

  return { setSearchParam, deleteSearchParam }

}