'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react'
import { ReactNotifications } from 'react-notifications-component'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {},
      })
  )
  return <>
    
    <QueryClientProvider client={queryClient}>

      <section>
        
        <ReactNotifications />
        
      </section>

      {children}
      </QueryClientProvider>
  </>
}