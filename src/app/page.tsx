import LandingNavbar from '@/components/LandingNavbar';
import HeroCarousel from '@/components/HeroCarousel';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <>
      {/* NOTA IMPORTANTE PARA EL NAVBAR: 
        Para el componente LandingNavbar, asegúrate de que el elemento que contiene 
        el texto "Nocturna Genesis" tenga clases como: 
        - text-3xl (para hacerlo grande)
        - font-serif o font-bold italic (para formalidad)
        - tracking-tight (para un look más profesional si usas sans-serif)
        
        EJEMPLO (en tu LandingNavbar.js): 
        <span className="text-3xl font-serif font-bold text-gray-900 dark:text-white">
          Nocturna Genesis
        </span>
      */}
      <LandingNavbar />
      
      {/* Hero Section con Carousel */}
      <section className="relative min-h-screen overflow-hidden">
        <HeroCarousel />
        
        {/* Botones de acción sobre el carousel */}
        <div className="absolute bottom-20 md:bottom-32 left-1/2 -translate-x-1/2 z-20 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {/* Botón principal más grande y con sombra más fuerte */}
            <Link
              href="/inventory"
              className="px-10 py-5 bg-yellow-400 text-gray-900 rounded-2xl font-extrabold text-xl uppercase tracking-wider hover:bg-yellow-300 transition-all duration-300 shadow-2xl shadow-yellow-500/50 hover:shadow-3xl hover:-translate-y-2 transform"
            >
              Ver Inventario
            </Link>
            {/* Botón secundario más contrastante */}
            <Link
              href="#promociones"
              className="px-10 py-5 bg-transparent border-3 border-white text-white rounded-2xl font-bold text-xl uppercase tracking-wider hover:bg-white hover:text-blue-900 transition-all duration-300 backdrop-blur-md shadow-2xl hover:shadow-3xl hover:translate-y-0.5"
            >
              Ver Promociones
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            {/* Título más grande y llamativo */}
            <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
              ¿Por qué elegir **Nocturna Genesis**?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-light">
              Tu confianza es nuestra **prioridad**
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Tarjeta con mejor degradado y sombra */}
            <div className="text-center p-10 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-gray-800 dark:to-gray-700 hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-500 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ring-4 ring-white/30">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-3">
                Calidad Garantizada
              </h3>
              <p className="text-blue-100 dark:text-gray-300">
                Todos nuestros vehículos pasan por un riguroso proceso de inspección y certificación.
              </p>
            </div>

            <div className="text-center p-10 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 dark:from-gray-800 dark:to-gray-700 hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-500 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ring-4 ring-white/30">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-3">
                Financiamiento Flexible
              </h3>
              <p className="text-green-100 dark:text-gray-300">
                Opciones de pago adaptadas a tus necesidades. Crédito, leasing y autofinanciamiento.
              </p>
            </div>

            <div className="text-center p-10 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 dark:from-gray-800 dark:to-gray-700 hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-500 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ring-4 ring-white/30">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-3">
                Servicio Integral
              </h3>
              <p className="text-purple-100 dark:text-gray-300">
                Mantenimiento, refacciones y servicio técnico especializado para tu vehículo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Promociones Section */}
      <section id="promociones" className="py-24 bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
              Ofertas Exclusivas
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-light">
              Descubre todas las promociones y condiciones preferenciales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: 1,
                image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
                title: 'Promoción Financiamiento',
                description: 'Tasa de interés preferencial del 8.9% en créditos automotrices',
              },
              {
                id: 2,
                image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',
                title: 'Descuento en Seminuevos',
                description: 'Hasta 15% de descuento en vehículos seminuevos certificados',
              },
              {
                id: 3,
                image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
                title: 'Mantenimiento Incluido',
                description: 'Primer año de mantenimiento gratuito con tu compra',
              },
            ].map((promo) => (
              <div key={promo.id} className="bg-white dark:bg-gray-700 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group border-4 border-transparent hover:border-blue-500">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={promo.image}
                    alt={promo.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 text-xs font-bold rounded-full shadow-md">OFERTA</span>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                    {promo.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {promo.description}
                  </p>
                  <Link
                    href="/inventory"
                    className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-800 transition-colors text-base inline-flex items-center gap-2"
                  >
                    Ver vehículos aplicables
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Financiamiento Section */}
      <section id="financiamiento" className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                Financiamiento a tu medida
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 font-light">
                Encuentra la opción que mejor se adapte a tus necesidades. Ofrecemos las mejores tasas del mercado.
              </p>
              <div className="space-y-6">
                {/* Elementos con un poco más de espaciado y contraste */}
                <div className="flex items-start gap-5 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300">
                  <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">Crédito Automotriz</h3>
                    <p className="text-gray-600 dark:text-gray-400">Tasas competitivas y aprobación rápida</p>
                  </div>
                </div>
                <div className="flex items-start gap-5 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300">
                  <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">Leasing</h3>
                    <p className="text-gray-600 dark:text-gray-400">Renta con opción a compra</p>
                  </div>
                </div>
                <div className="flex items-start gap-5 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300">
                  <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">Autofinanciamiento</h3>
                    <p className="text-gray-600 dark:text-gray-400">Planes flexibles sin intermediarios</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Tarjeta de Call to Action más audaz */}
            <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-3xl p-10 text-white shadow-2xl hover:shadow-indigo-700/50 transition-all duration-300 transform hover:scale-[1.01]">
              <h3 className="text-3xl font-extrabold mb-4 border-b border-white/20 pb-2">Calcula tu Pago</h3>
              <p className="text-xl mb-8 opacity-95">
                Utiliza nuestra calculadora para estimar tu pago mensual en segundos y comienza a planear la compra de tu nuevo vehículo.
              </p>
              <Link
                href="/inventory"
                className="inline-block px-8 py-4 bg-yellow-400 text-gray-900 rounded-xl font-extrabold text-lg uppercase hover:bg-yellow-300 transition-colors shadow-lg hover:shadow-xl"
              >
                Calcular Ahora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Servicio Section */}
      <section id="servicio" className="py-24 bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
              Servicio y Mantenimiento Premium
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-light">
              Mantén tu vehículo en perfecto estado con nuestros expertos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Tarjetas de Servicio con mejor diseño */}
            {[
              { 
                name: 'Precios de Mantenimiento', 
                image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80',
                alt: 'Herramientas de mantenimiento'
              },
              { 
                name: 'Agenda una Cita', 
                image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&q=80',
                alt: 'Calendario y agenda'
              },
              { 
                name: 'Service Express', 
                image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
                alt: 'Servicio rápido'
              },
              { 
                name: 'Carrocería y Pintura', 
                image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&q=80',
                alt: 'Carrocería y pintura automotriz'
              },
            ].map((service) => (
              <div key={service.name} className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] overflow-hidden group border-b-4 border-blue-500">
                <div className="relative w-full h-40 mb-4 rounded-xl overflow-hidden shadow-inner">
                  <Image
                    src={service.image}
                    alt={service.alt}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {service.name}
                </h3>
                <Link
                  href="#contacto"
                  className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-800 transition-colors text-base inline-flex items-center gap-1"
                >
                  Explorar
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto Section */}
      <section id="contacto" className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
              **Contáctanos**
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-light">
              Estamos aquí para ayudarte a encontrar el auto de tus sueños
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Tarjetas de contacto más destacadas */}
            <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-0.5">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-2">Llamada Directa</h3>
              <p className="text-lg text-blue-600 dark:text-blue-400 font-extrabold">(844) 123-4567</p>
            </div>

            <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-0.5">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-2">WhatsApp</h3>
              <p className="text-lg text-green-600 dark:text-green-400 font-extrabold">+52 844 123 4567</p>
            </div>

            <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-0.5">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-2">Envíanos un Email</h3>
              <p className="text-lg text-purple-600 dark:text-purple-400 font-extrabold">contacto@nocturnagenesis.com</p>
            </div>
          </div>

          <div className="mt-20 text-center">
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 border-b-2 border-blue-500/50 inline-block pb-1">
              Horarios de Atención
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Tarjetas de horario más limpias */}
              <div className="bg-blue-50 dark:bg-gray-800 rounded-xl p-8 shadow-md">
                <h4 className="font-extrabold text-2xl text-blue-800 dark:text-white mb-3">Ventas</h4>
                <p className="text-gray-700 dark:text-gray-300 text-lg">Lunes - Viernes: **9:00 AM - 8:00 PM**</p>
                <p className="text-gray-700 dark:text-gray-300 text-lg">Sábado: **9:00 AM - 6:00 PM**</p>
                <p className="text-gray-700 dark:text-gray-300 text-lg">Domingo: **11:00 AM - 6:00 PM**</p>
              </div>
              <div className="bg-green-50 dark:bg-gray-800 rounded-xl p-8 shadow-md">
                <h4 className="font-extrabold text-2xl text-green-800 dark:text-white mb-3">Servicio</h4>
                <p className="text-gray-700 dark:text-gray-300 text-lg">Lunes - Viernes: **8:00 AM - 7:00 PM**</p>
                <p className="text-gray-700 dark:text-gray-300 text-lg">Sábado: **8:00 AM - 1:00 PM**</p>
                <p className="text-gray-700 dark:text-gray-300 text-lg">Domingo: **Cerrado**</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              {/* Logo más grande y con tipografía formal */}
              <div className="flex items-center space-x-4 mb-6"> 
                {/* Ícono más grande */}
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                {/* Texto del logo con Trade Winds (logo-title) */}
                <span className="text-3xl font-bold italic tracking-tight logo-title">
                  Nocturna Genesis
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-4">
                Tu agencia de confianza para encontrar el vehículo perfecto. Llevamos tu experiencia de compra a otro nivel.
              </p>
            </div>
            {/* El resto del footer mantiene la estructura pero con un poco más de espaciado */}
            <div>
              <h4 className="font-extrabold mb-5 text-lg border-b border-blue-600/50 pb-2">Vehículos</h4>
              <ul className="space-y-3 text-base text-gray-400">
                <li><Link href="/inventory" className="hover:text-blue-400 transition-colors">Inventario Completo</Link></li>
                <li><Link href="/inventory?status=available" className="hover:text-blue-400 transition-colors">Seminuevos Certificados</Link></li>
                <li><Link href="#promociones" className="hover:text-blue-400 transition-colors">Promociones Vigentes</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-extrabold mb-5 text-lg border-b border-blue-600/50 pb-2">Servicios</h4>
              <ul className="space-y-3 text-base text-gray-400">
                <li><Link href="#financiamiento" className="hover:text-blue-400 transition-colors">Opciones de Financiamiento</Link></li>
                <li><Link href="#servicio" className="hover:text-blue-400 transition-colors">Mantenimiento y Taller</Link></li>
                <li><Link href="#contacto" className="hover:text-blue-400 transition-colors">Información de Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-extrabold mb-5 text-lg border-b border-blue-600/50 pb-2">Información</h4>
              <ul className="space-y-3 text-base text-gray-400">
                <li><Link href="#contacto" className="hover:text-blue-400 transition-colors">Consulta Nuestros Horarios</Link></li>
                <li><Link href="#" className="hover:text-blue-400 transition-colors">Aviso de Privacidad</Link></li>
                <li><Link href="#" className="hover:text-blue-400 transition-colors">Términos y Condiciones</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>**Nocturna Genesis** | © 2024 Todos los derechos reservados. Diseñado con pasión.</p>
          </div>
        </div>
      </footer>
    </>
  );
}