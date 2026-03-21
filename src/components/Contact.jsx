import React from 'react'

export default function Contact() {
    return (
        <div className='w-full bg-background min-h-screen transition-colors duration-300'>
            <div className='max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8'>
                <div className='flex flex-col items-center justify-center space-y-12 animate-in fade-in zoom-in duration-1000'>
                    {/* Header */}
                    <div className='text-center space-y-4'>
                        <h1 className='text-7xl md:text-9xl font-bold font-vend tracking-tighter text-foreground'>
                            REACH <span className='text-primary'>OUT</span>
                        </h1>
                        <p className='text-muted-foreground font-changa text-xl tracking-widest uppercase'>Available 24/7 for you</p>
                    </div>

                    {/* Contact Details */}
                    <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-8'>
                        <div className='bg-card p-12 rounded-[3rem] border border-border shadow-xl hover:shadow-primary/5 transition-all text-center space-y-4 group'>
                            <p className='text-muted-foreground font-changa uppercase tracking-widest text-sm'>General Inquiries</p>
                            <a href="mailto:info@insightville.com" className='text-3xl md:text-5xl font-bold font-vend text-foreground hover:text-primary transition-colors block break-words'>
                                info@insightville.com
                            </a>
                        </div>
                        <div className='bg-card p-12 rounded-[3rem] border border-border shadow-xl hover:shadow-primary/5 transition-all text-center space-y-4 group'>
                            <p className='text-muted-foreground font-changa uppercase tracking-widest text-sm'>Call Us Directly</p>
                            <a href="tel:+254703676436" className='text-3xl md:text-5xl font-bold font-vend text-foreground hover:text-primary transition-colors block'>
                                +254 703 676 436
                            </a>
                        </div>
                    </div>

                    {/* Socials */}
                    <div className='pt-12 space-y-8 text-center'>
                        <h2 className='text-2xl font-bold font-changa uppercase tracking-[0.3em] text-muted-foreground'>Follow the story</h2>
                        <div className='flex flex-wrap justify-center gap-10 md:gap-16'>
                            <a href="https://facebook.com/insightville" target="_blank" rel="noopener noreferrer" className='group transition-transform hover:-translate-y-2'>
                                <img src="/img/facebook.svg" alt="Facebook" className='w-16 h-16 md:w-20 md:h-20 grayscale brightness-200 group-hover:grayscale-0 group-hover:brightness-100 transition-all' />
                            </a>
                            <a href="https://twitter.com/insightville" target="_blank" rel="noopener noreferrer" className='group transition-transform hover:-translate-y-2'>
                                <img src="/img/twitter.svg" alt="Twitter" className='w-16 h-16 md:w-20 md:h-20 grayscale brightness-200 group-hover:grayscale-0 group-hover:brightness-100 transition-all' />
                            </a>
                            <a href="https://instagram.com/insightville" target="_blank" rel="noopener noreferrer" className='group transition-transform hover:-translate-y-2'>
                                <img src="/img/ig.svg" alt="Instagram" className='w-16 h-16 md:w-20 md:h-20 grayscale brightness-200 group-hover:grayscale-0 group-hover:brightness-100 transition-all' />
                            </a>
                            <a href="https://linkedin.com/company/insightville" target="_blank" rel="noopener noreferrer" className='group transition-transform hover:-translate-y-2'>
                                <img src="/img/linkedin.svg" alt="LinkedIn" className='w-16 h-16 md:w-20 md:h-20 grayscale brightness-200 group-hover:grayscale-0 group-hover:brightness-100 transition-all' />
                            </a>
                            <a href="mailto:insightville@gmail.com" className='group transition-transform hover:-translate-y-2'>
                                <img src="/img/gmail.svg" alt="Email" className='w-16 h-16 md:w-20 md:h-20 grayscale brightness-200 group-hover:grayscale-0 group-hover:brightness-100 transition-all' />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
