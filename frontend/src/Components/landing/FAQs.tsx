import React from 'react'

const FAQs = () => {
    return (
        <div className='flex flex-col items-center justify-center my-16'>
            <span className='font-xl font-semibold'>
                FAQs
            </span>
            <span className='w-1/2'>
                <AccordionDemo />
            </span>
        </div>
    )
}

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion"

export function AccordionDemo() {
    return (
        <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="item-1"
        >
            <AccordionItem value="item-1">
                <AccordionTrigger>Product Information</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-balance">
                    <p>
                        Our chat application delivers real-time messaging with zero lag, clean UI, and end-to-end encryption (* in future). Built for speed, privacy, and scale — whether you're chatting one-on-one or running massive group conversations.


                    </p>
                    <p>
                        You get read receipts, media sharing, message reactions, and smart contact search. Everything is designed to feel instant and intuitive, even for first-time users.
                    </p>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Account & Security</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-balance">
                    <p>
                        We use secure authentication and industry-standard encryption to protect every message. Your chats stay on your device and our servers only store what's required for delivery — nothing else.

                    </p>
                    <p>
                        You can manage sessions, log out remotely, and enable additional safety controls whenever needed.
                    </p>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Device Support</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-balance">
                    <p>
                        The app works smoothly across modern browsers and mobile devices. No installation required. Just sign in and start chatting.
                    </p>
                    <p>
                        Your conversations sync instantly across devices without losing history.
                    </p>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}


export default FAQs