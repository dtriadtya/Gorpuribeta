'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function FeaturedFields() {
  const [images, setImages] = useState<string[]>([])
  const [curr, setCurr] = useState(0)

  /* ---------- DATA DARI /public/fields ---------- */
  useEffect(() => {
    // Tambahkan nama file sesuai isi folder public/fields
    const imgs = [
    '/images/badminton.jpg',
    '/images/basket.jpg',
    '/images/futsal.jpg',
  ]
  setImages(imgs)
}, [])

  /* ---------- AUTO SLIDE ---------- */
  useEffect(() => {
    if (!images.length) return
    const interval = setInterval(() => {
      setCurr(p => (p + 1) % images.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [images.length])

  /* ---------- NAVIGASI ---------- */
  const prev = useCallback(() => {
    setCurr(c => (c - 1 + images.length) % images.length)
  }, [images.length])

  const next = useCallback(() => {
    setCurr(c => (c + 1) % images.length)
  }, [images.length])

  /* ---------- SWIPE ---------- */
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX)
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const diff = touchStart - e.targetTouches[0].clientX
    if (diff > 50) {
      next()
      setTouchStart(null)
    } else if (diff < -50) {
      prev()
      setTouchStart(null)
    }
  }
  const onTouchEnd = () => setTouchStart(null)

  /* ---------- RENDER ---------- */
  if (!images.length)
    return (
      <section className="py-20 bg-gray-50 text-center text-gray-500">
        Memuat gambar...
      </section>
    )

  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Carousel Coverflow */}
        <div
          className="relative w-full max-w-5xl mx-auto aspect-[16/9] perspective-[1200px]"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {images.map((img, i) => {
            const offset = (i - curr + images.length) % images.length
            let transform = ''
            let zIndex = 10
            let opacity = 1

            if (offset === 0) {
              transform = 'translateX(0) scale(1) rotateY(0deg)'
              zIndex = 30
            } else if (offset === 1) {
              transform = 'translateX(250px) scale(0.85) rotateY(-25deg)'
              zIndex = 20
              opacity = 0.8
            } else if (offset === images.length - 1) {
              transform = 'translateX(-250px) scale(0.85) rotateY(25deg)'
              zIndex = 20
              opacity = 0.8
            } else {
              transform = 'translateX(0) scale(0.7) rotateY(0deg)'
              opacity = 0
              zIndex = 0
            }

            return (
              <div
                key={i}
                className="absolute inset-0 transition-all duration-700 ease-in-out"
                style={{ transform, opacity, zIndex }}
              >
                <div className="relative w-full h-full overflow-hidden shadow-2xl cursor-default">
                  <Image
                    src={img}
                    alt={`Lapangan ${i + 1}`}
                    fill
                    className="object-cover select-none"
                    priority={i === 0}
                  />
                </div>
              </div>
            )
          })}

          {/* Tombol navigasi */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-50 
                       bg-gray-900/70 hover:bg-gray-900 text-white 
                       rounded-full p-3 shadow-lg transition-all duration-300
                       hidden sm:block"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-50 
                       bg-gray-900/70 hover:bg-gray-900 text-white 
                       rounded-full p-3 shadow-lg transition-all duration-300
                       hidden sm:block"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-50">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurr(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === curr 
                    ? 'bg-white w-8' 
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
