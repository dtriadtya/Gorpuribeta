(()=>{var e={};e.id=7702,e.ids=[7702],e.modules={55403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},94749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},25528:e=>{"use strict";e.exports=require("next/dist\\client\\components\\action-async-storage.external.js")},91877:e=>{"use strict";e.exports=require("next/dist\\client\\components\\request-async-storage.external.js")},25319:e=>{"use strict";e.exports=require("next/dist\\client\\components\\static-generation-async-storage.external.js")},57310:e=>{"use strict";e.exports=require("url")},95326:(e,t,a)=>{"use strict";a.r(t),a.d(t,{GlobalError:()=>i.a,__next_app__:()=>u,originalPathname:()=>m,pages:()=>c,routeModule:()=>p,tree:()=>d});var s=a(67096),r=a(16132),n=a(37284),i=a.n(n),l=a(32564),o={};for(let e in l)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(o[e]=()=>l[e]);a.d(t,o);let d=["",{children:["dashboard",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(a.bind(a,1618)),"C:\\Projects\\backup 07-11-2025 4.11\\gorpuribeta-main\\app\\dashboard\\page.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(a.bind(a,29925)),"C:\\Projects\\backup 07-11-2025 4.11\\gorpuribeta-main\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(a.t.bind(a,9291,23)),"next/dist/client/components/not-found-error"]}],c=["C:\\Projects\\backup 07-11-2025 4.11\\gorpuribeta-main\\app\\dashboard\\page.tsx"],m="/dashboard/page",u={require:a,loadChunk:()=>Promise.resolve()},p=new s.AppPageRouteModule({definition:{kind:r.x.APP_PAGE,page:"/dashboard/page",pathname:"/dashboard",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},36685:(e,t,a)=>{Promise.resolve().then(a.bind(a,55567))},55567:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>DashboardPage});var s=a(30784),r=a(9885),n=a(57114),i=a(517),l=a(15441),o=a(87094),d=a(34253),c=a(27157),m=a(6315),u=a(56206),p=a(34706),x=a(96253),h=a(23294),g=a(43250),b=a(28626),y=a(19300);function ChangePasswordModal({isOpen:e,onClose:t}){let[a,n]=(0,r.useState)(""),[i,l]=(0,r.useState)(""),[o,d]=(0,r.useState)(""),[c,m]=(0,r.useState)(!1),[u,p]=(0,r.useState)(!1),[x,f]=(0,r.useState)(!1),[v,N]=(0,r.useState)(!1),handleSubmit=async e=>{if(e.preventDefault(),i!==o){y.Z.fire({icon:"error",title:"Gagal",text:"Password baru dan konfirmasi password tidak cocok!"});return}N(!0);try{let e=localStorage.getItem("token"),s=JSON.parse(localStorage.getItem("user")||"{}"),r=await fetch("/api/users/change-password",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`},body:JSON.stringify({userId:s.id_user,currentPassword:a,newPassword:i})}),o=await r.json();if(r.ok)y.Z.fire({icon:"success",title:"Sukses",text:"Password berhasil diubah!"}),t(),n(""),l(""),d("");else throw Error(o.message||"Terjadi kesalahan saat mengubah password")}catch(e){y.Z.fire({icon:"error",title:"Gagal",text:e.message||"Terjadi kesalahan saat mengubah password"})}finally{N(!1)}};return e?s.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",children:(0,s.jsxs)("div",{className:"bg-white rounded-lg w-full max-w-md p-6 relative",children:[s.jsx("h2",{className:"text-xl font-semibold text-gray-900 mb-4",children:"Ganti Password"}),(0,s.jsxs)("form",{onSubmit:handleSubmit,children:[(0,s.jsxs)("div",{className:"space-y-4",children:[(0,s.jsxs)("div",{children:[s.jsx("label",{htmlFor:"currentPassword",className:"block text-sm font-medium text-gray-700 mb-1",children:"Password Saat Ini"}),(0,s.jsxs)("div",{className:"relative",children:[s.jsx("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",children:s.jsx(h.Z,{className:"h-5 w-5 text-gray-400"})}),s.jsx("input",{id:"currentPassword",type:c?"text":"password",value:a,onChange:e=>n(e.target.value),required:!0,className:"block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"}),s.jsx("button",{type:"button",onClick:()=>m(!c),className:"absolute inset-y-0 right-0 pr-3 flex items-center",children:c?s.jsx(g.Z,{className:"h-5 w-5 text-gray-400"}):s.jsx(b.Z,{className:"h-5 w-5 text-gray-400"})})]})]}),(0,s.jsxs)("div",{children:[s.jsx("label",{htmlFor:"newPassword",className:"block text-sm font-medium text-gray-700 mb-1",children:"Password Baru"}),(0,s.jsxs)("div",{className:"relative",children:[s.jsx("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",children:s.jsx(h.Z,{className:"h-5 w-5 text-gray-400"})}),s.jsx("input",{id:"newPassword",type:u?"text":"password",value:i,onChange:e=>l(e.target.value),required:!0,className:"block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"}),s.jsx("button",{type:"button",onClick:()=>p(!u),className:"absolute inset-y-0 right-0 pr-3 flex items-center",children:u?s.jsx(g.Z,{className:"h-5 w-5 text-gray-400"}):s.jsx(b.Z,{className:"h-5 w-5 text-gray-400"})})]})]}),(0,s.jsxs)("div",{children:[s.jsx("label",{htmlFor:"confirmPassword",className:"block text-sm font-medium text-gray-700 mb-1",children:"Konfirmasi Password Baru"}),(0,s.jsxs)("div",{className:"relative",children:[s.jsx("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",children:s.jsx(h.Z,{className:"h-5 w-5 text-gray-400"})}),s.jsx("input",{id:"confirmPassword",type:x?"text":"password",value:o,onChange:e=>d(e.target.value),required:!0,className:"block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"}),s.jsx("button",{type:"button",onClick:()=>f(!x),className:"absolute inset-y-0 right-0 pr-3 flex items-center",children:x?s.jsx(g.Z,{className:"h-5 w-5 text-gray-400"}):s.jsx(b.Z,{className:"h-5 w-5 text-gray-400"})})]})]})]}),(0,s.jsxs)("div",{className:"mt-6 flex justify-end space-x-3",children:[s.jsx("button",{type:"button",onClick:t,className:"px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",children:"Batal"}),s.jsx("button",{type:"submit",disabled:v,className:"px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed",children:v?"Menyimpan...":"Simpan"})]})]})]})}):null}function DashboardPage(){let[e,t]=(0,r.useState)(null),[a,h]=(0,r.useState)([]),[g,b]=(0,r.useState)(!0),[f,v]=(0,r.useState)(!1),[N,w]=(0,r.useState)(null),[j,k]=(0,r.useState)(null),[P,_]=(0,r.useState)("BANK_TRANSFER"),[E,D]=(0,r.useState)(!1),A=(0,n.useRouter)();(0,r.useEffect)(()=>{let initializeDashboard=async()=>{b(!0),await new Promise(e=>setTimeout(e,100)),checkAuth()};initializeDashboard()},[]);let checkAuth=async()=>{let e=localStorage.getItem("token"),a=localStorage.getItem("user");if(!e||!a){A.push("/login");return}try{let s=JSON.parse(a);t(s),await refreshUserProfile(e),fetchReservations(e)}catch(e){console.error("Error parsing user data:",e),A.push("/login")}},refreshUserProfile=async e=>{try{let a=await fetch("/api/auth/me",{headers:{Authorization:`Bearer ${e}`}});if(a.ok){let e=await a.json();e.user&&(t(e.user),localStorage.setItem("user",JSON.stringify(e.user)))}}catch(e){console.error("Error refreshing user profile:",e)}},fetchReservations=async e=>{try{let t=JSON.parse(localStorage.getItem("user")||"{}"),a=await fetch(`/api/reservations?user_id=${t.id_user}`,{headers:{Authorization:`Bearer ${e}`}});if(!a.ok){console.error("Failed to fetch reservations"),h([]);return}let s=await a.json(),r=s.reservations||[],n=r.sort((e,t)=>{let a=new Date(e.updated_at||e.created_at).getTime(),s=new Date(t.updated_at||t.created_at).getTime();return s-a});h(n)}catch(e){console.error("Error fetching reservations:",e)}finally{b(!1)}},formatPrice=e=>isNaN(e)||null==e?"Rp 0":new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0}).format(e),formatDate=e=>new Date(e).toLocaleDateString("id-ID"),getPaymentStatusColor=e=>{switch(e){case"PENDING":return"bg-yellow-100 text-yellow-800";case"FULL_SENT":case"DP_SENT":return"bg-blue-100 text-blue-800";case"FULL_REJECTED":case"DP_REJECTED":case"PELUNASAN_REJECTED":case"REFUNDED":return"bg-red-100 text-red-800";case"DP_PAID":return"bg-blue-200 text-blue-900";case"PELUNASAN_SENT":return"bg-purple-100 text-purple-800";case"PELUNASAN_PAID":return"bg-purple-200 text-purple-900";case"PAID":return"bg-green-100 text-green-800";default:return"bg-gray-100 text-gray-800"}},getPaymentStatusText=(e,t)=>{if("DP"!==t)switch(e){case"PENDING":case"FULL_SENT":return"Menunggu Validasi";case"PAID":case"PELUNASAN_PAID":return"Lunas";case"DP_REJECTED":case"FULL_REJECTED":return"Ditolak Admin";case"REFUNDED":return"Dikembalikan";default:return e}switch(e){case"PENDING":case"DP_SENT":return"Menunggu Validasi DP";case"DP_PAID":return"DP Terbayar";case"DP_REJECTED":return"DP Ditolak";case"PELUNASAN_SENT":return"Pelunasan Terkirim";case"PELUNASAN_REJECTED":return"Pelunasan Ditolak";case"PELUNASAN_PAID":return"Pelunasan Terbayar";case"PAID":return"Lunas";case"REFUNDED":return"Dikembalikan";default:return e}},handleUploadPelunasan=async e=>{_("BANK_TRANSFER"),D(!1);let t=a.find(t=>t.id===e);if(!t)return;let s=.5*t.total_price,r=t.payment_amount||.5*t.total_price,n="PELUNASAN_REJECTED"===t.payment_status,i=n?`<div class="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-4 flex items-start space-x-3 shadow-sm">
          <div class="flex-shrink-0 text-yellow-500 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>
              <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm text-yellow-900 leading-relaxed">
              <span class="font-semibold">Peringatan:</span> Pelunasan sebelumnya ditolak. Silakan upload bukti pembayaran yang benar.
            </p>
          </div>
        </div>`:"",{value:l}=await y.Z.fire({title:n?"Upload Ulang Bukti Pelunasan":"Upload Bukti Pelunasan",html:`
        <div class="text-left space-y-4">
          ${i}
          
          <!-- Sender Account Name Input - BARU -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nama Rekening Pengirim <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="pelunasanSenderAccountName"
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Masukkan nama sesuai rekening pengirim"
              required
            />
            <p class="text-xs text-gray-500 mt-1.5">
              Nama harus sesuai dengan rekening yang digunakan untuk transfer
            </p>
          </div>
          
          <!-- Payment Method Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Pilih Metode Pembayaran
            </label>
            <div class="relative">
              <!-- Dropdown Button -->
              <button
                type="button"
                id="paymentMethodBtn"
                class="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 font-medium cursor-pointer hover:border-gray-400 transition-colors shadow-sm text-left flex items-center"
              >
                <svg id="selectedIcon" class="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span id="selectedText">Tunai</span>
                <svg id="chevronIcon" class="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <div 
                id="paymentMethodMenu"
                class="hidden absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden"
                style="animation: fadeIn 0.2s ease-out;"
              >
                <style>
                  @keyframes fadeIn {
                    from {
                      opacity: 0;
                      transform: translateY(-10px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                </style>
                <!-- Tunai Option -->
                <button
                  type="button"
                  data-value="BANK_TRANSFER"
                  class="payment-option w-full px-4 py-3 text-left flex items-center hover:bg-blue-50 transition-colors bg-blue-50"
                >
                  <svg class="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span class="flex-1 font-medium text-gray-900">Tunai</span>
                  <svg class="check-icon w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>

                <!-- QRIS Option -->
                <button
                  type="button"
                  data-value="QRIS"
                  class="payment-option w-full px-4 py-3 text-left flex items-center hover:bg-blue-50 transition-colors"
                >
                  <svg class="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <span class="flex-1 font-medium text-gray-900">QRIS</span>
                  <svg class="check-icon w-5 h-5 text-blue-600 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Bank/QRIS Info Card -->
          <div id="paymentInfo" class="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
            <div class="flex items-start space-x-3 mb-3">
              <div class="bg-blue-600 rounded-lg p-2">
                <svg id="paymentIcon" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
              </div>
              <div class="flex-1">
                <p id="paymentTitle" class="text-sm font-bold text-blue-900 mb-1">Informasi Rekening Transfer</p>
                <p id="paymentSubtitle" class="text-xs text-blue-700">Silakan transfer ke rekening berikut:</p>
              </div>
            </div>
            
            <!-- Bank Transfer Content -->
            <div id="bankContent" class="bg-white rounded-lg p-4 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500">Bank</span>
                <span class="text-sm font-bold text-gray-900">BCA</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500">No. Rekening</span>
                <span class="text-sm font-bold text-gray-900">3450763755</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500">Atas Nama</span>
                <span class="text-sm font-bold text-gray-900">Rafael Nugroho</span>
              </div>
              <div class="flex justify-between items-center pt-2 border-t">
                <span class="text-xs font-medium text-gray-600">Total Harga</span>
                <span class="text-sm font-bold text-gray-900">${formatPrice(t.total_price)}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs font-medium text-gray-600">DP Terbayar (50%)</span>
                <span class="text-sm font-bold text-green-600">${formatPrice(r)}</span>
              </div>
              <div class="flex justify-between items-center pt-2 border-t border-blue-200">
                <span class="text-sm font-bold text-gray-900">Jumlah Transfer</span>
                <span class="text-lg font-bold text-blue-600">${formatPrice(s)}</span>
              </div>
            </div>

            <!-- QRIS Content (Hidden by default) -->
            <div id="qrisContent" class="bg-white rounded-lg p-4" style="display: none;">
              <div class="flex flex-col items-center">
                <div class="bg-white p-4 rounded-lg border-2 border-blue-200 mb-3">
                  <img 
                    src="/images/qris.jpeg" 
                    alt="QRIS Code" 
                    style="width: 256px; height: 256px; object-fit: contain;"
                    onerror="this.parentElement.innerHTML='<div style=\\'width:256px;height:256px;display:flex;align-items:center;justify-content:center;background:linear-gradient(to bottom right, #dbeafe, #e0e7ff);border-radius:0.5rem\\'><div style=\\'text-align:center\\'><svg style=\\'width:64px;height:64px;margin:0 auto 8px;color:#2563eb\\' fill=\\'none\\' stroke=\\'currentColor\\' viewBox=\\'0 0 24 24\\'><path stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'2\\' d=\\'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z\\'></path></svg><p style=\\'font-size:14px;font-weight:500;color:#1e3a8a\\'>QR Code QRIS</p><p style=\\'font-size:12px;color:#2563eb;margin-top:4px\\'>Scan untuk bayar</p></div></div>'"
                  />
                </div>
                <p class="text-sm text-gray-600 text-center mb-3 font-medium">Scan QR Code dengan aplikasi mobile banking</p>
                <div class="w-full border-t pt-3">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-xs font-medium text-gray-600">Total Harga</span>
                    <span class="text-sm font-bold text-gray-900">${formatPrice(t.total_price)}</span>
                  </div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-xs font-medium text-gray-600">DP Terbayar (50%)</span>
                    <span class="text-sm font-bold text-green-600">${formatPrice(r)}</span>
                  </div>
                  <div class="flex justify-between items-center pt-2 border-t border-blue-200">
                    <span class="text-sm font-bold text-gray-900">Jumlah Bayar</span>
                    <span class="text-lg font-bold text-blue-600">${formatPrice(s)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Upload Section -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Upload Bukti Transfer <span class="text-red-500">*</span>
            </label>
            <p class="text-xs text-gray-500 mb-3">Format: JPG, PNG, JPEG (Maksimal 5MB)</p>
          </div>
        </div>
        <style>
          .swal2-file {
            width: 100%;
            padding: 12px;
            border: 2px solid #d1d5db;
            border-radius: 8px;
            background-color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          }
          .swal2-file:hover {
            border-color: #9ca3af;
            background-color: #f9fafb;
          }
          .swal2-file:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          .swal2-file::file-selector-button {
            padding: 8px 16px;
            margin-right: 16px;
            border: none;
            border-radius: 6px;
            background-color: #3b82f6;
            color: white;
            font-weight: 500;
            font-size: 14px;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .swal2-file::file-selector-button:hover {
            background-color: #2563eb;
          }
          .swal2-html-container {
            margin: 0 !important;
            padding: 0 1rem 1rem 1rem !important;
          }
          .swal2-title {
            font-size: 1.5rem !important;
            font-weight: 600 !important;
            color: #1f2937 !important;
            padding: 1.5rem 1.5rem 1rem 1.5rem !important;
          }
          .swal2-actions button {
            border-radius: 0.75rem !important;
            padding: 0.75rem 2rem !important;
            font-weight: 500 !important;
            font-size: 0.95rem !important;
          }
          .swal2-cancel {
            background-color: white !important;
            color: #374151 !important;
            border: 2px solid #d1d5db !important;
          }
          .swal2-cancel:hover {
            background-color: #f9fafb !important;
            border-color: #9ca3af !important;
          }
        </style>
      `,input:"file",inputAttributes:{accept:"image/*","aria-label":"Upload bukti pelunasan"},showCancelButton:!0,confirmButtonText:"Upload",cancelButtonText:"Batal",confirmButtonColor:"#3b82f6",cancelButtonColor:"transparent",width:"650px",customClass:{popup:"rounded-xl"},preConfirm:e=>{let t=document.getElementById("pelunasanSenderAccountName"),a=t?.value?.trim();return e?{file:e,senderName:a}:(y.Z.showValidationMessage("File bukti transfer wajib diupload"),!1)},didOpen:()=>{let e=document.getElementById("paymentMethodBtn"),t=document.getElementById("paymentMethodMenu"),a=document.getElementById("chevronIcon"),s=document.querySelectorAll(".payment-option"),r=document.getElementById("bankContent"),n=document.getElementById("qrisContent"),i=document.getElementById("paymentIcon"),l=document.getElementById("paymentTitle"),o=document.getElementById("paymentSubtitle"),d=document.getElementById("selectedIcon"),c=document.getElementById("selectedText"),m=document.getElementById("pelunasanSenderAccountName"),u=y.Z.getConfirmButton(),p=y.Z.getInput(),validateForm=()=>{let e=m?.value?.trim()!=="",t=p?.files&&p.files.length>0;u&&(e&&t?u.removeAttribute("disabled"):u.setAttribute("disabled","true"))};validateForm(),m&&m.addEventListener("input",validateForm),p&&p.addEventListener("change",validateForm),e&&t&&a&&(e.addEventListener("click",function(e){e.preventDefault(),e.stopPropagation();let s=t.classList.contains("hidden");s?(t.classList.remove("hidden"),a&&(a.style.transform="translateY(-50%) rotate(180deg)")):(t.classList.add("hidden"),a&&(a.style.transform="translateY(-50%) rotate(0deg)"))}),document.addEventListener("click",function(s){let r=s.target;t&&!t.contains(r)&&r!==e&&(t.classList.add("hidden"),a&&(a.style.transform="translateY(-50%) rotate(0deg)"))})),s.forEach(e=>{e.addEventListener("click",function(e){e.preventDefault(),e.stopPropagation();let m=this.getAttribute("data-value");s.forEach(e=>{let t=e.querySelector(".check-icon");e===this?(e.classList.add("bg-blue-50"),t&&t.classList.remove("hidden")):(e.classList.remove("bg-blue-50"),t&&t.classList.add("hidden"))}),"QRIS"===m?(d&&(d.innerHTML='<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>',d.classList.remove("text-blue-600"),d.classList.add("text-green-600")),c&&(c.textContent="QRIS"),r&&(r.style.display="none"),n&&(n.style.display="block"),i&&(i.innerHTML='<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>'),l&&(l.textContent="Informasi QRIS"),o&&(o.textContent="Scan QR Code di bawah ini untuk pembayaran:")):(d&&(d.innerHTML='<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />',d.classList.remove("text-green-600"),d.classList.add("text-blue-600")),c&&(c.textContent="Tunai"),r&&(r.style.display="block"),n&&(n.style.display="none"),i&&(i.innerHTML='<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>'),l&&(l.textContent="Informasi Rekening Transfer"),o&&(o.textContent="Silakan transfer ke rekening berikut:")),t&&t.classList.add("hidden"),a&&(a.style.transform="translateY(-50%) rotate(0deg)")})})}});if(l){w(e);let t=new FormData;t.append("file",l.file),t.append("reservationId",e.toString()),t.append("paymentNotes","Bukti pelunasan pembayaran DP"),t.append("pelunasanSenderAccountName",l.senderName);try{let e=localStorage.getItem("token"),a=await fetch("/api/reservations/upload-payment",{method:"POST",headers:{Authorization:`Bearer ${e}`},body:t}),s=await a.json();if(a.ok)await y.Z.fire({icon:"success",title:"Berhasil!",text:"Bukti pelunasan berhasil diupload. Menunggu verifikasi admin.",confirmButtonColor:"#3b82f6"}),e&&fetchReservations(e);else throw Error(s.error||"Gagal upload bukti pelunasan")}catch(e){await y.Z.fire({icon:"error",title:"Gagal",text:e.message||"Terjadi kesalahan saat upload bukti pelunasan",confirmButtonColor:"#ef4444"})}finally{w(null)}}};return g?s.jsx("div",{className:"min-h-screen bg-gray-50 flex items-center justify-center",children:(0,s.jsxs)("div",{className:"text-center",children:[s.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"}),s.jsx("p",{className:"text-gray-600",children:"Memuat dashboard..."})]})}):(0,s.jsxs)("div",{className:"min-h-screen bg-gray-50",children:[s.jsx(ChangePasswordModal,{isOpen:f,onClose:()=>v(!1)}),(0,s.jsxs)("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8",children:[(0,s.jsxs)("div",{className:"bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between",children:[(0,s.jsxs)("div",{className:"flex items-start sm:items-center",children:[s.jsx("div",{className:"flex items-center justify-center",children:s.jsx("div",{className:"group cursor-pointer transition-transform duration-300 hover:scale-105",children:(0,s.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",width:"60",height:"60",viewBox:"0 0 24 24",fill:"none",stroke:"#0518ebff",strokeWidth:"0.75",strokeLinecap:"round",strokeLinejoin:"round",className:"transition-colors duration-300 group-hover:stroke-[#3b82f6]",children:[s.jsx("circle",{cx:"12",cy:"12",r:"10"}),s.jsx("circle",{cx:"12",cy:"10",r:"3"}),s.jsx("path",{d:"M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"})]})})}),(0,s.jsxs)("div",{className:"ml-3 sm:ml-4",children:[s.jsx("h3",{className:"text-base sm:text-lg font-semibold text-gray-900",children:e?.name||"—"}),s.jsx("p",{className:"text-sm text-gray-700",children:e?.email||"—"}),s.jsx("p",{className:"text-sm text-gray-600",children:e?.phone||"Belum ditambahkan"})]})]}),s.jsx("button",{onClick:()=>v(!0),className:"mt-4 sm:mt-0 w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700",children:"Ganti Password"})]}),(0,s.jsxs)("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 mb-6",children:[s.jsx("div",{className:"bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6",children:(0,s.jsxs)("div",{className:"flex items-center",children:[s.jsx("div",{className:"w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center",children:s.jsx(i.Z,{className:"w-5 h-5 sm:w-6 sm:h-6 text-blue-600"})}),(0,s.jsxs)("div",{className:"ml-3 sm:ml-4",children:[s.jsx("p",{className:"text-xs sm:text-sm font-medium text-gray-600",children:"Total Reservasi"}),s.jsx("p",{className:"text-lg sm:text-2xl font-bold text-gray-900",children:a.length})]})]})}),s.jsx("div",{className:"bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6",children:(0,s.jsxs)("div",{className:"flex items-center",children:[s.jsx("div",{className:"w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center",children:s.jsx(l.Z,{className:"w-5 h-5 sm:w-6 sm:h-6 text-green-600"})}),(0,s.jsxs)("div",{className:"ml-3 sm:ml-4",children:[s.jsx("p",{className:"text-xs sm:text-sm font-medium text-gray-600",children:"Reservasi Aktif"}),s.jsx("p",{className:"text-lg sm:text-2xl font-bold text-gray-900",children:a.filter(e=>"CONFIRMED"===e.status.toUpperCase()).length})]})]})}),s.jsx("div",{className:"bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6",children:(0,s.jsxs)("div",{className:"flex items-center",children:[s.jsx("div",{className:"w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center",children:s.jsx(o.Z,{className:"w-5 h-5 sm:w-6 sm:h-6 text-purple-600"})}),(0,s.jsxs)("div",{className:"ml-3 sm:ml-4",children:[s.jsx("p",{className:"text-xs sm:text-sm font-medium text-gray-600",children:"Total Pengeluaran"}),s.jsx("p",{className:"text-lg sm:text-2xl font-bold text-gray-900",children:formatPrice(a.reduce((e,t)=>e+t.total_price,0))})]})]})})]}),(0,s.jsxs)("div",{className:"bg-white rounded-lg shadow-sm border border-gray-200",children:[s.jsx("div",{className:"px-4 sm:px-6 py-4 border-b border-gray-200",children:s.jsx("h2",{className:"text-base sm:text-lg font-semibold text-gray-900",children:"Riwayat Reservasi"})}),a.length>0?s.jsx("div",{className:"divide-y divide-gray-200",children:a.map(e=>s.jsx("div",{className:"p-4 sm:p-6 hover:bg-gray-50",children:(0,s.jsxs)("div",{className:"flex flex-col sm:flex-row sm:items-start sm:justify-between",children:[(0,s.jsxs)("div",{className:"flex-1",children:[s.jsx("div",{className:"flex flex-wrap items-center justify-between gap-2 mb-2",children:(0,s.jsxs)("div",{className:"flex items-center gap-2",children:[s.jsx("h3",{className:"text-sm sm:text-base font-medium text-gray-900",children:e.field_name}),s.jsx("span",{className:`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(e.payment_status)}`,children:getPaymentStatusText(e.payment_status,e.payment_type)}),s.jsx("button",{onClick:()=>k(e),className:"inline-flex items-center justify-center w-7 h-7 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors",title:"Lihat Timeline Pembayaran",children:s.jsx(d.Z,{className:"w-4 h-4"})})]})}),(0,s.jsxs)("div",{className:"flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-0",children:[(0,s.jsxs)("div",{className:"flex items-center space-x-1",children:[s.jsx(i.Z,{className:"w-4 h-4"}),s.jsx("span",{children:formatDate(e.reservation_date)})]}),(0,s.jsxs)("div",{className:"flex items-center space-x-1",children:[s.jsx(l.Z,{className:"w-4 h-4"}),(0,s.jsxs)("span",{children:[e.start_time," - ",e.end_time]})]})]}),e.notes&&(0,s.jsxs)("p",{className:"text-xs sm:text-sm text-gray-600 mt-2",children:[s.jsx("strong",{children:"Catatan:"})," ",e.notes]})]}),(0,s.jsxs)("div",{className:"mt-3 sm:mt-0 sm:ml-6 text-left sm:text-right flex flex-row items-center justify-between sm:justify-end gap-3",children:[s.jsx("p",{className:"text-sm sm:text-lg font-semibold text-gray-900",children:formatPrice(e.total_price)}),"DP"===e.payment_type&&(()=>{let t=N===e.id,a=!!e.pelunasan_proof,r=e.payment_status?.toUpperCase()==="PAID"||"PELUNASAN_PAID"===e.payment_status,n="PELUNASAN_REJECTED"===e.payment_status,i="PELUNASAN_SENT"===e.payment_status,l=a&&!r&&!n||i,o="REJECTED"===e.status,d="CANCELLED"===e.status;return(0,s.jsxs)("button",{onClick:()=>handleUploadPelunasan(e.id),disabled:t||r||l||o||d,className:`inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-white rounded-lg transition-colors whitespace-nowrap ${n?"bg-orange-600 hover:bg-orange-700":"bg-blue-600 hover:bg-blue-700"} disabled:bg-gray-400 disabled:cursor-not-allowed`,children:[t?s.jsx("div",{className:"animate-spin rounded-full h-3 w-3 border-b-2 border-white"}):r||l?s.jsx(c.Z,{className:"w-3 h-3 sm:w-4 sm:h-4"}):s.jsx(m.Z,{className:"w-3 h-3 sm:w-4 sm:h-4"}),s.jsx("span",{className:"hidden sm:inline",children:t?"Mengupload...":o?"Ditolak":d?"Dibatalkan":r?"Pelunasan Lunas":n?"Upload":l?"Terkirim":"Upload"}),s.jsx("span",{className:"sm:hidden",children:t?"...":o?"Ditolak":d?"Batal":r?"Lunas":n?"Upload Ulang":l?"Terkirim":"Pelunasan"})]})})()]})]})},e.id))}):(0,s.jsxs)("div",{className:"p-8 sm:p-12 text-center",children:[s.jsx(i.Z,{className:"w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4"}),s.jsx("h3",{className:"text-sm sm:text-lg font-medium text-gray-900 mb-2",children:"Belum ada reservasi"}),s.jsx("p",{className:"text-gray-600 text-sm sm:text-base",children:"Riwayat reservasi Anda akan muncul di sini"})]})]})]}),j&&s.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",children:(0,s.jsxs)("div",{className:"bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl",children:[(0,s.jsxs)("div",{className:"flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50",children:[(0,s.jsxs)("div",{children:[s.jsx("h3",{className:"text-xl font-semibold text-gray-900",children:"Timeline Pembayaran"}),s.jsx("p",{className:"text-sm text-gray-600 mt-1",children:j.field_name})]}),s.jsx("button",{onClick:()=>k(null),className:"text-gray-400 hover:text-gray-600 transition-colors",children:s.jsx(u.Z,{className:"w-6 h-6"})})]}),(0,s.jsxs)("div",{className:"p-6 overflow-y-auto max-h-[calc(90vh-120px)]",children:[s.jsx("div",{className:"bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6",children:(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-3 text-sm",children:[(0,s.jsxs)("div",{children:[s.jsx("span",{className:"text-gray-600",children:"Tanggal Booking:"}),s.jsx("p",{className:"font-semibold text-gray-900",children:formatDate(j.reservation_date)})]}),(0,s.jsxs)("div",{children:[s.jsx("span",{className:"text-gray-600",children:"Total Harga:"}),s.jsx("p",{className:"font-semibold text-gray-900",children:formatPrice(j.total_price)})]}),(0,s.jsxs)("div",{children:[s.jsx("span",{className:"text-gray-600",children:"Metode Pembayaran:"}),s.jsx("p",{className:"font-semibold text-gray-900",children:"DP"===j.payment_type?"DP (Down Payment)":"Pembayaran Penuh"})]}),(0,s.jsxs)("div",{children:[s.jsx("span",{className:"text-gray-600",children:"Status Saat Ini:"}),s.jsx("span",{className:`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(j.payment_status)}`,children:getPaymentStatusText(j.payment_status,j.payment_type)})]})]})}),(0,s.jsxs)("div",{className:"space-y-4",children:[(0,s.jsxs)("h4",{className:"font-semibold text-gray-900 mb-4 flex items-center gap-2",children:[s.jsx("div",{className:"w-1 h-5 bg-blue-600 rounded-full"}),"Riwayat Pembayaran"]}),s.jsx("div",{className:"relative ml-4 pl-8 space-y-8",children:(()=>{let e=[];return"DP"===j.payment_type?(e.push(s.jsx(TimelineItem,{icon:s.jsx(l.Z,{className:"w-4 h-4"}),iconColor:"bg-gray-500",title:"Booking Dibuat",description:"Reservasi berhasil dibuat, menunggu pembayaran DP",status:"completed"},"booking-created")),(j.dp_proof||j.dp_validated_at||["DP_SENT","DP_PAID","DP_REJECTED","PELUNASAN_SENT","PELUNASAN_PAID","PELUNASAN_REJECTED","PAID"].includes(j.payment_status))&&e.push(s.jsx(TimelineItem,{icon:s.jsx(m.Z,{className:"w-4 h-4"}),iconColor:"bg-blue-500",title:"Bukti DP Dikirim",description:`Bukti pembayaran DP sebesar ${formatPrice(j.payment_amount||.5*j.total_price)} telah diupload`,status:"completed",timestamp:j.created_at},"dp-sent")),["DP_SENT","PENDING","DP_PAID","DP_REJECTED","PELUNASAN_SENT","PELUNASAN_PAID","PELUNASAN_REJECTED","PAID"].includes(j.payment_status)&&("DP_SENT"===j.payment_status||"PENDING"===j.payment_status?e.push(s.jsx(TimelineItem,{icon:s.jsx(l.Z,{className:"w-4 h-4"}),iconColor:"bg-yellow-500",title:"Menunggu Validasi DP",description:"Bukti pembayaran DP sedang dalam proses verifikasi oleh admin. Harap menunggu konfirmasi.",status:"pending"},"dp-validation")):e.push(s.jsx(TimelineItem,{icon:s.jsx(l.Z,{className:"w-4 h-4"}),iconColor:"bg-blue-500",title:"Proses Validasi DP",description:"Bukti pembayaran DP telah diproses oleh admin",status:"completed"},"dp-validation"))),"DP_REJECTED"===j.payment_status&&e.push(s.jsx(TimelineItem,{icon:s.jsx(p.Z,{className:"w-4 h-4"}),iconColor:"bg-red-500",title:"DP Ditolak Admin",description:"Bukti pembayaran DP ditolak oleh admin. Mohon lakukan reservasi ulang.",status:"rejected",timestamp:j.dp_validated_at},"dp-rejected")),["DP_PAID","PELUNASAN_SENT","PELUNASAN_PAID","PELUNASAN_REJECTED","PAID"].includes(j.payment_status)&&e.push(s.jsx(TimelineItem,{icon:s.jsx(x.Z,{className:"w-4 h-4"}),iconColor:"bg-green-500",title:"DP Diverifikasi",description:"Pembayaran DP telah diverifikasi oleh admin",status:"completed",timestamp:j.dp_validated_at},"dp-approved")),(j.pelunasan_proof||j.pelunasan_validated_at||["PELUNASAN_SENT","PELUNASAN_PAID","PELUNASAN_REJECTED","PAID"].includes(j.payment_status))&&e.push(s.jsx(TimelineItem,{icon:s.jsx(m.Z,{className:"w-4 h-4"}),iconColor:"bg-purple-500",title:"Bukti Pelunasan Dikirim",description:`Bukti pelunasan sebesar ${formatPrice(.5*j.total_price)} telah diupload`,status:"completed",timestamp:j.pelunasan_validated_at},"pelunasan-sent")),["PELUNASAN_SENT","PELUNASAN_PAID","PELUNASAN_REJECTED","PAID"].includes(j.payment_status)&&("PELUNASAN_SENT"===j.payment_status?e.push(s.jsx(TimelineItem,{icon:s.jsx(l.Z,{className:"w-4 h-4"}),iconColor:"bg-yellow-500",title:"Menunggu Verifikasi Admin",description:"Bukti pelunasan sedang dalam proses verifikasi oleh admin",status:"pending"},"pelunasan-validation")):e.push(s.jsx(TimelineItem,{icon:s.jsx(l.Z,{className:"w-4 h-4"}),iconColor:"bg-purple-500",title:"Proses Validasi Pelunasan",description:"Bukti pelunasan telah diproses oleh admin",status:"completed"},"pelunasan-validation"))),"PELUNASAN_REJECTED"===j.payment_status&&e.push(s.jsx(TimelineItem,{icon:s.jsx(p.Z,{className:"w-4 h-4"}),iconColor:"bg-red-500",title:"Pelunasan Ditolak Admin",description:"Bukti pelunasan ditolak oleh admin. Silakan upload ulang dengan bukti yang benar.",status:"rejected",timestamp:j.pelunasan_validated_at},"pelunasan-rejected")),["PELUNASAN_PAID","PAID"].includes(j.payment_status)&&e.push(s.jsx(TimelineItem,{icon:s.jsx(x.Z,{className:"w-4 h-4"}),iconColor:"bg-green-500",title:"Pelunasan Lunas",description:"Pembayaran pelunasan telah diverifikasi. Pembayaran selesai!",status:"completed",timestamp:j.pelunasan_validated_at},"pelunasan-approved")),"DP_PAID"===j.payment_status&&e.push(s.jsx(TimelineItem,{icon:s.jsx(l.Z,{className:"w-4 h-4"}),iconColor:"bg-yellow-500",title:"Menunggu Pelunasan",description:"DP sudah terbayar. Silakan upload bukti pelunasan untuk menyelesaikan pembayaran",status:"pending"},"pending-pelunasan"))):(e.push(s.jsx(TimelineItem,{icon:s.jsx(l.Z,{className:"w-4 h-4"}),iconColor:"bg-gray-500",title:"Booking Dibuat",description:"Reservasi berhasil dibuat, menunggu pembayaran penuh",status:"completed"},"booking-created")),(j.payment_proof||j.dp_validated_at||["DP_SENT","DP_PAID","DP_REJECTED","PAID","PENDING"].includes(j.payment_status))&&e.push(s.jsx(TimelineItem,{icon:s.jsx(m.Z,{className:"w-4 h-4"}),iconColor:"bg-blue-500",title:"Bukti Pembayaran Dikirim",description:`Bukti pembayaran penuh sebesar ${formatPrice(j.total_price)} telah diupload`,status:"completed",timestamp:j.created_at},"payment-sent")),["PENDING","DP_SENT","DP_REJECTED","PAID"].includes(j.payment_status)&&(["PENDING","DP_SENT"].includes(j.payment_status)?e.push(s.jsx(TimelineItem,{icon:s.jsx(l.Z,{className:"w-4 h-4"}),iconColor:"bg-yellow-500",title:"Menunggu Validasi Admin",description:"Bukti pembayaran sedang dalam proses verifikasi oleh admin. Harap menunggu konfirmasi.",status:"pending"},"payment-validation")):e.push(s.jsx(TimelineItem,{icon:s.jsx(l.Z,{className:"w-4 h-4"}),iconColor:"bg-blue-500",title:"Proses Validasi Pembayaran",description:"Bukti pembayaran telah diproses oleh admin",status:"completed"},"payment-validation"))),"DP_REJECTED"===j.payment_status&&e.push(s.jsx(TimelineItem,{icon:s.jsx(p.Z,{className:"w-4 h-4"}),iconColor:"bg-red-500",title:"Pembayaran Ditolak Admin",description:"Bukti pembayaran ditolak oleh admin. Mohon lakukan reservasi ulang dengan bukti yang benar.",status:"rejected",timestamp:j.dp_validated_at},"payment-rejected")),"PAID"===j.payment_status&&e.push(s.jsx(TimelineItem,{icon:s.jsx(x.Z,{className:"w-4 h-4"}),iconColor:"bg-green-500",title:"Pembayaran Diverifikasi",description:"Pembayaran penuh telah diverifikasi. Pembayaran selesai!",status:"completed",timestamp:j.dp_validated_at},"payment-verified"))),e.reverse()})()})]})]}),s.jsx("div",{className:"flex justify-end p-6 border-t border-gray-200 bg-gray-50",children:s.jsx("button",{onClick:()=>k(null),className:"px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors",children:"Tutup"})})]})})]})}function TimelineItem({icon:e,iconColor:t,title:a,description:r,status:n,timestamp:i}){return(0,s.jsxs)("div",{className:"relative group",children:[s.jsx("div",{className:`absolute -left-[3rem] flex items-center justify-center w-9 h-9 rounded-full ${t} text-white shadow-lg transition-transform group-hover:scale-110`,children:e}),s.jsx("div",{className:`transition-opacity ${"pending"===n?"opacity-70":"opacity-100"}`,children:(0,s.jsxs)("div",{className:"bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow",children:[s.jsx("h5",{className:"font-semibold text-gray-900 text-base mb-2",children:a}),s.jsx("p",{className:"text-sm text-gray-600 leading-relaxed",children:r}),i&&(0,s.jsxs)("div",{className:"flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100",children:[s.jsx(l.Z,{className:"w-3.5 h-3.5 text-gray-400"}),s.jsx("p",{className:"text-xs text-gray-500 font-medium",children:new Date(i).toLocaleString("id-ID",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})})]})]})})]})}},1618:(e,t,a)=>{"use strict";a.r(t),a.d(t,{$$typeof:()=>i,__esModule:()=>n,default:()=>o});var s=a(95153);let r=(0,s.createProxy)(String.raw`C:\Projects\backup 07-11-2025 4.11\gorpuribeta-main\app\dashboard\page.tsx`),{__esModule:n,$$typeof:i}=r,l=r.default,o=l}};var t=require("../../webpack-runtime.js");t.C(e);var __webpack_exec__=e=>t(t.s=e),a=t.X(0,[2006,2246,7756,2500,9290,6897],()=>__webpack_exec__(95326));module.exports=a})();