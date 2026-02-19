import React from 'react';

interface LayoutProps {
 sidebar: React.ReactNode;
 header: React.ReactNode;
 footer: React.ReactNode;
 children: React.ReactNode;
 sidebarOpen: boolean;
 onSidebarClose: () => void;
 sidebarCollapsed: boolean;
}

/**
 * Application shell shared between light/dark themes.
 * Keeps sidebar responsive while maintaining a consistent background surface.
 */
const Layout: React.FC<LayoutProps> = ({
 sidebar,
 header,
 footer,
 children,
 sidebarOpen,
 onSidebarClose,
 sidebarCollapsed,
}) => {
 const sidebarWidthClass = sidebarCollapsed ? 'w-80 lg:w-24' : 'w-80';

 return (
 <div className="min-h-screen bg-main text-primary">
 {/* mobile overlay */}
 {sidebarOpen && (
 <button
 type="button"
 className="fixed inset-0 z-30 bg-surface-primary/40 backdrop-blur-sm lg:hidden"
 onClick={onSidebarClose}
 aria-label="Close navigation sidebar"
 />
 )}

       <div className="relative flex min-h-screen">

         <aside

           className={`fixed inset-y-0 left-0 z-40 transform border-r border-border-primary bg-surface-primary/95 backdrop-blur-xl transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarWidthClass} ${sidebarOpen ? 'translate-x-0 shadow-lg' : '-translate-x-full lg:translate-x-0'

             }`}

         >

           {sidebar}

         </aside>

 

         <div className="flex flex-1 flex-col transition-all duration-300 ease-in-out lg:ml-5">

 
 <header className="sticky top-0 z-20 border-b border-border-primary bg-surface-primary/85 backdrop-blur-lg">
 {header}
 </header>

 <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">
 {children}
 </main>

 <footer className="border-t border-border-primary bg-surface-primary/80">
 {footer}
 </footer>
 </div>
 </div>
 </div>
 );
};

export default Layout;
