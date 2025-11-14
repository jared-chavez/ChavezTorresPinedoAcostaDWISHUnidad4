'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const carouselImages = [
  {
    url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80',
    alt: 'Agencia de vehículos moderna',
    title: 'Encuentra tu Vehículo Ideal',
    subtitle: 'La mejor selección de vehículos nuevos y seminuevos',
  },
  {
    url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&q=80',
    alt: 'Showroom de vehículos',
    title: 'Calidad Garantizada',
    subtitle: 'Todos nuestros vehículos pasan por rigurosa inspección',
  },
  {
    url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80',
    alt: 'Vehículos en exhibición',
    title: 'Financiamiento Flexible',
    subtitle: 'Opciones de pago adaptadas a tus necesidades',
  },
  {
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80',
    alt: 'Vehículos de lujo',
    title: 'Servicio Integral',
    subtitle: 'Mantenimiento y servicio técnico especializado',
  },
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
        setIsTransitioning(false);
      }, 500);
    }, 5000); // Cambiar cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  const goToPrevious = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
      setIsTransitioning(false);
    }, 300);
  };

  const goToNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
      setIsTransitioning(false);
    }, 300);
  };

  const currentImage = carouselImages[currentIndex];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Imagen de fondo con blur y opacidad */}
      <div className="absolute inset-0">
        <Image
          src={currentImage.url}
          alt={currentImage.alt}
          fill
          priority
          className={`object-cover transition-opacity duration-1000 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            filter: 'blur(1px)', // Blur muy sutil para mantener nitidez
          }}
        />
        {/* Overlay oscuro con opacidad reducida para mejor visualización */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/50" />
        {/* Overlay adicional sutil para contraste */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-indigo-900/20" />
      </div>

      {/* Contenido sobre la imagen */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <h1
            className={`text-5xl md:text-7xl font-bold text-white mb-6 transition-all duration-1000 ${
              isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            {currentImage.title}
          </h1>
          <p
            className={`text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
              isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            {currentImage.subtitle}
          </p>
        </div>
      </div>

      {/* Botones de navegación */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110"
        aria-label="Imagen anterior"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110"
        aria-label="Siguiente imagen"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Indicadores de slides */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 bg-white'
                : 'w-2 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Degradado inferior para transición suave */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-900 to-transparent z-10" />
    </div>
  );
}

