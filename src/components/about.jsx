import React from 'react'

export default function About() {
    return (
        <div className='w-full bg-background min-h-screen transition-colors duration-300'>
            {/* Hero Section */}
            <div className='max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>
                    <div className='space-y-8 animate-in fade-in slide-in-from-left duration-700'>
                        <div className='space-y-4'>
                            <p className='text-primary font-bold uppercase tracking-widest text-sm font-changa'>Empowering Information</p>
                            <h1 className='text-5xl md:text-7xl font-bold font-vend leading-tight text-foreground'>
                                Elevating <span className='text-primary underline decoration-primary/30 underline-offset-8'>Digital</span> Journalism
                            </h1>
                            <div className='w-24 h-2 bg-primary rounded-full'></div>
                        </div>

                        <p className='text-xl md:text-2xl text-muted-foreground leading-relaxed font-vend'>
                            Insightville is a digital news platform delivering timely, accurate, and in-depth coverage across a wide spectrum of topics. We deliver credible journalism that informs, educates, and drives conversation.
                        </p>

                        <div className='grid grid-cols-2 gap-8 pt-4'>
                            <div className='bg-card p-6 rounded-3xl border border-border shadow-sm group hover:border-primary/30 transition-all'>
                                <p className='text-3xl font-bold font-vend text-primary'>24/7</p>
                                <p className='text-muted-foreground font-changa text-sm font-medium'>Live Updates</p>
                            </div>
                            <div className='bg-card p-6 rounded-3xl border border-border shadow-sm group hover:border-primary/30 transition-all'>
                                <p className='text-3xl font-bold font-vend text-primary'>100%</p>
                                <p className='text-muted-foreground font-changa text-sm font-medium'>Credible Sourcing</p>
                            </div>
                        </div>
                    </div>

                    <div className='relative group animate-in fade-in slide-in-from-right duration-700'>
                        <div className='absolute -inset-4 bg-primary/10 rounded-[3rem] blur-2xl group-hover:bg-primary/20 transition-all'></div>
                        <div className='relative rounded-[2.5rem] overflow-hidden border-8 border-card shadow-2xl'>
                            <img
                                src="/img/Aboutus.jpg"
                                alt="Insightville Newsroom"
                                className='w-full h-full object-cover transform transition-transform group-hover:scale-105 duration-700'
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission Section */}
            <div className='bg-muted/30 py-20'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='max-w-3xl'>
                        <h2 className='text-3xl font-bold font-vend mb-8 text-foreground'>Our Core Mission</h2>
                        <p className='text-lg leading-relaxed text-muted-foreground font-vend'>
                            At Insightville, we believe journalism is more than just reporting—it's about driving conversation,
                            educating the public, and uncovering truths that matter. We strive to create a space
                            where credible journalism serves as the foundation for an informed and empowered society.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}