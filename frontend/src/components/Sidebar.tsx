// "use client";
// import React from "react";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "./ui/sidebar";
// import { Input } from "./ui/input";
// import { BoxSelect } from "lucide-react";
// import { blogCategories } from "@/app/blog/new/page";
// import { useAppData } from "@/context/AppContext";

// const SideBar = () => {
//   const { searchQuery, setSearchQuery, setCategory } = useAppData();
//   return (
//     <Sidebar>
//       <SidebarHeader className="bg-white text-2xl font-bold mt-5">
//         ViewFromThere
//       </SidebarHeader>
//       <SidebarContent className="bg-white">
//         <SidebarGroup>
//           <SidebarGroupLabel>Search</SidebarGroupLabel>
//           <Input
//             type="text"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder="Search Your Preferred Blog"
//           />
//           <SidebarGroupLabel>Categories</SidebarGroupLabel>
//           <SidebarMenu>
//             <SidebarMenuItem>
//               <SidebarMenuButton onClick={() => setCategory("")}>
//                 <BoxSelect />
//                 <span>All</span>
//               </SidebarMenuButton>
//               {blogCategories?.map((e, i) => {
//                 return (
//                   <SidebarMenuButton key={i} onClick={() => setCategory(e)}>
//                     <BoxSelect /> <span>{e}</span>
//                   </SidebarMenuButton>
//                 );
//               })}
//             </SidebarMenuItem>
//           </SidebarMenu>
//         </SidebarGroup>
//       </SidebarContent>
//     </Sidebar>
//   );
// };

// export default SideBar;

"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Input } from "./ui/input";
import { BoxSelect, Search } from "lucide-react";
import { blogCategories } from "@/app/blog/new/page";
import { useAppData } from "@/context/AppContext";

const SideBar = () => {
  const { searchQuery, setSearchQuery, category, setCategory } = useAppData();

  return (
    <Sidebar className="top-20 h-[calc(100vh-5rem)] border-r border-[#ece4d3] bg-[#faf9f6]">
      <SidebarHeader className="px-5 py-6 border-b border-[#ece4d3] bg-[#faf9f6] flex items-center justify-center">
        <h2
          className="text-3xl font-bold text-[#305867] text-center"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Explore
        </h2>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 bg-[#f5f1e9]">
        <SidebarGroup>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#305867]/60" />

            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blogs..."
              className="pl-9 h-10 rounded-lg border-[#ddd3bf] bg-white focus-visible:ring-[#305867]/30"
            />
          </div>

          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-[#8A6D46] mt-6 mb-2">
            Categories
          </SidebarGroupLabel>

          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setCategory("")}
                isActive={category === ""}
                className="rounded-lg transition-colors data-[active=true]:bg-[#305867] data-[active=true]:text-white hover:bg-[#305867]/10"
              >
                <BoxSelect className="h-4 w-4" />
                <span>All</span>
              </SidebarMenuButton>

              {blogCategories.map((item) => (
                <SidebarMenuButton
                  key={item}
                  onClick={() => setCategory(item)}
                  isActive={category === item}
                  className="rounded-lg transition-colors data-[active=true]:bg-[#305867] data-[active=true]:text-white hover:bg-[#305867]/10"
                >
                  <BoxSelect className="h-4 w-4" />
                  <span>{item}</span>
                </SidebarMenuButton>
              ))}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SideBar;
