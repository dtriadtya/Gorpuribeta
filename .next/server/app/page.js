(()=>{var e={};e.id=1931,e.ids=[1931],e.modules={55403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},94749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},25528:e=>{"use strict";e.exports=require("next/dist\\client\\components\\action-async-storage.external.js")},91877:e=>{"use strict";e.exports=require("next/dist\\client\\components\\request-async-storage.external.js")},25319:e=>{"use strict";e.exports=require("next/dist\\client\\components\\static-generation-async-storage.external.js")},57310:e=>{"use strict";e.exports=require("url")},32022:(e,t,a)=>{"use strict";a.r(t),a.d(t,{GlobalError:()=>n.a,__next_app__:()=>m,originalPathname:()=>p,pages:()=>c,routeModule:()=>u,tree:()=>d});var s=a(67096),r=a(16132),i=a(37284),n=a.n(i),l=a(32564),o={};for(let e in l)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(o[e]=()=>l[e]);a.d(t,o);let d=["",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(a.bind(a,83982)),"C:\\Projects\\backup 07-11-2025 4.11\\gorpuribeta-main\\app\\page.tsx"]}]},{layout:[()=>Promise.resolve().then(a.bind(a,29925)),"C:\\Projects\\backup 07-11-2025 4.11\\gorpuribeta-main\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(a.t.bind(a,9291,23)),"next/dist/client/components/not-found-error"]}],c=["C:\\Projects\\backup 07-11-2025 4.11\\gorpuribeta-main\\app\\page.tsx"],p="/page",m={require:a,loadChunk:()=>Promise.resolve()},u=new s.AppPageRouteModule({definition:{kind:r.x.APP_PAGE,page:"/page",pathname:"/",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},5127:(e,t,a)=>{Promise.resolve().then(a.bind(a,71047))},71047:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>Home});var s=a(30784),r=a(9885),i=a(57114),n=a(19300),l=a(517),o=a(15441),d=a(87094),c=a(67932);function Hero(){return s.jsx("section",{className:"bg-gradient-to-br from-primary-600 to-primary-800 text-white",children:s.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20",children:(0,s.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-12 items-center",children:[(0,s.jsxs)("div",{children:[(0,s.jsxs)("h1",{className:"text-4xl md:text-6xl font-bold mb-6",children:["Reservasi Lapangan Olahraga",s.jsx("span",{className:"block text-primary-200",children:"Terbaik di Ciledug"})]}),s.jsx("p",{className:"text-xl text-primary-100 mb-8",children:"Nikmati pengalaman bermain olahraga dengan fasilitas terbaik, harga terjangkau, dan sistem reservasi yang mudah."})]}),(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-4",children:[(0,s.jsxs)("div",{className:"bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center",children:[s.jsx(l.Z,{className:"w-8 h-8 mx-auto mb-3 text-primary-200"}),s.jsx("h3",{className:"text-lg font-semibold mb-2",children:"Reservasi Online"}),s.jsx("p",{className:"text-sm text-primary-100",children:"Booking kapan saja, di mana saja"})]}),(0,s.jsxs)("div",{className:"bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center",children:[s.jsx(o.Z,{className:"w-8 h-8 mx-auto mb-3 text-primary-200"}),s.jsx("h3",{className:"text-lg font-semibold mb-2",children:"24/7 Tersedia"}),s.jsx("p",{className:"text-sm text-primary-100",children:"Lapangan siap pakai setiap saat"})]}),(0,s.jsxs)("div",{className:"bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center",children:[s.jsx(d.Z,{className:"w-8 h-8 mx-auto mb-3 text-primary-200"}),s.jsx("h3",{className:"text-lg font-semibold mb-2",children:"Lokasi Strategis"}),s.jsx("p",{className:"text-sm text-primary-100",children:"Mudah dijangkau dari mana saja"})]}),(0,s.jsxs)("div",{className:"bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center",children:[s.jsx(c.Z,{className:"w-8 h-8 mx-auto mb-3 text-primary-200"}),s.jsx("h3",{className:"text-lg font-semibold mb-2",children:"Fasilitas Lengkap"}),s.jsx("p",{className:"text-sm text-primary-100",children:"AC, Locker, Parkir tersedia"})]})]})]})})})}var p=a(52451),m=a.n(p),u=a(51910),x=a(11922);function FeaturedFields(){let[e,t]=(0,r.useState)([]),[a,i]=(0,r.useState)(0);(0,r.useEffect)(()=>{t(["/images/badminton.jpg","/images/basket.jpg","/images/futsal.jpg"])},[]),(0,r.useEffect)(()=>{if(!e.length)return;let t=setInterval(()=>{i(t=>(t+1)%e.length)},4e3);return()=>clearInterval(t)},[e.length]);let n=(0,r.useCallback)(()=>{i(t=>(t-1+e.length)%e.length)},[e.length]),l=(0,r.useCallback)(()=>{i(t=>(t+1)%e.length)},[e.length]),[o,d]=(0,r.useState)(null);return e.length?s.jsx("section",{className:"py-20 bg-gray-50 overflow-hidden",children:s.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:(0,s.jsxs)("div",{className:"relative w-full max-w-5xl mx-auto aspect-[16/9] perspective-[1200px]",onTouchStart:e=>d(e.targetTouches[0].clientX),onTouchMove:e=>{if(null===o)return;let t=o-e.targetTouches[0].clientX;t>50?(l(),d(null)):t<-50&&(n(),d(null))},onTouchEnd:()=>d(null),children:[e.map((t,r)=>{let i=(r-a+e.length)%e.length,n="",l=10,o=1;return 0===i?(n="translateX(0) scale(1) rotateY(0deg)",l=30):1===i?(n="translateX(250px) scale(0.85) rotateY(-25deg)",l=20,o=.8):i===e.length-1?(n="translateX(-250px) scale(0.85) rotateY(25deg)",l=20,o=.8):(n="translateX(0) scale(0.7) rotateY(0deg)",o=0,l=0),s.jsx("div",{className:"absolute inset-0 transition-all duration-700 ease-in-out",style:{transform:n,opacity:o,zIndex:l},children:s.jsx("div",{className:"relative w-full h-full overflow-hidden shadow-2xl cursor-default",children:s.jsx(m(),{src:t,alt:`Lapangan ${r+1}`,fill:!0,className:"object-cover select-none",priority:0===r})})},r)}),s.jsx("button",{onClick:n,className:"absolute left-3 top-1/2 -translate-y-1/2 z-50  bg-gray-900/70 hover:bg-gray-900 text-white  rounded-full p-3 shadow-lg transition-all duration-300 hidden sm:block",children:s.jsx(u.Z,{className:"w-6 h-6"})}),s.jsx("button",{onClick:l,className:"absolute right-3 top-1/2 -translate-y-1/2 z-50  bg-gray-900/70 hover:bg-gray-900 text-white  rounded-full p-3 shadow-lg transition-all duration-300 hidden sm:block",children:s.jsx(x.Z,{className:"w-6 h-6"})}),s.jsx("div",{className:"absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-50",children:e.map((e,t)=>s.jsx("button",{onClick:()=>i(t),className:`w-2 h-2 rounded-full transition-all ${t===a?"bg-white w-8":"bg-white bg-opacity-50 hover:bg-opacity-75"}`,"aria-label":`Go to slide ${t+1}`},t))})]})})}):s.jsx("section",{className:"py-20 bg-gray-50 text-center text-gray-500",children:"Memuat gambar..."})}var g=a(44901),h=a(41516);function Features(){let e=[{icon:l.Z,title:"Reservasi Mudah",description:"Booking lapangan hanya dalam beberapa klik dengan sistem yang user-friendly"},{icon:o.Z,title:"Tersedia 24/7",description:"Lapangan siap pakai setiap saat, sesuai dengan jadwal yang Anda inginkan"},{icon:g.Z,title:"Pembayaran Aman",description:"Sistem pembayaran terjamin keamanannya dengan berbagai metode pembayaran"},{icon:h.Z,title:"Customer Service",description:"Tim customer service siap membantu Anda 24/7 untuk semua kebutuhan"},{icon:d.Z,title:"Lokasi Strategis",description:"Lokasi mudah dijangkau dengan akses transportasi yang memadai"},{icon:c.Z,title:"Fasilitas Lengkap",description:"AC, locker room, area parkir, dan cafe tersedia untuk kenyamanan Anda"}];return s.jsx("section",{className:"py-20 bg-white",children:(0,s.jsxs)("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[(0,s.jsxs)("div",{className:"text-center mb-16",children:[s.jsx("h2",{className:"text-3xl md:text-4xl font-bold text-gray-900 mb-4",children:"Mengapa Memilih Kami?"}),s.jsx("p",{className:"text-xl text-gray-600 max-w-2xl mx-auto",children:"Kami menyediakan pengalaman reservasi lapangan olahraga terbaik dengan berbagai keunggulan"})]}),s.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",children:e.map((e,t)=>(0,s.jsxs)("div",{className:"text-center group",children:[s.jsx("div",{className:"w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-600 transition-colors duration-300",children:s.jsx(e.icon,{className:"w-8 h-8 text-primary-600 group-hover:text-white transition-colors duration-300"})}),s.jsx("h3",{className:"text-xl font-semibold text-gray-900 mb-4",children:e.title}),s.jsx("p",{className:"text-gray-600 leading-relaxed",children:e.description})]},t))})]})})}function Home(){let e=(0,i.useRouter)();return(0,r.useEffect)(()=>{let checkUnpaidReservations=async()=>{let t=localStorage.getItem("token"),a=localStorage.getItem("user");if(!t||!a||"true"===sessionStorage.getItem("unpaidReservationsPopupShown"))return;let s=JSON.parse(a),r=s.id_user;try{let a=await fetch(`/api/reservations?user_id=${r}`,{headers:{Authorization:`Bearer ${t}`}});if(!a.ok)return;let s=await a.json(),i=`seenRejectedReservations_${r}`,l=JSON.parse(localStorage.getItem(i)||"[]"),o=s.reservations.filter(e=>{let t="PAID"!==e.payment_status,a="CANCELLED"!==e.status,s="DP_REJECTED"===e.payment_status||"PELUNASAN_REJECTED"===e.payment_status;if(s)return!("REJECTED"===e.status&&l.includes(e.id))&&a;let r="REJECTED"!==e.status;return t&&a&&r}),d=o.sort((e,t)=>{let a=new Date(e.updated_at||e.created_at).getTime(),s=new Date(t.updated_at||t.created_at).getTime();return s-a}),c=d.slice(0,2);c.length>0&&(o.length,setTimeout(()=>{n.Z.fire({icon:"warning",title:"Pembayaran Tertunda",html:`
                <style>
                  .reminder-intro {
                    text-align: left;
                    font-size: 14px;
                    margin-bottom: 20px;
                    padding: 16px;
                    background: #FFFBEB;
                    border: 1px solid #FEF3C7;
                    border-radius: 12px;
                    line-height: 1.6;
                  }
                  .reminder-intro p {
                    color: #78350F;
                    margin: 0;
                  }
                  .reminder-intro strong {
                    font-weight: 600;
                    color: #78350F;
                  }
                  .reminder-intro .count-highlight {
                    font-weight: 700;
                    color: #92400E;
                  }
                  .reservation-item {
                    background: #F9FAFB;
                    border: 1px solid #E5E7EB;
                    border-radius: 10px;
                    padding: 14px 16px;
                    margin-bottom: 10px;
                    text-align: left;
                    transition: all 0.2s;
                  }
                  .reservation-item:hover {
                    background: #F3F4F6;
                    border-color: #D1D5DB;
                  }
                  .res-name {
                    font-size: 15px;
                    font-weight: 600;
                    color: #111827;
                    margin-bottom: 6px;
                  }
                  .res-detail {
                    font-size: 13px;
                    color: #6B7280;
                    margin-bottom: 3px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                  }
                  .res-icon {
                    width: 14px;
                    height: 14px;
                    flex-shrink: 0;
                  }
                  .status-badge {
                    display: inline-block;
                    padding: 3px 10px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                    margin-top: 4px;
                  }
                  .status-pending { background: #FEF3C7; color: #92400E; }
                  .status-dp { background: #DBEAFE; color: #1E40AF; }
                  .status-waiting { background: #FEF3C7; color: #92400E; }
                  .status-rejected { background: #FEE2E2; color: #991B1B; }
                  .res-list {
                    max-height: 300px;
                    overflow-y: auto;
                    padding-right: 4px;
                  }
                  .res-list::-webkit-scrollbar {
                    width: 6px;
                  }
                  .res-list::-webkit-scrollbar-track {
                    background: #F3F4F6;
                    border-radius: 10px;
                  }
                  .res-list::-webkit-scrollbar-thumb {
                    background: #D1D5DB;
                    border-radius: 10px;
                  }
                  .res-list::-webkit-scrollbar-thumb:hover {
                    background: #9CA3AF;
                  }
                </style>
                <div class="reminder-intro">
                  <p>
                    <strong>Peringatan:</strong> Anda memiliki reservasi yang menunggu pembayaran.
                  </p>
                </div>
                <div class="res-list">
                  ${c.map(e=>{let t="Status Tidak Dikenal",a="status-waiting";switch(e.payment_status){case"PENDING":case"DP_SENT":t="Menunggu Validasi DP",a="status-waiting";break;case"DP_PAID":t="DP Terbayar",a="status-dp";break;case"DP_REJECTED":t="DP Ditolak",a="status-rejected";break;case"PELUNASAN_SENT":t="Pelunasan Terkirim",a="status-waiting";break;case"PELUNASAN_REJECTED":t="Pelunasan Ditolak",a="status-rejected";break;case"PELUNASAN_PAID":t="Pelunasan Terbayar",a="status-dp";break;case"PAID":t="Lunas",a="status-dp";break;case"REFUNDED":t="Dikembalikan",a="status-rejected"}return`
                      <div class="reservation-item">
                        <div class="res-name">${e.field_name||e.field?.name||"Lapangan"}</div>
                        <div class="res-detail">
                          <svg class="res-icon" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                          </svg>
                          ${new Date(e.reservation_date).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})} • ${e.start_time} - ${e.end_time}
                        </div>
                        <span class="status-badge ${a}">${t}</span>
                      </div>
                    `}).join("")}
                </div>
              `,confirmButtonText:"Lihat Detail",showCancelButton:!0,cancelButtonText:"Nanti",confirmButtonColor:"#2563eb",cancelButtonColor:"#9CA3AF",width:"480px",customClass:{popup:"swal-popup-custom",title:"swal-title-custom",htmlContainer:"swal-html-custom",confirmButton:"swal-btn-custom",cancelButton:"swal-btn-cancel-custom"},didOpen:()=>{let e=document.createElement("style");e.textContent=`
                  .swal-popup-custom {
                    border-radius: 16px;
                    padding: 0;
                  }
                  .swal-title-custom {
                    font-size: 22px;
                    font-weight: 700;
                    color: #111827;
                    padding: 24px 24px 12px 24px;
                  }
                  .swal-html-custom {
                    margin: 0 !important;
                    padding: 0 24px 20px 24px !important;
                  }
                  .swal-btn-custom {
                    border-radius: 8px !important;
                    padding: 10px 24px !important;
                    font-weight: 600 !important;
                    font-size: 14px !important;
                  }
                  .swal-btn-cancel-custom {
                    border-radius: 8px !important;
                    padding: 10px 24px !important;
                    font-weight: 600 !important;
                    font-size: 14px !important;
                  }
                  .swal2-icon.swal2-warning {
                    border-color: #F59E0B !important;
                    color: #F59E0B !important;
                    margin: 20px auto 8px !important;
                  }
                  .swal2-actions {
                    padding: 0 24px 24px 24px !important;
                  }
                `,document.head.appendChild(e)}}).then(t=>{sessionStorage.setItem("unpaidReservationsPopupShown","true");let a=c.filter(e=>("DP_REJECTED"===e.payment_status||"PELUNASAN_REJECTED"===e.payment_status)&&"REJECTED"===e.status).map(e=>e.id);if(a.length>0){let e=`seenRejectedReservations_${r}`,t=JSON.parse(localStorage.getItem(e)||"[]"),s=[...t,...a],i=Array.from(new Set(s));localStorage.setItem(e,JSON.stringify(i))}t.isConfirmed&&e.push("/dashboard")})},500))}catch(e){console.error("Error fetching unpaid reservations:",e)}};checkUnpaidReservations()},[e]),(0,s.jsxs)("div",{children:[s.jsx(Hero,{}),s.jsx(FeaturedFields,{}),s.jsx(Features,{})]})}},83982:(e,t,a)=>{"use strict";a.r(t),a.d(t,{$$typeof:()=>n,__esModule:()=>i,default:()=>o});var s=a(95153);let r=(0,s.createProxy)(String.raw`C:\Projects\backup 07-11-2025 4.11\gorpuribeta-main\app\page.tsx`),{__esModule:i,$$typeof:n}=r,l=r.default,o=l}};var t=require("../webpack-runtime.js");t.C(e);var __webpack_exec__=e=>t(t.s=e),a=t.X(0,[2006,2246,7756,3364,6897],()=>__webpack_exec__(32022));module.exports=a})();