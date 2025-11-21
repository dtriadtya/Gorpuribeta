'use client'

import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 sm:py-20 px-4 text-center">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">
            Hubungi Kami
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto">
            Ada pertanyaan atau butuh bantuan? Tim customer service kami siap membantu Anda 
            24/7 dengan senang hati.
          </p>
        </div>
      </div>

      {/* Main Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Ketentuan dan Rules Booking */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 mb-8 sm:mb-12 transition-all duration-300 hover:shadow-lg hover:border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 sm:mb-8 border-b-2 border-green-500 pb-3 sm:pb-4">
            Ketentuan & Rules Booking
          </h2>
          
          <div className="space-y-6">
            {/* Ketentuan Umum */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Ketentuan Umum
              </h3>
              <ul className="space-y-2.5 ml-5 text-gray-700">
                <li className="flex items-start leading-relaxed">
                  <span className="text-green-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Booking lapangan dapat dilakukan minimal H-1 (1 hari sebelumnya)</span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-green-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Jam operasional booking: 08:00 - 22:00 WIB</span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-green-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Minimal durasi booking adalah 1 jam</span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-green-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Maksimal booking dapat dilakukan untuk 30 hari ke depan</span>
                </li>
              </ul>
            </div>

            {/* Pembayaran */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Pembayaran
              </h3>
              <ul className="space-y-2.5 ml-5 text-gray-700">
                <li className="flex items-start leading-relaxed">
                  <span className="text-blue-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Tersedia 2 opsi pembayaran: <strong className="text-blue-600">DP</strong> atau <strong className="text-green-600">Lunas</strong></span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-blue-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Pembayaran DP sebesar 50% dari total biaya booking</span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-blue-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Pelunasan sisa pembayaran dilakukan maksimal H-1 sebelum jadwal main</span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-blue-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Upload bukti pembayaran setelah melakukan transfer</span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-blue-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Verifikasi pembayaran dilakukan maksimal 2 jam oleh admin</span>
                </li>
              </ul>
            </div>

            {/* Pembatalan */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                Pembatalan & Reschedule
              </h3>
              <ul className="space-y-2.5 ml-5 text-gray-700">
                <li className="flex items-start leading-relaxed">
                  <span className="text-red-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Pembatalan dapat dilakukan maksimal H-2 sebelum jadwal main</span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-red-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base"><strong className="text-red-600">DP yang sudah dibayarkan tidak akan dikembalikan</strong> jika terjadi pembatalan</span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-red-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base"><strong className="text-red-600">Pelunasan yang telah dilakukan akan dikembalikan 50%</strong> jika terjadi pembatalan</span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-red-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Reschedule dapat dilakukan maksimal 1x dengan pemberitahuan H-2</span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-red-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Pembatalan setelah H-2 atau tanpa konfirmasi tidak dapat di-refund</span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-red-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Hubungi customer service untuk proses pembatalan/reschedule</span>
                </li>
              </ul>
            </div>

            {/* Fasilitas & Aturan Lapangan */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Fasilitas & Aturan Lapangan
              </h3>
              <ul className="space-y-2.5 ml-5 text-gray-700">
                <li className="flex items-start leading-relaxed">
                  <span className="text-purple-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base"><strong className="text-purple-600">Check-in dilakukan paling lama 15 menit sebelum jadwal mulai</strong></span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-purple-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Toleransi keterlambatan maksimal 15 menit dari jadwal booking</span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-purple-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Dilarang membawa makanan dan minuman dari luar area</span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-purple-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Wajib menggunakan sepatu olahraga yang bersih</span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-purple-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Menjaga kebersihan dan tidak merusak fasilitas lapangan</span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-purple-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Pengelola tidak bertanggung jawab atas kehilangan barang pribadi</span>
                </li>
              </ul>
            </div>

            {/* Contact for Questions */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 sm:p-6 border-2 border-green-200 mt-6">
              <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                <strong className="text-green-700 font-bold text-base sm:text-lg">💡 Catatan:</strong> Untuk informasi lebih lanjut atau pertanyaan mengenai ketentuan booking, 
                silakan hubungi customer service kami melalui WhatsApp atau datang langsung ke lokasi kami.
              </p>
            </div>
          </div>
        </div>

        {/* Ketentuan Member */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 mb-8 sm:mb-12 transition-all duration-300 hover:shadow-lg hover:border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 sm:mb-8 border-b-2 border-yellow-500 pb-3 sm:pb-4">
            Ketentuan Member
          </h2>
          
          <div className="space-y-6">
            {/* Jenis & Benefit Member */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                Jenis & Benefit Member
              </h3>
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 sm:p-5 space-y-4">
                <div className="flex items-start">
                  <span className="text-yellow-500 mr-3 font-bold text-lg">•</span>
                  <div className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    <strong className="text-yellow-700">Member Reguler</strong>
                    <div className="text-xs sm:text-sm mt-1 text-gray-600">
                      Durasi paket fleksibel 1 – 6 bulan. <br className="hidden sm:block" />
                      Benefit: <strong>Gratis 1 galon Aqua per jam</strong> jadwal member (contoh: 2 jam / minggu = 2 galon setiap kali jadwal berjalan).
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-yellow-500 mr-3 font-bold text-lg">•</span>
                  <div className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    <strong className="text-yellow-700">Member+</strong>
                    <div className="text-xs sm:text-sm mt-1 text-gray-600">
                      Durasi khusus 12 bulan. <br className="hidden sm:block" />
                      Benefit: <strong>Gratis 3 galon Aqua + es kristal</strong> setiap jadwal bermain.
                    </div>
                  </div>
                </div>
                <div className="bg-white/70 border border-yellow-200 rounded-md p-3 text-[11px] sm:text-xs text-gray-600">
                  Catatan: Pemberian galon dihitung per sesi/jadwal aktif (bukan akumulasi jam terpisah dalam hari berbeda). Es kristal hanya khusus untuk Member+.
                </div>
              </div>
            </div>

            {/* (Opsional) Ringkasan Benefit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-700 mb-2">Ringkas Member Reguler</h4>
                <ul className="space-y-1 text-xs sm:text-sm text-gray-700 list-disc ml-4">
                  <li>Durasi fleksibel 1–6 bulan</li>
                  <li>1 galon Aqua gratis per jam jadwal</li>
                  <li>Dapat diperpanjang kapan saja sebelum habis</li>
                </ul>
              </div>
              <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-purple-700 mb-2">Ringkas Member+</h4>
                <ul className="space-y-1 text-xs sm:text-sm text-gray-700 list-disc ml-4">
                  <li>Durasi 12 bulan</li>
                  <li>3 galon Aqua + es kristal per sesi</li>
                  <li>Prioritas ketersediaan jadwal (jika diberlakukan)</li>
                </ul>
              </div>
            </div>

            {/* Syarat & Ketentuan Member */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Syarat & Ketentuan
              </h3>
              <ul className="space-y-2.5 ml-5 text-gray-700">
                <li className="flex items-start leading-relaxed">
                  <span className="text-blue-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Membership bersifat personal dan tidak dapat dipindahtangankan</span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-blue-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Wajib menunjukkan kartu member atau ID member saat check-in</span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-blue-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Pembayaran membership dapat dilakukan secara cash atau transfer</span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-blue-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Perpanjangan membership harus dilakukan maksimal 1 bulan sebelum masa aktif berakhir dengan menghubungi customer service</span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-blue-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Member yang telah kadaluarsa dapat melakukan pembaruan dengan syarat dan ketentuan berlaku</span>
                </li>
              </ul>
            </div>

            {/* Pembatalan & Refund Member */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                Pembatalan & Refund
              </h3>
              <ul className="space-y-2.5 ml-5 text-gray-700">
                <li className="flex items-start leading-relaxed">
                  <span className="text-red-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base"><strong className="text-red-600">Membership yang sudah dibeli tidak dapat dikembalikan (non-refundable)</strong></span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-red-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Masa aktif membership tidak dapat diperpanjang secara otomatis</span>
                </li>
              </ul>
            </div>

            {/* Aturan Khusus Member */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Aturan Khusus
              </h3>
              <ul className="space-y-2.5 ml-5 text-gray-700">
                <li className="flex items-start leading-relaxed">
                  <span className="text-purple-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Member wajib menjaga fasilitas dan tidak merusak properti venue</span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-purple-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Pelanggaran terhadap aturan dapat mengakibatkan pencabutan membership tanpa refund</span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-purple-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Diskon member tidak dapat digabungkan dengan promo lainnya</span>
                </li>
                <li className="flex items-start leading-relaxed">
                  <span className="text-purple-500 mr-3 font-bold text-lg">•</span>
                  <span className="text-sm sm:text-base">Manajemen berhak mengubah syarat dan ketentuan member sewaktu-waktu dengan pemberitahuan terlebih dahulu</span>
                </li>
              </ul>
            </div>

            {/* Contact for Member Info */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 sm:p-6 border-2 border-yellow-200 mt-6">
              <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                <strong className="text-yellow-700 font-bold text-base sm:text-lg">🎖️ Info Membership:</strong> Untuk mendaftar menjadi member atau mendapatkan informasi lebih lanjut tentang paket membership dan harganya, 
                silakan hubungi customer service kami melalui WhatsApp atau kunjungi langsung lokasi kami.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          
          {/* Left Side - Contact Information */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 border-b pb-2 sm:pb-3">
              Informasi Kontak
            </h2>
            
            <div className="space-y-6 sm:space-y-8">
              {[
                {
                  icon: <MapPin className="w-7 h-7 text-blue-500" />,
                  title: 'Alamat',
                  text: (
                    <>
                      Jl. Puri Beta Utara No.65<br />
                      Larangan, Kota Tangerang<br />
                      Banten 15154
                    </>
                  ),
                },
                {
                  icon: <Phone className="w-7 h-7 text-green-500" />,
                  title: 'Telepon / WhatsApp',
                  text: (
                    <>
                      <a
                        href="https://wa.me/6287773002607"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 font-medium transition-colors"
                      >
                        +62 877-7300-2607 (WhatsApp)
                      </a>
                    </>
                  ),
                },
                {
                  icon: <Mail className="w-7 h-7 text-red-500" />,
                  title: 'Email',
                  text: (
                    <>
                      info@sportreservation.com<br />
                      support@sportreservation.com
                    </>
                  ),
                },
                {
                  icon: <Clock className="w-7 h-7 text-purple-500" />,
                  title: 'Jam Operasional',
                  text: (
                    <>
                      Senin - Minggu: 08:00 - 22:00<br />
                      Customer Service: 24 Jam
                    </>
                  ),
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-3 sm:space-x-4 group"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-100 transition">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Map Embed */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 border-b pb-2 sm:pb-3">
              Lokasi Kami
            </h2>
            <div className="w-full h-64 sm:h-96 rounded-xl overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.282434741892!2d106.72150747399009!3d-6.226443693761633!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f0a9fb50ab95%3A0xd5616851f0ec0961!2sGelanggang%20Olahraga%20Larangan!5e0!3m2!1sen!2sid!4v1761065307659!5m2!1sen!2sid" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }}
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
