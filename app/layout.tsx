import './globals.css';import {ReactNode} from 'react';import {Providers} from '@/components/providers';
export const metadata={title:'LOOP — Customer Feedback Intelligence',description:'AI-powered customer feedback intelligence platform'};
export default function RootLayout({children}:{children:ReactNode}){return <html lang="en"><body><Providers>{children}</Providers></body></html>}
