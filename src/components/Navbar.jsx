// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../contexts/AuthContext";
// import { LogOut } from "lucide-react";

// export const Navbar = () => {
//   const navigate = useNavigate();
//   const { logout } = useAuth();

//   return (
//     <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200">
//       <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">

//         {/* LEFT */}
//         <div className="flex items-center gap-3">
//           <img src="/src/assets/favicon.png" alt="Virtusa" className="h-8" />
//           <h1 className="font-semibold text-primary hidden md:block">
//             Credit Officer Panel
//           </h1>
//         </div>

//         {/* RIGHT */}
//         <button
//           onClick={() => {
//             logout();
//             navigate("/login");
//           }}
//           className="flex items-center gap-2 px-4 py-2 rounded-xl 
//                      bg-red-500 text-white font-medium 
//                      shadow-md transition-all duration-200 
//                      hover:bg-red-600 hover:shadow-lg 
//                      active:scale-95"
//         >
//           <LogOut size={18} />
//           Logout
//         </button>

//       </div>
//     </header>
//   );
// };