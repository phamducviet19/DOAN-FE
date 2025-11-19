import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    url: 'https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?q=80&w=2070&auto=format&fit=crop',
    title: 'Build Your Dream PC',
    subtitle: 'Find the latest and greatest components to power up your rig.',
    cta: 'Shop Now',
    link: '/products'
  },
  {
    url: 'https://images.unsplash.com/photo-1591491713921-2908a01770b7?q=80&w=2070&auto=format&fit=crop',
    title: 'Unleash Peak Performance',
    subtitle: 'Upgrade your components for an unparalleled gaming experience.',
    cta: 'Explore Parts',
    link: '/products'
  },
  {
    url: 'https://images.unsplash.com/photo-1629202517865-455b88074900?q=80&w=1974&auto=format&fit=crop',
    title: 'Craft the Ultimate Setup',
    subtitle: 'From motherboards to memory, find every part you need for a perfect build.',
    cta: 'Browse All Parts',
    link: '/products'
  }
];

const HeroSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = useCallback(() => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex]);

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };
  
  useEffect(() => {
    const timer = setInterval(() => {
        nextSlide();
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="h-[500px] w-full m-auto mb-12 relative group rounded-lg overflow-hidden shadow-lg border border-border-color">
      {/* Background Image */}
      <div
        style={{ backgroundImage: `url(${slides[currentIndex].url})` }}
        className="w-full h-full bg-center bg-cover duration-500 transition-all"
      ></div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Slide Content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white p-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary drop-shadow-lg">
          {slides[currentIndex].title}
        </h1>
        <p className="text-lg md:text-xl mb-8 text-gray-200 max-w-3xl mx-auto drop-shadow-md">
          {slides[currentIndex].subtitle}
        </p>
        <Link 
          to={slides[currentIndex].link}
          className="bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-highlight transition-transform transform hover:scale-105 duration-300 inline-block shadow-md"
        >
          {slides[currentIndex].cta}
        </Link>
      </div>
      
      {/* Left Arrow */}
      <div className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 left-5 text-2xl rounded-full p-2 bg-black/40 text-white cursor-pointer hover:bg-black/60 transition-all">
        <ChevronLeft onClick={prevSlide} size={30} />
      </div>
      
      {/* Right Arrow */}
      <div className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 right-5 text-2xl rounded-full p-2 bg-black/40 text-white cursor-pointer hover:bg-black/60 transition-all">
        <ChevronRight onClick={nextSlide} size={30} />
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex justify-center py-2">
        {slides.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
            className={`w-3 h-3 rounded-full mx-2 cursor-pointer transition-all duration-300 ${currentIndex === slideIndex ? 'bg-accent scale-125' : 'bg-white/50 hover:bg-white/80'}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;